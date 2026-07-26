"""
Audit logging.

log_action() is called from every other service after a business action
succeeds - never before, since AuditLogRepository.create() commits
immediately and we don't want an audit row for an action that later
fails and rolls back.

Kept deliberately dumb: this module has no opinion on *what* counts as
loggable. Callers pass exactly the actor/entity/action triple from the
audit log taxonomy in the requirement doc (e.g. "Event Published",
"Registration Confirmed").
"""

from __future__ import annotations

from typing import Any

from app.repositories.audit_log_repository import AuditLogRepository

_audit_repo = AuditLogRepository()


def log_action(
    actor_type: str,
    action: str,
    entity_type: str,
    actor_id=None,
    actor_name: str | None = None,
    actor_email: str | None = None,
    entity_id=None,
    entity_name: str | None = None,
    old_value: dict[str, Any] | None = None,
    new_value: dict[str, Any] | None = None,
    ip_address: str | None = None,
):
    """
    Write one audit log row.

    actor_type: 'ADMIN' | 'ORGANIZER' | 'SYSTEM'
    action: e.g. 'Event Published', 'Payment Success', 'Admin Updated Organizer'
    entity_type: e.g. 'event', 'organizer', 'registration', 'payment', 'coupon'
    """
    return _audit_repo.create(
        actor_type=actor_type,
        actor_id=actor_id,
        actor_name=actor_name,
        actor_email=actor_email,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        action=action,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
    )
