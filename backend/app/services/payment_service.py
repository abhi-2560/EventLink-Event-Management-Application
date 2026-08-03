"""
Simulated payment flow. No external gateway — the frontend shows a fake
payment screen and calls verify/failure endpoints directly.

Idempotency: payment.razorpay_payment_id has a UNIQUE constraint (reused
as simulated payment reference). verify_payment() checks current status
first and no-ops if already in a final state.

Receipt: Payment columns ARE the frozen receipt. get_receipt() returns
the Payment row.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timezone
from decimal import Decimal

from app.repositories.payment_repository import PaymentRepository
from app.repositories.registration_repository import RegistrationRepository
from . import booking_service
from .audit_service import log_action
from .exceptions import ConflictError, NotFoundError, ValidationError

_payment_repo = PaymentRepository()
_registration_repo = RegistrationRepository()


def _generate_order_id() -> str:
    return f"ORD-{secrets.token_hex(8).upper()}"


def _generate_payment_ref() -> str:
    return f"PAY-{secrets.token_hex(8).upper()}"


def _generate_receipt_number() -> str:
    return f"RCPT-{secrets.token_hex(6).upper()}"


def _event_snapshot(event_id):
    """Return event delivery details to freeze onto a new payment."""
    from app.extensions import db
    from app.models import Event

    event = db.session.get(Event, event_id) if event_id else None
    if event is None:
        return {}
    return {
        "event_type": event.event_type,
        "venue": event.venue,
        "city": event.city,
        "state": event.state,
        "meeting_link": event.meeting_link,
    }


def create_order(registration_id):
    registration = booking_service.get_registration(registration_id)
    if registration.registration_status != "PENDING":
        raise ConflictError("This registration is not awaiting payment")

    existing = _payment_repo.get_by_registration(registration_id)
    payment = existing[0] if existing else None
    if payment and payment.payment_status == "SUCCESS":
        raise ConflictError("This registration has already been paid for")

    order_id = _generate_order_id()

    if payment is None:
        payment = _payment_repo.create(
            registration_id=registration.registration_id,
            razorpay_order_id=order_id,
            event_id=registration.event_id,
            event_title=registration.event_title,
            **_event_snapshot(registration.event_id),
            category_id=registration.category_id,
            category_name=registration.category_name,
            organizer_id=registration.organizer_id,
            organizer_name=registration.organizer_name,
            buyer_name=registration.registrant_name,
            buyer_phone=registration.registrant_phone,
            buyer_email=registration.registrant_email,
            ticket_price=registration.ticket_price,
            discount=registration.discount_amount,
            convenience_fee=registration.convenience_fee,
            gateway_fee=registration.gateway_fee,
            amount=registration.total_amount,
        )
    else:
        payment.razorpay_order_id = order_id
        payment.payment_status = "INITIATED"
        payment.failure_reason = None
        _payment_repo.update()

    log_action(
        actor_type="SYSTEM", action="Payment Initiated", entity_type="payment",
        entity_id=payment.payment_id, entity_name=order_id,
    )
    return payment, order_id


def verify_payment(registration_id, order_id: str):
    registration = booking_service.get_registration(registration_id)
    payment = _payment_repo.get_by_razorpay_order_id(order_id)
    if payment is None or str(payment.registration_id) != str(registration_id):
        raise NotFoundError("No payment found for this order")

    if payment.payment_status in ("SUCCESS", "FAILED"):
        return payment

    if registration.registration_status != "PENDING":
        raise ConflictError("Registration is no longer pending payment")

    payment_ref = _generate_payment_ref()
    payment.razorpay_payment_id = payment_ref
    payment.payment_status = "SUCCESS"
    payment.completed_at = datetime.now(timezone.utc)
    payment.receipt_number = _generate_receipt_number()
    payment.receipt_generated_at = payment.completed_at
    _payment_repo.update()

    booking_service.confirm_registration(payment.registration_id)
    _bump_sales_totals(payment)

    log_action(
        actor_type="SYSTEM", action="Payment Success", entity_type="payment",
        entity_id=payment.payment_id, entity_name=payment_ref,
    )
    log_action(
        actor_type="SYSTEM", action="Receipt Generated", entity_type="payment",
        entity_id=payment.payment_id, entity_name=payment.receipt_number,
    )
    return payment


def handle_failure(registration_id, failure_reason: str | None = None):
    registration = booking_service.get_registration(registration_id)
    payments = _payment_repo.get_by_registration(registration_id)
    payment = payments[0] if payments else None

    if payment and payment.payment_status in ("SUCCESS", "FAILED"):
        return payment

    if payment is None:
        order_id = _generate_order_id()
        payment = _payment_repo.create(
            registration_id=registration.registration_id,
            razorpay_order_id=order_id,
            event_id=registration.event_id,
            event_title=registration.event_title,
            **_event_snapshot(registration.event_id),
            category_id=registration.category_id,
            category_name=registration.category_name,
            organizer_id=registration.organizer_id,
            organizer_name=registration.organizer_name,
            buyer_name=registration.registrant_name,
            buyer_phone=registration.registrant_phone,
            buyer_email=registration.registrant_email,
            ticket_price=registration.ticket_price,
            discount=registration.discount_amount,
            convenience_fee=registration.convenience_fee,
            gateway_fee=registration.gateway_fee,
            amount=registration.total_amount,
            payment_status="FAILED",
            failure_reason=failure_reason or "Payment failed or timed out",
            completed_at=datetime.now(timezone.utc),
        )
    else:
        payment.payment_status = "FAILED"
        payment.failure_reason = failure_reason or "Payment failed or timed out"
        payment.completed_at = datetime.now(timezone.utc)
        _payment_repo.update()

    booking_service.fail_registration(registration_id, reason=payment.failure_reason)

    log_action(
        actor_type="SYSTEM", action="Payment Failed", entity_type="payment",
        entity_id=payment.payment_id, entity_name=payment.razorpay_order_id,
    )
    return payment


def _bump_sales_totals(payment):
    from app.models import Category, Event, Organizer
    from app.extensions import db

    registration = _registration_repo.get_by_id(payment.registration_id)
    amount = payment.amount or Decimal(0)

    for model, id_field, id_value in (
        (Event, "event_id", registration.event_id),
        (Organizer, "organizer_id", registration.organizer_id),
        (Category, "category_id", registration.category_id),
    ):
        if id_value is None:
            continue
        obj = db.session.get(model, id_value)
        if obj is None:
            continue
        obj.total_registrations = (obj.total_registrations or 0) + 1
        obj.total_tickets_sold = (obj.total_tickets_sold or 0) + registration.seats_booked
        obj.total_sales = (obj.total_sales or Decimal(0)) + amount

    db.session.commit()


def get_receipt(payment_id):
    payment = _payment_repo.get_by_id(payment_id)
    if payment is None or payment.payment_status != "SUCCESS":
        raise NotFoundError("No completed payment found")
    return payment


def get_receipt_by_registration(registration_id, registrant_phone: str):
    booking_service.get_for_receipt(registration_id, registrant_phone)
    payments = _payment_repo.get_by_registration(registration_id)
    payment = payments[0] if payments else None
    if payment is None or payment.payment_status != "SUCCESS":
        raise NotFoundError("No completed payment found for this registration")
    return payment
