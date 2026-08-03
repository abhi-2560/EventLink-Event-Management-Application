import pytest


@pytest.mark.integration
def test_organizer_can_publish_own_event(client, organizer_headers, category):
    create_response = client.post(
        "/organizer/events",
        headers=organizer_headers,
        json={
            "category_id": str(category.category_id),
            "title": "Published Event",
            "event_type": "OFFLINE",
            "city": "Indore",
            "ticket_price": 0,
            "is_free": True,
            "capacity": 20,
            "start_datetime": "2030-12-31T10:00:00+00:00",
        },
    )
    assert create_response.status_code == 201

    event_id = create_response.get_json()["event_id"]
    publish_response = client.post(f"/organizer/events/{event_id}/publish", headers=organizer_headers)

    assert publish_response.status_code == 200
    assert publish_response.get_json()["status"] == "PUBLISHED"

# integration test
@pytest.mark.integration
def test_publish_validation_requires_offline_city(client, organizer_headers, category):
    create_response = client.post(
        "/organizer/events",
        headers=organizer_headers,
        json={
            "category_id": str(category.category_id),
            "title": "No City Event",
            "event_type": "OFFLINE",
            "capacity": 20,
            "is_free": True,
            "ticket_price": 0,
            "start_datetime": "2030-12-31T10:00:00+00:00",
        },
    )
    event_id = create_response.get_json()["event_id"]

    response = client.post(f"/organizer/events/{event_id}/publish", headers=organizer_headers)

    assert response.status_code == 422
    assert response.get_json()["error"] == "City is required for offline events"


@pytest.mark.integration
def test_admin_dashboard_and_reports_are_authorized(client, admin_headers, published_event):
    dashboard = client.get("/admin/reports/dashboard", headers=admin_headers)
    monthly = client.get("/admin/reports/monthly", headers=admin_headers)

    assert dashboard.status_code == 200
    assert dashboard.get_json()["total_events"] == 1
    assert monthly.status_code == 200
    assert isinstance(monthly.get_json(), list)
