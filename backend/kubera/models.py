from .db import db
from .utils import utc_now


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
