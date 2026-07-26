from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required

from app.services import auth_service
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_organizer

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    actor_type = data.get("actor_type")
    email = data.get("email")
    password = data.get("password")

    if actor_type not in ("admin", "organizer"):
        raise ValidationError("actor_type must be 'admin' or 'organizer'")
    if not email or not password:
        raise ValidationError("email and password are required")

    actor = auth_service.authenticate(
        actor_type, email, password, ip_address=request.remote_addr
    )
    actor_id = getattr(actor, f"{actor_type}_id")
    name = getattr(actor, "name", None) or getattr(actor, "organizer_name", None)

    token = create_access_token(
        identity=str(actor_id),
        additional_claims={"actor_type": actor_type, "email": actor.email, "name": name},
    )
    return jsonify({"access_token": token, "actor_type": actor_type}), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    claims = get_jwt()
    auth_service.logout(
        actor_type=claims.get("actor_type"),
        actor_id=get_jwt_identity(),
        actor_email=claims.get("email"),
        ip_address=request.remote_addr,
    )
    # Stateless JWTs aren't server-invalidated here - see note in
    # auth_service.logout(). Add a token-blocklist (e.g. Redis-backed,
    # via flask-jwt-extended's blocklist hook) if you need hard logout
    # before token expiry.
    return jsonify({"message": "Logged out"}), 200


@auth_bp.route("/register/organizer", methods=["POST"])
def register_organizer():
    data = request.get_json(silent=True) or {}
    organizer = auth_service.register_organizer(data)
    return jsonify(serialize_organizer(organizer)), 201


@auth_bp.route("/password-reset/request", methods=["POST"])
def password_reset_request():
    data = request.get_json(silent=True) or {}
    actor_type = data.get("actor_type")
    email = data.get("email")
    if actor_type not in ("admin", "organizer") or not email:
        raise ValidationError("actor_type and email are required")

    auth_service.request_password_reset(actor_type, email, current_app.config["SECRET_KEY"])
    # Always the same response regardless of whether the email exists,
    # so this endpoint can't be used to enumerate registered emails.
    return jsonify({"message": "If that email exists, a reset link has been sent."}), 200





@auth_bp.route("/password-reset/confirm", methods=["POST"])
def password_reset_confirm():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    new_password = data.get("new_password")
    if not token or not new_password:
        raise ValidationError("token and new_password are required")

    auth_service.confirm_password_reset(token, new_password, current_app.config["SECRET_KEY"])
    return jsonify({"message": "Password updated"}), 200