from app.models import Admin
from .base_repository import BaseRepository


class AdminRepository(BaseRepository):

    def __init__(self):
        super().__init__(Admin)

    def get_by_email(self, email):
        
        return Admin.query.filter_by(email=email).first()

    def get_active_admins(self):
        return Admin.query.filter_by(status="ACTIVE").all()

    def get_inactive_admins(self):
        return Admin.query.filter_by(status="INACTIVE").all()

    def email_exists(self, email):
        return (
            Admin.query.filter_by(email=email).first()
            is not None
        )