import pytest
from sqlalchemy.exc import OperationalError


@pytest.mark.integration
def test_health_returns_database_readiness(client):
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["status"] == "ok"
    assert payload["database"] == "connected"
    assert payload["timestamp"]
    assert payload["version"]


@pytest.mark.unit
def test_health_returns_503_when_database_is_unavailable(app, client, monkeypatch):
    from app.routes import health

    monkeypatch.setattr(
        health.db.session,
        "execute",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(OperationalError("SELECT 1", {}, Exception())),
    )

    response = client.get("/health")

    assert response.status_code == 503
    assert response.get_json()["database"] == "unavailable"
