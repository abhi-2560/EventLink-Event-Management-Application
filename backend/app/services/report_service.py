"""
Admin reports. Dashboard reads denormalized totals; time-window reports
query Payment/Event directly grouped by date.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import func

from app.extensions import db
from app.models import Category, Event, Organizer, Payment

DEFAULT_WINDOW_MONTHS = 6


def get_admin_dashboard_summary():
    total_organizers = db.session.query(func.count(Organizer.organizer_id)).scalar() or 0
    total_events = db.session.query(func.count(Event.event_id)).filter(Event.archived_at.is_(None)).scalar() or 0
    active_events = db.session.query(func.count(Event.event_id)).filter(
        Event.status == "PUBLISHED", Event.archived_at.is_(None)
    ).scalar() or 0
    total_registrations = db.session.query(func.coalesce(func.sum(Event.total_registrations), 0)).scalar() or 0
    total_tickets_sold = db.session.query(func.coalesce(func.sum(Event.total_tickets_sold), 0)).scalar() or 0
    total_value_earned = db.session.query(func.coalesce(func.sum(Event.total_sales), 0)).scalar() or Decimal(0)

    return {
        "total_organizers": total_organizers,
        "total_events": total_events,
        "active_events": active_events,
        "total_registrations": int(total_registrations),
        "total_tickets_sold": int(total_tickets_sold),
        "total_revenue": str(total_value_earned),
        "total_value_earned": str(total_value_earned),
    }


def get_monthly_bar_chart(months: int = DEFAULT_WINDOW_MONTHS, start_date=None, end_date=None):
    if end_date is None:
        end_date = datetime.now(timezone.utc)
    if start_date is None:
        start_date = end_date - timedelta(days=30 * months)

    payment_rows = (
        db.session.query(
            func.date_trunc("month", Payment.completed_at).label("month"),
            func.count(Payment.payment_id).label("registrations"),
            func.coalesce(func.sum(Payment.amount), 0).label("revenue"),
        )
        .filter(
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
        .filter(Event.created_at >= start_date, Event.created_at <= end_date)
        .group_by("month")
        .all()
    )

    organizer_rows = (
        db.session.query(
            func.date_trunc("month", Organizer.created_at).label("month"),
            func.count(Organizer.organizer_id).label("organizers"),
        )
        .filter(Organizer.created_at >= start_date, Organizer.created_at <= end_date)
        .group_by("month")
        .all()
    )

    by_month: dict[str, dict] = {}

    def bucket(month_dt):
        key = month_dt.strftime("%Y-%m")
        if key not in by_month:
            by_month[key] = {
                "month": key,
                "events": 0,
                "registrations": 0,
                "revenue": Decimal(0),
                "organizers": 0,
            }
        return by_month[key]

    for row in payment_rows:
        b = bucket(row.month)
        b["registrations"] = row.registrations
        b["revenue"] = row.revenue

    for row in event_rows:
        bucket(row.month)["events"] = row.events

    for row in organizer_rows:
        bucket(row.month)["organizers"] = row.organizers

    return [
        {**v, "revenue": str(v["revenue"])}
        for v in sorted(by_month.values(), key=lambda x: x["month"])
    ]


def get_category_pie_chart(start_date=None, end_date=None):
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
            Event.start_datetime >= start_date,
            Event.start_datetime <= end_date,
            Event.archived_at.is_(None),
        )
        .group_by(Event.category_name)
        .all()
    )

    return [{"category_name": row.category_name, "event_count": row.event_count} for row in rows]
