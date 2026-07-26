"""
Organizer actions on their own events, plus read-only browsing of the
whole catalog ("can also view other events" per the requirement doc).

Every function that touches a specific event starts with _owns_event(),
which is the only place ownership is checked - keeps that rule from
being re-implemented slightly differently in five different routes.
"""

from __future__ import annotations

from app.models import Event
from app.repositories.event_repository import EventRepository
from app.repositories.organizer_repository import OrganizerRepository
from app.repositories.registration_repository import RegistrationRepository
from . import event_service
from .audit_service import log_action
from .exceptions import ForbiddenError, NotFoundError

_event_repo = EventRepository()
_organizer_repo = OrganizerRepository()
_registration_repo = RegistrationRepository()


def _owns_event(organizer_id, event_id) -> Event:
    event = event_service.get_event(event_id)
    if str(event.organizer_id) != str(organizer_id):
        raise ForbiddenError("You do not own this event")
    return event


# --------------------------------------------------------------------- events

def list_own_events(organizer_id):
    return _event_repo.get_by_organizer(organizer_id)


def browse_all_events():
    """Read-only view of every event, regardless of owner."""
    return _event_repo.get_all()


def create_event(organizer_id, payload: dict) -> Event:
    event = event_service.create_event(organizer_id, payload)

    organizer = _organizer_repo.get_by_id(organizer_id)
    organizer.total_events = (organizer.total_events or 0) + 1
    organizer.active_events = (organizer.active_events or 0) + 1
    _organizer_repo.update()

    log_action(
        actor_type="ORGANIZER",
        actor_id=organizer_id,
        action="Event Created",
        entity_type="event",
        entity_id=event.event_id,
        entity_name=event.title,
    )
    return event


def get_own_event(organizer_id, event_id) -> Event:
    return _owns_event(organizer_id, event_id)


def update_event(organizer_id, event_id, payload: dict) -> Event:
    _owns_event(organizer_id, event_id)
    event = event_service.update_event(event_id, payload)

    log_action(
        actor_type="ORGANIZER",
        actor_id=organizer_id,
        action="Event Updated",
        entity_type="event",
        entity_id=event_id,
        entity_name=event.title,
    )
    return event


def update_capacity(organizer_id, event_id, new_capacity: int) -> Event:
    before = _owns_event(organizer_id, event_id)
    old_capacity = before.capacity

    event = event_service.update_capacity(event_id, new_capacity)

    action = "Capacity Increased" if new_capacity > old_capacity else "Capacity Reduced"
    log_action(
        actor_type="ORGANIZER",
        actor_id=organizer_id,
        action=action,
        entity_type="event",
        entity_id=event_id,
        entity_name=event.title,
        old_value={"capacity": old_capacity},
        new_value={"capacity": new_capacity},
    )
    return event


def publish_event(organizer_id, event_id) -> Event:
    _owns_event(organizer_id, event_id)
    event = event_service.publish_event(event_id)
    log_action(
        actor_type="ORGANIZER", actor_id=organizer_id, action="Event Published",
        entity_type="event", entity_id=event_id, entity_name=event.title,
    )
    return event


def close_registrations(organizer_id, event_id) -> Event:
    _owns_event(organizer_id, event_id)
    event = event_service.close_registrations(event_id)
    log_action(
        actor_type="ORGANIZER", actor_id=organizer_id, action="Registration Closed",
        entity_type="event", entity_id=event_id, entity_name=event.title,
    )
    return event


def archive_event(organizer_id, event_id) -> Event:
    _owns_event(organizer_id, event_id)
    event = event_service.archive_event(event_id)

    organizer = _organizer_repo.get_by_id(organizer_id)
    if organizer.active_events:
        organizer.active_events -= 1
        _organizer_repo.update()

    log_action(
        actor_type="ORGANIZER", actor_id=organizer_id, action="Event Archived",
        entity_type="event", entity_id=event_id, entity_name=event.title,
    )
    return event


# ---------------------------------------------------------- bookings & sales

def list_registrations(organizer_id, event_id):
    _owns_event(organizer_id, event_id)
    return _registration_repo.get_by_event(event_id)


def get_registration_detail(organizer_id, event_id, registration_id):
    _owns_event(organizer_id, event_id)
    registration = _registration_repo.get_by_id(registration_id)
    if registration is None or str(registration.event_id) != str(event_id):
        raise NotFoundError("Registration not found for this event")
    return registration


def get_total_sales(organizer_id):
    organizer = _organizer_repo.get_by_id(organizer_id)
    if organizer is None:
        raise NotFoundError("Organizer not found")
    return organizer.total_sales


def get_event_sales(organizer_id, event_id):
    event = _owns_event(organizer_id, event_id)
    return {
        "total_sales": event.total_sales,
        "total_registrations": event.total_registrations,
        "total_tickets_sold": event.total_tickets_sold,
    }
