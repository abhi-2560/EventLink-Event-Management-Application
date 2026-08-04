# An application context is Flask's way of keeping track of which Flask application is currently active.

import pytest

from app.extensions import db
from app.models import Category, Coupon, Event, Organizer


@pytest.mark.integration
def test_admin_category_crud(client, app, admin_headers):
    create_response = client.post(
        "/admin/categories",
        headers=admin_headers,
        json={"name": "Workshop", "description": "Hands-on sessions"},
    )
    
    assert create_response.status_code == 201
    # “I expect the result to be 201. If it is not 5, this test should fail.”
    
    category_id = create_response.get_json()["category_id"]

    list_response = client.get("/admin/categories", headers=admin_headers)
    assert list_response.status_code == 200
    assert any(item["category_id"] == category_id for item in list_response.get_json())

    update_response = client.put(
        f"/admin/categories/{category_id}",
        headers=admin_headers,
        json={"name": "Workshops", "description": "Updated description"},
    )
    assert update_response.status_code == 200

    delete_response = client.delete(f"/admin/categories/{category_id}", headers=admin_headers)
    assert delete_response.status_code == 200

    with app.app_context():
        assert db.session.get(Category, category_id) is None


@pytest.mark.integration
def test_admin_coupon_crud_soft_deletes_in_database(client, app, admin_headers):
    create_response = client.post(
        "/admin/coupons",
        headers=admin_headers,
        json={"code": "ADMIN20", "flat_discount": "20.00", "description": "Admin coupon"},
    )
    assert create_response.status_code == 201
    coupon_id = create_response.get_json()["coupon_id"]

    get_response = client.get(f"/admin/coupons/{coupon_id}", headers=admin_headers)
    assert get_response.status_code == 200
    assert get_response.get_json()["code"] == "ADMIN20"

    update_response = client.put(
        f"/admin/coupons/{coupon_id}",
        headers=admin_headers,
        json={"description": "Updated coupon copy"},
    )
    assert update_response.status_code == 200

    delete_response = client.delete(f"/admin/coupons/{coupon_id}", headers=admin_headers)
    assert delete_response.status_code == 200

    with app.app_context():
        coupon = db.session.get(Coupon, coupon_id)
        assert coupon is not None
        assert coupon.is_active is False


@pytest.mark.integration
def test_admin_organizer_management_updates_and_archives(client, app, admin_headers, organizer):
    list_response = client.get("/admin/organizers", headers=admin_headers)
    assert list_response.status_code == 200
    assert any(item["organizer_id"] == str(organizer.organizer_id) for item in list_response.get_json())

    update_response = client.put(
        f"/admin/organizers/{organizer.organizer_id}",
        headers=admin_headers,
        json={"organizer_name": "Admin Renamed Organizer"},
    )
    assert update_response.status_code == 200

    archive_response = client.patch(
        f"/admin/organizers/{organizer.organizer_id}/archive",
        headers=admin_headers,
    )
    assert archive_response.status_code == 200

    with app.app_context():
        stored = db.session.get(Organizer, organizer.organizer_id)
        assert stored.organizer_name == "Admin Renamed Organizer"
        assert stored.status == "INACTIVE"
        assert stored.archived_at is not None


@pytest.mark.integration
def test_admin_event_archive_updates_database(client, app, admin_headers, published_event):
    list_response = client.get("/admin/events", headers=admin_headers)
    assert list_response.status_code == 200
    assert any(item["event_id"] == str(published_event.event_id) for item in list_response.get_json())

    archive_response = client.post(
        f"/admin/events/{published_event.event_id}/archive",
        headers=admin_headers,
    )
    assert archive_response.status_code == 200

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        assert event.status == "ARCHIVED"
        assert event.archived_at is not None


@pytest.mark.integration
def test_admin_can_read_platform_fees(client, admin_headers):
    response = client.get("/admin/settings/platform-fees", headers=admin_headers)

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["convenience_fee"] == "5.00"
    assert payload["gateway_fee"] == "2.00"
