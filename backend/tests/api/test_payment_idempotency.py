import pytest

from app.extensions import db
from app.models import Event, Payment, Registration


def _create_registration(client, event_id):
    response = client.post(
        "/registrations",
        json={
            "event_id": str(event_id),
            "registrant_name": "Payment Registrant",
            "registrant_phone": "9876543210",
            "seats_booked": 1,
        },
    )
    assert response.status_code == 201
    return response.get_json()


@pytest.mark.integration
def test_verify_payment_retry_returns_same_receipt_without_double_counting(
    client, app, published_event
):
    registration = _create_registration(client, published_event.event_id)

    first_verify = client.post(
        "/payments/verify",
        json={
            "registration_id": registration["registration_id"],
            "order_id": registration["order_id"],
        },
    )
    assert first_verify.status_code == 200
    first_payment = first_verify.get_json()
    assert first_payment["payment_status"] == "SUCCESS"
    assert first_payment["receipt_number"]

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        registration_row = db.session.get(Registration, registration["registration_id"])
        assert event.total_registrations == 1
        assert registration_row.registration_status == "CONFIRMED"

    second_verify = client.post(
        "/payments/verify",
        json={
            "registration_id": registration["registration_id"],
            "order_id": registration["order_id"],
        },
    )
    assert second_verify.status_code == 200
    second_payment = second_verify.get_json()
    assert second_payment["receipt_number"] == first_payment["receipt_number"]
    assert second_payment["payment_status"] == "SUCCESS"

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        payments = Payment.query.filter_by(registration_id=registration["registration_id"]).all()
        assert event.total_registrations == 1
        assert len(payments) == 1


@pytest.mark.integration
def test_payment_failure_retry_is_idempotent_and_releases_seats(client, app, published_event):
    registration = _create_registration(client, published_event.event_id)

    first_failure = client.post(
        "/payments/failure",
        json={"registration_id": registration["registration_id"], "failure_reason": "User cancelled"},
    )
    assert first_failure.status_code == 200
    assert first_failure.get_json()["payment_status"] == "FAILED"

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        registration_row = db.session.get(Registration, registration["registration_id"])
        assert event.available_seats == published_event.available_seats
        assert registration_row.registration_status == "FAILED"
        assert registration_row.reservation_status == "EXPIRED"

    second_failure = client.post(
        "/payments/failure",
        json={"registration_id": registration["registration_id"], "failure_reason": "User cancelled"},
    )
    assert second_failure.status_code == 200
    assert second_failure.get_json()["payment_status"] == "FAILED"

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        payments = Payment.query.filter_by(registration_id=registration["registration_id"]).all()
        assert event.available_seats == published_event.available_seats
        assert len(payments) == 1
