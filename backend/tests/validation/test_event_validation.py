import pytest

from app.services.exceptions import ValidationError
from app.validation.events import validate_event_payload


def test_event_validation_normalizes_iso_datetime():
    payload = validate_event_payload(
        {
            "title": "Valid event",
            "category_id": "123e4567-e89b-12d3-a456-426614174000",
            "capacity": 10,
            "event_type": "OFFLINE",
            "ticket_price": "0",
            "start_datetime": "2030-01-10T10:00:00+00:00",
        },
        creating=True,
    )

    assert payload["capacity"] == 10
    assert payload["start_datetime"].year == 2030


def test_event_validation_rejects_registration_after_event_start():
    with pytest.raises(ValidationError, match="Registration end cannot exceed event start"):
        validate_event_payload(
            {
                "start_datetime": "2030-01-10T10:00:00+00:00",
                "registration_end": "2030-01-11T10:00:00+00:00",
            }
        )
