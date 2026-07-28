from flask import g, jsonify, request

from app.middleware import admin_required
from app.services import admin_service
from app.utils.serializers import serialize_event
from . import admin_bp


@admin_bp.route("/events", methods=["GET"])
@admin_required
def list_events():
    events = admin_service.list_events()
    return jsonify([serialize_event(e, include_internal=True) for e in events]), 200


@admin_bp.route("/events/<event_id>", methods=["GET"])
@admin_required
def get_event(event_id):
    event = admin_service.get_event(event_id)
    return jsonify(serialize_event(event, include_internal=True)), 200


@admin_bp.route("/events/<event_id>", methods=["PUT"])
@admin_required
def update_event(event_id):
    payload = request.get_json(silent=True) or {}
    event = admin_service.update_event(g.current_admin_id, event_id, payload)
    return jsonify(serialize_event(event, include_internal=True)), 200


@admin_bp.route("/events/<event_id>/archive", methods=["PATCH", "POST"])
@admin_required
def archive_event(event_id):
    event = admin_service.archive_event(g.current_admin_id, event_id)
    return jsonify(serialize_event(event, include_internal=True)), 200


@admin_bp.route("/events/<event_id>", methods=["DELETE"])
@admin_required
def delete_event(event_id):
    admin_service.hard_delete_event(g.current_admin_id, event_id)
    return jsonify({"message": "Event deleted"}), 200
