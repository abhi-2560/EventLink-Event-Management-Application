from flask import jsonify

from app.middleware import organizer_required
from app.services import admin_service
from app.utils.serializers import serialize_category
from . import organizer_bp


@organizer_bp.route("/categories", methods=["GET"])
@organizer_required
def list_categories():
    categories = admin_service.list_categories()
    return jsonify([serialize_category(c) for c in categories]), 200
