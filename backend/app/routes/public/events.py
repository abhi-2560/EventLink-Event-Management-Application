from datetime import datetime

from flask import jsonify, request

from app.services import event_service
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_event
from . import public_bp


@public_bp.route("/events", methods=["GET"])
def search_events():
    args = request.args
    try:
        date_from = datetime.fromisoformat(args["date_from"]) if args.get("date_from") else None
        date_to = datetime.fromisoformat(args["date_to"]) if args.get("date_to") else None
    except ValueError as exc:
        raise ValidationError("date_from and date_to must be valid ISO-8601 datetimes") from exc

    events = event_service.search_events(
        title=args.get("title"),
        city=args.get("city") or args.get("location"),
        category_id=args.get("category_id"),
        event_type=args.get("type"),
        organizer_name=args.get("organizer"),
        keyword=args.get("keyword"),
        date_from=date_from,
        date_to=date_to,
    )
    return jsonify([serialize_event(e) for e in events]), 200


@public_bp.route("/events/<event_id>", methods=["GET"])
def get_event(event_id):
    event = event_service.get_public_event(event_id)
    return jsonify(serialize_event(event)), 200
