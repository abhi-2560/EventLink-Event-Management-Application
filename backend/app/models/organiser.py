from __future__ import annotations

from sqlalchemy import CheckConstraint, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.extensions import db


class Organizer(db.Model):
    """Event organizers who publish and manage events."""

    __tablename__ = "organizer"

    organizer_id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    organization_name = db.Column(String(255), nullable=False)
    contact_person = db.Column(String(255), nullable=False)
    email = db.Column(String(255), nullable=False, unique=True)
    phone = db.Column(String(50), nullable=False)
    password_hash = db.Column(Text, nullable=False)
    status = db.Column(String(20), nullable=False, server_default=text("'ACTIVE'"))
    total_events = db.Column(Integer, nullable=True, server_default=text("0"))
    active_events = db.Column(Integer, nullable=True, server_default=text("0"))
    total_registrations = db.Column(Integer, nullable=True, server_default=text("0"))
    total_tickets_sold = db.Column(Integer, nullable=True, server_default=text("0"))
    total_sales = db.Column(db.Numeric(12, 2), nullable=True, server_default=text("0"))
    platform_fee_generated = db.Column(db.Numeric(12, 2), nullable=True, server_default=text("0"))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    archived_at = db.Column(db.DateTime(timezone=True), nullable=True)

    events = db.relationship("Event", back_populates="organizer", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("status IN ('ACTIVE','INACTIVE')", name="ck_organizer_status"),
    )
