from flask import g, jsonify

from app.middleware import organizer_required
from app.services import organizer_service
from . import organizer_bp


@organizer_bp.route("/sales", methods=["GET"])
@organizer_required
def total_sales():
    return jsonify({"total_sales": str(organizer_service.get_total_sales(g.current_organizer_id))}), 200


@organizer_bp.route("/events/<event_id>/sales", methods=["GET"])
@organizer_required
def event_sales(event_id):
    sales = organizer_service.get_event_sales(g.current_organizer_id, event_id)
    return jsonify({k: str(v) for k, v in sales.items()}), 200
