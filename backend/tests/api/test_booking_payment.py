import pytest


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
