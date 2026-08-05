from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify
from sqlalchemy import text

from app.extensions import db

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Readiness-aware health endpoint"""

    timestamp = datetime.now(timezone.utc).isoformat()
    try:
        db.session.execute(text("SELECT 1"))
    except Exception:
        current_app.logger.exception("health_check_database_unavailable")
        return jsonify(
            {
                "status": "unavailable",
                "database": "unavailable",
                "timestamp": timestamp,
                "version": current_app.config["APP_VERSION"],
            }
        ), 503

    return jsonify(
        {
            "status": "ok",
            "database": "connected",
            "timestamp": timestamp,
            "version": current_app.config["APP_VERSION"],
        }
    ), 200
