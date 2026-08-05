"""
Every admin/organizer route in routes/ uses one
of these; public routes use neither.

Identity model: the JWT's `sub` (identity) is the actor's UUID as a
string; `actor_type` ("admin" | "organizer") lives in the additional
claims set at token-creation time in routes/auth/routes.py. Checking
actor_type here - not just "is this a valid token" - is what stops an
organizer's token from being replayed against an admin route.

"""

from functools import wraps

from flask import current_app, g, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        
        # predefined funcs, checks http req for valid JWT (from AUTHORIZATION: BEARER<TOKEN> HEADER)
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("actor_type") != "admin":
            current_app.logger.warning(
                "authorization_denied",
                extra={"method": request.method, "path": request.path, "status_code": 403},
            )
            return jsonify({"error": "Admin access required"}), 403
        g.current_admin_id = get_jwt_identity()
        g.current_admin_email = claims.get("email")
        return fn(*args, **kwargs)
    return wrapper


def organizer_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("actor_type") != "organizer":
            current_app.logger.warning(
                "authorization_denied",
                extra={"method": request.method, "path": request.path, "status_code": 403},
            )
            return jsonify({"error": "Organizer access required"}), 403
        g.current_organizer_id = get_jwt_identity()
        g.current_organizer_email = claims.get("email")
        return fn(*args, **kwargs)
    return wrapper
