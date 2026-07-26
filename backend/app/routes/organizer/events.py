from flask import g, jsonify, request

from app.middleware import organizer_required
from app.services import organizer_service
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_event
from . import organizer_bp


@organizer_bp.route("/events", methods=["GET"])
@organizer_required
def list_own_events():
    events = organizer_service.list_own_events(g.current_organizer_id)
    return jsonify([serialize_event(e, include_internal=True) for e in events]), 200


@organizer_bp.route("/events/browse", methods=["GET"])
@organizer_required
def browse_all_events():
    events = organizer_service.browse_all_events()
    return jsonify([serialize_event(e) for e in events]), 200


@organizer_bp.route("/events", methods=["POST"])
@organizer_required
def create_event():
    payload = request.get_json(silent=True) or {}
    event = organizer_service.create_event(g.current_organizer_id, payload)
    return jsonify(serialize_event(event, include_internal=True)), 201


@organizer_bp.route("/events/<event_id>", methods=["GET"])
@organizer_required
def get_own_event(event_id):
    event = organizer_service.get_own_event(g.current_organizer_id, event_id)
    return jsonify(serialize_event(event, include_internal=True)), 200


@organizer_bp.route("/events/<event_id>", methods=["PUT"])
@organizer_required
def update_event(event_id):
    payload = request.get_json(silent=True) or {}
    event = organizer_service.update_event(g.current_organizer_id, event_id, payload)
    return jsonify(serialize_event(event, include_internal=True)), 200


@organizer_bp.route("/events/<event_id>/capacity", methods=["PUT"])
@organizer_required
def update_capacity(event_id):
    data = request.get_json(silent=True) or {}
    new_capacity = data.get("capacity")
    if new_capacity is None:
        raise ValidationError("capacity is required")
    try:
        new_capacity = int(new_capacity)
    except (TypeError, ValueError) as exc:
        raise ValidationError("capacity must be a valid integer") from exc
    event = organizer_service.update_capacity(g.current_organizer_id, event_id, new_capacity)
    return jsonify(serialize_event(event, include_internal=True)), 200


@organizer_bp.route("/events/<event_id>/publish", methods=["POST"])
@organizer_required
def publish_event(event_id):
    event = organizer_service.publish_event(g.current_organizer_id, event_id)
    return jsonify(serialize_event(event, include_internal=True)), 200


@organizer_bp.route("/events/<event_id>/close-registration", methods=["POST"])
@organizer_required
def close_registrations(event_id):
    event = organizer_service.close_registrations(g.current_organizer_id, event_id)
    return jsonify(serialize_event(event, include_internal=True)), 200


@organizer_bp.route("/events/<event_id>/archive", methods=["POST"])
@organizer_required
def archive_event(event_id):
    event = organizer_service.archive_event(g.current_organizer_id, event_id)
    return jsonify(serialize_event(event, include_internal=True)), 200
