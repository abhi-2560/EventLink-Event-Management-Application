"""
Admin reports. Two different data sources are used deliberately:

- The dashboard summary reads the denormalized running totals directly
  off Organizer/Event/Category (the whole point of that denormalization
  - "no joins" per the schema design notes).
- The monthly/period reports need a specific time window, which the
  running totals can't give you (they're all-time), so those query
  Payment/Event directly grouped by date.
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
    total_events = db.session.query(func.count(Event.event_id)).scalar() or 0
    total_tickets_sold = db.session.query(func.coalesce(func.sum(Event.total_tickets_sold), 0)).scalar() or 0
    total_value_earned = db.session.query(func.coalesce(func.sum(Event.total_sales), 0)).scalar() or Decimal(0)

    return {
        "total_organizers": total_organizers,
        "total_events": total_events,
        "total_tickets_sold": total_tickets_sold,
        "total_value_earned": total_value_earned,
    }


def get_monthly_bar_chart(months: int = DEFAULT_WINDOW_MONTHS):
    """
    Monthly, per-category ticket sales for the last `months` months,
    based on successful payments' completed_at.
    Returns a list of {month, category_name, tickets_sold, revenue}.
    """
    since = datetime.now(timezone.utc) - timedelta(days=30 * months)

    rows = (
        db.session.query(
            func.date_trunc("month", Payment.completed_at).label("month"),
            Payment.category_name,
            func.count(Payment.payment_id).label("tickets_sold"),
            func.coalesce(func.sum(Payment.amount), 0).label("revenue"),
        )
        .filter(Payment.payment_status == "SUCCESS", Payment.completed_at >= since)
        .group_by("month", Payment.category_name)
        .order_by("month")
        .all()
    )

    return [
        {
            "month": row.month.strftime("%Y-%m"),
            "category_name": row.category_name,
            "tickets_sold": row.tickets_sold,
            "revenue": row.revenue,
        }
        for row in rows
    ]


def get_category_pie_chart(start_date=None, end_date=None):
    """
    Number of events per category within a period. Defaults to the last
    6 months of event start_datetime if no explicit range is given.
    """
    if end_date is None:
        end_date = datetime.now(timezone.utc)
    if start_date is None:
        start_date = end_date - timedelta(days=30 * DEFAULT_WINDOW_MONTHS)

    rows = (
        db.session.query(
            Category.name,
            func.count(Event.event_id).label("event_count"),
        )
        .join(Event, Event.category_id == Category.category_id)
        .filter(Event.start_datetime >= start_date, Event.start_datetime <= end_date)
        .group_by(Category.name)
        .all()
    )

    return [{"category_name": row.name, "event_count": row.event_count} for row in rows]
