from flask import jsonify, request

from app.middleware import admin_required
from app.services import admin_service
from app.utils.serializers import serialize_category
from . import admin_bp


@admin_bp.route("/categories", methods=["GET"])
@admin_required
def list_categories():
    categories = admin_service.list_categories()
    return jsonify([serialize_category(c) for c in categories]), 200


@admin_bp.route("/categories", methods=["POST"])
@admin_required
def create_category():
    data = request.get_json(silent=True) or {}
    category = admin_service.create_category(
        name=data.get("name"),
        description=data.get("description"),
        is_default=data.get("is_default", False),
    )
    return jsonify(serialize_category(category)), 201


@admin_bp.route("/categories/<category_id>", methods=["PUT"])
@admin_required
def update_category(category_id):
    payload = request.get_json(silent=True) or {}
    category = admin_service.update_category(category_id, payload)
    return jsonify(serialize_category(category)), 200
