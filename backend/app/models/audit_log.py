from __future__ import annotations

from sqlalchemy import Index, String, Text, text
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.sql import func

from app.extensions import db


class AuditLog(db.Model):
    """Audit trail entries for entity changes."""

    __tablename__ = "audit_log"

    log_id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    actor_type = db.Column(String(50), nullable=False)
    actor_id = db.Column(UUID(as_uuid=True), nullable=True)
    actor_name = db.Column(String(255), nullable=True)
    actor_email = db.Column(String(255), nullable=True)
    entity_type = db.Column(String(100), nullable=False)
    entity_id = db.Column(UUID(as_uuid=True), nullable=True)
    entity_name = db.Column(String(255), nullable=True)
    action = db.Column(String(100), nullable=False)
    old_value = db.Column(JSONB, nullable=True)
    new_value = db.Column(JSONB, nullable=True)
    ip_address = db.Column(INET, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("idx_audit_entity", "entity_type", "entity_id"),
    )
