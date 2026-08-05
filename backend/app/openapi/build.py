"""Assemble the OpenAPI 3.1 specification."""

from .paths import build_paths
from .schemas import COMPONENTS


def get_openapi_spec() -> dict:
    return {
        "openapi": "3.1.0",
        "info": {
            "title": "Event Management Platform API",
            "version": "0.1.0",
            "description": (
                "REST API for the Event Management Platform. "
                "Registrants are anonymous; organizers and admins authenticate with JWT Bearer tokens. "
                "Refresh tokens are issued as HttpOnly cookies on login."
            ),
        },
        "servers": [
            {"url": "http://localhost:5000", "description": "Local Flask server"},
            {"url": "/api", "description": "Vite dev proxy prefix (stripped before Flask)"},
        ],
        "tags": [
            {"name": "Root", "description": "API root"},
            {"name": "Health", "description": "Health and readiness"},
            {"name": "Auth", "description": "Authentication and password reset"},
            {"name": "Public", "description": "Public endpoints (no auth)"},
            {"name": "Organizer", "description": "Organizer-authenticated endpoints"},
            {"name": "Admin", "description": "Admin-authenticated endpoints"},
        ],
        "paths": build_paths(),
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "JWT access token from login response (`access_token`).",
                }
            },
            "schemas": COMPONENTS,
        },
        "security": [{"BearerAuth": []}],
    }
