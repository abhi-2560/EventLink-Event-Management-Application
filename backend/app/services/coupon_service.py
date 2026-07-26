"""
Coupons are platform-wide in the finalized schema (no event_id column),
so any registrant can apply any active, unexpired code.

Note: the current Coupon model has no max_uses/redemption-limit column -
times_used is tracked but nothing caps it. redeem() still does the
increment atomically (guarding against a coupon going inactive/expired
between the validity check and the redemption, which is a real race),
but there's no "sold out" case the way there is for event seats. Add a
max_uses column later if a redemption cap is needed.
"""

from __future__ import annotations

from sqlalchemy import update

from app.extensions import db
from app.models import Coupon
from app.repositories.coupon_repository import CouponRepository
from .audit_service import log_action
from .exceptions import ConflictError, CouponInvalidError, NotFoundError

_coupon_repo = CouponRepository()


def list_coupons():
    return _coupon_repo.get_all()


def create_coupon(admin_id, code: str, flat_discount, description=None, expiry_date=None):
    if _coupon_repo.code_exists(code):
        raise ConflictError(f"Coupon code '{code}' already exists")

    coupon = _coupon_repo.create(
        code=code, flat_discount=flat_discount, description=description, expiry_date=expiry_date,
    )
    log_action(
        actor_type="ADMIN", actor_id=admin_id, action="Coupon Created",
        entity_type="coupon", entity_id=coupon.coupon_id, entity_name=coupon.code,
    )
    return coupon


def update_coupon(admin_id, coupon_id, payload: dict):
    coupon = _coupon_repo.get_by_id(coupon_id)
    if coupon is None:
        raise NotFoundError("Coupon not found")

    for field in ("description", "flat_discount", "is_active", "expiry_date"):
        if field in payload:
            setattr(coupon, field, payload[field])
    _coupon_repo.update()

    log_action(
        actor_type="ADMIN", actor_id=admin_id, action="Coupon Updated",
        entity_type="coupon", entity_id=coupon_id, entity_name=coupon.code,
    )
    return coupon


def delete_coupon(admin_id, coupon_id):
    """Soft delete - flips is_active off rather than a real DELETE."""
    coupon = _coupon_repo.get_by_id(coupon_id)
    if coupon is None:
        raise NotFoundError("Coupon not found")

    coupon.is_active = False
    _coupon_repo.update()

    log_action(
        actor_type="ADMIN", actor_id=admin_id, action="Coupon Deleted",
        entity_type="coupon", entity_id=coupon_id, entity_name=coupon.code,
    )
    return coupon


def validate(code: str) -> Coupon:
    coupon = _coupon_repo.get_valid_coupon(code)
    if coupon is None:
        raise CouponInvalidError("Coupon is invalid, inactive, or expired")
    return coupon


def redeem(coupon_id, discount_amount) -> Coupon:
    """
    Atomic increment of times_used/total_discount_given, re-checking
    validity in the same statement. Does NOT commit - the caller
    (booking_service.apply_coupon) folds this into its own transaction
    alongside the registration update.
    """
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
