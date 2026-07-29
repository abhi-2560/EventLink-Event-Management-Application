from flask import jsonify, request

from app.middleware import admin_required
from app.services import platform_settings_service
from app.services.exceptions import ValidationError
from . import admin_bp


@admin_bp.route("/settings/platform-fees", methods=["GET"])
@admin_required
def get_platform_fees():
    settings = platform_settings_service.get_settings()
    return jsonify({
        "convenience_fee": str(settings.convenience_fee),
        "gateway_fee": str(settings.gateway_fee),
        "updated_at": settings.updated_at.isoformat() if settings.updated_at else None,
    }), 200


@admin_bp.route("/settings/platform-fees", methods=["PUT"])
@admin_required
def update_platform_fees():
    data = request.get_json(silent=True) or {}
    if "convenience_fee" not in data or "gateway_fee" not in data:
        raise ValidationError("convenience_fee and gateway_fee are required")

    admin = platform_settings_service.update_settings(
        data.get("convenience_fee"),
        data.get("gateway_fee"),
    )
    return jsonify({
        "convenience_fee": str(admin.convenience_fee),
        "gateway_fee": str(admin.gateway_fee),
        "updated_at": admin.updated_at.isoformat() if admin.updated_at else None,
    }), 200
