from .common import parse_positive_int, parse_uuid, require_text, validate_email, validate_phone


def validate_registration_payload(payload: dict) -> dict:
    data = dict(payload or {})
    data["event_id"] = parse_uuid(data.get("event_id"), "event_id")
    data["registrant_name"] = require_text(data.get("registrant_name"), "registrant_name", max_length=255)
    data["registrant_phone"] = validate_phone(data.get("registrant_phone"), "registrant_phone")
    data["seats_booked"] = parse_positive_int(data.get("seats_booked", 1), "seats_booked")
    if data.get("registrant_email"):
        data["registrant_email"] = validate_email(data["registrant_email"], "registrant_email")
    return data
