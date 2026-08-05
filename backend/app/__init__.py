# __init__.py marks a directory as a Python package, so that it can be imported elsewhere


import time
import uuid

from flask import Flask, g, jsonify, request
from werkzeug.exceptions import HTTPException

from .config import Config
from .extensions import db, migrate, jwt
from .logging_config import configure_logging
from .services.exceptions import ServiceError

from flask_cors import CORS


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    if app.config.get("TESTING") and not app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise RuntimeError("TEST_DATABASE_URL must be set when running backend tests")

    configure_logging(app)

    CORS(
        app,
        resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from . import models  # noqa: F401

    register_error_handlers(app)
    register_blueprints(app)
    register_request_logging(app)
    register_jwt_error_handlers()

    app.logger.info(
        "application_started",
        extra={"version": app.config["APP_VERSION"], "environment": app.config.get("ENV")},
    )

    return app


def register_request_logging(app):
    @app.before_request
    def start_request_timer():
        g.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        g.request_started_at = time.perf_counter()

    @app.after_request
    def log_request(response):
        started_at = getattr(g, "request_started_at", None)
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2) if started_at else None
        app.logger.info(
            "request_completed",
            extra={
                "request_id": getattr(g, "request_id", None),
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "remote_addr": request.remote_addr,
            },
        )
        response.headers["X-Request-ID"] = getattr(g, "request_id", "")
        return response


def register_error_handlers(app):
    @app.errorhandler(ServiceError)
    def handle_service_error(exc):
        app.logger.warning(
            "service_error",
            extra={
                "request_id": getattr(g, "request_id", None),
                "method": request.method,
                "path": request.path,
                "status_code": exc.status_code,
            },
        )
        return jsonify({"error": str(exc)}), exc.status_code

    @app.errorhandler(HTTPException)
    def handle_http_error(exc):
        return jsonify({"error": exc.description}), exc.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc):
        app.logger.exception(
            "unhandled_exception",
            extra={
                "request_id": getattr(g, "request_id", None),
                "method": request.method,
                "path": request.path,
                "status_code": 500,
            },
        )
        return jsonify({"error": "An unexpected server error occurred"}), 500


def register_jwt_error_handlers():
    def jwt_error(reason):
        from flask import current_app

        current_app.logger.warning(
            "jwt_validation_failed",
            extra={
                "request_id": getattr(g, "request_id", None),
                "method": request.method,
                "path": request.path,
                "status_code": 401,
            },
        )
        return jsonify({"error": "Authentication is required", "reason": reason}), 401

    jwt.unauthorized_loader(jwt_error)
    jwt.invalid_token_loader(jwt_error)
    jwt.expired_token_loader(lambda _header, _payload: jwt_error("Token has expired"))


def register_blueprints(app):
    from .routes.auth import auth_bp
    from .routes.admin import admin_bp
    from .routes.health import health_bp
    from .routes.organizer import organizer_bp
    from .routes.public import public_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(organizer_bp, url_prefix="/organizer")
    app.register_blueprint(public_bp)
