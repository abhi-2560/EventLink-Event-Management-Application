from flask import g, jsonify, request

from app.middleware import admin_required
from app.services import admin_service
from app.utils.serializers import serialize_organizer
from . import admin_bp


@admin_bp.route("/organizers", methods=["GET"])
@admin_required
def list_organizers():
    organizers = admin_service.list_organizers()
    return jsonify([serialize_organizer(o) for o in organizers]), 200


@admin_bp.route("/organizers/<organizer_id>", methods=["GET"])
@admin_required
def get_organizer(organizer_id):
    organizer = admin_service.get_organizer(organizer_id)
    return jsonify(serialize_organizer(organizer)), 200


@admin_bp.route("/organizers/<organizer_id>", methods=["PUT"])
@admin_required
def update_organizer(organizer_id):
    payload = request.get_json(silent=True) or {}
    organizer = admin_service.update_organizer(g.current_admin_id, organizer_id, payload)
    return jsonify(serialize_organizer(organizer)), 200


@admin_bp.route("/organizers/<organizer_id>/archive", methods=["PATCH", "POST"])
@admin_required
def archive_organizer(organizer_id):
    organizer = admin_service.archive_organizer(g.current_admin_id, organizer_id)
    return jsonify(serialize_organizer(organizer)), 200


@admin_bp.route("/organizers/<organizer_id>", methods=["DELETE"])
@admin_required
def delete_organizer(organizer_id):
    admin_service.hard_delete_organizer(g.current_admin_id, organizer_id)
    return jsonify({"message": "Organizer deleted"}), 200
