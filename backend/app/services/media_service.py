"""Optional Cloudinary-backed event media management."""

from __future__ import annotations

import os

from flask import current_app

from app.extensions import db
from app.models import EventMedia
from app.repositories.event_media_repository import EventMediaRepository
from .audit_service import log_action
from .exceptions import NotFoundError, ServiceUnavailableError, ValidationError

_media_repo = EventMediaRepository()
IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
VIDEO_TYPES = {"video/mp4", "video/webm"}


def _cloudinary():
    if not all(
        (
            current_app.config["CLOUDINARY_CLOUD_NAME"],
            current_app.config["CLOUDINARY_API_KEY"],
            current_app.config["CLOUDINARY_API_SECRET"],
        )
    ):
        raise ServiceUnavailableError("Cloudinary is not configured")
    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=current_app.config["CLOUDINARY_CLOUD_NAME"],
        api_key=current_app.config["CLOUDINARY_API_KEY"],
        api_secret=current_app.config["CLOUDINARY_API_SECRET"],
        secure=True,
    )
    return cloudinary.uploader


def _validate_file(file, media_type):
    if file is None or not file.filename:
        raise ValidationError("file is required")
    allowed = IMAGE_TYPES if media_type == "IMAGE" else VIDEO_TYPES
    maximum = current_app.config["MAX_IMAGE_UPLOAD_BYTES"] if media_type == "IMAGE" else current_app.config["MAX_VIDEO_UPLOAD_BYTES"]
    if file.mimetype not in allowed:
        raise ValidationError(f"Unsupported {media_type.lower()} format")
    file.stream.seek(0, os.SEEK_END)
    size = file.stream.tell()
    file.stream.seek(0)
    if size > maximum:
        raise ValidationError(f"{media_type.title()} exceeds the maximum upload size")


def upload_banner(event, file, organizer_id):
    _validate_file(file, "IMAGE")
    uploader = _cloudinary()
    upload = uploader.upload(file, folder=f"event-management/{event.event_id}/banner", resource_type="image")
    old_public_id = event.banner_public_id
    event.banner_url = upload["secure_url"]
    event.banner_public_id = upload["public_id"]
    db.session.commit()
    if old_public_id:
        uploader.destroy(old_public_id, resource_type="image", invalidate=True)
    log_action(
        actor_type="ORGANIZER", actor_id=organizer_id, action="Banner updated" if old_public_id else "Banner uploaded",
        entity_type="event", entity_id=event.event_id, entity_name=event.title,
        new_value={"media_type": "BANNER", "public_id": event.banner_public_id},
    )
    return event


def delete_banner(event, organizer_id):
    if not event.banner_public_id:
        return event
    _cloudinary().destroy(event.banner_public_id, resource_type="image", invalidate=True)
    event.banner_url = None
    event.banner_public_id = None
    db.session.commit()
    log_action(
        actor_type="ORGANIZER", actor_id=organizer_id, action="Banner deleted",
        entity_type="event", entity_id=event.event_id, entity_name=event.title,
        new_value={"media_type": "BANNER"},
    )
    return event


def upload_media(event, file, media_type, organizer_id):
    if media_type not in {"IMAGE", "VIDEO"}:
        raise ValidationError("media_type must be IMAGE or VIDEO")
    _validate_file(file, media_type)
    upload = _cloudinary().upload(
        file,
        folder=f"event-management/{event.event_id}/media",
        resource_type="image" if media_type == "IMAGE" else "video",
    )
    order = len(_media_repo.get_for_event(event.event_id))
    media = _media_repo.create(
        event_id=event.event_id, media_type=media_type, media_url=upload["secure_url"],
        public_id=upload["public_id"], display_order=order,
    )
    log_action(
        actor_type="ORGANIZER", actor_id=organizer_id, action=f"{media_type.title()} uploaded",
        entity_type="event", entity_id=event.event_id, entity_name=event.title,
        new_value={"media_type": media_type, "media_id": str(media.media_id)},
    )
    return media


def delete_media(event, media_id, organizer_id):
    media = _media_repo.get_by_id(media_id)
    if media is None or str(media.event_id) != str(event.event_id):
        raise NotFoundError("Media not found")
    _cloudinary().destroy(media.public_id, resource_type="image" if media.media_type == "IMAGE" else "video", invalidate=True)
    db.session.delete(media)
    db.session.commit()
    log_action(
        actor_type="ORGANIZER", actor_id=organizer_id, action=f"{media.media_type.title()} deleted",
        entity_type="event", entity_id=event.event_id, entity_name=event.title,
        new_value={"media_type": media.media_type, "media_id": str(media_id)},
    )
