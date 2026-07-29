"""
Event business logic, shared across admin, organizer, and public routes.

Nothing in this file checks *who* is allowed to call it - that's the
caller's job (admin_service / organizer_service apply role and
ownership checks, then delegate here). This keeps the actual event
rules - capacity math, seat atomicity, cascade snapshots - defined
exactly once.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import update

from app.extensions import db
from app.models import Category, Event, Organizer
from app.repositories.category_repository import CategoryRepository
from app.repositories.event_repository import EventRepository
from app.repositories.organizer_repository import OrganizerRepository
from .exceptions import ConflictError, NotFoundError, SeatsUnavailableError, ValidationError

_event_repo = EventRepository()
_organizer_repo = OrganizerRepository()
_category_repo = CategoryRepository()

CREATABLE_FIELDS = {
    "title", "description", "event_type", "venue", "city", "state", "country",
    "meeting_link", "keywords", "ticket_price", "is_free",
    "capacity", "registration_start", "registration_end",
    "start_datetime",
}

# capacity updates use update_capacity(); category_id handled in update_event()
UPDATABLE_FIELDS = (CREATABLE_FIELDS - {"capacity"}) | {"category_id", "registration_status"}


def get_event(event_id) -> Event:
    event = _event_repo.get_by_id(event_id)
    if event is None:
        raise NotFoundError("Event not found")
    return event


def update_event(event_id, payload: dict) -> Event:
    event = get_event(event_id)

    if "category_id" in payload:
        new_category_id = payload["category_id"]
        if str(new_category_id) != str(event.category_id):
            new_category = _category_repo.get_by_id(new_category_id)
            if new_category is None:
                raise ValidationError("category_id must reference an existing category")
            old_category_id = event.category_id
            event.category_id = new_category.category_id
            event.category_name = new_category.name
            if event.archived_at is None:
                old_category = _category_repo.get_by_id(old_category_id)
                if old_category is not None and (old_category.total_events or 0) > 0:
                    old_category.total_events -= 1
                new_category.total_events = (new_category.total_events or 0) + 1
                _category_repo.update()

    for key, value in payload.items():
        if key in UPDATABLE_FIELDS and key != "category_id":
            setattr(event, key, value)

    _event_repo.update()
    return event


def get_public_event(event_id) -> Event:
    """Public detail view - only events actually visible to registrants."""
    event = get_event(event_id)
    if event.status != "PUBLISHED" or event.archived_at is not None:
        raise NotFoundError("Event not found")
    return event


def create_event(organizer_id, payload: dict) -> Event:
    organizer = _organizer_repo.get_by_id(organizer_id)
    if organizer is None:
        raise NotFoundError("Organizer not found")

    category = _category_repo.get_by_id(payload.get("category_id"))
    if category is None:
        raise ValidationError("category_id is required and must reference an existing category")

    capacity = payload.get("capacity")
    if not capacity or capacity <= 0:
        raise ValidationError("capacity must be a positive integer")

    fields = {k: v for k, v in payload.items() if k in CREATABLE_FIELDS}

    return _event_repo.create(
        organizer_id=organizer.organizer_id,
        organizer_name=organizer.organizer_name,
        organizer_email=organizer.email,
        organizer_phone=organizer.phone,
        category_id=category.category_id,
        category_name=category.name,
        available_seats=capacity,
        **fields,
    )


def update_capacity(event_id, new_capacity: int) -> Event:
    """
    Enforces: can't downsize below what's already booked.
    booked = capacity - available_seats (current state, before this change).
    """
    if new_capacity is None or new_capacity <= 0:
        raise ValidationError("capacity must be a positive integer")

    event = get_event(event_id)
    booked = event.capacity - event.available_seats

    if new_capacity < booked:
        raise ValidationError(
            f"Cannot reduce capacity to {new_capacity}; {booked} seats are already booked"
        )

    delta = new_capacity - event.capacity
    event.available_seats += delta
    event.capacity = new_capacity
    _event_repo.update()
    return event


def _validate_event_for_publish(event: Event) -> None:
    """Enforce the same business rules applied on the organizer event form."""
    title = (event.title or "").strip()
    if len(title) < 3:
        raise ValidationError("Title must be at least 3 characters")

    if not event.category_id:
        raise ValidationError("category_id is required")

    if not event.event_type:
        raise ValidationError("event_type is required")

    if not event.start_datetime:
        raise ValidationError("start_datetime is required")

    if not event.capacity or event.capacity <= 0:
        raise ValidationError("capacity must be a positive integer")

    if event.event_type == "OFFLINE" and not (event.city or "").strip():
        raise ValidationError("City is required for offline events")

    if event.event_type in ("ONLINE", "HYBRID") and not (event.meeting_link or "").strip():
        raise ValidationError("Meeting link is required for online and hybrid events")

    if event.is_free and event.ticket_price not in (None, 0):
        raise ValidationError("Free events must have ticket price 0")

    if not event.is_free and (event.ticket_price is None or event.ticket_price < 0):
        raise ValidationError("Ticket price must be 0 or more")

    if (
        event.registration_start
        and event.registration_end
        and event.registration_end <= event.registration_start
    ):
        raise ValidationError("Registration end must be after registration start")


def publish_event(event_id) -> Event:
    event = get_event(event_id)

    if event.status not in ("DRAFT", "ARCHIVED"):
        raise ConflictError(f"Cannot publish event with status {event.status}")

    _validate_event_for_publish(event)

    event.status = "PUBLISHED"
    if event.archived_at is not None:
        event.archived_at = None

    _event_repo.update()
    return event


def close_registrations(event_id) -> Event:
    event = get_event(event_id)
    event.registration_status = "CLOSED"
    _event_repo.update()
    return event


def archive_event(event_id) -> Event:
    """Soft delete. See note in services/exceptions.py header re: no distinct hard-delete state."""
    event = get_event(event_id)
    event.status = "ARCHIVED"
    event.archived_at = datetime.now(timezone.utc)
    _event_repo.update()
    return event


def list_public_events():
    """All published, non-archived events."""
    return Event.query.filter(
        Event.status == "PUBLISHED",
        Event.archived_at.is_(None),
    ).order_by(Event.start_datetime.asc()).all()


def search_events(
    title: str | None = None,
    city: str | None = None,
    category_id=None,
    category_name: str | None = None,
    event_type: str | None = None,
    organizer_name: str | None = None,
    keyword: str | None = None,
    date_from=None,
    date_to=None,
):
    """
    Public search - only PUBLISHED, non-archived events. Combines filters
    additively (AND). Any filter left as None is skipped.
    """
    query = Event.query.filter(
        Event.status == "PUBLISHED",
        Event.archived_at.is_(None),
    )
    if title:
        query = query.filter(Event.title.ilike(f"%{title}%"))
    if city:
        query = query.filter(Event.city.ilike(f"%{city}%"))
    if category_id:
        query = query.filter(Event.category_id == category_id)
    if category_name:
        query = query.filter(Event.category_name.ilike(f"%{category_name}%"))
    if event_type:
        query = query.filter(Event.event_type == event_type)
    if organizer_name:
        query = query.filter(Event.organizer_name.ilike(f"%{organizer_name}%"))
    if keyword:
        query = query.filter(Event.keywords.any(keyword))
    if date_from:
        query = query.filter(Event.start_datetime >= date_from)
    if date_to:
        query = query.filter(Event.start_datetime <= date_to)
    return query.order_by(Event.start_datetime.asc()).all()


def cascade_organizer_snapshot(organizer: Organizer):
    """
    Call after committing an organizer name/email/phone change. Bulk-updates
    every non-archived event snapshot to match - see the "event is live,
    registration/payment are frozen" distinction from the schema design.
    """
    db.session.execute(
        update(Event)
        .where(Event.organizer_id == organizer.organizer_id, Event.archived_at.is_(None))
        .values(
            organizer_name=organizer.organizer_name,
            organizer_email=organizer.email,
            organizer_phone=organizer.phone,
        )
    )
    db.session.commit()


def cascade_category_snapshot(category: Category):
    """Same idea as cascade_organizer_snapshot, for category renames."""
    db.session.execute(
        update(Event)
        .where(Event.category_id == category.category_id, Event.archived_at.is_(None))
        .values(category_name=category.name)
    )
    db.session.commit()


def reserve_seats(event_id, seats_needed: int) -> int:
    """
    Atomic seat decrement - the race-condition guard. Does NOT commit;
    the caller (booking_service) folds this into the same transaction as
    the registration insert so both succeed or fail together.

    Returns the new available_seats count. Raises SeatsUnavailableError
    if the WHERE clause matched zero rows (not enough seats left, or the
    event doesn't exist).
    """
    result = db.session.execute(
        update(Event)
        .where(Event.event_id == event_id, Event.available_seats >= seats_needed)
        .values(available_seats=Event.available_seats - seats_needed)
        .returning(Event.available_seats)
    )
    row = result.first()
    if row is None:
        raise SeatsUnavailableError("Not enough seats available")
    return row[0]


def release_seats(event_id, seats_to_release: int):
    """
    Atomic seat release (hold expired/cancelled or payment failed).
    Clamped to capacity in the same statement so a double-release can't
    push available_seats above it. Does NOT commit - same reasoning as
    reserve_seats; the caller folds this into its own transaction.
    """
    db.session.execute(
        update(Event)
        .where(Event.event_id == event_id)
        .values(
            available_seats=db.func.least(
                Event.capacity, Event.available_seats + seats_to_release
            )
        )
    )
