from flask import Flask
from sqlalchemy import text

from app.config import Config
from app.extensions import db, migrate
from app.models import Admin, AuditLog, Category, Coupon, Event, Organizer, Payment, Registration  # noqa: F401


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    @app.route("/")
    def home():
        db.session.execute(text("SELECT 1"))
        return {"message": "Database connected successfully!"}

    return app
