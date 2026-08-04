"""Shared PostgreSQL-backed test fixtures.

Set TEST_DATABASE_URL to a dedicated database. This suite deliberately never
uses DATABASE_URL, preventing accidental mutation of development data.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from sqlalchemy import text
from werkzeug.security import generate_password_hash

from app import create_app
from app.config import TestConfig
from app.extensions import db
from app.models import Admin, Category, Coupon, Event, Organizer

TABLES = "audit_log, refresh_token, payment, registration, event_media, event, coupon, category, organizer, admin"

# @pytest.fixture
# This function prepares some reusable data or object that tests can use.
# without fixtures: rewrite the code again when required

# Create this fixture only once for the entire test run, and reuse it for all tests.
# without this, app() would get created 'n times for n cases'
@pytest.fixture(scope="session")
def app():
    if not os.getenv("TEST_DATABASE_URL"):
        pytest.skip("TEST_DATABASE_URL is required for PostgreSQL integration tests")
    application = create_app(TestConfig)
    with application.app_context():
        db.session.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))
        db.create_all()
        # create_all() does not retrofit constraints onto an existing local
        # test database. Mirror the active Alembic invariant for reused DBs.
        
        # Postgres psql
        db.session.execute(
            text(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'ck_coupon_flat_discount'
                    ) THEN
                        ALTER TABLE coupon
                        ADD CONSTRAINT ck_coupon_flat_discount
                        CHECK (flat_discount >= 0);
                    END IF;
                END $$;
                """
            )
        )
        db.session.commit()
    yield application
    with application.app_context():
        db.session.remove()


@pytest.fixture(autouse=True)
def clean_database(app):
    with app.app_context():
        db.session.execute(text(f"TRUNCATE TABLE {TABLES} RESTART IDENTITY CASCADE"))
        # Platform fees intentionally live on an admin row. The application
        # seeds one in every deployed environment, so integration tests seed
        # the same baseline before exercising public registration flows.
        db.session.add(
            Admin(
                name="Test Admin",
                email="admin@test.local",
                password_hash=generate_password_hash("Admin@123"),
                status="ACTIVE",
                convenience_fee=Decimal("5.00"),
                gateway_fee=Decimal("2.00"),
            )
        )
        db.session.commit()
    yield
    with app.app_context():
        db.session.rollback()
        db.session.execute(text(f"TRUNCATE TABLE {TABLES} RESTART IDENTITY CASCADE"))
        db.session.commit()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin(app):
    with app.app_context():
        result = Admin.query.filter_by(email="admin@test.local").one()
        db.session.refresh(result)
        return result


@pytest.fixture
def category(app):
    with app.app_context():
        result = Category(name="Conference", description="Test category")
        db.session.add(result)
        db.session.commit()
        db.session.refresh(result)
        return result


@pytest.fixture
def organizer(app):
    with app.app_context():
        result = Organizer(
            organizer_name="Test Organizer",
            contact_person="Test Contact",
            email="organizer@test.local",
            phone="9876543210",
            password_hash=generate_password_hash("Organizer@123"),
            status="ACTIVE",
        )
        db.session.add(result)
        db.session.commit()
        db.session.refresh(result)
        return result


@pytest.fixture
def published_event(app, organizer, category):
    with app.app_context():
        start = datetime.now(timezone.utc) + timedelta(days=7)
        result = Event(
            organizer_id=organizer.organizer_id,
            organizer_name=organizer.organizer_name,
            organizer_email=organizer.email,
            organizer_phone=organizer.phone,
            category_id=category.category_id,
            category_name=category.name,
            title="Test Conference",
            description="An event for integration tests",
            event_type="OFFLINE",
            city="Indore",
            country="India",
            keywords=["testing"],
            ticket_price=Decimal("100.00"),
            is_free=False,
            capacity=10,
            available_seats=10,
            start_datetime=start,
            status="PUBLISHED",
            registration_status="OPEN",
        )
        db.session.add(result)
        db.session.commit()
        db.session.refresh(result)
        return result


@pytest.fixture
def coupon(app):
    with app.app_context():
        result = Coupon(code="SAVE10", flat_discount=Decimal("10.00"), is_active=True)
        db.session.add(result)
        db.session.commit()
        db.session.refresh(result)
        return result


def login(client, path, email, password):
    response = client.post(path, json={"email": email, "password": password})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.get_json()['access_token']}"}


@pytest.fixture
def admin_headers(client, admin):
    return login(client, "/auth/admin/login", admin.email, "Admin@123")


@pytest.fixture
def organizer_headers(client, organizer):
    return login(client, "/auth/organizer/login", organizer.email, "Organizer@123")


@pytest.fixture
def other_organizer(app):
    with app.app_context():
        result = Organizer(
            organizer_name="Other Organizer",
            contact_person="Other Contact",
            email="other-organizer@test.local",
            phone="9876543211",
            password_hash=generate_password_hash("Organizer@123"),
            status="ACTIVE",
        )
        db.session.add(result)
        db.session.commit()
        db.session.refresh(result)
        return result


@pytest.fixture
def other_organizer_headers(client, other_organizer):
    return login(client, "/auth/organizer/login", other_organizer.email, "Organizer@123")
