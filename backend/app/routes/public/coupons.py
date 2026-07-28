from decimal import Decimal

from flask import jsonify, request

from app.services import coupon_service, event_service
from app.services.exceptions import ValidationError
from . import public_bp


@public_bp.route("/coupons/validate", methods=["POST"])
def validate_coupon():
    data = request.get_json(silent=True) or {}
    code = data.get("coupon_code")
    event_id = data.get("event_id")
    seat_count = data.get("seat_count", 1)

    if not code:
        raise ValidationError("coupon_code is required")
    if not event_id:
        raise ValidationError("event_id is required")
    if seat_count <= 0:
        raise ValidationError("seat_count must be at least 1")

    coupon = coupon_service.validate(code)
    event = event_service.get_public_event(event_id)

    ticket_price = Decimal(0) if event.is_free else event.ticket_price
    convenience_fee = event.convenience_fee or Decimal(0)
    gateway_fee = event.gateway_fee or Decimal(0)
    subtotal = (ticket_price * seat_count) + convenience_fee + gateway_fee
    discount = coupon.flat_discount
    final_amount = max(subtotal - discount, Decimal(0))

    return jsonify({
        "coupon_code": coupon.code,
        "discount": str(discount),
        "final_amount": str(final_amount),
        "subtotal": str(subtotal),
    }), 200
