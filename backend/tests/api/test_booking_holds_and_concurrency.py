from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest

from app.extensions import db
from app.models import Event, Registration
from app.repositories.registration_repository import RegistrationRepository
from app.services import booking_service


def _registration_payload(event_id, suffix="00"):
    return {
        "event_id": str(event_id),
        "registrant_name": f"Registrant {suffix}",
        "registrant_phone": f"900000{suffix.zfill(4)}",
        "seats_booked": 1,
    }


@pytest.mark.integration
def test_release_expired_holds_reclaims_seats_and_marks_failed(app, published_event):
    seats_held = 3
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        event.available_seats -= seats_held
        db.session.commit()

        repo = RegistrationRepository()
        registration = repo.create(
            event_id=event.event_id,
            event_title=event.title,
            event_city=event.city,
            category_id=event.category_id,
            category_name=event.category_name,
            organizer_id=event.organizer_id,
            organizer_name=event.organizer_name,
            registrant_name="Expired Hold",
            registrant_phone="9000000001",
            seats_booked=seats_held,
            ticket_price=Decimal("100.00"),
            total_amount=Decimal("107.00"),
            reservation_status="RESERVED",
            registration_status="PENDING",
            reservation_expires_at=datetime.now(timezone.utc) - timedelta(minutes=5),
        )
        registration_id = registration.registration_id

        booking_service.release_expired_holds(event.event_id)

        event = db.session.get(Event, published_event.event_id)
        registration = db.session.get(Registration, registration_id)
        assert event.available_seats == published_event.available_seats
        assert registration.reservation_status == "EXPIRED"
        assert registration.registration_status == "FAILED"


@pytest.mark.integration
def test_create_registration_reclaims_expired_hold_before_booking(client, app, published_event):
    seats_held = 2
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        event.available_seats -= seats_held
        db.session.commit()

        RegistrationRepository().create(
            event_id=event.event_id,
            event_title=event.title,
            event_city=event.city,
            category_id=event.category_id,
            category_name=event.category_name,
            organizer_id=event.organizer_id,
            organizer_name=event.organizer_name,
            registrant_name="Expired Hold",
            registrant_phone="9000000002",
            seats_booked=seats_held,
            ticket_price=Decimal("100.00"),
            total_amount=Decimal("214.00"),
            reservation_status="RESERVED",
            registration_status="PENDING",
            reservation_expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        )

    response = client.post("/registrations", json=_registration_payload(published_event.event_id, "0001"))

    assert response.status_code == 201
    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        assert event.available_seats == published_event.available_seats - 1
        assert Registration.query.filter_by(reservation_status="EXPIRED").count() == 1
        assert Registration.query.filter_by(reservation_status="RESERVED").count() == 1


@pytest.mark.integration
def test_concurrent_booking_on_single_seat_event_allows_exactly_one_success(app, published_event):
    event_id = published_event.event_id
    with app.app_context():
        event = db.session.get(Event, event_id)
        event.capacity = 1
        event.available_seats = 1
        db.session.commit()

    def attempt(suffix):
        with app.app_context():
            test_client = app.test_client()
            return test_client.post("/registrations", json=_registration_payload(event_id, suffix))

    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(attempt, ["10", "11"]))

    status_codes = sorted(response.status_code for response in responses)
    assert status_codes == [201, 409]

    with app.app_context():
        event = db.session.get(Event, event_id)
        assert event.available_seats == 0
        assert Registration.query.filter_by(event_id=event_id).count() == 1
