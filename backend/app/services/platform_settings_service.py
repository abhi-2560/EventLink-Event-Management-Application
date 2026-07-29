"""Admin-managed global platform fees stored on the admin table."""

from __future__ import annotations

from decimal import Decimal

from app.extensions import db
from app.models import Admin
from .exceptions import ValidationError


def _fee_admin() -> Admin:
    admin = Admin.query.order_by(Admin.created_at.asc()).first()
    if admin is None:
        raise ValidationError("No admin account exists to store platform fees")
    return admin


def get_settings() -> Admin:
    return _fee_admin()


def get_fees() -> dict[str, Decimal]:
    admin = _fee_admin()
    return {
        "convenience_fee": Decimal(admin.convenience_fee or 0),
        "gateway_fee": Decimal(admin.gateway_fee or 0),
    }


def update_settings(convenience_fee, gateway_fee) -> Admin:
    try:
        convenience = Decimal(str(convenience_fee))
        gateway = Decimal(str(gateway_fee))
    except Exception as exc:
        raise ValidationError("convenience_fee and gateway_fee must be valid numbers") from exc

    if convenience < 0 or gateway < 0:
        raise ValidationError("Fees must be zero or greater")

    for admin in Admin.query.all():
        admin.convenience_fee = convenience
        admin.gateway_fee = gateway

    db.session.commit()
    return _fee_admin()
