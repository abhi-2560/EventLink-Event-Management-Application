"""
Authentication for admin and organizer actors. Registrants never
authenticate - they're identified per-booking by contact info, handled
in booking_service instead.

Password reset uses a stateless, signed token (itsdangerous) rather than
a reset-token table, since the current schema has no such table. The
token embeds actor_type + actor_id and expires on its own; nothing needs
to be stored or cleaned up server-side. secret_key is passed in by the
route (from current_app.config["SECRET_KEY"]) so this module stays
Flask-free and independently testable.
"""

from __future__ import annotations

import re

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash
from flask import current_app

from app.repositories.admin_repository import AdminRepository
from app.repositories.organizer_repository import OrganizerRepository
from .audit_service import log_action
from .exceptions import ConflictError, NotFoundError, ValidationError

_admin_repo = AdminRepository()
_organizer_repo = OrganizerRepository()

_RESET_SALT = "password-reset"
_RESET_MAX_AGE_SECONDS = 30 * 60  # 30 minutes

_REPOS = {"admin": _admin_repo, "organizer": _organizer_repo}

_EMAIL_RE = re.compile(r"^[^@]+@[^@]+\.[^@]+$")
_PHONE_RE = re.compile(r"^[0-9+\-\s()]{10,15}$")


def _validate_password(password: str) -> None:
    if len(password) < 8:
        raise ValidationError("password must be at least 8 characters")
    if not re.search(r"[a-z]", password):
        raise ValidationError("password must include a lowercase letter")
    if not re.search(r"[A-Z]", password):
        raise ValidationError("password must include an uppercase letter")
    if not re.search(r"[0-9]", password):
        raise ValidationError("password must include a number")


def _repo_for(actor_type: str):
    repo = _REPOS.get(actor_type)
    if repo is None:
        raise ValidationError(f"Unknown actor_type '{actor_type}'")
    return repo


def register_organizer(payload: dict):
    organizer_name = (payload.get("organizer_name") or "").strip()
    contact_person = (payload.get("contact_person") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    phone = (payload.get("phone") or "").strip()
    password = payload.get("password") or ""

    if not organizer_name:
        raise ValidationError("organizer_name is required")
    if not contact_person:
        raise ValidationError("contact_person is required")
    if not email:
        raise ValidationError("email is required")
    if not phone:
        raise ValidationError("phone is required")
    if not password:
        raise ValidationError("password is required")

    if not _EMAIL_RE.match(email):
        raise ValidationError("email format is invalid")
    if not _PHONE_RE.match(phone):
        raise ValidationError("phone format is invalid")
    _validate_password(password)

    if _organizer_repo.get_by_email(email) is not None:
        raise ConflictError("Organizer with this email already exists")

    organizer = _organizer_repo.create(
        organizer_name=organizer_name,
        contact_person=contact_person,
        email=email,
        phone=phone,
        password_hash=generate_password_hash(password),
        status="ACTIVE",
    )
    return organizer


def authenticate(actor_type: str, email: str, password: str, ip_address: str | None = None):
    """
    Verify credentials and return the actor row on success.
    Logs 'Admin Login'/'Organizer Login' or 'Failed Login'.
    """
    repo = _repo_for(actor_type)
    actor = repo.get_by_email(email)
    if actor is None or not check_password_hash(actor.password_hash, password):
        current_app.logger.warning(
            "authentication_failed",
            extra={"actor_type": actor_type, "email": email, "ip_address": ip_address},
        )
        log_action(
            actor_type="SYSTEM",
            action="Failed Login",
            entity_type=actor_type,
            entity_name=email,
            ip_address=ip_address,
        )
        raise ValidationError("Invalid email or password")

    if actor.status != "ACTIVE":
        raise ValidationError("Account is not active")

    actor_id = getattr(actor, f"{actor_type}_id")
    actor.last_login = _now()
    repo.update()

    log_action(
        actor_type=actor_type.upper(),
        actor_id=actor_id,
        actor_name=getattr(actor, "name", None) or getattr(actor, "organizer_name", None),
        actor_email=actor.email,
        action=f"{actor_type.capitalize()} Login",
        entity_type=actor_type,
        entity_id=actor_id,
        ip_address=ip_address,
    )
    return actor


def logout(actor_type: str, actor_id, actor_email: str | None = None, ip_address: str | None = None):
    """No server-side session to invalidate (token auth) - this only records the audit event."""
    log_action(
        actor_type=actor_type.upper(),
        actor_id=actor_id,
        actor_email=actor_email,
        action="Logout",
        entity_type=actor_type,
        entity_id=actor_id,
        ip_address=ip_address,
    )


def request_password_reset(actor_type: str, email: str, secret_key: str) -> str | None:
    """
    Returns a signed reset token if the email exists, else None.
    Always return a generic success message from the route regardless of
    the return value here, so this endpoint can't be used to enumerate
    registered emails.
    """
    repo = _repo_for(actor_type)
    actor = repo.get_by_email(email)
    if actor is None:
        return None

    actor_id = getattr(actor, f"{actor_type}_id")
    serializer = URLSafeTimedSerializer(secret_key, salt=_RESET_SALT)
    return serializer.dumps({"actor_type": actor_type, "actor_id": str(actor_id)})


def confirm_password_reset(token: str, new_password: str, secret_key: str):
    """Validate the reset token and set a new password hash."""
    serializer = URLSafeTimedSerializer(secret_key, salt=_RESET_SALT)
    try:
        payload = serializer.loads(token, max_age=_RESET_MAX_AGE_SECONDS)
    except SignatureExpired:
        raise ValidationError("Reset link has expired")
    except BadSignature:
        raise ValidationError("Reset link is invalid")

    actor_type = payload["actor_type"]
    repo = _repo_for(actor_type)
    actor = repo.get_by_id(payload["actor_id"])
    if actor is None:
        raise NotFoundError(f"{actor_type.capitalize()} not found")

    actor.password_hash = generate_password_hash(new_password)
    repo.update()

    log_action(
        actor_type=actor_type.upper(),
        actor_id=payload["actor_id"],
        actor_email=actor.email,
        action="Password Reset",
        entity_type=actor_type,
        entity_id=payload["actor_id"],
    )
    return actor


def _now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)
