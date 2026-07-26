# from flask import Flask
# from sqlalchemy import text

# from app.config import Config
# from app.extensions import db, migrate
# from app.models import Admin, AuditLog, Category, Coupon, Event, Organizer, Payment, Registration  # noqa: F401


# def create_app():
#     app = Flask(__name__)

#     app.config.from_object(Config)

#     db.init_app(app)
#     migrate.init_app(app, db)

#     @app.route("/")
#     def home():
#         db.session.execute(text("SELECT 1"))
#         return {"message": "Database connected successfully!"}

#     return app


from flask import Flask

from .config import Config
from .extensions import db, migrate, jwt, init_razorpay
from .services.exceptions import ServiceError


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

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


# def register_blueprints(app):
#     # Uncomment as each blueprint is built:
#     from .api.auth import auth_bp
#     from .api.admin import admin_bp
#     from .api.organizer import organizer_bp
#     from .api.public import public_bp
    
#     app.register_blueprint(auth_bp, url_prefix="/auth")
#     app.register_blueprint(admin_bp, url_prefix="/admin")
#     app.register_blueprint(organizer_bp, url_prefix="/organizer")
#     app.register_blueprint(public_bp)
#     pass

def register_blueprints(app):
    # Uncomment as each blueprint is built:
    from .routes.auth import auth_bp
    from .routes.admin import admin_bp
    from .routes.organizer import organizer_bp
    from .routes.public import public_bp
    
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(organizer_bp, url_prefix="/organizer")
    app.register_blueprint(public_bp)
    pass