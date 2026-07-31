from app.models import EventMedia
from .base_repository import BaseRepository


class EventMediaRepository(BaseRepository):
    def __init__(self):
        super().__init__(EventMedia)

    def get_for_event(self, event_id):
        return EventMedia.query.filter_by(event_id=event_id).order_by(EventMedia.display_order).all()
