from flask import jsonify, request

from app.services import auth_service
from app.utils.serializers import serialize_organizer
from . import public_bp


@public_bp.route("/organizers/register", methods=["POST"])
def register_organizer():
    data = request.get_json(silent=True) or {}
    organizer = auth_service.register_organizer(data)
    return jsonify(serialize_organizer(organizer)), 201
