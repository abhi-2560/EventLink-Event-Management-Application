from flask import current_app, jsonify, request

from app import extensions
from app.services import booking_service, payment_service
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_payment, serialize_registration
from . import public_bp


@public_bp.route("/events/<event_id>/hold", methods=["POST"])
def create_seat_hold(event_id):
    data = request.get_json(silent=True) or {}
    registration = booking_service.create_seat_hold(
        event_id=event_id,
        registrant_name=data.get("registrant_name"),
        registrant_phone=data.get("registrant_phone"),
        seats_booked=data.get("seats_booked", 1),
        registrant_email=data.get("registrant_email"),
    )
    return jsonify(serialize_registration(registration)), 201


@public_bp.route("/bookings/<registration_id>/apply-coupon", methods=["POST"])
def apply_coupon(registration_id):
    data = request.get_json(silent=True) or {}
    code = data.get("coupon_code")
    if not code:
        raise ValidationError("coupon_code is required")
    registration = booking_service.apply_coupon(registration_id, code)
    return jsonify(serialize_registration(registration)), 200


@public_bp.route("/bookings/<registration_id>/checkout", methods=["POST"])
def checkout(registration_id):
    payment, order = payment_service.create_razorpay_order(extensions.razorpay_client, registration_id)
    return jsonify({
        "payment_id": str(payment.payment_id),
        "razorpay_order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "razorpay_key_id": current_app.config["RAZORPAY_KEY_ID"],
    }), 200


@public_bp.route("/bookings/<registration_id>/receipt", methods=["GET"])
def get_receipt(registration_id):
    phone = request.args.get("phone")
    if not phone:
        raise ValidationError("phone query parameter is required to verify identity")
    payment = payment_service.get_receipt(registration_id, phone)
    return jsonify(serialize_payment(payment)), 200
