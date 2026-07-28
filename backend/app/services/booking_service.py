"""
Registrant-facing booking flow. No auth - registrants are identified by
contact info per booking, not an account.

Flow: create_registration() -> payment simulation -> verify_payment() or
handle_failure().
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.extensions import db
from app.repositories.registration_repository import RegistrationRepository
from . import coupon_service, event_service
from .audit_service import log_action
from .exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationError

_registration_repo = RegistrationRepository()

HOLD_DURATION = timedelta(minutes=15)


def release_expired_holds(event_id):
    """Lazy sweep: reclaim seats for this event's expired-but-unclaimed holds."""
    now = datetime.now(timezone.utc)
    expired = [
        r for r in _registration_repo.get_by_event(event_id)
        if r.reservation_status == "RESERVED" and r.reservation_expires_at and r.reservation_expires_at < now
    ]
    if not expired:
        return

    for registration in expired:
        event_service.release_seats(event_id, registration.seats_booked)
        registration.reservation_status = "EXPIRED"
        registration.registration_status = "FAILED"

    db.session.commit()

    for registration in expired:
        log_action(
            actor_type="SYSTEM",
            action="Registration Failed",
            entity_type="registration",
            entity_id=registration.registration_id,
            entity_name=registration.registrant_name,
            new_value={"reason": "hold_expired"},
        )


def create_registration(
    event_id,
    registrant_name: str,
    registrant_phone: str,
    seats_booked: int,
    registrant_email: str | None = None,
    coupon_code: str | None = None,
):
    if seats_booked <= 0:
        raise ValidationError("seats_booked must be at least 1")
    if not registrant_phone:
        raise ValidationError("Contact phone is required")
    if not registrant_name:
        raise ValidationError("Contact name is required")

    release_expired_holds(event_id)

    event = event_service.get_event(event_id)
    if event.status != "PUBLISHED" or event.archived_at is not None:
        raise NotFoundError("Event not found")
    if event.registration_status != "OPEN":
        raise ConflictError("Registration is closed for this event")

    try:
        event_service.reserve_seats(event_id, seats_booked)
    except Exception:
        db.session.rollback()
        raise

    ticket_price = Decimal(0) if event.is_free else event.ticket_price
    convenience_fee = event.convenience_fee or Decimal(0)
    gateway_fee = event.gateway_fee or Decimal(0)
    discount = Decimal(0)
    coupon_id = None
    applied_code = None

    if coupon_code:
        coupon = coupon_service.validate(coupon_code)
        discount = coupon.flat_discount
        coupon_id = coupon.coupon_id
        applied_code = coupon.code
        coupon_service.redeem(coupon.coupon_id, discount)

    subtotal = (ticket_price * seats_booked) + convenience_fee + gateway_fee
    total_amount = max(subtotal - discount, Decimal(0))

    registration = _registration_repo.create(
        event_id=event.event_id,
        event_title=event.title,
        event_city=event.city,
        event_type=event.event_type,
        category_id=event.category_id,
        category_name=event.category_name,
        organizer_id=event.organizer_id,
        organizer_name=event.organizer_name,
        registrant_name=registrant_name,
        registrant_email=registrant_email,
        registrant_phone=registrant_phone,
        seats_booked=seats_booked,
        ticket_price=ticket_price,
        discount_amount=discount,
        convenience_fee=convenience_fee,
        gateway_fee=gateway_fee,
        total_amount=total_amount,
        coupon_id=coupon_id,
        coupon_code=applied_code,
        reservation_expires_at=datetime.now(timezone.utc) + HOLD_DURATION,
    )

    log_action(
        actor_type="SYSTEM",
        action="Registration Created",
        entity_type="registration",
        entity_id=registration.registration_id,
        entity_name=registration.registrant_name,
    )
    log_action(
        actor_type="SYSTEM",
        action="Seats Reserved",
        entity_type="event",
        entity_id=event_id,
        new_value={"seats_booked": seats_booked},
    )

    if applied_code:
        log_action(
            actor_type="SYSTEM",
            action="Coupon Applied",
            entity_type="coupon",
            entity_id=coupon_id,
            entity_name=applied_code,
            new_value={"registration_id": str(registration.registration_id), "discount": str(discount)},
        )

    from . import payment_service
    payment, order_id = payment_service.create_order(registration.registration_id)

    return registration, payment, order_id


def get_registration(registration_id):
    registration = _registration_repo.get_by_id(registration_id)
    if registration is None:
        raise NotFoundError("Registration not found")
    return registration


def apply_coupon(registration_id, code: str):
    registration = get_registration(registration_id)

    if registration.reservation_status != "RESERVED" or registration.registration_status != "PENDING":
        raise ConflictError("Coupon can only be applied to a pending, unexpired registration")
    if registration.coupon_id is not None:
        raise ConflictError("A coupon has already been applied to this registration")

    coupon = coupon_service.validate(code)
    discount = coupon.flat_discount

    coupon_service.redeem(coupon.coupon_id, discount)

    registration.coupon_id = coupon.coupon_id
    registration.coupon_code = coupon.code
    registration.discount_amount = discount
    subtotal = (registration.ticket_price * registration.seats_booked) + (
        registration.convenience_fee or Decimal(0)
    ) + (registration.gateway_fee or Decimal(0))
    registration.total_amount = max(subtotal - discount, Decimal(0))
    _registration_repo.update()

    log_action(
        actor_type="SYSTEM",
        action="Coupon Applied",
        entity_type="coupon",
        entity_id=coupon.coupon_id,
        entity_name=coupon.code,
        new_value={"registration_id": str(registration_id), "discount": str(discount)},
    )
    return registration


def confirm_registration(registration_id):
    registration = get_registration(registration_id)
    registration.registration_status = "CONFIRMED"
    registration.confirmed_at = datetime.now(timezone.utc)
    _registration_repo.update()

    log_action(
        actor_type="SYSTEM",
        action="Registration Confirmed",
        entity_type="registration",
        entity_id=registration_id,
        entity_name=registration.registrant_name,
    )
    return registration


def fail_registration(registration_id, reason: str = "payment_failed"):
    registration = get_registration(registration_id)
    if registration.reservation_status == "RESERVED":
        event_service.release_seats(registration.event_id, registration.seats_booked)
    registration.registration_status = "FAILED"
    registration.reservation_status = "EXPIRED"
    _registration_repo.update()

    log_action(
        actor_type="SYSTEM",
        action="Registration Failed",
        entity_type="registration",
        entity_id=registration_id,
        entity_name=registration.registrant_name,
        new_value={"reason": reason},
    )
    return registration


def get_for_receipt(registration_id, registrant_phone: str):
    """No account = verify identity by matching the contact phone used at booking time."""
    registration = get_registration(registration_id)
    if registration.registrant_phone != registrant_phone:
        raise ForbiddenError("Contact details do not match this registration")
    return registration
