"""
Admin actions: organizers, categories, and read/update (never create) on
events. Anything that touches Event delegates to event_service so the
capacity/cascade logic isn't duplicated here.
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.repositories.category_repository import CategoryRepository
from app.repositories.event_repository import EventRepository
from app.repositories.organizer_repository import OrganizerRepository
from . import event_service
from .audit_service import log_action
from .exceptions import ConflictError, NotFoundError

_organizer_repo = OrganizerRepository()
_event_repo = EventRepository()
_category_repo = CategoryRepository()

ORGANIZER_UPDATABLE_FIELDS = {"organizer_name", "contact_person", "email", "phone"}


# ---------------------------------------------------------------- organizers

def list_organizers():
    return _organizer_repo.get_all()


def get_organizer(organizer_id):
    organizer = _organizer_repo.get_by_id(organizer_id)
    if organizer is None:
        raise NotFoundError("Organizer not found")
    return organizer


def update_organizer(admin_id, organizer_id, payload: dict):
    organizer = get_organizer(organizer_id)
    before = {f: getattr(organizer, f) for f in ORGANIZER_UPDATABLE_FIELDS}

    name_or_contact_changed = False
    for key, value in payload.items():
        if key in ORGANIZER_UPDATABLE_FIELDS:
            if key in {"organizer_name", "email", "phone"} and getattr(organizer, key) != value:
                name_or_contact_changed = True
            setattr(organizer, key, value)
    _organizer_repo.update()

    # organizer_name/email/phone are snapshotted onto event - keep them in sync.
    if name_or_contact_changed:
        event_service.cascade_organizer_snapshot(organizer)

    after = {f: getattr(organizer, f) for f in ORGANIZER_UPDATABLE_FIELDS}
    log_action(
        actor_type="ADMIN",
        actor_id=admin_id,
        action="Admin Updated Organizer",
        entity_type="organizer",
        entity_id=organizer_id,
        entity_name=organizer.organizer_name,
        old_value=before,
        new_value=after,
    )
    return organizer


def archive_organizer(admin_id, organizer_id):
    organizer = get_organizer(organizer_id)
    organizer.status = "INACTIVE"
    organizer.archived_at = datetime.now(timezone.utc)
    _organizer_repo.update()

    log_action(
        actor_type="ADMIN",
        actor_id=admin_id,
        action="Organizer Archived",
        entity_type="organizer",
        entity_id=organizer_id,
        entity_name=organizer.organizer_name,
    )
    return organizer


def hard_delete_organizer(admin_id, organizer_id):
    """
    Status flip, not a real DELETE - preserves history for existing
    events/registrations/payments. See services/exceptions.py header:
    the schema has no status value distinct from archive for this, so
    this currently behaves the same as archive_organizer but logs a
    different action for the audit trail.
    """
    organizer = get_organizer(organizer_id)
    organizer.status = "INACTIVE"
    organizer.archived_at = datetime.now(timezone.utc)
    _organizer_repo.update()

    log_action(
        actor_type="ADMIN",
        actor_id=admin_id,
        action="Organizer Deleted",
        entity_type="organizer",
        entity_id=organizer_id,
        entity_name=organizer.organizer_name,
    )
    return organizer


# --------------------------------------------------------------------- events

def list_events():
    return _event_repo.get_all()


def get_event(event_id):
    return event_service.get_event(event_id)


def update_event(admin_id, event_id, payload: dict):
    before_status = event_service.get_event(event_id).status
    event = event_service.update_event(event_id, payload)

    log_action(
        actor_type="ADMIN",
        actor_id=admin_id,
        action="Admin Updated Event",
        entity_type="event",
        entity_id=event_id,
        entity_name=event.title,
        old_value={"status": before_status},
        new_value={"status": event.status},
    )
    return event


def archive_event(admin_id, event_id):
    before = event_service.get_event(event_id)
    event = event_service.archive_event(event_id)

    if before.archived_at is None:
        category = _category_repo.get_by_id(before.category_id)
        if category is not None and (category.total_events or 0) > 0:
            category.total_events -= 1
            _category_repo.update()

    log_action(
        actor_type="ADMIN",
        actor_id=admin_id,
        action="Admin Archived Event",
        entity_type="event",
        entity_id=event_id,
        entity_name=event.title,
    )
    return event


def hard_delete_event(admin_id, event_id):
    """Same caveat as hard_delete_organizer - see that function's docstring."""
    before = event_service.get_event(event_id)
    event = event_service.archive_event(event_id)

    if before.archived_at is None:
        category = _category_repo.get_by_id(before.category_id)
        if category is not None and (category.total_events or 0) > 0:
            category.total_events -= 1
            _category_repo.update()

    log_action(
        actor_type="ADMIN",
        actor_id=admin_id,
        action="Admin Deleted Event",
        entity_type="event",
        entity_id=event_id,
        entity_name=event.title,
    )
    return event


# ---------------------------------------------------------------- categories

def list_categories():
    return _category_repo.get_all()


def create_category(name: str, description: str | None = None, is_default: bool = False):
    if _category_repo.name_exists(name):
        raise ConflictError(f"Category '{name}' already exists")
    return _category_repo.create(name=name, description=description, is_default=is_default)


def update_category(category_id, payload: dict):
    category = _category_repo.get_by_id(category_id)
    if category is None:
        raise NotFoundError("Category not found")

    new_name = payload.get("name")
    name_changed = bool(new_name) and new_name != category.name

    if "name" in payload:
        category.name = payload["name"]
    if "description" in payload:
        category.description = payload["description"]
    if "is_default" in payload:
        category.is_default = payload["is_default"]
    _category_repo.update()

    if name_changed:
        event_service.cascade_category_snapshot(category)

    return category


def delete_category(category_id):
    category = _category_repo.get_by_id(category_id)
    if category is None:
        raise NotFoundError("Category not found")
    if (category.total_events or 0) > 0:
        raise ConflictError("Cannot delete category with existing events")
    _category_repo.delete(category)
    return category


def archive_category(admin_id, category_id):
    """Soft-archive by renaming default categories; delete only when unused."""
    category = _category_repo.get_by_id(category_id)
    if category is None:
        raise NotFoundError("Category not found")
    if (category.total_events or 0) > 0:
        category.description = (category.description or "") + " [ARCHIVED]"
        category.is_default = False
        _category_repo.update()
    else:
        _category_repo.delete(category)

    log_action(
        actor_type="ADMIN", actor_id=admin_id, action="Category Deleted",
        entity_type="category", entity_id=category_id, entity_name=category.name,
    )
    return category
