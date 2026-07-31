from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required

from app.services import auth_service
from app.services.exceptions import ValidationError
from app.utils.serializers import serialize_organizer

auth_bp = Blueprint("auth", __name__)


def _refresh_cookie_name(actor_type: str) -> str:
    return f"refresh_token_{actor_type}"


def _set_refresh_cookie(response, actor_type: str, token: str):
    response.set_cookie(
        _refresh_cookie_name(actor_type),
        token,
        max_age=current_app.config["JWT_REFRESH_TOKEN_EXPIRES_SECONDS"],
        httponly=True,
        secure=current_app.config["REFRESH_COOKIE_SECURE"],
        samesite=current_app.config["REFRESH_COOKIE_SAMESITE"],
        domain=current_app.config["REFRESH_COOKIE_DOMAIN"],
        path="/auth",
    )


def _clear_refresh_cookie(response, actor_type: str):
    response.delete_cookie(
        _refresh_cookie_name(actor_type),
        domain=current_app.config["REFRESH_COOKIE_DOMAIN"],
        path="/auth",
        samesite=current_app.config["REFRESH_COOKIE_SAMESITE"],
    )


def _token_response(actor, actor_type: str, refresh_token: str | None = None):
    actor_id = getattr(actor, f"{actor_type}_id")
    name = getattr(actor, "name", None) or getattr(actor, "organizer_name", None)
    access_token = create_access_token(
        identity=str(actor_id),
        additional_claims={"actor_type": actor_type, "email": actor.email, "name": name},
    )
    if refresh_token is None:
        refresh_token, _ = auth_service.issue_refresh_token(
            actor_type,
            actor_id,
            user_agent=request.headers.get("User-Agent"),
            ip_address=request.remote_addr,
        )
    response = jsonify(
        {
            "access_token": access_token,
            "actor_type": actor_type,
            "expires_in": current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
        }
    )
    _set_refresh_cookie(response, actor_type, refresh_token)
    return response


def _verify_refresh_request(actor_type: str):
    if request.headers.get("X-Refresh-Request") != "1":
        raise ValidationError("Refresh request header is required")
    origin = request.headers.get("Origin")
    if origin and origin not in current_app.config["CORS_ORIGINS"]:
        raise ValidationError("Refresh request origin is not allowed")
    if actor_type not in ("admin", "organizer"):
        raise ValidationError("actor_type must be 'admin' or 'organizer'")


@auth_bp.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        raise ValidationError("email and password are required")

    actor = auth_service.authenticate("admin", email, password, ip_address=request.remote_addr)
    return _token_response(actor, "admin"), 200


@auth_bp.route("/admin/logout", methods=["POST"])
@jwt_required()
def admin_logout():
    claims = get_jwt()
    if claims.get("actor_type") != "admin":
        raise ValidationError("Admin access required")
    auth_service.logout(
        actor_type="admin",
        actor_id=get_jwt_identity(),
        actor_email=claims.get("email"),
        ip_address=request.remote_addr,
    )
    response = jsonify({"message": "Logged out"})
    auth_service.revoke_refresh_token(request.cookies.get(_refresh_cookie_name("admin")))
    _clear_refresh_cookie(response, "admin")
    return response, 200


@auth_bp.route("/admin/forgot-password", methods=["POST"])
def admin_forgot_password():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    if not email:
        raise ValidationError("email is required")
    auth_service.request_password_reset("admin", email, current_app.config["SECRET_KEY"])
    return jsonify({"message": "If that email exists, a reset link has been sent."}), 200


@auth_bp.route("/admin/reset-password", methods=["POST"])
def admin_reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    new_password = data.get("new_password")
    if not token or not new_password:
        raise ValidationError("token and new_password are required")
    auth_service.confirm_password_reset(token, new_password, current_app.config["SECRET_KEY"])
    return jsonify({"message": "Password updated"}), 200


@auth_bp.route("/organizer/login", methods=["POST"])
def organizer_login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        raise ValidationError("email and password are required")

    actor = auth_service.authenticate(
        "organizer", email, password, ip_address=request.remote_addr
    )
    return _token_response(actor, "organizer"), 200


@auth_bp.route("/organizer/logout", methods=["POST"])
@jwt_required()
def organizer_logout():
    claims = get_jwt()
    if claims.get("actor_type") != "organizer":
        raise ValidationError("Organizer access required")
    auth_service.logout(
        actor_type="organizer",
        actor_id=get_jwt_identity(),
        actor_email=claims.get("email"),
        ip_address=request.remote_addr,
    )
    response = jsonify({"message": "Logged out"})
    auth_service.revoke_refresh_token(request.cookies.get(_refresh_cookie_name("organizer")))
    _clear_refresh_cookie(response, "organizer")
    return response, 200


@auth_bp.route("/organizer/forgot-password", methods=["POST"])
def organizer_forgot_password():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    if not email:
        raise ValidationError("email is required")
    auth_service.request_password_reset("organizer", email, current_app.config["SECRET_KEY"])
    return jsonify({"message": "If that email exists, a reset link has been sent."}), 200


@auth_bp.route("/organizer/reset-password", methods=["POST"])
def organizer_reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    new_password = data.get("new_password")
    if not token or not new_password:
        raise ValidationError("token and new_password are required")
    auth_service.confirm_password_reset(token, new_password, current_app.config["SECRET_KEY"])
    return jsonify({"message": "Password updated"}), 200


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
    return _token_response(actor, actor_type), 200


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
    actor_type = claims.get("actor_type")
    auth_service.revoke_refresh_token(request.cookies.get(_refresh_cookie_name(actor_type)))
    response = jsonify({"message": "Logged out"})
    _clear_refresh_cookie(response, actor_type)
    return response, 200


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    actor_type = request.headers.get("X-Actor-Type")
    _verify_refresh_request(actor_type)
    raw_token = request.cookies.get(_refresh_cookie_name(actor_type))
    new_raw_token, session = auth_service.rotate_refresh_token(
        raw_token or "",
        actor_type,
        user_agent=request.headers.get("User-Agent"),
        ip_address=request.remote_addr,
    )
    repo = auth_service._repo_for(actor_type)
    actor = repo.get_by_id(session.actor_id)
    if actor is None or actor.status != "ACTIVE":
        auth_service.revoke_refresh_token(new_raw_token)
        raise ValidationError("Account is not active")
    response = _token_response(actor, actor_type, refresh_token=new_raw_token)
    return response, 200


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