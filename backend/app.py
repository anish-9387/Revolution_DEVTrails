import hashlib
import json
import math
import random
from datetime import datetime, timedelta
from uuid import uuid4

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

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


db = SQLAlchemy()


PLATFORMS = [
    "Zomato",
    "Swiggy",
    "Zepto",
    "Amazon",
    "Blinkit",
    "Flipkart",
    "Meesho",
]

ZONE_COORDS = {
    "mumbai-central": {"lat": 19.0760, "lon": 72.8777},
    "mumbai-west": {"lat": 19.1510, "lon": 72.8300},
    "delhi-north": {"lat": 28.7041, "lon": 77.1025},
    "delhi-south": {"lat": 28.5355, "lon": 77.3910},
    "bengaluru-south": {"lat": 12.9165, "lon": 77.6101},
    "jaipur-east": {"lat": 26.9124, "lon": 75.7873},
}

ZONE_RISK = {
    "mumbai-central": 0.86,
    "mumbai-west": 0.81,
    "delhi-north": 0.68,
    "delhi-south": 0.66,
    "bengaluru-south": 0.59,
    "jaipur-east": 0.44,
}


def utc_now() -> datetime:
    return datetime.utcnow()


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def parse_json_blob(blob, default):
    if blob is None:
        return default
    if isinstance(blob, (dict, list)):
        return blob
    try:
        return json.loads(blob)
    except (TypeError, json.JSONDecodeError):
        return default


def to_iso(dt: datetime) -> str:
    return dt.replace(microsecond=0).isoformat() + "Z"


def zone_distance_km(zone_a: str, zone_b: str) -> float:
    coord_a = ZONE_COORDS.get(zone_a)
    coord_b = ZONE_COORDS.get(zone_b)
    if not coord_a or not coord_b:
        return 0.0
    return geo_distance_km(coord_a["lat"], coord_a["lon"], coord_b["lat"], coord_b["lon"])


def geo_distance_km(lat_1: float, lon_1: float, lat_2: float, lon_2: float) -> float:
    radius = 6371.0
    phi_1 = math.radians(lat_1)
    phi_2 = math.radians(lat_2)
    delta_phi = math.radians(lat_2 - lat_1)
    delta_lambda = math.radians(lon_2 - lon_1)

    value = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi_1) * math.cos(phi_2) * math.sin(delta_lambda / 2) ** 2
    )
    distance = 2 * radius * math.atan2(math.sqrt(value), math.sqrt(1 - value))
    return float(distance)


def euclidean_distance(values_a, values_b) -> float:
    size = min(len(values_a), len(values_b))
    if size == 0:
        return 0.0
    total = 0.0
    for idx in range(size):
        total += (float(values_a[idx]) - float(values_b[idx])) ** 2
    return math.sqrt(total)


def parse_timestamp(raw):
    if not raw:
        return None
    if isinstance(raw, datetime):
        return raw
    text = str(raw).strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo:
        return parsed.replace(tzinfo=None)
    return parsed


def compute_max_speed_kmh(gps_history):
    if not isinstance(gps_history, list) or len(gps_history) < 2:
        return 0.0

    points = []
    for point in gps_history:
        lat = point.get("lat")
        lon = point.get("lon")
        ts = parse_timestamp(point.get("timestamp"))
        if lat is None or lon is None or ts is None:
            continue
        points.append({"lat": float(lat), "lon": float(lon), "timestamp": ts})

    if len(points) < 2:
        return 0.0

    points.sort(key=lambda p: p["timestamp"])
    max_speed = 0.0

    for idx in range(1, len(points)):
        prev_point = points[idx - 1]
        curr_point = points[idx]

        hours = (curr_point["timestamp"] - prev_point["timestamp"]).total_seconds() / 3600
        hours = max(hours, 1 / 3600)

        distance = geo_distance_km(
            prev_point["lat"],
            prev_point["lon"],
            curr_point["lat"],
            curr_point["lon"],
        )

        speed = distance / hours
        max_speed = max(max_speed, speed)

    return round(max_speed, 2)


def build_default_gps_history(zone: str, movement_profile: str = "normal"):
    center = ZONE_COORDS.get(zone, {"lat": 19.0760, "lon": 72.8777})
    now = utc_now()

    if movement_profile == "teleport":
        return [
            {
                "lat": center["lat"] - 0.45,
                "lon": center["lon"] - 0.40,
                "timestamp": to_iso(now - timedelta(seconds=30)),
            },
            {
                "lat": center["lat"],
                "lon": center["lon"],
                "timestamp": to_iso(now),
            },
        ]

    if movement_profile == "static":
        return [
            {
                "lat": center["lat"],
                "lon": center["lon"],
                "timestamp": to_iso(now - timedelta(minutes=8)),
            },
            {
                "lat": center["lat"] + 0.0001,
                "lon": center["lon"] + 0.0001,
                "timestamp": to_iso(now),
            },
        ]

    return [
        {
            "lat": center["lat"] - 0.01,
            "lon": center["lon"] - 0.008,
            "timestamp": to_iso(now - timedelta(minutes=8)),
        },
        {
            "lat": center["lat"] - 0.004,
            "lon": center["lon"] - 0.003,
            "timestamp": to_iso(now - timedelta(minutes=4)),
        },
        {
            "lat": center["lat"],
            "lon": center["lon"],
            "timestamp": to_iso(now),
        },
    ]


def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"


class Worker(db.Model):
    __tablename__ = "workers"

    id = db.Column(db.String(36), primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    platform = db.Column(db.String(40), nullable=False)
    home_city = db.Column(db.String(80), nullable=False)
    primary_zone = db.Column(db.String(80), nullable=False)
    usual_zones = db.Column(db.Text, nullable=False)
    weekly_income = db.Column(db.Float, nullable=False, default=5000.0)
    active_start_hour = db.Column(db.Integer, nullable=False, default=8)
    active_end_hour = db.Column(db.Integer, nullable=False, default=22)
    clean_months = db.Column(db.Integer, nullable=False, default=0)
    device_fingerprint = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)


class Subscription(db.Model):
    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    worker_id = db.Column(db.String(36), db.ForeignKey("workers.id"), nullable=False)
    weekly_premium = db.Column(db.Float, nullable=False)
    premium_breakdown = db.Column(db.Text, nullable=False)
    active = db.Column(db.Boolean, nullable=False, default=True)
    started_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    ended_at = db.Column(db.DateTime, nullable=True)


class DisruptionEvent(db.Model):
    __tablename__ = "disruption_events"

    id = db.Column(db.Integer, primary_key=True)
    zone = db.Column(db.String(80), nullable=False)
    rainfall_mm_hr = db.Column(db.Float, nullable=False, default=0.0)
    heat_index_c = db.Column(db.Float, nullable=False, default=0.0)
    aqi = db.Column(db.Integer, nullable=False, default=0)
    curfew = db.Column(db.Boolean, nullable=False, default=False)
    sustained_hours = db.Column(db.Float, nullable=False, default=0.0)
    official_reports = db.Column(db.Integer, nullable=False, default=0)
    source = db.Column(db.String(80), nullable=False, default="api")
    trigger_flags = db.Column(db.Text, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=False)
    occurred_at = db.Column(db.DateTime, nullable=False, default=utc_now)


class Claim(db.Model):
    __tablename__ = "claims"

    id = db.Column(db.String(36), primary_key=True)
    worker_id = db.Column(db.String(36), db.ForeignKey("workers.id"), nullable=False)
    subscription_id = db.Column(db.Integer, db.ForeignKey("subscriptions.id"), nullable=False)
    zone = db.Column(db.String(80), nullable=False)
    status = db.Column(db.String(40), nullable=False)
    tier = db.Column(db.String(40), nullable=False)
    risk_score = db.Column(db.Float, nullable=False)
    base_payout = db.Column(db.Float, nullable=False, default=0.0)
    final_payout = db.Column(db.Float, nullable=False, default=0.0)
    bridge_loan = db.Column(db.Float, nullable=False, default=0.0)
    hold_reason = db.Column(db.String(300), nullable=True)
    otp_code = db.Column(db.String(6), nullable=True)
    trigger_snapshot = db.Column(db.Text, nullable=False)
    validation_breakdown = db.Column(db.Text, nullable=False)
    liquidity_snapshot = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)


class LedgerEntry(db.Model):
    __tablename__ = "ledger_entries"

    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.String(36), db.ForeignKey("claims.id"), nullable=False)
    entry_type = db.Column(db.String(30), nullable=False)
    payload_hash = db.Column(db.String(64), nullable=False)
    tx_hash = db.Column(db.String(66), nullable=False)
    chain_name = db.Column(db.String(30), nullable=False, default="Polygon")
    recorded_at = db.Column(db.DateTime, nullable=False, default=utc_now)


class PricingEngine:
    def quote(self, worker: Worker, quote_payload: dict):
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

        rainfall_trigger = rainfall > 50.0
        heat_trigger = heat > 42.0 and sustained_hours >= 2.0
        aqi_trigger = aqi > 300
        curfew_trigger = curfew

        return {
            "rainfall_trigger": rainfall_trigger,
            "heat_trigger": heat_trigger,
            "aqi_trigger": aqi_trigger,
            "curfew_trigger": curfew_trigger,
            "active": rainfall_trigger or heat_trigger or aqi_trigger or curfew_trigger,
            "thresholds": {
                "rainfall_mm_hr": 50,
                "heat_index_c": 42,
                "aqi": 300,
            },
        }


class PayoutEngine:
    def calculate(self, worker: Worker, disruption: DisruptionEvent):
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

    def _is_within_shift(self, worker: Worker, hour_value: int) -> bool:
        start = int(worker.active_start_hour)
        end = int(worker.active_end_hour)

        if start <= end:
            return start <= hour_value <= end

        return hour_value >= start or hour_value <= end

    def extract_features(self, worker: Worker, claim_payload: dict):
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

    def score_claim(self, worker: Worker, claim_payload: dict, trigger_active: bool):
        vector, evidence = self.extract_features(worker, claim_payload)

        if self.model is not None:
            model_score = float(self.model.decision_function([vector])[0])
            model_anomaly = clamp((0.14 - model_score) / 0.30, 0.0, 1.0)
        else:
            # Fallback for constrained environments where sklearn/numpy are unavailable.
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

    def _record(self, claim: Claim, entry_type: str, payload: dict):
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

    def log_claim(self, claim: Claim):
        payload = {
            "claim_id": claim.id,
            "worker_id": claim.worker_id,
            "zone": claim.zone,
            "status": claim.status,
            "risk_score": claim.risk_score,
            "recorded_at": to_iso(utc_now()),
        }
        return self._record(claim, "claim_hash", payload)

    def log_payout(self, claim: Claim):
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


def serialize_worker(worker: Worker):
    return {
        "id": worker.id,
        "full_name": worker.full_name,
        "phone": worker.phone,
        "platform": worker.platform,
        "home_city": worker.home_city,
        "primary_zone": worker.primary_zone,
        "usual_zones": parse_json_blob(worker.usual_zones, [worker.primary_zone]),
        "weekly_income": round(worker.weekly_income, 2),
        "active_window": {
            "start_hour": worker.active_start_hour,
            "end_hour": worker.active_end_hour,
        },
        "clean_months": worker.clean_months,
        "device_fingerprint": worker.device_fingerprint,
        "created_at": to_iso(worker.created_at),
    }


def serialize_subscription(subscription: Subscription):
    return {
        "id": subscription.id,
        "worker_id": subscription.worker_id,
        "weekly_premium": round(subscription.weekly_premium, 2),
        "premium_breakdown": parse_json_blob(subscription.premium_breakdown, {}),
        "active": bool(subscription.active),
        "started_at": to_iso(subscription.started_at),
        "ended_at": to_iso(subscription.ended_at) if subscription.ended_at else None,
    }


def serialize_disruption(disruption: DisruptionEvent):
    return {
        "id": disruption.id,
        "zone": disruption.zone,
        "rainfall_mm_hr": disruption.rainfall_mm_hr,
        "heat_index_c": disruption.heat_index_c,
        "aqi": disruption.aqi,
        "curfew": bool(disruption.curfew),
        "sustained_hours": disruption.sustained_hours,
        "official_reports": disruption.official_reports,
        "source": disruption.source,
        "trigger_flags": parse_json_blob(disruption.trigger_flags, {}),
        "is_active": bool(disruption.is_active),
        "occurred_at": to_iso(disruption.occurred_at),
    }


def serialize_claim(claim: Claim):
    return {
        "id": claim.id,
        "worker_id": claim.worker_id,
        "subscription_id": claim.subscription_id,
        "zone": claim.zone,
        "status": claim.status,
        "tier": claim.tier,
        "risk_score": round(claim.risk_score, 3),
        "base_payout": round(claim.base_payout, 2),
        "final_payout": round(claim.final_payout, 2),
        "bridge_loan": round(claim.bridge_loan, 2),
        "hold_reason": claim.hold_reason,
        "otp_required": bool(claim.otp_code),
        "trigger_snapshot": parse_json_blob(claim.trigger_snapshot, {}),
        "validation_breakdown": parse_json_blob(claim.validation_breakdown, {}),
        "liquidity_snapshot": parse_json_blob(claim.liquidity_snapshot, {}),
        "created_at": to_iso(claim.created_at),
        "updated_at": to_iso(claim.updated_at),
    }


def serialize_ledger_entries(claim_id: str):
    entries = LedgerEntry.query.filter(LedgerEntry.claim_id == claim_id).all()
    return [
        {
            "entry_type": entry.entry_type,
            "payload_hash": entry.payload_hash,
            "tx_hash": entry.tx_hash,
            "chain": entry.chain_name,
            "recorded_at": to_iso(entry.recorded_at),
        }
        for entry in entries
    ]


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

    with app.app_context():
        db.create_all()

    def get_latest_active_disruption(zone: str):
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

    @app.post("/api/disruptions/report")
    def report_disruption():
        payload = request.get_json(silent=True) or {}
        zone = payload.get("zone")

        if not zone:
            return jsonify({"error": "zone_required"}), 400
        if zone not in ZONE_COORDS:
            return jsonify({"error": "unsupported_zone", "zone": zone}), 400

        flags = trigger_engine.evaluate(payload)

        event = DisruptionEvent(
            zone=zone,
            rainfall_mm_hr=float(payload.get("rainfall_mm_hr", 0.0)),
            heat_index_c=float(payload.get("heat_index_c", 0.0)),
            aqi=int(payload.get("aqi", 0)),
            curfew=bool(payload.get("curfew", False)),
            sustained_hours=float(payload.get("sustained_hours", 0.0)),
            official_reports=int(payload.get("official_reports", 0)),
            source=payload.get("source", "api"),
            trigger_flags=json.dumps(flags),
            is_active=flags["active"],
        )

        db.session.add(event)
        db.session.commit()

        return jsonify({"event": serialize_disruption(event)}), 201

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

        subscription = (
            Subscription.query.filter_by(worker_id=worker.id, active=True)
            .order_by(Subscription.started_at.desc())
            .first()
        )
        if not subscription:
            return jsonify({"error": "active_subscription_required"}), 400

        payload["zone"] = zone
        movement_profile = payload.get("movement_profile", "normal")
        if not payload.get("gps_history"):
            payload["gps_history"] = build_default_gps_history(zone, movement_profile)

        disruption = get_latest_active_disruption(zone)
        trigger_active = bool(disruption)

        if trigger_active:
            base_payout, severity = payout_engine.calculate(worker, disruption)
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

        risk_breakdown, evidence = fraud_engine.score_claim(worker, payload, trigger_active)
        syndicate = detect_syndicate_pattern(zone, evidence["feature_vector"])

        liquidity = liquidity_guard.evaluate(zone)

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
            blockchain_service.log_claim(claim)
            blockchain_service.log_payout(claim)

        db.session.commit()

        next_steps = []
        if status == "approved":
            next_steps.append("Payout approved and logged on immutable ledger.")
        elif status in ["held_revalidation", "queued"]:
            next_steps.append("Worker must complete OTP + in-app check-in revalidation.")
            next_steps.append("Bridge loan issued where applicable to minimize hardship.")
        else:
            next_steps.append("Claim moved to manual audit with transparency logs preserved.")

        return jsonify(
            {
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
        ), 201

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


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
