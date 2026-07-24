from app.models import Registration
from .base_repository import BaseRepository


class RegistrationRepository(BaseRepository):

    def __init__(self):
        super().__init__(Registration)

    def get_by_event(self, event_id):
        return Registration.query.filter_by(
            event_id=event_id
        ).all()

    def get_by_coupon(self, coupon_id):
        return Registration.query.filter_by(
            coupon_id=coupon_id
        ).all()

    def get_by_registrant_email(self, email):
        return Registration.query.filter_by(
            registrant_email=email
        ).all()

    def get_confirmed_registrations(self):
        return Registration.query.filter_by(
            registration_status="CONFIRMED"
        ).all()

    def get_pending_registrations(self):
        return Registration.query.filter_by(
            registration_status="PENDING"
        ).all()

    def get_failed_registrations(self):
        return Registration.query.filter_by(
            registration_status="FAILED"
        ).all()

    def get_reserved(self):
        return Registration.query.filter_by(
            reservation_status="RESERVED"
        ).all()

    def get_expired(self):
        return Registration.query.filter_by(
            reservation_status="EXPIRED"
        ).all()

    def search_by_name(self, keyword):
        return Registration.query.filter(
            Registration.registrant_name.ilike(f"%{keyword}%")
        ).all()