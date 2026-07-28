from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import func

from app.extensions import db
from app.models import Event, Organizer, Payment


DEFAULT_WINDOW_MONTHS = 6


def get_organizer_dashboard(organizer_id):
    events = Event.query.filter_by(organizer_id=organizer_id).all()
    now = datetime.now(timezone.utc)

    draft_events = sum(1 for e in events if e.status == "DRAFT" and e.archived_at is None)
    active_events = sum(
        1 for e in events
        if e.status == "PUBLISHED" and e.archived_at is None
    )
    closed_events = sum(
        1 for e in events
        if e.registration_status == "CLOSED" and e.archived_at is None
    )
    archived_events = sum(1 for e in events if e.archived_at is not None or e.status == "ARCHIVED")

    upcoming = [
        e for e in events
        if e.start_datetime and e.start_datetime >= now
        and e.status == "PUBLISHED"
        and e.archived_at is None
    ]
    upcoming.sort(key=lambda e: e.start_datetime)

    organizer = db.session.get(Organizer, organizer_id)

    return {
        "total_events": len([e for e in events if e.archived_at is None]),
        "active_events": active_events,
        "draft_events": draft_events,
        "closed_events": closed_events,
        "archived_events": archived_events,
        "total_registrations": organizer.total_registrations or 0 if organizer else 0,
        "total_revenue": str(organizer.total_sales or Decimal(0)) if organizer else "0",
        "total_tickets_sold": organizer.total_tickets_sold or 0 if organizer else 0,
        "upcoming_events": [
            {
                "event_id": str(e.event_id),
                "title": e.title,
                "start_datetime": e.start_datetime.isoformat(),
                "city": e.city,
                "available_seats": e.available_seats,
            }
            for e in upcoming[:5]
        ],
    }


def get_organizer_monthly_report(organizer_id, start_date=None, end_date=None):
    if end_date is None:
        end_date = datetime.now(timezone.utc)
    if start_date is None:
        start_date = end_date - timedelta(days=30 * DEFAULT_WINDOW_MONTHS)

    rows = (
        db.session.query(
            func.date_trunc("month", Payment.completed_at).label("month"),
            func.count(Payment.payment_id).label("registrations"),
            func.coalesce(func.sum(Payment.amount), 0).label("revenue"),
        )
        .filter(
            Payment.organizer_id == organizer_id,
            Payment.payment_status == "SUCCESS",
            Payment.completed_at >= start_date,
            Payment.completed_at <= end_date,
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    event_rows = (
        db.session.query(
            func.date_trunc("month", Event.created_at).label("month"),
            func.count(Event.event_id).label("events"),
        )
        .filter(
            Event.organizer_id == organizer_id,
            Event.created_at >= start_date,
            Event.created_at <= end_date,
        )
        .group_by("month")
        .all()
    )

    events_by_month = {row.month.strftime("%Y-%m"): row.events for row in event_rows}

    return [
        {
            "month": row.month.strftime("%Y-%m"),
            "registrations": row.registrations,
            "revenue": str(row.revenue),
            "events": events_by_month.get(row.month.strftime("%Y-%m"), 0),
        }
        for row in rows
    ]


def get_organizer_category_report(organizer_id, start_date=None, end_date=None):
    if end_date is None:
        end_date = datetime.now(timezone.utc)
    if start_date is None:
        start_date = end_date - timedelta(days=30 * DEFAULT_WINDOW_MONTHS)

    rows = (
        db.session.query(
            Event.category_name,
            func.count(Event.event_id).label("event_count"),
        )
        .filter(
            Event.organizer_id == organizer_id,
            Event.start_datetime >= start_date,
            Event.start_datetime <= end_date,
            Event.archived_at.is_(None),
        )
        .group_by(Event.category_name)
        .all()
    )

    return [{"category_name": row.category_name, "event_count": row.event_count} for row in rows]


def get_organizer_recent_transactions(organizer_id, limit: int = 10):
    payments = (
        Payment.query.filter_by(organizer_id=organizer_id, payment_status="SUCCESS")
        .order_by(Payment.completed_at.desc())
        .limit(limit)
        .all()
    )
    return payments
