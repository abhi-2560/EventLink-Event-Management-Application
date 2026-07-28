from flask import g, jsonify, request

from app.middleware import organizer_required
from app.repositories.organizer_repository import OrganizerRepository
from app.services import event_service
from app.services.audit_service import log_action
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_organizer
from werkzeug.security import check_password_hash, generate_password_hash
from . import organizer_bp

_organizer_repo = OrganizerRepository()


@organizer_bp.route("/profile", methods=["GET"])
@organizer_required
def get_profile():
    organizer = _organizer_repo.get_by_id(g.current_organizer_id)
    return jsonify(serialize_organizer(organizer)), 200


@organizer_bp.route("/profile", methods=["PUT"])
@organizer_required
def update_profile():
    data = request.get_json(silent=True) or {}
    organizer = _organizer_repo.get_by_id(g.current_organizer_id)

    for field in ("organizer_name", "contact_person", "phone"):
        if field in data and data[field] is not None:
            setattr(organizer, field, data[field].strip())

    _organizer_repo.update()
    event_service.cascade_organizer_snapshot(organizer)

    log_action(
        actor_type="ORGANIZER",
        actor_id=g.current_organizer_id,
        action="Organizer Updated",
        entity_type="organizer",
        entity_id=g.current_organizer_id,
        entity_name=organizer.organizer_name,
    )
    return jsonify(serialize_organizer(organizer)), 200


@organizer_bp.route("/profile/change-password", methods=["POST"])
@organizer_required
def change_password():
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    if not current_password or not new_password:
        raise ValidationError("current_password and new_password are required")

    organizer = _organizer_repo.get_by_id(g.current_organizer_id)
    if not check_password_hash(organizer.password_hash, current_password):
        raise ValidationError("Current password is incorrect")

    organizer.password_hash = generate_password_hash(new_password)
    _organizer_repo.update()

    log_action(
        actor_type="ORGANIZER",
        actor_id=g.current_organizer_id,
        action="Password Reset",
        entity_type="organizer",
        entity_id=g.current_organizer_id,
    )
    return jsonify({"message": "Password updated"}), 200
