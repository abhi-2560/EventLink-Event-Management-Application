from types import SimpleNamespace

import pytest

from app.services import auth_service


class FakeOrganizerRepo:
    def __init__(self):
        self.created = []

    def get_by_email(self, email):
        return None

    def create(self, **kwargs):
        organizer = SimpleNamespace(**kwargs)
        self.created.append(organizer)
        return organizer

    def update(self):
        return None


@pytest.fixture
def fake_repo(monkeypatch):
    repo = FakeOrganizerRepo()
    monkeypatch.setattr(auth_service, "_organizer_repo", repo)
    return repo


def test_register_organizer_creates_active_organizer(fake_repo):
    organizer = auth_service.register_organizer(
        {
            "organizer_name": "Example Org",
            "contact_person": "Jane Doe",
            "email": "org@example.com",
            "phone": "1234567890",
            "password": "secret123",
        }
    )

    assert organizer.status == "ACTIVE"
    assert organizer.organizer_name == "Example Org"
    assert organizer.email == "org@example.com"
    assert organizer.password_hash != "secret123"
    assert fake_repo.created
