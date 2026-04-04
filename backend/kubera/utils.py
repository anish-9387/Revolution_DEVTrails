import json
import math
import random
from datetime import datetime, timedelta

from .constants import ZONE_COORDS, ZONE_RISK


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


def zone_distance_km(zone_a: str, zone_b: str) -> float:
    coord_a = ZONE_COORDS.get(zone_a)
    coord_b = ZONE_COORDS.get(zone_b)
    if not coord_a or not coord_b:
        return 0.0
    return geo_distance_km(coord_a["lat"], coord_a["lon"], coord_b["lat"], coord_b["lon"])


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


def mock_external_signals(zone: str):
    risk = ZONE_RISK.get(zone, 0.55)
    now = utc_now()

    monsoon_boost = 0.18 if now.month in [6, 7, 8, 9] else 0.0

    rainfall = max(0.0, random.gauss(18 + risk * 42 + monsoon_boost * 50, 16))
    heat_index = max(25.0, random.gauss(34 + risk * 8, 4))
    aqi = int(max(60.0, random.gauss(180 + risk * 140, 45)))

    traffic_slowdown = clamp(random.uniform(0.35, 0.95) + risk * 0.12, 0.0, 1.0)

    official_reports = int(
        round(max(0.0, random.gauss(risk * 3.2 + monsoon_boost * 4.2, 1.4)))
    )

    platform_outage = random.random() < (0.03 + risk * 0.08)
    curfew = random.random() < (0.02 + risk * 0.06) or official_reports >= 5
    sustained_hours = round(clamp(random.uniform(0.5, 4.5) + risk, 0.5, 6.0), 1)

    return {
        "zone": zone,
        "rainfall_mm_hr": round(rainfall, 2),
        "heat_index_c": round(heat_index, 2),
        "aqi": int(aqi),
        "curfew": bool(curfew),
        "sustained_hours": sustained_hours,
        "official_reports": official_reports,
        "traffic_slowdown_index": round(traffic_slowdown, 3),
        "platform_outage": bool(platform_outage),
        "source": "mock-monitor",
    }


def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"
