from __future__ import annotations

from sqlalchemy import CheckConstraint, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.extensions import db


class Admin(db.Model):
    """Platform administrators."""

    __tablename__ = "admin"

    admin_id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    name = db.Column(String(255), nullable=False)
    email = db.Column(String(255), nullable=False, unique=True)
    password_hash = db.Column(Text, nullable=False)
    status = db.Column(String(20), nullable=False, server_default=text("'ACTIVE'"))
    last_login = db.Column(db.DateTime(timezone=True), nullable=True)
    convenience_fee = db.Column(db.Numeric(10, 2), nullable=False, server_default=text("0"))
    gateway_fee = db.Column(db.Numeric(10, 2), nullable=False, server_default=text("0"))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        CheckConstraint("status IN ('ACTIVE','INACTIVE')", name="ck_admin_status"),
        CheckConstraint("convenience_fee >= 0", name="ck_admin_convenience_fee"),
        CheckConstraint("gateway_fee >= 0", name="ck_admin_gateway_fee"),
    )
