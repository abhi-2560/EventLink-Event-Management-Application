from io import BytesIO

import pytest

from app.extensions import db
from app.models import Event, EventMedia

# Monkeypatch: temporarily change behavior without changing the original source code.

@pytest.fixture
def mock_cloudinary_uploader(monkeypatch):
    class FakeUploader:
        @staticmethod
        def upload(file, folder=None, resource_type="image"):
            return {
                "secure_url": f"https://cdn.example.test/{folder}/uploaded",
                "public_id": f"{folder}/uploaded",
            }

        @staticmethod
        def destroy(public_id, **kwargs):
            return {"result": "ok"}

    monkeypatch.setattr("app.services.media_service._cloudinary", lambda: FakeUploader())


def _jpeg_file(name="banner.jpg"):
    return (BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 64), name, "image/jpeg")


@pytest.mark.integration
def test_upload_banner_persists_urls_without_network(
    client, app, organizer_headers, published_event, mock_cloudinary_uploader
):
    response = client.post(
        f"/organizer/events/{published_event.event_id}/banner",
        headers=organizer_headers,
        data={"file": _jpeg_file()},
        content_type="multipart/form-data",
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["banner_url"].startswith("https://cdn.example.test/")

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        assert event.banner_url == payload["banner_url"]
        assert event.banner_public_id is not None


@pytest.mark.integration
def test_delete_banner_clears_event_media_fields(
    client, app, organizer_headers, published_event, mock_cloudinary_uploader
):
    upload_response = client.post(
        f"/organizer/events/{published_event.event_id}/banner",
        headers=organizer_headers,
        data={"file": _jpeg_file()},
        content_type="multipart/form-data",
    )
    assert upload_response.status_code == 200

    delete_response = client.delete(
        f"/organizer/events/{published_event.event_id}/banner",
        headers=organizer_headers,
    )
    assert delete_response.status_code == 200

    with app.app_context():
        event = db.session.get(Event, published_event.event_id)
        assert event.banner_url is None
        assert event.banner_public_id is None


@pytest.mark.integration
def test_upload_gallery_media_creates_event_media_row(
    client, app, organizer_headers, published_event, mock_cloudinary_uploader
):
    response = client.post(
        f"/organizer/events/{published_event.event_id}/media",
        headers=organizer_headers,
        data={"file": _jpeg_file("gallery.jpg"), "media_type": "IMAGE"},
        content_type="multipart/form-data",
    )

    assert response.status_code == 201
    payload = response.get_json()
    assert payload["media_type"] == "IMAGE"
    assert payload["media_url"].startswith("https://cdn.example.test/")

    with app.app_context():
        media_rows = EventMedia.query.filter_by(event_id=published_event.event_id).all()
        assert len(media_rows) == 1
        assert str(media_rows[0].media_id) == payload["media_id"]
        assert media_rows[0].public_id is not None
