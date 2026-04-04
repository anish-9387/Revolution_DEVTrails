from .models import LedgerEntry
from .utils import parse_json_blob, to_iso


def serialize_worker(worker):
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


def serialize_subscription(subscription):
    return {
        "id": subscription.id,
        "worker_id": subscription.worker_id,
        "weekly_premium": round(subscription.weekly_premium, 2),
        "premium_breakdown": parse_json_blob(subscription.premium_breakdown, {}),
        "active": bool(subscription.active),
        "started_at": to_iso(subscription.started_at),
        "ended_at": to_iso(subscription.ended_at) if subscription.ended_at else None,
    }


def serialize_disruption(disruption):
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


def serialize_claim(claim):
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
