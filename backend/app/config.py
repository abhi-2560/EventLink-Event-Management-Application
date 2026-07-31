import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_SECONDS", 60 * 60 * 8))
    APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    ENV = os.getenv("FLASK_ENV", "development")


class TestConfig(Config):
    """Test-only configuration. Never falls back to the development database."""

    TESTING = True
    SECRET_KEY = os.getenv("TEST_SECRET_KEY", "test-secret-key")
    JWT_SECRET_KEY = os.getenv("TEST_JWT_SECRET_KEY", "test-jwt-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("TEST_DATABASE_URL")
