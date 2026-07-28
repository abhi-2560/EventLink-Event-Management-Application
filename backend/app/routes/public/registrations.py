from flask import jsonify, request

from app.services import booking_service
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_registration
from . import public_bp


@public_bp.route("/registrations", methods=["POST"])
def create_registration():
    data = request.get_json(silent=True) or {}
    event_id = data.get("event_id")
    if not event_id:
        raise ValidationError("event_id is required")

    registration, payment, order_id = booking_service.create_registration(
        event_id=event_id,
        registrant_name=data.get("registrant_name"),
        registrant_phone=data.get("registrant_phone"),
        seats_booked=data.get("seats_booked", 1),
        registrant_email=data.get("registrant_email"),
        coupon_code=data.get("coupon_code"),
    )
    return jsonify({
        **serialize_registration(registration),
        "payment_id": str(payment.payment_id),
        "order_id": order_id,
        "amount": str(registration.total_amount),
    }), 201


@public_bp.route("/registrations/<registration_id>", methods=["GET"])
def get_registration(registration_id):
    from app.repositories.payment_repository import PaymentRepository
    registration = booking_service.get_registration(registration_id)
    data = serialize_registration(registration)
    payments = PaymentRepository().get_by_registration(registration_id)
    if payments:
        payment = payments[0]
        data["payment_id"] = str(payment.payment_id)
        data["order_id"] = payment.razorpay_order_id
    return jsonify(data), 200
