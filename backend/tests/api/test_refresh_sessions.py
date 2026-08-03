from datetime import datetime, timedelta, timezone

import pytest

from app.extensions import db
from app.models import RefreshToken


REFRESH_HEADERS = {"X-Refresh-Request": "1", "X-Actor-Type": "admin"}


def _login_and_set_refresh_cookie(client, admin):
    response = client.post(
        "/auth/admin/login",
        json={"email": admin.email, "password": "Admin@123"},
    )
    assert response.status_code == 200
    cookie = client.get_cookie("refresh_token_admin", path="/api/auth")
    assert cookie is not None
    client.set_cookie("refresh_token_admin", cookie.value)
    return response, cookie.value


@pytest.mark.integration
def test_login_sets_refresh_cookie_for_api_auth_proxy(client, admin):
    response, _ = _login_and_set_refresh_cookie(client, admin)

    assert "Path=/api/auth" in response.headers["Set-Cookie"]
    assert "HttpOnly" in response.headers["Set-Cookie"]


@pytest.mark.integration
def test_refresh_rotates_cookie_and_access_token(client, admin):
    _, original_token = _login_and_set_refresh_cookie(client, admin)

    response = client.post("/auth/refresh", headers=REFRESH_HEADERS)

    assert response.status_code == 200
    assert response.get_json()["access_token"]
    rotated_cookie = client.get_cookie("refresh_token_admin", path="/api/auth")
    assert rotated_cookie is not None
    assert rotated_cookie.value != original_token


@pytest.mark.integration
def test_refresh_replay_revokes_entire_token_family(client, admin, app):
    _, original_token = _login_and_set_refresh_cookie(client, admin)
    assert client.post("/auth/refresh", headers=REFRESH_HEADERS).status_code == 200

    client.set_cookie("refresh_token_admin", original_token)
    replay_response = client.post("/auth/refresh", headers=REFRESH_HEADERS)

    assert replay_response.status_code == 422
    assert replay_response.get_json()["error"] == "Refresh token has already been used"
    with app.app_context():
        sessions = RefreshToken.query.all()
        assert len(sessions) == 2
        assert all(session.revoked_at is not None for session in sessions)


@pytest.mark.integration
def test_logout_revokes_refresh_session_and_clears_cookie(client, admin, app):
    login_response, _ = _login_and_set_refresh_cookie(client, admin)

    response = client.post(
        "/auth/admin/logout",
        headers={"Authorization": f"Bearer {login_response.get_json()['access_token']}"},
    )

    assert response.status_code == 200
    assert "Path=/api/auth" in response.headers["Set-Cookie"]
    with app.app_context():
        assert RefreshToken.query.one().revoked_at is not None


@pytest.mark.integration
def test_expired_refresh_session_is_rejected(client, admin, app):
    _login_and_set_refresh_cookie(client, admin)
    with app.app_context():
        session = RefreshToken.query.one()
        session.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.session.commit()

    response = client.post("/auth/refresh", headers=REFRESH_HEADERS)

    assert response.status_code == 422
    assert response.get_json()["error"] == "Refresh token is invalid or expired"
