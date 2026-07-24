from __future__ import annotations

from sqlalchemy import String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.extensions import db


class Coupon(db.Model):
    """Discount coupons for event registrations."""

    __tablename__ = "coupon"

    coupon_id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    code = db.Column(String(100), nullable=False, unique=True)
    description = db.Column(Text, nullable=True)
    flat_discount = db.Column(db.Numeric(10, 2), nullable=False, server_default=text("0"))
    is_active = db.Column(db.Boolean, nullable=True, server_default=text("true"))
    expiry_date = db.Column(db.DateTime(timezone=True), nullable=True)
    times_used = db.Column(db.Integer, nullable=True, server_default=text("0"))
    total_discount_given = db.Column(db.Numeric(12, 2), nullable=True, server_default=text("0"))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    registrations = db.relationship("Registration", back_populates="coupon", cascade="all, delete-orphan")
