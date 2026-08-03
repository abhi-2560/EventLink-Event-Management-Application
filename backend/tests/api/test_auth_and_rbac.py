import pytest

@pytest.mark.integration
def test_admin_login_returns_access_token(client, admin):
    # invloves login endpoint, authn code, db, etc..
    response = client.post("/auth/admin/login", json={"email": admin.email, "password": "Admin@123"})

    assert response.status_code == 200
    assert response.get_json()["actor_type"] == "admin"
    assert response.get_json()["access_token"]


@pytest.mark.integration
def test_login_rejects_invalid_credentials(client, admin):
    response = client.post("/auth/admin/login", json={"email": admin.email, "password": "bad-password"})

    # built-in Python statement that checks whether a condition is true.
    assert response.status_code == 422
    assert response.get_json()["error"] == "Invalid email or password"


@pytest.mark.integration
def test_organizer_token_cannot_access_admin_route(client, organizer_headers):
    response = client.get("/admin/categories", headers=organizer_headers)

    assert response.status_code == 403
    assert response.get_json()["error"] == "Admin access required"


@pytest.mark.integration
def test_missing_token_uses_json_error_contract(client):
    response = client.get("/admin/categories")

    assert response.status_code == 401
    assert response.is_json
    assert response.get_json()["error"] == "Authentication is required"
