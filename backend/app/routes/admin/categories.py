from flask import g, jsonify, request

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


@admin_bp.route("/categories/<category_id>", methods=["DELETE"])
@admin_required
def delete_category(category_id):
    admin_service.delete_category(category_id)
    return jsonify({"message": "Category deleted"}), 200


@admin_bp.route("/categories/<category_id>/archive", methods=["PATCH"])
@admin_required
def archive_category(category_id):
    from app.repositories.category_repository import CategoryRepository
    before = CategoryRepository().get_by_id(category_id)
    if before is None:
        from app.services.exceptions import NotFoundError
        raise NotFoundError("Category not found")
    had_events = (before.total_events or 0) > 0
    result = admin_service.archive_category(g.current_admin_id, category_id)
    if had_events:
        return jsonify(serialize_category(result)), 200
    return jsonify({"message": "Category archived"}), 200
