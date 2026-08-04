import pytest

from app.extensions import db
from app.models import Event, Registration


@pytest.mark.integration
def test_other_organizer_cannot_get_event(client, published_event, other_organizer_headers):
    response = client.get(
        f"/organizer/events/{published_event.event_id}",
        headers=other_organizer_headers,
    )

    assert response.status_code == 403
    assert response.get_json()["error"] == "You do not own this event"


@pytest.mark.integration
def test_other_organizer_cannot_list_event_registrations(
    client, published_event, other_organizer_headers
):
    response = client.get(
        f"/organizer/events/{published_event.event_id}/registrations",
        headers=other_organizer_headers,
    )

    assert response.status_code == 403
    assert response.get_json()["error"] == "You do not own this event"


@pytest.mark.integration
def test_other_organizer_cannot_update_event_capacity(
    client, app, published_event, other_organizer_headers
):
    response = client.put(
        f"/organizer/events/{published_event.event_id}/capacity",
        headers=other_organizer_headers,
        json={"capacity": 20},
    )

    assert response.status_code == 403
    assert response.get_json()["error"] == "You do not own this event"
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        assert event.capacity == published_event.capacity


@pytest.mark.integration
def test_update_capacity_rejects_downsize_below_booked_seats(
    client, app, organizer_headers, published_event
):
    registration_response = client.post(
        "/registrations",
        json={
            "event_id": str(published_event.event_id),
            "registrant_name": "Booked Registrant",
            "registrant_phone": "9876543210",
            "seats_booked": 2,
        },
    )
    assert registration_response.status_code == 201

    ok_response = client.put(
        f"/organizer/events/{published_event.event_id}/capacity",
        headers=organizer_headers,
        json={"capacity": 8},
    )
    assert ok_response.status_code == 200

    reject_response = client.put(
        f"/organizer/events/{published_event.event_id}/capacity",
        headers=organizer_headers,
        json={"capacity": 1},
    )

    assert reject_response.status_code == 422
    assert "2 seats are already booked" in reject_response.get_json()["error"]

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        assert event.capacity == 8
        assert event.available_seats == 6
        assert Registration.query.filter_by(event_id=published_event.event_id).count() == 1
