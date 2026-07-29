from datetime import datetime, timezone

from app.models import Coupon
from .base_repository import BaseRepository


class CouponRepository(BaseRepository):

    def __init__(self):
        super().__init__(Coupon)

    def get_by_code(self, code):
        return Coupon.query.filter_by(code=code).first()

    def code_exists(self, code, exclude_id=None):
        query = Coupon.query.filter(Coupon.code == code)
        if exclude_id is not None:
            query = query.filter(Coupon.coupon_id != exclude_id)
        return query.first() is not None

    def get_active_coupons(self):
        return Coupon.query.filter_by(
            is_active=True
        ).all()

    def get_inactive_coupons(self):
        return Coupon.query.filter_by(
            is_active=False
        ).all()

    def get_valid_coupon(self, code):
        return Coupon.query.filter(
            Coupon.code == code,
            Coupon.is_active.is_(True),
            (
                (Coupon.expiry_date.is_(None))
                | (Coupon.expiry_date > datetime.now(timezone.utc))
            ),
        ).first()

    def get_expired_coupons(self):
        return Coupon.query.filter(
            Coupon.expiry_date.is_not(None),
            Coupon.expiry_date < datetime.now(timezone.utc),
        ).all()

    def get_most_used(self):
        return Coupon.query.order_by(
            Coupon.times_used.desc()
        ).all()