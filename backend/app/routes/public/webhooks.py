from flask import current_app, jsonify, request

from app import extensions
from app.services import payment_service
from . import public_bp


@public_bp.route("/webhooks/razorpay", methods=["POST"])
def razorpay_webhook():
    raw_body = request.get_data(as_text=True)
    signature = request.headers.get("X-Razorpay-Signature", "")

    try:
        extensions.razorpay_client.utility.verify_webhook_signature(
            raw_body, signature, current_app.config["RAZORPAY_WEBHOOK_SECRET"]
        )
    except Exception:
        # Deliberately vague response body - don't tell a forged request
        # which part of verification failed.
        return jsonify({"error": "Invalid signature"}), 400

    data = request.get_json(silent=True) or {}
    event_name = data.get("event", "")
    entity = data.get("payload", {}).get("payment", {}).get("entity", {})

    razorpay_payment_id = entity.get("id")
    razorpay_order_id = entity.get("order_id")

    if event_name == "payment.captured":
        payment_service.handle_webhook(razorpay_payment_id, razorpay_order_id, success=True)
    elif event_name in ("payment.failed",):
        payment_service.handle_webhook(
            razorpay_payment_id, razorpay_order_id, success=False,
            failure_reason=entity.get("error_description", "Payment failed"),
        )
    # Unrecognized event types are acknowledged, not errored, so Razorpay
    # doesn't retry-storm us for events we don't act on (e.g. refund events).

    return jsonify({"status": "ok"}), 200
