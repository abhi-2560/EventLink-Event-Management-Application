from datetime import datetime

from flask import jsonify, request

from app.services import event_service
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_event
from . import public_bp


def _parse_search_args(args):
    try:
        date_from = None
        date_to = None
        if args.get("date"):
            date_val = datetime.fromisoformat(args["date"].replace("Z", "+00:00"))
            date_from = date_val.replace(hour=0, minute=0, second=0, microsecond=0)
            date_to = date_val.replace(hour=23, minute=59, second=59, microsecond=999999)
        elif args.get("date_from") or args.get("date_to"):
            date_from = datetime.fromisoformat(args["date_from"]) if args.get("date_from") else None
            date_to = datetime.fromisoformat(args["date_to"]) if args.get("date_to") else None
    except ValueError as exc:
        raise ValidationError("date must be a valid ISO-8601 datetime") from exc

    category = args.get("category")
    category_id = args.get("category_id")

    return {
        "title": args.get("title"),
        "city": args.get("city") or args.get("location"),
        "category_id": category_id,
        "category_name": category,
        "event_type": args.get("type"),
        "organizer_name": args.get("organizer"),
        "keyword": args.get("keyword"),
        "date_from": date_from,
        "date_to": date_to,
    }


@public_bp.route("/events", methods=["GET"])
def list_events():
    events = event_service.list_public_events()
    return jsonify([serialize_event(e, use_platform_fees=True) for e in events]), 200


@public_bp.route("/events/search", methods=["GET"])
def search_events():
    filters = _parse_search_args(request.args)
    events = event_service.search_events(**filters)
    return jsonify([serialize_event(e, use_platform_fees=True) for e in events]), 200


@public_bp.route("/events/<event_id>", methods=["GET"])
def get_event(event_id):
    event = event_service.get_public_event(event_id)
    return jsonify(serialize_event(event, use_platform_fees=True)), 200
