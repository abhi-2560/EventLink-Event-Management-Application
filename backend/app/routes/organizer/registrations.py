from flask import g, jsonify

from app.middleware import organizer_required
from app.repositories.payment_repository import PaymentRepository
from app.services import organizer_service
from app.utils.serializers import serialize_registration
from . import organizer_bp

_payment_repo = PaymentRepository()


@organizer_bp.route("/events/<event_id>/registrations", methods=["GET"])
@organizer_required
def list_registrations(event_id):
    registrations = organizer_service.list_registrations(g.current_organizer_id, event_id)
    result = []
    for registration in registrations:
        payments = _payment_repo.get_by_registration(registration.registration_id)
        payment = payments[0] if payments else None
        result.append(serialize_registration(registration, payment))
    return jsonify(result), 200


@organizer_bp.route("/events/<event_id>/registrations/<registration_id>", methods=["GET"])
@organizer_required
def get_registration_detail(event_id, registration_id):
    registration = organizer_service.get_registration_detail(
        g.current_organizer_id, event_id, registration_id
    )
    payments = _payment_repo.get_by_registration(registration_id)
    payment = payments[0] if payments else None
    return jsonify(serialize_registration(registration, payment)), 200
