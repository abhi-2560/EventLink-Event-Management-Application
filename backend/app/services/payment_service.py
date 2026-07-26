"""
Razorpay integration. The razorpay client is passed in by the route
(constructed once at app startup from config) rather than built here,
so this module doesn't need Flask config access to stay testable.

Idempotency: payment.razorpay_payment_id has a UNIQUE constraint.
Razorpay retries webhook delivery, so handle_webhook() must be safe to
call twice for the same payment - it checks current status first and
no-ops if already in a final state, and relies on the DB constraint as
a hard backstop if two retries somehow race each other.

Receipt: there's no separate Receipt table in this schema - Payment's
own columns (ticket_price, discount, fees, amount, receipt_number) ARE
the frozen receipt. get_receipt() just returns the Payment row.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timezone
from decimal import Decimal

from app.repositories.payment_repository import PaymentRepository
from app.repositories.registration_repository import RegistrationRepository
from . import booking_service
from .audit_service import log_action
from .exceptions import ConflictError, NotFoundError

_payment_repo = PaymentRepository()
_registration_repo = RegistrationRepository()

PLATFORM_FEE_RATE = Decimal("0")  # set if the platform takes an additional cut beyond convenience/gateway fee


def create_razorpay_order(razorpay_client, registration_id):
    registration = booking_service.get_registration(registration_id)
    if registration.registration_status != "PENDING":
        raise ConflictError("This registration is not awaiting payment")

    existing = _payment_repo.get_by_registration(registration_id)
    payment = existing[0] if existing else None
    if payment and payment.payment_status == "SUCCESS":
        raise ConflictError("This registration has already been paid for")

    amount_paise = int((registration.total_amount or Decimal(0)) * 100)

    order = razorpay_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": str(registration_id),
        "payment_capture": 1,
    })

    if payment is None:
        payment = _payment_repo.create(
            registration_id=registration.registration_id,
            razorpay_order_id=order["id"],
            event_id=registration.event_id,
            event_title=registration.event_title,
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
            platform_fee=(registration.total_amount or Decimal(0)) * PLATFORM_FEE_RATE,
            amount=registration.total_amount,
        )
    else:
        # Retry: same registration, fresh order id.
        payment.razorpay_order_id = order["id"]
        payment.payment_status = "INITIATED"
        payment.failure_reason = None
        _payment_repo.update()

    log_action(
        actor_type="SYSTEM", action="Payment Initiated", entity_type="payment",
        entity_id=payment.payment_id, entity_name=order["id"],
    )
    return payment, order


def handle_webhook(razorpay_payment_id: str, razorpay_order_id: str, success: bool, failure_reason: str | None = None):
    """
    Call this only after verifying the webhook signature (that check
    belongs in the route, against the raw request body).
    """
    payment = _payment_repo.get_by_razorpay_order_id(razorpay_order_id)
    if payment is None:
        raise NotFoundError("No payment found for this order")

    if payment.payment_status in ("SUCCESS", "FAILED"):
        # Already processed - webhook retry. No-op, not an error.
        return payment

    if success:
        payment.razorpay_payment_id = razorpay_payment_id
        payment.payment_status = "SUCCESS"
        payment.completed_at = datetime.now(timezone.utc)
        payment.receipt_number = _generate_receipt_number()
        payment.receipt_generated_at = payment.completed_at
        _payment_repo.update()

        booking_service.confirm_registration(payment.registration_id)
        _bump_sales_totals(payment)

        log_action(
            actor_type="SYSTEM", action="Payment Success", entity_type="payment",
            entity_id=payment.payment_id, entity_name=razorpay_payment_id,
        )
        log_action(
            actor_type="SYSTEM", action="Receipt Generated", entity_type="payment",
            entity_id=payment.payment_id, entity_name=payment.receipt_number,
        )
    else:
        payment.payment_status = "FAILED"
        payment.failure_reason = failure_reason or "Payment failed or timed out"
        _payment_repo.update()

        booking_service.fail_registration(payment.registration_id, reason=payment.failure_reason)

        log_action(
            actor_type="SYSTEM", action="Payment Failed", entity_type="payment",
            entity_id=payment.payment_id, entity_name=razorpay_payment_id,
        )

    return payment


def _bump_sales_totals(payment):
    """
    Synchronous, in-transaction aggregate updates on Event/Organizer/Category.
    Deliberately synchronous per the "normal usage, not millions of users"
    scale decision - see earlier discussion for when to revisit this.
    """
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
        if hasattr(obj, "platform_fee_generated"):
            obj.platform_fee_generated = (obj.platform_fee_generated or Decimal(0)) + (payment.platform_fee or Decimal(0))

    db.session.commit()


def get_receipt(registration_id, registrant_phone: str):
    booking_service.get_for_receipt(registration_id, registrant_phone)  # identity check
    payments = _payment_repo.get_by_registration(registration_id)
    payment = payments[0] if payments else None
    if payment is None or payment.payment_status != "SUCCESS":
        raise NotFoundError("No completed payment found for this registration")
    return payment


def _generate_receipt_number() -> str:
    return f"RCPT-{secrets.token_hex(6).upper()}"
