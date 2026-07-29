"""Admin-managed global platform fees applied at booking time."""

from __future__ import annotations

from decimal import Decimal

from app.extensions import db
from app.models import PlatformSettings
from .exceptions import ValidationError


def get_settings() -> PlatformSettings:
    settings = db.session.get(PlatformSettings, 1)
    if settings is None:
        settings = PlatformSettings(id=1, convenience_fee=Decimal(0), gateway_fee=Decimal(0))
        db.session.add(settings)
        db.session.commit()
    return settings


def get_fees() -> dict[str, Decimal]:
    settings = get_settings()
    return {
        "convenience_fee": Decimal(settings.convenience_fee or 0),
        "gateway_fee": Decimal(settings.gateway_fee or 0),
    }


def update_settings(convenience_fee, gateway_fee) -> PlatformSettings:
    try:
        convenience = Decimal(str(convenience_fee))
        gateway = Decimal(str(gateway_fee))
    except Exception as exc:
        raise ValidationError("convenience_fee and gateway_fee must be valid numbers") from exc

    if convenience < 0 or gateway < 0:
        raise ValidationError("Fees must be zero or greater")

    settings = get_settings()
    settings.convenience_fee = convenience
    settings.gateway_fee = gateway
    db.session.commit()
    return settings
