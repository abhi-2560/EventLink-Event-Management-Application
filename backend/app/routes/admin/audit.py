from flask import jsonify, request

from app.middleware import admin_required
from app.models import AuditLog
from app.services.exceptions import NotFoundError
from app.utils.serializers import serialize_audit_log
from . import admin_bp


@admin_bp.route("/audit-logs", methods=["GET"])
@admin_required
def list_audit_logs():
    query = AuditLog.query

    entity_type = request.args.get("entity_type")
    entity_id = request.args.get("entity_id")
    actor_type = request.args.get("actor_type")
    action = request.args.get("action")
    search = request.args.get("search") or request.args.get("keyword")
    organizer = request.args.get("organizer")
    event = request.args.get("event")

    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if actor_type:
        query = query.filter(AuditLog.actor_type == actor_type.upper())
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if organizer:
        query = query.filter(AuditLog.entity_name.ilike(f"%{organizer}%"))
    if event:
        query = query.filter(AuditLog.entity_name.ilike(f"%{event}%"))
    if search:
        query = query.filter(
            AuditLog.entity_name.ilike(f"%{search}%")
            | AuditLog.actor_name.ilike(f"%{search}%")
            | AuditLog.action.ilike(f"%{search}%")
            | AuditLog.actor_email.ilike(f"%{search}%")
        )

    page = request.args.get("page", default=1, type=int)
    page_size = request.args.get("page_size", default=20, type=int)
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)

    total = query.count()
    logs = (
        query.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return jsonify({
        "items": [serialize_audit_log(log) for log in logs],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }), 200


@admin_bp.route("/audit-logs/<log_id>", methods=["GET"])
@admin_required
def get_audit_log(log_id):
    log = AuditLog.query.filter_by(log_id=log_id).first()
    if log is None:
        raise NotFoundError("Audit log not found")
    return jsonify(serialize_audit_log(log)), 200
