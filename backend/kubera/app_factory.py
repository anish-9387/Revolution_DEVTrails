import json
from datetime import timedelta
from uuid import uuid4

from flask import Flask, jsonify, request
from flask_cors import CORS

from .constants import PLATFORMS, ZONE_COORDS, ZONE_RISK
from .db import db
from .engines import (
    BlockchainService,
    FraudEngine,
    LiquidityGuard,
    PayoutEngine,
    PricingEngine,
    TriggerEngine,
)
from .models import Claim, DisruptionEvent, Subscription, Worker
from .orchestrator import ClaimOrchestrator
from .serializers import (
    serialize_claim,
    serialize_disruption,
    serialize_ledger_entries,
    serialize_subscription,
    serialize_worker,
)
from .utils import mock_external_signals, parse_json_blob, utc_now


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///kubera.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    pricing_engine = PricingEngine()
    trigger_engine = TriggerEngine()
    payout_engine = PayoutEngine()
    fraud_engine = FraudEngine()
    liquidity_guard = LiquidityGuard()
    blockchain_service = BlockchainService()
    orchestrator = ClaimOrchestrator(
        trigger_engine=trigger_engine,
        payout_engine=payout_engine,
        fraud_engine=fraud_engine,
        liquidity_guard=liquidity_guard,
        blockchain_service=blockchain_service,
    )

    with app.app_context():
        db.create_all()

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok", "service": "KuberaAI API"})

    @app.get("/api/meta")
    def get_meta():
        zones = []
        for zone_name, coords in ZONE_COORDS.items():
            zones.append(
                {
                    "name": zone_name,
                    "risk_score": ZONE_RISK.get(zone_name, 0.55),
                    "lat": coords["lat"],
                    "lon": coords["lon"],
                }
            )

        return jsonify(
            {
                "platforms": PLATFORMS,
                "zones": zones,
                "trigger_thresholds": {
                    "rainfall_mm_hr": 50,
                    "heat_index_c": 42,
                    "aqi": 300,
                    "curfew": True,
                    "official_reports": 3,
                    "traffic_slowdown_index": 0.82,
                    "platform_outage": True,
                },
            }
        )

    @app.get("/api/scenarios")
    def get_scenarios():
        return jsonify(
            {
                "scenarios": [
                    {
                        "id": "genuine-rainfall",
                        "name": "Genuine Rainfall Claim",
                        "description": "Healthy platform activity and consistent sensor/network evidence.",
                        "disruption": {
                            "rainfall_mm_hr": 64,
                            "heat_index_c": 34,
                            "aqi": 165,
                            "curfew": False,
                            "sustained_hours": 2,
                        },
                        "claim_overrides": {
                            "movement_profile": "normal",
                            "platform_activity": {
                                "orders_accepted": 10,
                                "orders_completed": 8,
                            },
                            "motion": {
                                "accel_variance": 1.1,
                                "gyro_variance": 0.75,
                            },
                            "network": {
                                "wifi_match": True,
                                "cell_match": True,
                                "ip_geo_match": True,
                            },
                            "device": {
                                "rooted": False,
                                "emulator": False,
                            },
                        },
                    },
                    {
                        "id": "gps-spoof-attempt",
                        "name": "GPS Spoof Attempt",
                        "description": "Teleport movement, rooted device, low order activity.",
                        "disruption": {
                            "rainfall_mm_hr": 58,
                            "heat_index_c": 33,
                            "aqi": 140,
                            "curfew": False,
                            "sustained_hours": 1,
                        },
                        "claim_overrides": {
                            "movement_profile": "teleport",
                            "platform_activity": {
                                "orders_accepted": 4,
                                "orders_completed": 0,
                            },
                            "motion": {
                                "accel_variance": 4.8,
                                "gyro_variance": 4.2,
                            },
                            "network": {
                                "wifi_match": False,
                                "cell_match": False,
                                "ip_geo_match": False,
                            },
                            "device": {
                                "rooted": True,
                                "emulator": True,
                            },
                            "environmental_alignment": False,
                        },
                    },
                    {
                        "id": "medium-risk-revalidation",
                        "name": "Medium Risk Revalidation",
                        "description": "New zone behavior but plausible movement and activity.",
                        "disruption": {
                            "rainfall_mm_hr": 0,
                            "heat_index_c": 44,
                            "aqi": 240,
                            "curfew": False,
                            "sustained_hours": 3,
                        },
                        "claim_overrides": {
                            "movement_profile": "normal",
                            "platform_activity": {
                                "orders_accepted": 6,
                                "orders_completed": 4,
                            },
                            "motion": {
                                "accel_variance": 1.6,
                                "gyro_variance": 1.2,
                            },
                            "network": {
                                "wifi_match": True,
                                "cell_match": True,
                                "ip_geo_match": False,
                            },
                        },
                    },
                    {
                        "id": "no-trigger-edge-case",
                        "name": "No Trigger Edge Case",
                        "description": "Claim submitted while no thresholds are crossed.",
                        "disruption": {
                            "rainfall_mm_hr": 12,
                            "heat_index_c": 34,
                            "aqi": 140,
                            "curfew": False,
                            "sustained_hours": 1,
                        },
                        "claim_overrides": {
                            "movement_profile": "normal",
                            "platform_activity": {
                                "orders_accepted": 7,
                                "orders_completed": 6,
                            },
                        },
                    },
                ]
            }
        )

    @app.post("/api/workers/register")
    def register_worker():
        payload = request.get_json(silent=True) or {}

        required_fields = ["full_name", "phone", "platform", "home_city", "primary_zone"]
        missing = [field for field in required_fields if not payload.get(field)]
        if missing:
            return jsonify({"error": "missing_required_fields", "fields": missing}), 400

        if payload["platform"] not in PLATFORMS:
            return jsonify({"error": "unsupported_platform", "platform": payload["platform"]}), 400

        if payload["primary_zone"] not in ZONE_COORDS:
            return jsonify({"error": "unsupported_zone", "zone": payload["primary_zone"]}), 400

        zones = payload.get("usual_zones") or [payload["primary_zone"]]
        if payload["primary_zone"] not in zones:
            zones.append(payload["primary_zone"])

        worker = Worker(
            id=str(uuid4()),
            full_name=payload["full_name"].strip(),
            phone=payload["phone"].strip(),
            platform=payload["platform"],
            home_city=payload["home_city"].strip(),
            primary_zone=payload["primary_zone"],
            usual_zones=json.dumps(zones),
            weekly_income=float(payload.get("weekly_income", 5000.0)),
            active_start_hour=int(payload.get("active_start_hour", 8)),
            active_end_hour=int(payload.get("active_end_hour", 22)),
            clean_months=int(payload.get("clean_months", 0)),
            device_fingerprint=payload.get("device_fingerprint", ""),
        )

        db.session.add(worker)
        db.session.commit()

        return jsonify({"worker": serialize_worker(worker)}), 201

    @app.post("/api/workers/<worker_id>/quote")
    def quote(worker_id):
        worker = db.session.get(Worker, worker_id)
        if not worker:
            return jsonify({"error": "worker_not_found"}), 404

        payload = request.get_json(silent=True) or {}
        premium, breakdown = pricing_engine.quote(worker, payload)

        return jsonify(
            {
                "worker_id": worker.id,
                "weekly_premium": premium,
                "breakdown": breakdown,
            }
        )

    @app.post("/api/workers/<worker_id>/subscribe")
    def subscribe(worker_id):
        worker = db.session.get(Worker, worker_id)
        if not worker:
            return jsonify({"error": "worker_not_found"}), 404

        payload = request.get_json(silent=True) or {}
        premium, breakdown = pricing_engine.quote(worker, payload)

        existing = Subscription.query.filter_by(worker_id=worker.id, active=True).all()
        for item in existing:
            item.active = False
            item.ended_at = utc_now()

        subscription = Subscription(
            worker_id=worker.id,
            weekly_premium=premium,
            premium_breakdown=json.dumps(breakdown),
            active=True,
        )

        db.session.add(subscription)
        db.session.commit()

        return jsonify({"subscription": serialize_subscription(subscription)}), 201

    @app.get("/api/workers/<worker_id>/policies")
    def list_worker_policies(worker_id):
        worker = db.session.get(Worker, worker_id)
        if not worker:
            return jsonify({"error": "worker_not_found"}), 404

        subscriptions = (
            Subscription.query.filter_by(worker_id=worker.id)
            .order_by(Subscription.started_at.desc())
            .all()
        )

        active_policy = next((item for item in subscriptions if item.active), None)

        return jsonify(
            {
                "worker_id": worker.id,
                "active_policy": serialize_subscription(active_policy) if active_policy else None,
                "policies": [serialize_subscription(item) for item in subscriptions],
                "coverage_scope": {
                    "income_loss_only": True,
                    "excluded": [
                        "health",
                        "life",
                        "accidents",
                        "vehicle_repairs",
                    ],
                },
            }
        )

    @app.post("/api/policies/<int:policy_id>/cancel")
    def cancel_policy(policy_id):
        policy = db.session.get(Subscription, policy_id)
        if not policy:
            return jsonify({"error": "policy_not_found"}), 404

        if not policy.active:
            return jsonify({"error": "policy_already_inactive", "policy": serialize_subscription(policy)}), 400

        policy.active = False
        policy.ended_at = utc_now()
        db.session.commit()

        return jsonify(
            {
                "policy": serialize_subscription(policy),
                "message": "Policy cancelled. Future automated claims are paused for this worker.",
            }
        )

    @app.post("/api/disruptions/report")
    def report_disruption():
        payload = request.get_json(silent=True) or {}
        zone = payload.get("zone")

        if not zone:
            return jsonify({"error": "zone_required"}), 400
        if zone not in ZONE_COORDS:
            return jsonify({"error": "unsupported_zone", "zone": zone}), 400

        if bool(payload.get("use_mock_oracle", False)):
            oracle_snapshot = mock_external_signals(zone)
            payload = {
                **oracle_snapshot,
                **payload,
                "zone": zone,
                "source": payload.get("source", "manual-plus-mock"),
            }

        event = orchestrator.create_disruption_event(payload, fallback_source="api")

        auto_summary = {
            "zone": zone,
            "created": 0,
            "skipped_recent": 0,
            "status_breakdown": {},
            "claims": [],
        }
        auto_enabled = bool(payload.get("auto_initiate_claims", True))

        if auto_enabled and event.is_active:
            auto_summary = orchestrator.auto_initiate_claims_for_zone(
                zone,
                source_label=f"auto-trigger:event-{event.id}",
                monitor_snapshot=payload,
            )

        return jsonify({"event": serialize_disruption(event), "auto_claims": auto_summary}), 201

    @app.post("/api/automation/monitor")
    def monitor_and_trigger():
        payload = request.get_json(silent=True) or {}
        zones = payload.get("zones") or list(ZONE_COORDS.keys())
        auto_enabled = bool(payload.get("auto_initiate_claims", True))

        run_results = []
        total_auto_claims = 0

        for zone in zones:
            if zone not in ZONE_COORDS:
                continue

            snapshot = mock_external_signals(zone)
            snapshot["source"] = payload.get("source", "mock-monitor")

            event = orchestrator.create_disruption_event(snapshot, fallback_source="mock-monitor")

            auto_summary = {
                "zone": zone,
                "created": 0,
                "skipped_recent": 0,
                "status_breakdown": {},
                "claims": [],
            }

            if auto_enabled and event.is_active:
                auto_summary = orchestrator.auto_initiate_claims_for_zone(
                    zone,
                    source_label=f"auto-monitor:event-{event.id}",
                    monitor_snapshot=snapshot,
                )

            total_auto_claims += int(auto_summary.get("created", 0))
            run_results.append(
                {
                    "zone": zone,
                    "event": serialize_disruption(event),
                    "auto_claims": auto_summary,
                }
            )

        return jsonify(
            {
                "zones_processed": len(run_results),
                "auto_claims_created": total_auto_claims,
                "runs": run_results,
            }
        )

    @app.get("/api/disruptions/active")
    def get_active_disruptions():
        zone = request.args.get("zone")
        horizon = utc_now() - timedelta(hours=6)

        query = DisruptionEvent.query.filter(
            DisruptionEvent.is_active.is_(True),
            DisruptionEvent.occurred_at >= horizon,
        )
        if zone:
            query = query.filter(DisruptionEvent.zone == zone)

        events = query.order_by(DisruptionEvent.occurred_at.desc()).all()

        return jsonify({"events": [serialize_disruption(event) for event in events]})

    @app.post("/api/claims/submit")
    def submit_claim():
        payload = request.get_json(silent=True) or {}
        worker_id = payload.get("worker_id")
        zone = payload.get("zone")

        if not worker_id or not zone:
            return jsonify({"error": "worker_id_and_zone_required"}), 400

        worker = db.session.get(Worker, worker_id)
        if not worker:
            return jsonify({"error": "worker_not_found"}), 404

        if zone not in ZONE_COORDS:
            return jsonify({"error": "unsupported_zone", "zone": zone}), 400

        subscription = orchestrator.get_active_subscription(worker.id)
        if not subscription:
            return jsonify({"error": "active_subscription_required"}), 400

        decision, _ = orchestrator.create_claim_decision(
            worker,
            subscription,
            zone,
            payload,
            source_label="manual-claim",
        )

        return jsonify(decision), 201

    @app.post("/api/claims/<claim_id>/revalidate")
    def revalidate_claim(claim_id):
        claim = db.session.get(Claim, claim_id)
        if not claim:
            return jsonify({"error": "claim_not_found"}), 404

        if claim.status == "approved":
            return jsonify({"error": "claim_already_approved", "claim": serialize_claim(claim)}), 400

        payload = request.get_json(silent=True) or {}

        otp_ok = True
        if claim.otp_code:
            otp_ok = payload.get("otp_code") == claim.otp_code

        in_app_check_in = bool(payload.get("in_app_check_in", False))
        device_confirmed = bool(payload.get("device_confirmed", False))

        if otp_ok and in_app_check_in and device_confirmed:
            claim.status = "approved"
            claim.hold_reason = "Revalidation successful; payout released."
            claim.final_payout = round(claim.base_payout * (1 - claim.risk_score * 0.10), 2)
            if claim.bridge_loan <= 0 and claim.base_payout > 0:
                claim.bridge_loan = round(min(400.0, claim.base_payout * 0.10), 2)
            claim.otp_code = None

            blockchain_service.log_claim(claim)
            blockchain_service.log_payout(claim)
            db.session.commit()

            return jsonify(
                {
                    "result": "approved",
                    "claim": serialize_claim(claim),
                    "ledger_entries": serialize_ledger_entries(claim.id),
                }
            )

        claim.status = "manual_review"
        claim.hold_reason = "Revalidation incomplete or invalid OTP; manual review required."
        db.session.commit()

        return jsonify(
            {
                "result": "manual_review",
                "claim": serialize_claim(claim),
            }
        )

    @app.get("/api/claims")
    def list_claims():
        worker_id = request.args.get("worker_id")

        query = Claim.query
        if worker_id:
            query = query.filter(Claim.worker_id == worker_id)

        claims = query.order_by(Claim.created_at.desc()).limit(100).all()

        output = []
        for claim in claims:
            data = serialize_claim(claim)
            data["ledger_entries"] = serialize_ledger_entries(claim.id)
            output.append(data)

        return jsonify({"claims": output})

    @app.get("/api/dashboard/<worker_id>")
    def worker_dashboard(worker_id):
        worker = db.session.get(Worker, worker_id)
        if not worker:
            return jsonify({"error": "worker_not_found"}), 404

        subscription = (
            Subscription.query.filter_by(worker_id=worker.id, active=True)
            .order_by(Subscription.started_at.desc())
            .first()
        )

        claims = (
            Claim.query.filter_by(worker_id=worker.id)
            .order_by(Claim.created_at.desc())
            .limit(10)
            .all()
        )

        zones = parse_json_blob(worker.usual_zones, [worker.primary_zone])
        horizon = utc_now() - timedelta(hours=6)

        disruptions = (
            DisruptionEvent.query.filter(
                DisruptionEvent.zone.in_(zones),
                DisruptionEvent.occurred_at >= horizon,
            )
            .order_by(DisruptionEvent.occurred_at.desc())
            .limit(10)
            .all()
        )

        return jsonify(
            {
                "worker": serialize_worker(worker),
                "active_subscription": serialize_subscription(subscription) if subscription else None,
                "recent_claims": [serialize_claim(claim) for claim in claims],
                "recent_disruptions": [serialize_disruption(item) for item in disruptions],
            }
        )

    return app
