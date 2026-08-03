import pytest

from app.extensions import db
from app.models import Event

# You never explicitly import conftest.py because pytest automatically discovers and loads it.

@pytest.mark.integration
def test_registration_payment_and_receipt_flow(client, published_event, coupon):
    registration_response = client.post(
        "/registrations",
        json={
            "event_id": str(published_event.event_id),
            "registrant_name": "Test Registrant",
            "registrant_phone": "9876543210",
            "registrant_email": "registrant@test.local",
            "seats_booked": 2,
            "coupon_code": coupon.code,
        }
    )
    
    assert registration_response.status_code == 201
    registration = registration_response.get_json()
    assert registration["reservation_status"] == "RESERVED"
    assert registration["total_amount"] == "197.00"

    payment_response = client.post(
        "/payments/verify",
        json={"registration_id": registration["registration_id"], "order_id": registration["order_id"]},
    )

    assert payment_response.status_code == 200
    payment = payment_response.get_json()
    assert payment["payment_status"] == "SUCCESS"
    assert payment["receipt_number"]

    receipt_response = client.get(f"/payments/{payment['payment_id']}/receipt")
    assert receipt_response.status_code == 200
    assert receipt_response.get_json()["receipt_number"] == payment["receipt_number"]


@pytest.mark.integration
def test_receipt_serializes_frozen_event_delivery_snapshot(client, app, published_event):
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        event.event_type = "HYBRID"
        event.venue = "Original Hall"
        event.city = "Indore"
        event.state = "Madhya Pradesh"
        event.meeting_link = "https://meet.example.test/original"
        db.session.commit()

    registration_response = client.post(
        "/registrations",
        json={
            "event_id": str(published_event.event_id),
            "registrant_name": "Test Registrant",
            "registrant_phone": "9876543210",
            "seats_booked": 1,
        },
    )
    assert registration_response.status_code == 201
    registration = registration_response.get_json()

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        event.event_type = "ONLINE"
        event.venue = "Changed Hall"
        event.city = "Bhopal"
        event.state = "Changed State"
        event.meeting_link = "https://meet.example.test/changed"
        db.session.commit()

    payment_response = client.post(
        "/payments/verify",
        json={"registration_id": registration["registration_id"], "order_id": registration["order_id"]},
    )
    assert payment_response.status_code == 200
    payment = payment_response.get_json()
    assert payment["event_type"] == "HYBRID"
    assert payment["venue"] == "Original Hall"
    assert payment["city"] == "Indore"
    assert payment["state"] == "Madhya Pradesh"
    assert payment["meeting_link"] == "https://meet.example.test/original"

    receipt_response = client.get(f"/payments/{payment['payment_id']}/receipt")
    assert receipt_response.status_code == 200
    assert receipt_response.get_json()["meeting_link"] == "https://meet.example.test/original"


@pytest.mark.integration
def test_registration_rejects_insufficient_capacity(client, published_event):
    response = client.post(
        "/registrations",
        json={
            "event_id": str(published_event.event_id),
            "registrant_name": "Test Registrant",
            "registrant_phone": "9876543210",
            "seats_booked": 11,
        },
    )

    assert response.status_code == 409
    assert response.get_json()["error"] == "Not enough seats available"


@pytest.mark.integration
def test_coupon_validation_requires_positive_seat_count(client, published_event, coupon):
    response = client.post(
        "/coupons/validate",
        json={"coupon_code": coupon.code, "event_id": str(published_event.event_id), "seat_count": 0},
    )

    assert response.status_code == 422
    assert response.get_json()["error"] == "seat_count must be at least 1"
