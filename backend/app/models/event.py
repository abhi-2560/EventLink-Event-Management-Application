from __future__ import annotations

from sqlalchemy import ARRAY, CheckConstraint, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.extensions import db


class Event(db.Model):
    """Event catalog entries created by organizers."""

    __tablename__ = "event"

    event_id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    organizer_id = db.Column(UUID(as_uuid=True), db.ForeignKey("organizer.organizer_id"), nullable=True)
    organizer_name = db.Column(String(255), nullable=False)
    organizer_email = db.Column(String(255), nullable=False)
    organizer_phone = db.Column(String(50), nullable=False)
    category_id = db.Column(UUID(as_uuid=True), db.ForeignKey("category.category_id"), nullable=True)
    category_name = db.Column(String(255), nullable=False)
    title = db.Column(String(255), nullable=False)
    description = db.Column(Text, nullable=True)
    event_type = db.Column(String(20), nullable=False)
    venue = db.Column(String(255), nullable=True)
    city = db.Column(String(255), nullable=True)
    state = db.Column(String(255), nullable=True)
    country = db.Column(String(255), nullable=True)
    meeting_link = db.Column(Text, nullable=True)
    keywords = db.Column(ARRAY(String), nullable=True)
    ticket_price = db.Column(db.Numeric(10, 2), nullable=True, server_default=text("0"))
    is_free = db.Column(db.Boolean, nullable=True, server_default=text("false"))
    capacity = db.Column(Integer, nullable=False)
    available_seats = db.Column(Integer, nullable=False)
    total_registrations = db.Column(Integer, nullable=True, server_default=text("0"))
    total_tickets_sold = db.Column(Integer, nullable=True, server_default=text("0"))
    total_sales = db.Column(db.Numeric(12, 2), nullable=True, server_default=text("0"))
    registration_start = db.Column(db.DateTime(timezone=True), nullable=True)
    registration_end = db.Column(db.DateTime(timezone=True), nullable=True)
    start_datetime = db.Column(db.DateTime(timezone=True), nullable=False)
    status = db.Column(String(30), nullable=True, server_default=text("'DRAFT'"))
    registration_status = db.Column(String(20), nullable=True, server_default=text("'OPEN'"))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    archived_at = db.Column(db.DateTime(timezone=True), nullable=True)

    organizer = db.relationship("Organizer", back_populates="events")
    category = db.relationship("Category", back_populates="events")
    registrations = db.relationship("Registration", back_populates="event", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("event_type IN ('ONLINE','OFFLINE','HYBRID')", name="ck_event_type"),
        CheckConstraint("ticket_price >= 0", name="ck_event_ticket_price_nonnegative"),
        CheckConstraint("(NOT is_free) OR ticket_price = 0", name="ck_event_is_free_ticket_price"),
        CheckConstraint("capacity > 0", name="ck_event_capacity_positive"),
        CheckConstraint("available_seats >= 0 AND available_seats <= capacity", name="ck_event_available_seats_range"),
        CheckConstraint("total_registrations >= 0", name="ck_event_total_registrations_nonnegative"),
        CheckConstraint("total_tickets_sold >= 0", name="ck_event_total_tickets_sold_nonnegative"),
        CheckConstraint("total_sales >= 0", name="ck_event_total_sales_nonnegative"),
        CheckConstraint("registration_end IS NULL OR registration_start IS NULL OR registration_end > registration_start", name="ck_event_registration_window"),
        CheckConstraint("status IN ('DRAFT','PUBLISHED','COMPLETED','ARCHIVED')", name="ck_event_status"),
        CheckConstraint("registration_status IN ('OPEN','CLOSED')", name="ck_event_registration_status"),
        Index("idx_event_search", "city", "category_name", "event_type"),
        Index("idx_event_status", "status", "registration_status"),
        Index("idx_event_keywords", "keywords", postgresql_using="gin"),
    )
