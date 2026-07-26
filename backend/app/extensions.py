# from flask_sqlalchemy import SQLAlchemy
# from flask_migrate import Migrate

# db = SQLAlchemy()
# migrate = Migrate()

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import razorpay

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Razorpay's client isn't a Flask extension (no init_app hook), and it
# needs config values that only exist once the app is created - so it's
# built in create_app() via init_razorpay(app) below, not at import time
# like db/migrate/jwt are.
razorpay_client: razorpay.Client | None = None


def init_razorpay(app):
    global razorpay_client
    razorpay_client = razorpay.Client(
        auth=(app.config["RAZORPAY_KEY_ID"], app.config["RAZORPAY_KEY_SECRET"])
    )
    return razorpay_client
