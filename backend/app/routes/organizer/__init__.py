from flask import Blueprint

organizer_bp = Blueprint("organizer", __name__)

from . import events, registrations, sales  # noqa: E402,F401
