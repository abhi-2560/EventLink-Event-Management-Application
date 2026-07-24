from __future__ import annotations

from sqlalchemy import CheckConstraint, Index, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.extensions import db


class Payment(db.Model):
    """Payment records linked to registrations."""

    __tablename__ = "payment"

    payment_id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    registration_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("registration.registration_id"),
        nullable=True,
        unique=True,
    )
    razorpay_order_id = db.Column(String(255), nullable=True, unique=True)
    razorpay_payment_id = db.Column(String(255), nullable=True, unique=True)
    receipt_number = db.Column(String(255), nullable=True, unique=True)
    receipt_generated_at = db.Column(db.DateTime(timezone=True), nullable=True)
    event_id = db.Column(UUID(as_uuid=True), nullable=True)
    event_title = db.Column(String(255), nullable=True)
    category_id = db.Column(UUID(as_uuid=True), nullable=True)
    category_name = db.Column(String(255), nullable=True)
    organizer_id = db.Column(UUID(as_uuid=True), nullable=True)
    organizer_name = db.Column(String(255), nullable=True)
    buyer_name = db.Column(String(255), nullable=True)
    buyer_phone = db.Column(String(50), nullable=True)
    buyer_email = db.Column(String(255), nullable=True)
    ticket_price = db.Column(db.Numeric(10, 2), nullable=True)
    discount = db.Column(db.Numeric(10, 2), nullable=True, server_default=text("0"))
    convenience_fee = db.Column(db.Numeric(10, 2), nullable=True, server_default=text("0"))
    gateway_fee = db.Column(db.Numeric(10, 2), nullable=True, server_default=text("0"))
    platform_fee = db.Column(db.Numeric(10, 2), nullable=True, server_default=text("0"))
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    payment_status = db.Column(String(20), nullable=True, server_default=text("'INITIATED'"))
    failure_reason = db.Column(Text, nullable=True)
    initiated_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    registration = db.relationship("Registration", back_populates="payment")

    __table_args__ = (
        CheckConstraint("payment_status IN ('INITIATED','SUCCESS','FAILED')", name="ck_payment_status"),
        Index("idx_payment_org", "organizer_id"),
        Index("idx_payment_status", "payment_status"),
    )
