from flask import g, jsonify, request

from app.middleware import admin_required
from app.repositories.admin_repository import AdminRepository
from app.services.audit_service import log_action
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_admin
from werkzeug.security import check_password_hash, generate_password_hash
from . import admin_bp

_admin_repo = AdminRepository()


@admin_bp.route("/profile", methods=["GET"])
@admin_required
def get_profile():
    admin = _admin_repo.get_by_id(g.current_admin_id)
    return jsonify(serialize_admin(admin)), 200


@admin_bp.route("/profile", methods=["PUT"])
@admin_required
def update_profile():
    data = request.get_json(silent=True) or {}
    admin = _admin_repo.get_by_id(g.current_admin_id)
    if "name" in data and data["name"]:
        admin.name = data["name"].strip()
    _admin_repo.update()
    log_action(
        actor_type="ADMIN", actor_id=g.current_admin_id, action="Admin Updated",
        entity_type="admin", entity_id=g.current_admin_id, entity_name=admin.name,
    )
    return jsonify(serialize_admin(admin)), 200


@admin_bp.route("/profile/change-password", methods=["POST"])
@admin_required
def change_password():
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    if not current_password or not new_password:
        raise ValidationError("current_password and new_password are required")

    admin = _admin_repo.get_by_id(g.current_admin_id)
    if not check_password_hash(admin.password_hash, current_password):
        raise ValidationError("Current password is incorrect")

    admin.password_hash = generate_password_hash(new_password)
    _admin_repo.update()
    return jsonify({"message": "Password updated"}), 200
