from flask import Flask

from .config import Config
from .extensions import db, migrate, jwt, init_razorpay
from .services.exceptions import ServiceError


from flask_cors import CORS

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(
        app,
        resources={r"/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True,
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    init_razorpay(app)

    # Import models so Alembic/Flask-Migrate can see them via db.metadata.
    from . import models  # noqa: F401

    register_error_handlers(app)
    register_blueprints(app)

    return app


def register_error_handlers(app):
    from flask import jsonify

    @app.errorhandler(ServiceError)
    def handle_service_error(exc):
        return jsonify({"error": str(exc)}), exc.status_code


def register_blueprints(app):
    from .routes.auth import auth_bp
    from .routes.admin import admin_bp
    from .routes.organizer import organizer_bp
    from .routes.public import public_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(organizer_bp, url_prefix="/organizer")
    app.register_blueprint(public_bp)
