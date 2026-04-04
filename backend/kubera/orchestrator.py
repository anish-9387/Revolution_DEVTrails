import json
from datetime import timedelta
from uuid import uuid4

from .constants import ZONE_RISK
from .db import db
from .engines import detect_syndicate_pattern
from .models import Claim, DisruptionEvent, Subscription, Worker
from .serializers import (
    serialize_claim,
    serialize_disruption,
    serialize_ledger_entries,
)
from .utils import (
    build_default_gps_history,
    clamp,
    generate_otp,
    parse_json_blob,
    to_iso,
    utc_now,
)


class ClaimOrchestrator:
    def __init__(
        self,
        trigger_engine,
        payout_engine,
        fraud_engine,
        liquidity_guard,
        blockchain_service,
    ):
        self.trigger_engine = trigger_engine
        self.payout_engine = payout_engine
        self.fraud_engine = fraud_engine
        self.liquidity_guard = liquidity_guard
        self.blockchain_service = blockchain_service

    def get_latest_active_disruption(self, zone: str):
        horizon = utc_now() - timedelta(hours=6)
        return (
            DisruptionEvent.query.filter(
                DisruptionEvent.zone == zone,
                DisruptionEvent.is_active.is_(True),
                DisruptionEvent.occurred_at >= horizon,
            )
            .order_by(DisruptionEvent.occurred_at.desc())
            .first()
        )

    def get_active_subscription(self, worker_id: str):
        return (
            Subscription.query.filter_by(worker_id=worker_id, active=True)
            .order_by(Subscription.started_at.desc())
            .first()
        )

    def create_disruption_event(self, payload: dict, fallback_source: str = "api"):
        flags = self.trigger_engine.evaluate(payload)
        event_snapshot = dict(flags)
        event_snapshot["signals"] = {
            "traffic_slowdown_index": round(float(payload.get("traffic_slowdown_index", 0.0)), 3),
            "platform_outage": bool(payload.get("platform_outage", False)),
            "official_reports": int(payload.get("official_reports", 0)),
        }

        event = DisruptionEvent(
            zone=payload["zone"],
            rainfall_mm_hr=float(payload.get("rainfall_mm_hr", 0.0)),
            heat_index_c=float(payload.get("heat_index_c", 0.0)),
            aqi=int(payload.get("aqi", 0)),
            curfew=bool(payload.get("curfew", False)),
            sustained_hours=float(payload.get("sustained_hours", 0.0)),
            official_reports=int(payload.get("official_reports", 0)),
            source=payload.get("source", fallback_source),
            trigger_flags=json.dumps(event_snapshot),
            is_active=flags["active"],
        )

        db.session.add(event)
        db.session.commit()
        return event

    def build_auto_claim_payload(self, worker: Worker, zone: str, monitor_snapshot: dict):
        traffic_slowdown = float(monitor_snapshot.get("traffic_slowdown_index", 0.68))
        zone_risk = float(ZONE_RISK.get(zone, 0.55))

        accepted_orders = max(4, int(round(clamp(worker.weekly_income / 900.0, 4.0, 12.0))))
        completion_drop = int(round(clamp(traffic_slowdown * 3.2 + zone_risk * 2.0, 1.0, 5.0)))
        completed_orders = max(0, accepted_orders - completion_drop)

        accel_variance = round(clamp(1.0 + zone_risk * 0.40 + traffic_slowdown * 0.25, 0.8, 2.4), 2)
        gyro_variance = round(clamp(0.8 + zone_risk * 0.30 + traffic_slowdown * 0.18, 0.6, 2.2), 2)

        network_reliability = clamp(0.90 - traffic_slowdown * 0.24, 0.35, 0.95)
        wifi_match = network_reliability > 0.45
        cell_match = network_reliability > 0.35
        ip_geo_match = network_reliability > 0.40

        return {
            "worker_id": worker.id,
            "zone": zone,
            "movement_profile": "normal" if traffic_slowdown < 0.93 else "static",
            "claim_timestamp": to_iso(utc_now()),
            "environmental_alignment": bool(monitor_snapshot.get("official_reports", 0) >= 1),
            "platform_activity": {
                "orders_accepted": accepted_orders,
                "orders_completed": completed_orders,
            },
            "motion": {
                "accel_variance": accel_variance,
                "gyro_variance": gyro_variance,
            },
            "network": {
                "wifi_match": wifi_match,
                "cell_match": cell_match,
                "ip_geo_match": ip_geo_match,
            },
            "device": {
                "rooted": False,
                "emulator": False,
                "session_device_id": worker.device_fingerprint or f"auto-session-{worker.id[:8]}",
            },
        }

    def create_claim_decision(self, worker: Worker, subscription: Subscription, zone: str, payload: dict, source_label: str):
        payload = dict(payload or {})
        payload["zone"] = zone

        movement_profile = payload.get("movement_profile", "normal")
        if not payload.get("gps_history"):
            payload["gps_history"] = build_default_gps_history(zone, movement_profile)

        disruption = self.get_latest_active_disruption(zone)
        trigger_active = bool(disruption)

        if trigger_active:
            base_payout, severity = self.payout_engine.calculate(worker, disruption)
            trigger_snapshot = {
                "event": serialize_disruption(disruption),
                "severity_multiplier": severity,
            }
        else:
            base_payout = 0.0
            trigger_snapshot = {
                "event": None,
                "severity_multiplier": 0.0,
                "message": "No active disruption trigger found in the zone.",
            }

        risk_breakdown, evidence = self.fraud_engine.score_claim(worker, payload, trigger_active)
        syndicate = detect_syndicate_pattern(zone, evidence["feature_vector"])

        liquidity = self.liquidity_guard.evaluate(zone)

        risk_score = float(risk_breakdown["risk_score"])
        hold_reasons = []

        if syndicate["anomaly"]:
            risk_score += 0.28
            hold_reasons.append("Cluster resembles coordinated ring; geo-cluster throttling applied.")

        if liquidity["claim_hold_mode"]:
            risk_score += 0.07

        risk_score = clamp(risk_score, 0.0, 1.0)

        if not trigger_active:
            tier = "Tier 2 - Medium Trust"
            status = "held_revalidation"
            timeline_minutes = 30
            hold_reasons.append("No verified parametric trigger yet. Claim held for oracle cross-validation.")
        elif risk_score < 0.33 and worker.clean_months >= 6 and not syndicate["anomaly"]:
            tier = "Tier 1 - High Trust"
            status = "approved"
            timeline_minutes = 1
        elif risk_score < 0.66 and not risk_breakdown["severe"]:
            tier = "Tier 2 - Medium Trust"
            status = "held_revalidation"
            timeline_minutes = 20
        else:
            tier = "Tier 3 - Fraud Suspected"
            status = "manual_review"
            timeline_minutes = 90

        if liquidity["global_queue"] and status != "approved":
            status = "queued"
            timeline_minutes = max(timeline_minutes, 45)
            hold_reasons.append("Global payout queue active due to anomaly spike.")

        if syndicate["anomaly"] and status == "approved":
            status = "held_revalidation"
            tier = "Tier 2 - Medium Trust"
            timeline_minutes = 30
            hold_reasons.append("High-similarity cluster detected; revalidation required.")

        bridge_loan = 0.0
        final_payout = 0.0
        otp_code = None

        if status == "approved":
            final_payout = round(base_payout * (1 - risk_score * 0.15), 2)
        else:
            if base_payout > 0:
                bridge_factor = 0.25 if tier == "Tier 3 - Fraud Suspected" else 0.15
                bridge_loan = round(min(500.0, base_payout * bridge_factor), 2)
            otp_code = generate_otp()

        validation_snapshot = {
            "risk_score": round(risk_score, 3),
            "tier": tier,
            "status": status,
            "risk_breakdown": risk_breakdown,
            "evidence": evidence,
            "syndicate_analysis": syndicate,
            "feature_vector": evidence["feature_vector"],
            "claim_source": source_label,
        }

        claim = Claim(
            id=str(uuid4()),
            worker_id=worker.id,
            subscription_id=subscription.id,
            zone=zone,
            status=status,
            tier=tier,
            risk_score=risk_score,
            base_payout=base_payout,
            final_payout=final_payout,
            bridge_loan=bridge_loan,
            hold_reason=" ".join(hold_reasons) if hold_reasons else None,
            otp_code=otp_code,
            trigger_snapshot=json.dumps(trigger_snapshot),
            validation_breakdown=json.dumps(validation_snapshot),
            liquidity_snapshot=json.dumps(liquidity),
        )

        db.session.add(claim)

        if status == "approved":
            self.blockchain_service.log_claim(claim)
            self.blockchain_service.log_payout(claim)

        db.session.commit()

        next_steps = []
        if status == "approved":
            next_steps.append("Payout approved and logged on immutable ledger.")
        elif status in ["held_revalidation", "queued"]:
            next_steps.append("Worker must complete OTP + in-app check-in revalidation.")
            next_steps.append("Bridge loan issued where applicable to minimize hardship.")
        else:
            next_steps.append("Claim moved to manual audit with transparency logs preserved.")

        result = {
            "claim": serialize_claim(claim),
            "ledger_entries": serialize_ledger_entries(claim.id),
            "debug_otp": otp_code,
            "decision": {
                "status": status,
                "tier": tier,
                "risk_score": round(risk_score, 3),
                "timeline_minutes": timeline_minutes,
                "otp_required": bool(otp_code),
            },
            "next_steps": next_steps,
        }

        return result, claim

    def auto_initiate_claims_for_zone(self, zone: str, source_label: str, monitor_snapshot: dict):
        now = utc_now()
        cooldown = now - timedelta(hours=2)

        created_claims = []
        status_counts = {}
        skipped = 0

        workers = Worker.query.all()
        for worker in workers:
            worker_zones = parse_json_blob(worker.usual_zones, [worker.primary_zone])
            if zone not in worker_zones and worker.primary_zone != zone:
                continue

            subscription = self.get_active_subscription(worker.id)
            if not subscription:
                continue

            recent_claim = (
                Claim.query.filter(
                    Claim.worker_id == worker.id,
                    Claim.zone == zone,
                    Claim.created_at >= cooldown,
                )
                .order_by(Claim.created_at.desc())
                .first()
            )
            if recent_claim:
                skipped += 1
                continue

            auto_payload = self.build_auto_claim_payload(worker, zone, monitor_snapshot)
            _, claim = self.create_claim_decision(
                worker,
                subscription,
                zone,
                auto_payload,
                source_label=source_label,
            )

            created_claims.append(
                {
                    "worker_id": worker.id,
                    "worker_name": worker.full_name,
                    "claim_id": claim.id,
                    "status": claim.status,
                    "final_payout": claim.final_payout,
                }
            )

            status_counts[claim.status] = status_counts.get(claim.status, 0) + 1

        return {
            "zone": zone,
            "created": len(created_claims),
            "skipped_recent": skipped,
            "status_breakdown": status_counts,
            "claims": created_claims,
        }
