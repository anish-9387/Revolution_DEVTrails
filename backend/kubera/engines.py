import hashlib
import json
from datetime import timedelta

from .constants import ZONE_RISK
from .db import db
from .models import Claim, LedgerEntry
from .utils import (
    clamp,
    compute_max_speed_kmh,
    euclidean_distance,
    parse_json_blob,
    parse_timestamp,
    to_iso,
    utc_now,
    zone_distance_km,
)

try:
    import numpy as np
except ImportError:
    np = None

try:
    from sklearn.cluster import DBSCAN
    from sklearn.ensemble import IsolationForest
except ImportError:
    DBSCAN = None
    IsolationForest = None


class PricingEngine:
    def quote(self, worker, quote_payload: dict):
        weekly_income = float(quote_payload.get("weekly_income", worker.weekly_income))
        weekly_income = max(weekly_income, 1000.0)

        zones = quote_payload.get("zones") or parse_json_blob(worker.usual_zones, [worker.primary_zone])
        zones = [zone for zone in zones if zone in ZONE_RISK]
        if not zones:
            zones = [worker.primary_zone]

        zone_risk = sum(ZONE_RISK.get(zone, 0.55) for zone in zones) / len(zones)

        hours_active = float(quote_payload.get("hours_active_per_week", 45.0))
        hours_factor = clamp(hours_active / 50.0, 0.5, 1.5)

        historical_disruption_factor = float(quote_payload.get("historical_disruption_factor", 1.0))
        disruption_factor = clamp(historical_disruption_factor, 0.6, 1.6)

        base_rate = 0.025 + zone_risk * 0.045
        premium = weekly_income * base_rate * hours_factor * disruption_factor
        premium = max(premium, 70.0)

        breakdown = {
            "weekly_income": round(weekly_income, 2),
            "zone_risk_score": round(zone_risk, 3),
            "hours_factor": round(hours_factor, 3),
            "historical_disruption_factor": round(disruption_factor, 3),
            "base_rate": round(base_rate, 4),
            "zones": zones,
        }

        return round(premium, 2), breakdown


class TriggerEngine:
    def evaluate(self, event_like):
        rainfall = float(event_like.get("rainfall_mm_hr", 0.0))
        heat = float(event_like.get("heat_index_c", 0.0))
        aqi = int(event_like.get("aqi", 0))
        curfew = bool(event_like.get("curfew", False))
        sustained_hours = float(event_like.get("sustained_hours", 0.0))
        official_reports = int(event_like.get("official_reports", 0))
        traffic_slowdown_index = float(event_like.get("traffic_slowdown_index", 0.0))
        platform_outage = bool(event_like.get("platform_outage", False))

        rainfall_trigger = rainfall > 50.0
        heat_trigger = heat > 42.0 and sustained_hours >= 2.0
        aqi_trigger = aqi > 300
        curfew_trigger = curfew
        official_alert_trigger = official_reports >= 3
        traffic_trigger = traffic_slowdown_index >= 0.82
        platform_outage_trigger = platform_outage

        active = any(
            [
                rainfall_trigger,
                heat_trigger,
                aqi_trigger,
                curfew_trigger,
                official_alert_trigger,
                traffic_trigger,
                platform_outage_trigger,
            ]
        )

        return {
            "rainfall_trigger": rainfall_trigger,
            "heat_trigger": heat_trigger,
            "aqi_trigger": aqi_trigger,
            "curfew_trigger": curfew_trigger,
            "official_alert_trigger": official_alert_trigger,
            "traffic_trigger": traffic_trigger,
            "platform_outage_trigger": platform_outage_trigger,
            "active": active,
            "active_trigger_count": int(
                rainfall_trigger
                + heat_trigger
                + aqi_trigger
                + curfew_trigger
                + official_alert_trigger
                + traffic_trigger
                + platform_outage_trigger
            ),
            "thresholds": {
                "rainfall_mm_hr": 50,
                "heat_index_c": 42,
                "aqi": 300,
                "official_reports": 3,
                "traffic_slowdown_index": 0.82,
            },
        }


class PayoutEngine:
    def calculate(self, worker, disruption):
        weekly_income = float(worker.weekly_income)

        severity_rain = disruption.rainfall_mm_hr / 50.0
        severity_heat = disruption.heat_index_c / 42.0
        severity_aqi = disruption.aqi / 300.0
        severity_curfew = 1.2 if disruption.curfew else 0.0

        severity = max(1.0, severity_rain, severity_heat, severity_aqi, severity_curfew)
        raw_payout = weekly_income * 0.30 * severity
        capped = min(raw_payout, weekly_income * 0.80, 7000.0)

        return round(capped, 2), round(severity, 2)


class FraudEngine:
    def __init__(self):
        self.model = self._train_model()

    def _train_model(self):
        if np is None or IsolationForest is None:
            return None

        rng = np.random.default_rng(seed=42)
        size = 400

        speed = np.clip(rng.normal(28, 6, size), 2, 90)
        completion_rate = np.clip(rng.normal(0.86, 0.08, size), 0.1, 1.0)
        sensor_consistency = np.clip(rng.normal(0.88, 0.06, size), 0.2, 1.0)
        network_match = np.clip(rng.normal(0.9, 0.07, size), 0.2, 1.0)
        zone_distance = np.clip(rng.normal(6, 4, size), 0, 40)
        device_integrity = rng.binomial(1, 0.95, size)

        sample = np.column_stack(
            [
                speed,
                completion_rate,
                sensor_consistency,
                network_match,
                zone_distance,
                device_integrity,
            ]
        )

        model = IsolationForest(
            n_estimators=200,
            contamination=0.08,
            random_state=42,
        )
        model.fit(sample)
        return model

    def _is_within_shift(self, worker, hour_value: int) -> bool:
        start = int(worker.active_start_hour)
        end = int(worker.active_end_hour)

        if start <= end:
            return start <= hour_value <= end

        return hour_value >= start or hour_value <= end

    def extract_features(self, worker, claim_payload: dict):
        activity = claim_payload.get("platform_activity", {})
        motion = claim_payload.get("motion", {})
        network = claim_payload.get("network", {})
        device = claim_payload.get("device", {})

        accepted_orders = float(activity.get("orders_accepted", 0.0))
        completed_orders = float(activity.get("orders_completed", 0.0))
        completion_rate = clamp(completed_orders / max(accepted_orders, 1.0), 0.0, 1.0)

        accel_variance = float(motion.get("accel_variance", 1.2))
        gyro_variance = float(motion.get("gyro_variance", 0.8))
        sensor_consistency = motion.get("sensor_consistency")
        if sensor_consistency is None:
            accel_component = clamp(1.0 - abs(accel_variance - 1.2) / 3.0, 0.0, 1.0)
            gyro_component = clamp(1.0 - abs(gyro_variance - 0.8) / 3.0, 0.0, 1.0)
            sensor_consistency = round((accel_component + gyro_component) / 2.0, 3)
        sensor_consistency = float(sensor_consistency)

        wifi_match = bool(network.get("wifi_match", True))
        cell_match = bool(network.get("cell_match", True))
        ip_geo_match = bool(network.get("ip_geo_match", True))
        network_match = (float(wifi_match) + float(cell_match) + float(ip_geo_match)) / 3.0

        claim_zone = claim_payload.get("zone", worker.primary_zone)
        distance_from_usual = zone_distance_km(worker.primary_zone, claim_zone)

        rooted = bool(device.get("rooted", False))
        emulator = bool(device.get("emulator", False))
        device_integrity = 0.0 if rooted or emulator else 1.0

        session_device = device.get("session_device_id")
        session_mismatch = bool(
            worker.device_fingerprint and session_device and session_device != worker.device_fingerprint
        )

        gps_history = claim_payload.get("gps_history", [])
        max_speed = compute_max_speed_kmh(gps_history)

        claim_ts = parse_timestamp(claim_payload.get("claim_timestamp")) or utc_now()
        shift_anomaly = not self._is_within_shift(worker, claim_ts.hour)

        environmental_alignment = bool(claim_payload.get("environmental_alignment", True))

        feature_vector = [
            max_speed,
            completion_rate,
            sensor_consistency,
            network_match,
            distance_from_usual,
            device_integrity,
        ]

        evidence = {
            "max_speed_kmh": round(max_speed, 2),
            "order_completion_rate": round(completion_rate, 3),
            "sensor_consistency": round(sensor_consistency, 3),
            "network_match": round(network_match, 3),
            "distance_from_usual_zone_km": round(distance_from_usual, 2),
            "device_integrity": bool(device_integrity),
            "rooted": rooted,
            "emulator": emulator,
            "shift_anomaly": shift_anomaly,
            "session_mismatch": session_mismatch,
            "environmental_alignment": environmental_alignment,
            "feature_vector": [round(float(v), 4) for v in feature_vector],
        }

        return feature_vector, evidence

    def score_claim(self, worker, claim_payload: dict, trigger_active: bool):
        vector, evidence = self.extract_features(worker, claim_payload)

        if self.model is not None:
            model_score = float(self.model.decision_function([vector])[0])
            model_anomaly = clamp((0.14 - model_score) / 0.30, 0.0, 1.0)
        else:
            baseline = [28.0, 0.86, 0.88, 0.90, 6.0, 1.0]
            scaling = [80.0, 1.0, 1.0, 1.0, 70.0, 1.0]
            deltas = []
            for idx, value in enumerate(vector):
                deltas.append(abs(float(value) - baseline[idx]) / max(scaling[idx], 0.001))
            model_anomaly = clamp(sum(deltas) / len(deltas), 0.0, 1.0)

        penalties = 0.0
        reasons = []

        if evidence["max_speed_kmh"] > 120:
            penalties += 0.35
            reasons.append("impossible_movement_detected")

        if evidence["order_completion_rate"] < 0.2:
            penalties += 0.15
            reasons.append("platform_activity_low")

        if evidence["sensor_consistency"] < 0.45:
            penalties += 0.15
            reasons.append("sensor_motion_mismatch")

        if evidence["network_match"] < 0.5:
            penalties += 0.10
            reasons.append("network_triangulation_mismatch")

        if evidence["distance_from_usual_zone_km"] > 50:
            penalties += 0.10
            reasons.append("geographic_pivot_detected")

        if not evidence["device_integrity"]:
            penalties += 0.20
            reasons.append("device_integrity_failure")

        if evidence["session_mismatch"]:
            penalties += 0.12
            reasons.append("session_inconsistency")

        if evidence["shift_anomaly"]:
            penalties += 0.08
            reasons.append("sleep_pattern_deviation")

        if not evidence["environmental_alignment"]:
            penalties += 0.12
            reasons.append("environmental_data_mismatch")

        if not trigger_active:
            penalties += 0.12
            reasons.append("parametric_trigger_not_confirmed")

        severe = bool(
            evidence["max_speed_kmh"] > 180
            or (
                not evidence["device_integrity"]
                and evidence["order_completion_rate"] < 0.2
                and evidence["sensor_consistency"] < 0.35
            )
        )

        risk_score = clamp(model_anomaly * 0.62 + penalties, 0.0, 1.0)

        breakdown = {
            "model_anomaly_component": round(model_anomaly, 3),
            "rules_penalty_component": round(penalties, 3),
            "risk_score": round(risk_score, 3),
            "reasons": reasons,
            "severe": severe,
        }

        return breakdown, evidence


class LiquidityGuard:
    def evaluate(self, zone: str):
        now = utc_now()
        ten_minutes_ago = now - timedelta(minutes=10)
        one_day_ago = now - timedelta(hours=24)

        claims_last_10m = Claim.query.filter(Claim.created_at >= ten_minutes_ago).count()
        zone_claims_last_10m = Claim.query.filter(
            Claim.created_at >= ten_minutes_ago,
            Claim.zone == zone,
        ).count()

        claims_24h = Claim.query.filter(Claim.created_at >= one_day_ago).count()
        historical_rate_per_10m = claims_24h / 144.0
        historical_rate_per_10m = max(historical_rate_per_10m, 0.5)

        spike_ratio = claims_last_10m / historical_rate_per_10m

        hold_mode = spike_ratio > 3.0
        global_queue = spike_ratio > 5.0

        return {
            "claims_last_10m": claims_last_10m,
            "zone_claims_last_10m": zone_claims_last_10m,
            "historical_rate_per_10m": round(historical_rate_per_10m, 2),
            "spike_ratio": round(spike_ratio, 2),
            "claim_hold_mode": hold_mode,
            "global_queue": global_queue,
        }


class BlockchainService:
    chain_name = "Polygon"

    def _record(self, claim, entry_type: str, payload: dict):
        payload_text = json.dumps(payload, sort_keys=True)
        payload_hash = hashlib.sha256(payload_text.encode("utf-8")).hexdigest()

        seed = f"{entry_type}|{claim.id}|{payload_hash}|{to_iso(utc_now())}"
        tx_hash = "0x" + hashlib.sha256(seed.encode("utf-8")).hexdigest()

        db.session.add(
            LedgerEntry(
                claim_id=claim.id,
                entry_type=entry_type,
                payload_hash=payload_hash,
                tx_hash=tx_hash,
                chain_name=self.chain_name,
            )
        )

        return {"payload_hash": payload_hash, "tx_hash": tx_hash, "chain": self.chain_name}

    def log_claim(self, claim):
        payload = {
            "claim_id": claim.id,
            "worker_id": claim.worker_id,
            "zone": claim.zone,
            "status": claim.status,
            "risk_score": claim.risk_score,
            "recorded_at": to_iso(utc_now()),
        }
        return self._record(claim, "claim_hash", payload)

    def log_payout(self, claim):
        payload = {
            "claim_id": claim.id,
            "worker_id": claim.worker_id,
            "payout": claim.final_payout,
            "bridge_loan": claim.bridge_loan,
            "recorded_at": to_iso(utc_now()),
        }
        return self._record(claim, "payout_record", payload)


def detect_syndicate_pattern(zone: str, feature_vector):
    horizon_start = utc_now() - timedelta(minutes=30)

    recent_claims = Claim.query.filter(
        Claim.zone == zone,
        Claim.created_at >= horizon_start,
    ).all()

    vectors = []
    for claim in recent_claims:
        snapshot = parse_json_blob(claim.validation_breakdown, {})
        historical_vector = snapshot.get("feature_vector")
        if isinstance(historical_vector, list) and len(historical_vector) == 6:
            vectors.append([float(item) for item in historical_vector])

    vectors.append([float(item) for item in feature_vector])

    if len(vectors) < 6:
        return {
            "anomaly": False,
            "cluster_similarity_score": 0.0,
            "cluster_size": len(vectors),
        }

    if np is not None and DBSCAN is not None:
        matrix = np.array(vectors, dtype=float)

        mean = matrix.mean(axis=0)
        std = matrix.std(axis=0)
        std[std == 0] = 1.0
        normalized = (matrix - mean) / std

        labels = DBSCAN(eps=0.95, min_samples=5).fit_predict(normalized)
        current_label = int(labels[-1])

        if current_label == -1:
            return {
                "anomaly": False,
                "cluster_similarity_score": 0.0,
                "cluster_size": 1,
            }

        cluster_points = normalized[labels == current_label]
        cluster_size = int(cluster_points.shape[0])

        distances = []
        for idx_a in range(cluster_size):
            for idx_b in range(idx_a + 1, cluster_size):
                distances.append(float(np.linalg.norm(cluster_points[idx_a] - cluster_points[idx_b])))

        if distances:
            mean_distance = sum(distances) / len(distances)
        else:
            mean_distance = 0.0

        similarity = clamp(1.0 - (mean_distance / 3.5), 0.0, 1.0)
        anomaly = cluster_size >= 5 and similarity >= 0.65

        return {
            "anomaly": bool(anomaly),
            "cluster_similarity_score": round(similarity, 3),
            "cluster_size": cluster_size,
        }

    current_vector = vectors[-1]
    close_distances = []
    for historical in vectors[:-1]:
        distance = euclidean_distance(current_vector, historical)
        if distance <= 15.0:
            close_distances.append(distance)

    cluster_size = len(close_distances) + 1
    if close_distances:
        mean_distance = sum(close_distances) / len(close_distances)
    else:
        mean_distance = 999.0

    similarity = clamp(1.0 - (mean_distance / 20.0), 0.0, 1.0)
    anomaly = cluster_size >= 5 and similarity >= 0.65

    return {
        "anomaly": bool(anomaly),
        "cluster_similarity_score": round(similarity, 3),
        "cluster_size": cluster_size,
    }
