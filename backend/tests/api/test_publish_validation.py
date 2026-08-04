import pytest


@pytest.mark.integration
def test_publish_validation_requires_online_meeting_link(client, organizer_headers, category):
    create_response = client.post(
        "/organizer/events",
        headers=organizer_headers,
        json={
            "category_id": str(category.category_id),
            "title": "Online Event",
            "event_type": "ONLINE",
            "capacity": 20,
            "is_free": True,
            "ticket_price": 0,
            "start_datetime": "2030-12-31T10:00:00+00:00",
        },
    )
    assert create_response.status_code == 201
    event_id = create_response.get_json()["event_id"]

    response = client.post(f"/organizer/events/{event_id}/publish", headers=organizer_headers)

    assert response.status_code == 422
    assert response.get_json()["error"] == "Meeting link is required for online and hybrid events"


@pytest.mark.integration
def test_publish_validation_rejects_short_title(client, app, organizer_headers, category):
    create_response = client.post(
        "/organizer/events",
        headers=organizer_headers,
        json={
            "category_id": str(category.category_id),
            "title": "Valid Title",
            "event_type": "OFFLINE",
            "city": "Indore",
            "capacity": 20,
            "is_free": True,
            "ticket_price": 0,
            "start_datetime": "2030-12-31T10:00:00+00:00",
        },
    )
    assert create_response.status_code == 201
    event_id = create_response.get_json()["event_id"]

    with app.app_context():
        from app.extensions import db
        from app.models import Event

        event = db.session.get(Event, event_id)
        event.title = "AB"
        db.session.commit()

    response = client.post(f"/organizer/events/{event_id}/publish", headers=organizer_headers)

    assert response.status_code == 422
    assert response.get_json()["error"] == "Title must be at least 3 characters"

    with app.app_context():
        from app.extensions import db
        from app.models import Event

        event = db.session.get(Event, event_id)
        assert event.status == "DRAFT"


@pytest.mark.integration
def test_event_create_validation_rejects_registration_window_end_before_start(
    client, organizer_headers, category
):
    response = client.post(
        "/organizer/events",
        headers=organizer_headers,
        json={
            "category_id": str(category.category_id),
            "title": "Window Event",
            "event_type": "OFFLINE",
            "city": "Indore",
            "capacity": 20,
            "is_free": True,
            "ticket_price": 0,
            "start_datetime": "2030-12-31T10:00:00+00:00",
            "registration_start": "2030-12-20T10:00:00+00:00",
            "registration_end": "2030-12-10T10:00:00+00:00",
        },
    )

    assert response.status_code == 422
    assert response.get_json()["error"] == "Registration end must be after registration start"
