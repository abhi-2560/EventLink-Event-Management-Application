from flask import jsonify, request

from app.middleware import admin_required
from app.models import AuditLog
from app.utils.serializers import serialize_audit_log
from . import admin_bp


@admin_bp.route("/audit-logs", methods=["GET"])
@admin_required
def list_audit_logs():
    """
    Simple combined-filter listing. All filters are optional and AND
    together; falls back to the 50 most recent logs if none are given.
    """
    query = AuditLog.query

    entity_type = request.args.get("entity_type")
    entity_id = request.args.get("entity_id")
    actor_type = request.args.get("actor_type")
    action = request.args.get("action")

    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if actor_type:
        query = query.filter(AuditLog.actor_type == actor_type.upper())
    if action:
        query = query.filter(AuditLog.action == action)

    limit = request.args.get("limit", default=50, type=int)
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return jsonify([serialize_audit_log(log) for log in logs]), 200
