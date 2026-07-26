from flask import g, jsonify

from app.middleware import organizer_required
from app.services import organizer_service
from app.utils.serializers import serialize_registration
from . import organizer_bp


@organizer_bp.route("/events/<event_id>/registrations", methods=["GET"])
@organizer_required
def list_registrations(event_id):
    registrations = organizer_service.list_registrations(g.current_organizer_id, event_id)
    return jsonify([serialize_registration(r) for r in registrations]), 200


@organizer_bp.route("/events/<event_id>/registrations/<registration_id>", methods=["GET"])
@organizer_required
def get_registration_detail(event_id, registration_id):
    registration = organizer_service.get_registration_detail(
        g.current_organizer_id, event_id, registration_id
    )
    return jsonify(serialize_registration(registration)), 200
