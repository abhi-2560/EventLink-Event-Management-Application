from __future__ import annotations

from sqlalchemy import CheckConstraint, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.extensions import db


class Registration(db.Model):
    """Event registrations made by attendees."""

    __tablename__ = "registration"

    registration_id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    event_id = db.Column(UUID(as_uuid=True), db.ForeignKey("event.event_id"), nullable=True)
    event_title = db.Column(String(255), nullable=False)
    event_city = db.Column(String(255), nullable=True)
    category_id = db.Column(UUID(as_uuid=True), db.ForeignKey("category.category_id"), nullable=True)
    category_name = db.Column(String(255), nullable=True)
    organizer_id = db.Column(UUID(as_uuid=True), db.ForeignKey("organizer.organizer_id"), nullable=True)
    organizer_name = db.Column(String(255), nullable=True)
    registrant_name = db.Column(String(255), nullable=False)
    registrant_email = db.Column(String(255), nullable=True)
    registrant_phone = db.Column(String(50), nullable=False)
    seats_booked = db.Column(Integer, nullable=False)
    ticket_price = db.Column(db.Numeric(10, 2), nullable=False)
    discount_amount = db.Column(db.Numeric(10, 2), nullable=True, server_default=text("0"))
    convenience_fee = db.Column(db.Numeric(10, 2), nullable=True, server_default=text("0"))
    gateway_fee = db.Column(db.Numeric(10, 2), nullable=True, server_default=text("0"))
    total_amount = db.Column(db.Numeric(12, 2), nullable=False)
    reservation_status = db.Column(String(20), nullable=True, server_default=text("'RESERVED'"))
    registration_status = db.Column(String(20), nullable=True, server_default=text("'PENDING'"))
    reservation_expires_at = db.Column(db.DateTime(timezone=True), nullable=True)
    coupon_id = db.Column(UUID(as_uuid=True), db.ForeignKey("coupon.coupon_id"), nullable=True)
    coupon_code = db.Column(String(100), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    confirmed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    event = db.relationship("Event", back_populates="registrations")
    coupon = db.relationship("Coupon", back_populates="registrations")
    payment = db.relationship("Payment", back_populates="registration", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("seats_booked > 0", name="ck_registration_seats_booked_positive"),
        CheckConstraint("ticket_price >= 0", name="ck_registration_ticket_price_nonnegative"),
        CheckConstraint("discount_amount >= 0", name="ck_registration_discount_amount_nonnegative"),
        CheckConstraint("reservation_status IN ('RESERVED','EXPIRED')", name="ck_registration_reservation_status"),
        CheckConstraint("registration_status IN ('PENDING','CONFIRMED','FAILED')", name="ck_registration_status"),
        Index("idx_registration_event", "event_id"),
        Index("idx_registration_org", "organizer_id"),
    )
