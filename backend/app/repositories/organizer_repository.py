from app.models import Organizer
from .base_repository import BaseRepository


class OrganizerRepository(BaseRepository):

    def __init__(self):
        super().__init__(Organizer)

    def get_by_email(self, email):
        return Organizer.query.filter_by(email=email).first()

    def get_active_organizers(self):
        return Organizer.query.filter_by(
            status="ACTIVE"
        ).all()

    def get_inactive_organizers(self):
        return Organizer.query.filter_by(
            status="INACTIVE"
        ).all()

    def get_by_organizer_name(self, organizer_name):
        return Organizer.query.filter_by(
            organizer_name=organizer_name
        ).first()

    def email_exists(self, email):
        return (
            Organizer.query.filter_by(email=email).first()
            is not None
        )

    def search(self, keyword):
        return Organizer.query.filter(
            Organizer.organizer_name.ilike(f"%{keyword}%")
        ).all()

    def get_archived(self):
        return Organizer.query.filter(
            Organizer.archived_at.isnot(None)
        ).all()