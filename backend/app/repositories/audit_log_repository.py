from app.models import AuditLog
from .base_repository import BaseRepository


class AuditLogRepository(BaseRepository):

    def __init__(self):
        super().__init__(AuditLog)

    def get_by_actor(self, actor_id):
        return AuditLog.query.filter_by(
            actor_id=actor_id
        ).all()

    def get_by_actor_type(self, actor_type):
        return AuditLog.query.filter_by(
            actor_type=actor_type
        ).all()

    def get_by_action(self, action):
        return AuditLog.query.filter_by(
            action=action
        ).all()

    def get_by_entity(self, entity_type):
        return AuditLog.query.filter_by(
            entity_type=entity_type
        ).all()

    def get_by_entity_id(self, entity_id):
        return AuditLog.query.filter_by(
            entity_id=entity_id
        ).all()

    def get_recent_logs(self, limit=50):
        return (
            AuditLog.query
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .all()
        )