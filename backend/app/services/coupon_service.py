"""
Coupons are platform-wide in the finalized schema (no event_id column),
so any registrant can apply any active, unexpired code.
"""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import update

from app.extensions import db
from app.models import Coupon
from app.repositories.coupon_repository import CouponRepository
from .audit_service import log_action
from .exceptions import ConflictError, CouponInvalidError, NotFoundError, ValidationError

_coupon_repo = CouponRepository()


def _parse_expiry(expiry_date):
    if expiry_date is None or expiry_date == "":
        return None
    if isinstance(expiry_date, str):
        return datetime.fromisoformat(expiry_date.replace("Z", "+00:00"))
    return expiry_date


def _validate_coupon_input(code, flat_discount, expiry_date=None):
    normalized_code = (code or "").strip().upper()
    if not normalized_code:
        raise ValidationError("code is required")
    if len(normalized_code) > 100:
        raise ValidationError("code must be at most 100 characters")

    try:
        discount = Decimal(str(flat_discount))
    except Exception as exc:
        raise ValidationError("flat_discount must be a valid number") from exc
    if discount <= 0:
        raise ValidationError("flat_discount must be greater than 0")

    parsed_expiry = _parse_expiry(expiry_date)
    if parsed_expiry is not None and parsed_expiry <= datetime.now(timezone.utc):
        raise ValidationError("expiry_date must be in the future")

    return normalized_code, discount, parsed_expiry


def list_coupons():
    return _coupon_repo.get_all()


def get_coupon(coupon_id):
    coupon = _coupon_repo.get_by_id(coupon_id)
    if coupon is None:
        raise NotFoundError("Coupon not found")
    return coupon


def create_coupon(admin_id, code: str, flat_discount, description=None, expiry_date=None, is_active=True):
    normalized_code, discount, parsed_expiry = _validate_coupon_input(code, flat_discount, expiry_date)
    if _coupon_repo.code_exists(normalized_code):
        raise ConflictError(f"Coupon code '{normalized_code}' already exists")

    coupon = _coupon_repo.create(
        code=normalized_code,
        flat_discount=discount,
        description=description,
        expiry_date=parsed_expiry,
        is_active=True if is_active is None else bool(is_active),
    )
    log_action(
        actor_type="ADMIN", actor_id=admin_id, action="Coupon Created",
        entity_type="coupon", entity_id=coupon.coupon_id, entity_name=coupon.code,
    )
    return coupon


def update_coupon(admin_id, coupon_id, payload: dict):
    coupon = get_coupon(coupon_id)

    if "code" in payload:
        normalized_code, _, _ = _validate_coupon_input(payload["code"], payload.get("flat_discount", coupon.flat_discount), payload.get("expiry_date", coupon.expiry_date))
        if normalized_code != coupon.code and _coupon_repo.code_exists(normalized_code, exclude_id=coupon_id):
            raise ConflictError(f"Coupon code '{normalized_code}' already exists")
        coupon.code = normalized_code

    if "flat_discount" in payload:
        _, discount, _ = _validate_coupon_input(coupon.code, payload["flat_discount"], payload.get("expiry_date", coupon.expiry_date))
        coupon.flat_discount = discount

    if "expiry_date" in payload:
        _, _, parsed_expiry = _validate_coupon_input(coupon.code, coupon.flat_discount, payload["expiry_date"])
        coupon.expiry_date = parsed_expiry

    if "description" in payload:
        coupon.description = payload["description"]

    if "is_active" in payload:
        coupon.is_active = bool(payload["is_active"])

    _coupon_repo.update()

    log_action(
        actor_type="ADMIN", actor_id=admin_id, action="Coupon Updated",
        entity_type="coupon", entity_id=coupon_id, entity_name=coupon.code,
    )
    return coupon


def delete_coupon(admin_id, coupon_id):
    """Soft delete - flips is_active off rather than a real DELETE."""
    coupon = get_coupon(coupon_id)
    coupon.is_active = False
    _coupon_repo.update()

    log_action(
        actor_type="ADMIN", actor_id=admin_id, action="Coupon Deleted",
        entity_type="coupon", entity_id=coupon_id, entity_name=coupon.code,
    )
    return coupon


def validate(code: str) -> Coupon:
    normalized = (code or "").strip().upper()
    coupon = _coupon_repo.get_valid_coupon(normalized)
    if coupon is None:
        raise CouponInvalidError("Coupon is invalid, inactive, or expired")
    return coupon


def redeem(coupon_id, discount_amount) -> Coupon:
    result = db.session.execute(
        update(Coupon)
        .where(
            Coupon.coupon_id == coupon_id,
            Coupon.is_active.is_(True),
            (Coupon.expiry_date.is_(None)) | (Coupon.expiry_date > db.func.now()),
        )
        .values(
            times_used=Coupon.times_used + 1,
            total_discount_given=Coupon.total_discount_given + discount_amount,
        )
        .returning(Coupon.coupon_id)
    )
    if result.first() is None:
        raise CouponInvalidError("Coupon became invalid before it could be applied")
    return _coupon_repo.get_by_id(coupon_id)
