from flask import g, jsonify, request

from app.middleware import admin_required
from app.services import coupon_service
from app.utils.serializers import serialize_coupon
from . import admin_bp


@admin_bp.route("/coupons", methods=["GET"])
@admin_required
def list_coupons():
    coupons = coupon_service.list_coupons()
    return jsonify([serialize_coupon(c) for c in coupons]), 200


@admin_bp.route("/coupons", methods=["POST"])
@admin_required
def create_coupon():
    data = request.get_json(silent=True) or {}
    coupon = coupon_service.create_coupon(
        admin_id=g.current_admin_id,
        code=data.get("code"),
        flat_discount=data.get("flat_discount"),
        description=data.get("description"),
        expiry_date=data.get("expiry_date"),
        is_active=data.get("is_active", True),
    )
    return jsonify(serialize_coupon(coupon)), 201


@admin_bp.route("/coupons/<coupon_id>", methods=["GET"])
@admin_required
def get_coupon(coupon_id):
    coupon = coupon_service.get_coupon(coupon_id)
    return jsonify(serialize_coupon(coupon)), 200


@admin_bp.route("/coupons/<coupon_id>", methods=["PUT"])
@admin_required
def update_coupon(coupon_id):
    payload = request.get_json(silent=True) or {}
    coupon = coupon_service.update_coupon(g.current_admin_id, coupon_id, payload)
    return jsonify(serialize_coupon(coupon)), 200


@admin_bp.route("/coupons/<coupon_id>", methods=["DELETE"])
@admin_required
def delete_coupon(coupon_id):
    coupon_service.delete_coupon(g.current_admin_id, coupon_id)
    return jsonify({"message": "Coupon deactivated"}), 200
