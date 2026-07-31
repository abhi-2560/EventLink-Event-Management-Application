from __future__ import annotations

import re
import uuid
from datetime import datetime
from decimal import Decimal, InvalidOperation
from urllib.parse import urlparse

from app.services.exceptions import ValidationError

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[0-9+\-\s()]{10,15}$")


def require_text(value, field: str, *, max_length: int | None = None) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{field} is required")
    value = value.strip()
    if max_length and len(value) > max_length:
        raise ValidationError(f"{field} must be at most {max_length} characters")
    return value


def parse_uuid(value, field: str):
    try:
        return str(uuid.UUID(str(value)))
    except (ValueError, TypeError, AttributeError) as exc:
        raise ValidationError(f"{field} must be a valid UUID") from exc


def parse_positive_int(value, field: str) -> int:
    try:
        result = int(value)
    except (TypeError, ValueError) as exc:
        raise ValidationError(f"{field} must be a valid integer") from exc
    if result <= 0:
        raise ValidationError(f"{field} must be greater than zero")
    return result


def parse_nonnegative_decimal(value, field: str) -> Decimal:
    try:
        result = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValidationError(f"{field} must be a valid number") from exc
    if result < 0:
        raise ValidationError(f"{field} cannot be negative")
    return result


def parse_datetime(value, field: str):
    if value in (None, ""):
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValidationError(f"{field} must be a valid ISO-8601 datetime") from exc


def validate_email(value, field="email"):
    value = require_text(value, field, max_length=255).lower()
    if not EMAIL_RE.match(value):
        raise ValidationError(f"{field} format is invalid")
    return value


def validate_phone(value, field="phone"):
    value = require_text(value, field, max_length=50)
    if not PHONE_RE.match(value):
        raise ValidationError(f"{field} format is invalid")
    return value


def validate_url(value, field="url"):
    if value in (None, ""):
        return value
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValidationError(f"{field} must be a valid HTTP(S) URL")
    return value
