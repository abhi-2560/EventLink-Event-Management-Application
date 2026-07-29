from __future__ import annotations

from sqlalchemy import CheckConstraint, Integer, text
from sqlalchemy.sql import func

from app.extensions import db


class PlatformSettings(db.Model):
    """Singleton platform-wide fee configuration managed by admin."""

    __tablename__ = "platform_settings"

    id = db.Column(Integer, primary_key=True, server_default=text("1"))
    convenience_fee = db.Column(db.Numeric(10, 2), nullable=False, server_default=text("0"))
    gateway_fee = db.Column(db.Numeric(10, 2), nullable=False, server_default=text("0"))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        CheckConstraint("convenience_fee >= 0", name="ck_platform_settings_convenience_fee"),
        CheckConstraint("gateway_fee >= 0", name="ck_platform_settings_gateway_fee"),
        CheckConstraint("id = 1", name="ck_platform_settings_singleton"),
    )
