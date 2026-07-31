from __future__ import annotations

from sqlalchemy import CheckConstraint, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.extensions import db


class EventMedia(db.Model):
    __tablename__ = "event_media"

    media_id = db.Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    event_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("event.event_id", ondelete="CASCADE"),
        nullable=False,
    )
    media_type = db.Column(String(10), nullable=False)
    media_url = db.Column(Text, nullable=False)
    public_id = db.Column(String(255), nullable=False)
    display_order = db.Column(Integer, nullable=False, server_default=text("0"))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    event = db.relationship("Event", back_populates="media")

    __table_args__ = (
        CheckConstraint("media_type IN ('IMAGE','VIDEO')", name="ck_event_media_type"),
        CheckConstraint("display_order >= 0", name="ck_event_media_display_order"),
        Index("idx_event_media_event_order", "event_id", "display_order"),
    )
