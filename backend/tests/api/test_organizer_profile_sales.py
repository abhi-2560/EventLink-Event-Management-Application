import pytest

from app.extensions import db
from app.models import Event, Organizer


@pytest.mark.integration
def test_organizer_profile_get_and_update(client, app, organizer_headers, organizer, published_event):
    profile_response = client.get("/organizer/profile", headers=organizer_headers)
    assert profile_response.status_code == 200
    assert profile_response.get_json()["email"] == organizer.email

    update_response = client.put(
        "/organizer/profile",
        headers=organizer_headers,
        json={"organizer_name": "Updated Organizer Name", "contact_person": "Updated Contact"},
    )
    assert update_response.status_code == 200

    with app.app_context():
        stored = db.session.get(Organizer, organizer.organizer_id)
        assert stored.organizer_name == "Updated Organizer Name"
        assert stored.contact_person == "Updated Contact"
        event = db.session.get(Event, published_event.event_id)
        assert event.organizer_name == "Updated Organizer Name"


@pytest.mark.integration
def test_organizer_sales_reflect_successful_payment(client, app, organizer_headers, published_event):
    registration_response = client.post(
        "/registrations",
        json={
            "event_id": str(published_event.event_id),
            "registrant_name": "Sales Registrant",
            "registrant_phone": "9876543210",
            "seats_booked": 2,
        },
    )
    assert registration_response.status_code == 201
    registration = registration_response.get_json()

    verify_response = client.post(
        "/payments/verify",
        json={
            "registration_id": registration["registration_id"],
            "order_id": registration["order_id"],
        },
    )
    assert verify_response.status_code == 200

    total_sales_response = client.get("/organizer/sales", headers=organizer_headers)
    assert total_sales_response.status_code == 200
    assert total_sales_response.get_json()["total_sales"] == "207.00"

    event_sales_response = client.get(
        f"/organizer/events/{published_event.event_id}/sales",
        headers=organizer_headers,
    )
    assert event_sales_response.status_code == 200
    payload = event_sales_response.get_json()
    assert payload["total_sales"] == "207.00"
    assert payload["total_registrations"] == "1"
    assert payload["total_tickets_sold"] == "2"

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        assert event.total_registrations == 1
        assert event.total_tickets_sold == 2
