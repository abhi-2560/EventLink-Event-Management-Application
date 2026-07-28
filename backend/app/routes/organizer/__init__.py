from flask import Blueprint

organizer_bp = Blueprint("organizer", __name__)

from . import events, registrations, sales, dashboard, profile, categories  # noqa: E402,F401
