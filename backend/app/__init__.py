from flask import Flask

from app.config import Config
from app.extensions import db, migrate

from sqlalchemy import text  # just to


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    # @app.route("/")
    # def home():
    #     return {
    #         "message": "Backend is running!"
    #     }


    @app.route("/")
    def home():
        db.session.execute(text("SELECT 1"))

        return {"message": "Database connected successfully!"}


    return app
