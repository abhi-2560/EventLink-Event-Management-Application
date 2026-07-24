from app.models import Event
from .base_repository import BaseRepository


class EventRepository(BaseRepository):

    def __init__(self):
        super().__init__(Event)

    def get_by_title(self, title):
        return Event.query.filter_by(title=title).first()

    def get_by_organizer(self, organizer_id):
        return Event.query.filter_by(
            organizer_id=organizer_id
        ).all()

    def get_by_category(self, category_id):
        return Event.query.filter_by(
            category_id=category_id
        ).all()

    def get_open_registrations(self):
        return Event.query.filter_by(
            registration_status="OPEN"
        ).all()

    def get_draft_events(self):
        return Event.query.filter_by(
            status="DRAFT"
        ).all()

    def get_published_events(self):
        return Event.query.filter_by(
            status="PUBLISHED"
        ).all()

    def get_archived_events(self):
        return Event.query.filter(
            Event.archived_at.isnot(None)
        ).all()

    def search_by_title(self, keyword):
        return Event.query.filter(
            Event.title.ilike(f"%{keyword}%")
        ).all()

    def get_by_city(self, city):
        return Event.query.filter_by(city=city).all()

    def get_by_event_type(self, event_type):
        return Event.query.filter_by(
            event_type=event_type
        ).all()

    def get_free_events(self):
        return Event.query.filter_by(
            is_free=True
        ).all()

    def get_paid_events(self):
        return Event.query.filter_by(
            is_free=False
        ).all()

    def get_available_events(self):
        return Event.query.filter(
            Event.available_seats > 0
        ).all()