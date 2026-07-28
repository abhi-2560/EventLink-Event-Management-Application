from flask import jsonify, request

from app.services import payment_service
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_payment
from . import public_bp


@public_bp.route("/payments/create-order", methods=["POST"])
def create_order():
    data = request.get_json(silent=True) or {}
    registration_id = data.get("registration_id")
    if not registration_id:
        raise ValidationError("registration_id is required")

    payment, order_id = payment_service.create_order(registration_id)
    return jsonify({
        "payment_id": str(payment.payment_id),
        "registration_id": str(payment.registration_id),
        "order_id": order_id,
        "amount": str(payment.amount),
        "currency": "INR",
    }), 200


@public_bp.route("/payments/verify", methods=["POST"])
def verify_payment():
    data = request.get_json(silent=True) or {}
    registration_id = data.get("registration_id")
    order_id = data.get("order_id")
    if not registration_id:
        raise ValidationError("registration_id is required")
    if not order_id:
        raise ValidationError("order_id is required")

    payment = payment_service.verify_payment(registration_id, order_id)
    return jsonify(serialize_payment(payment)), 200


@public_bp.route("/payments/failure", methods=["POST"])
def payment_failure():
    data = request.get_json(silent=True) or {}
    registration_id = data.get("registration_id")
    if not registration_id:
        raise ValidationError("registration_id is required")

    reason = data.get("failure_reason", "Payment failed or timed out")
    payment = payment_service.handle_failure(registration_id, reason)
    return jsonify(serialize_payment(payment)), 200


@public_bp.route("/payments/<payment_id>/receipt", methods=["GET"])
def get_receipt(payment_id):
    payment = payment_service.get_receipt(payment_id)
    return jsonify(serialize_payment(payment)), 200
