from app.services.exceptions import ValidationError
from .common import parse_datetime, parse_nonnegative_decimal, parse_positive_int, parse_uuid, require_text, validate_url

EVENT_TYPES = {"ONLINE", "OFFLINE", "HYBRID"}
REGISTRATION_STATUSES = {"OPEN", "CLOSED"}


def validate_event_payload(payload: dict, *, creating=False) -> dict:
    data = dict(payload or {})
    if creating:
        data["category_id"] = parse_uuid(data.get("category_id"), "category_id")
        data["capacity"] = parse_positive_int(data.get("capacity"), "capacity")
    elif "category_id" in data:
        data["category_id"] = parse_uuid(data["category_id"], "category_id")

    if "title" in data:
        data["title"] = require_text(data["title"], "title", max_length=255)
    if creating and "title" not in data:
        raise ValidationError("title is required")
    if "event_type" in data and data["event_type"] not in EVENT_TYPES:
        raise ValidationError("event_type must be ONLINE, OFFLINE, or HYBRID")
    if "ticket_price" in data:
        data["ticket_price"] = parse_nonnegative_decimal(data["ticket_price"], "ticket_price")
    if "meeting_link" in data:
        data["meeting_link"] = validate_url(data["meeting_link"], "meeting_link")
    for field in ("start_datetime", "registration_start", "registration_end"):
        if field in data:
            data[field] = parse_datetime(data[field], field)
    if data.get("registration_start") and data.get("registration_end"):
        if data["registration_end"] <= data["registration_start"]:
            raise ValidationError("Registration end must be after registration start")
    if data.get("registration_end") and data.get("start_datetime"):
        if data["registration_end"] > data["start_datetime"]:
            raise ValidationError("Registration end cannot exceed event start")
    if "registration_status" in data and data["registration_status"] not in REGISTRATION_STATUSES:
        raise ValidationError("registration_status must be OPEN or CLOSED")
    return data
