from __future__ import annotations

from sqlalchemy import CheckConstraint, Index, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.extensions import db


class RefreshToken(db.Model):
    """Persisted, opaque refresh-token session used for rotation and revocation."""

    __tablename__ = "refresh_token"

    token_id = db.Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    actor_type = db.Column(String(20), nullable=False)
    actor_id = db.Column(UUID(as_uuid=True), nullable=False)
    token_hash = db.Column(String(64), nullable=False, unique=True)
    family_id = db.Column(UUID(as_uuid=True), nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    revoked_at = db.Column(db.DateTime(timezone=True), nullable=True)
    replaced_by_token_id = db.Column(UUID(as_uuid=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    last_used_at = db.Column(db.DateTime(timezone=True), nullable=True)
    user_agent = db.Column(Text, nullable=True)
    ip_address = db.Column(String(64), nullable=True)

    __table_args__ = (
        CheckConstraint("actor_type IN ('admin','organizer')", name="ck_refresh_token_actor_type"),
        Index("idx_refresh_token_actor_active", "actor_type", "actor_id", "revoked_at"),
        Index("idx_refresh_token_expiry", "expires_at"),
    )
