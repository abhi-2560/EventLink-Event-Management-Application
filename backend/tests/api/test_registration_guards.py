from datetime import datetime, timezone

import pytest

from app.extensions import db
from app.models import Event, Registration


def _registration_payload(event_id):
    return {
        "event_id": str(event_id),
        "registrant_name": "Test Registrant",
        "registrant_phone": "9876543210",
        "seats_booked": 1,
    }


@pytest.mark.integration
def test_create_registration_rejects_unpublished_event(client, app, published_event):
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        event.status = "DRAFT"
        db.session.commit()

    response = client.post("/registrations", json=_registration_payload(published_event.event_id))

    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        assert event.available_seats == published_event.available_seats
        assert Registration.query.count() == 0


@pytest.mark.integration
def test_create_registration_rejects_archived_event(client, app, published_event):
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        event.archived_at = datetime.now(timezone.utc)
        db.session.commit()

    response = client.post("/registrations", json=_registration_payload(published_event.event_id))

    assert response.status_code == 404
    assert response.get_json()["error"] == "Event not found"
    with app.app_context():
        assert Registration.query.count() == 0


@pytest.mark.integration
def test_create_registration_rejects_closed_registration(client, app, published_event):
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        event.registration_status = "CLOSED"
        db.session.commit()

    response = client.post("/registrations", json=_registration_payload(published_event.event_id))

    assert response.status_code == 409
    assert response.get_json()["error"] == "Registration is closed for this event"
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        assert event.available_seats == published_event.available_seats
        assert Registration.query.count() == 0
