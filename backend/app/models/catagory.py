from __future__ import annotations

from sqlalchemy import CheckConstraint, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.extensions import db


class Category(db.Model):
    """Event categories used to organize events."""

    __tablename__ = "category"

    category_id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    name = db.Column(String(255), nullable=False, unique=True)
    description = db.Column(Text, nullable=True)
    is_default = db.Column(db.Boolean, nullable=True, server_default=text("false"))
    total_events = db.Column(Integer, nullable=True, server_default=text("0"))
    total_registrations = db.Column(Integer, nullable=True, server_default=text("0"))
    total_tickets_sold = db.Column(Integer, nullable=True, server_default=text("0"))
    total_sales = db.Column(db.Numeric(12, 2), nullable=True, server_default=text("0"))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    events = db.relationship("Event", back_populates="category", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("name IS NOT NULL", name="ck_category_name_not_null"),
    )
