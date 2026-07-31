from flask import g, jsonify, request

from app.middleware import organizer_required
from app.services import organizer_service
from app.services import media_service
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_event
from app.validation.events import validate_event_payload
from app.validation.common import parse_positive_int
from . import organizer_bp


@organizer_bp.route("/events", methods=["GET"])
@organizer_required
def list_own_events():
    events = organizer_service.list_own_events(g.current_organizer_id)
    return jsonify([serialize_event(e, include_internal=True, use_platform_fees=True) for e in events]), 200


@organizer_bp.route("/events/browse", methods=["GET"])
@organizer_required
def browse_all_events():
    events = organizer_service.browse_all_events()
    return jsonify([serialize_event(e) for e in events]), 200


@organizer_bp.route("/events", methods=["POST"])
@organizer_required
def create_event():
    payload = validate_event_payload(request.get_json(silent=True) or {}, creating=True)
    event = organizer_service.create_event(g.current_organizer_id, payload)
    return jsonify(serialize_event(event, include_internal=True, use_platform_fees=True)), 201


@organizer_bp.route("/events/<event_id>", methods=["GET"])
@organizer_required
def get_own_event(event_id):
    event = organizer_service.get_own_event(g.current_organizer_id, event_id)
    return jsonify(serialize_event(event, include_internal=True, use_platform_fees=True, include_media=True)), 200


@organizer_bp.route("/events/<event_id>", methods=["PUT"])
@organizer_required
def update_event(event_id):
    payload = validate_event_payload(request.get_json(silent=True) or {})
    event = organizer_service.update_event(g.current_organizer_id, event_id, payload)
    return jsonify(serialize_event(event, include_internal=True, use_platform_fees=True)), 200


@organizer_bp.route("/events/<event_id>/capacity", methods=["PUT"])
@organizer_required
def update_capacity(event_id):
    data = request.get_json(silent=True) or {}
    new_capacity = data.get("capacity")
    if new_capacity is None:
        raise ValidationError("capacity is required")
    new_capacity = parse_positive_int(new_capacity, "capacity")
    event = organizer_service.update_capacity(g.current_organizer_id, event_id, new_capacity)
    return jsonify(serialize_event(event, include_internal=True, use_platform_fees=True)), 200


@organizer_bp.route("/events/<event_id>/publish", methods=["POST", "PATCH"])
@organizer_required
def publish_event(event_id):
    event = organizer_service.publish_event(g.current_organizer_id, event_id)
    return jsonify(serialize_event(event, include_internal=True, use_platform_fees=True)), 200


@organizer_bp.route("/events/<event_id>/close-registration", methods=["POST"])
@organizer_required
def close_registrations(event_id):
    event = organizer_service.close_registrations(g.current_organizer_id, event_id)
    return jsonify(serialize_event(event, include_internal=True, use_platform_fees=True)), 200


@organizer_bp.route("/events/<event_id>/archive", methods=["POST"])
@organizer_required
def archive_event(event_id):
    event = organizer_service.archive_event(g.current_organizer_id, event_id)
    return jsonify(serialize_event(event, include_internal=True, use_platform_fees=True)), 200


@organizer_bp.route("/events/<event_id>/banner", methods=["POST"])
@organizer_required
def upload_banner(event_id):
    event = organizer_service.get_own_event(g.current_organizer_id, event_id)
    event = media_service.upload_banner(event, request.files.get("file"), g.current_organizer_id)
    return jsonify(serialize_event(event, include_internal=True, use_platform_fees=True, include_media=True)), 200


@organizer_bp.route("/events/<event_id>/banner", methods=["DELETE"])
@organizer_required
def delete_banner(event_id):
    event = organizer_service.get_own_event(g.current_organizer_id, event_id)
    event = media_service.delete_banner(event, g.current_organizer_id)
    return jsonify(serialize_event(event, include_internal=True, use_platform_fees=True, include_media=True)), 200


@organizer_bp.route("/events/<event_id>/media", methods=["POST"])
@organizer_required
def upload_media(event_id):
    event = organizer_service.get_own_event(g.current_organizer_id, event_id)
    media = media_service.upload_media(
        event,
        request.files.get("file"),
        (request.form.get("media_type") or "").upper(),
        g.current_organizer_id,
    )
    return jsonify(
        {
            "media_id": str(media.media_id),
            "media_type": media.media_type,
            "media_url": media.media_url,
            "display_order": media.display_order,
        }
    ), 201


@organizer_bp.route("/events/<event_id>/media/<media_id>", methods=["DELETE"])
@organizer_required
def delete_media(event_id, media_id):
    event = organizer_service.get_own_event(g.current_organizer_id, event_id)
    media_service.delete_media(event, media_id, g.current_organizer_id)
    return jsonify({"message": "Media deleted"}), 200
