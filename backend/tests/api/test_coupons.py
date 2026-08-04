from datetime import datetime, timedelta, timezone

import pytest

from app.extensions import db
from app.models import Coupon


@pytest.mark.integration
def test_coupon_validate_rejects_nonexistent_code(client, published_event):
    response = client.post(
        "/coupons/validate",
        json={
            "coupon_code": "MISSING",
            "event_id": str(published_event.event_id),
            "seat_count": 1,
        },
    )

    assert response.status_code == 422
    assert response.get_json()["error"] == "Coupon is invalid, inactive, or expired"


@pytest.mark.integration
def test_coupon_validate_rejects_inactive_code(client, app, published_event, coupon):
    with app.app_context():
        stored = db.session.get(Coupon, coupon.coupon_id)
        stored.is_active = False
        db.session.commit()

    response = client.post(
        "/coupons/validate",
        json={
            "coupon_code": coupon.code,
            "event_id": str(published_event.event_id),
            "seat_count": 1,
        },
    )

    assert response.status_code == 422
    assert response.get_json()["error"] == "Coupon is invalid, inactive, or expired"


@pytest.mark.integration
def test_coupon_validate_rejects_expired_code(client, app, published_event, coupon):
    with app.app_context():
        stored = db.session.get(Coupon, coupon.coupon_id)
        stored.expiry_date = datetime.now(timezone.utc) - timedelta(days=1)
        db.session.commit()

    response = client.post(
        "/coupons/validate",
        json={
            "coupon_code": coupon.code,
            "event_id": str(published_event.event_id),
            "seat_count": 1,
        },
    )

    assert response.status_code == 422
    assert response.get_json()["error"] == "Coupon is invalid, inactive, or expired"
