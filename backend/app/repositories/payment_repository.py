from app.models import Payment
from .base_repository import BaseRepository


class PaymentRepository(BaseRepository):

    def __init__(self):
        super().__init__(Payment)

    def get_by_razorpay_order_id(self, razorpay_order_id):
        return Payment.query.filter_by(
            razorpay_order_id=razorpay_order_id
        ).first()

    def get_by_razorpay_payment_id(self, razorpay_payment_id):
        return Payment.query.filter_by(
            razorpay_payment_id=razorpay_payment_id
        ).first()

    def get_by_registration(self, registration_id):
        return Payment.query.filter_by(
            registration_id=registration_id
        ).all()

    def get_successful_payments(self):
        return Payment.query.filter_by(
            payment_status="SUCCESS"
        ).all()

    def get_pending_payments(self):
        return Payment.query.filter_by(
            payment_status="PENDING"
        ).all()

    def get_failed_payments(self):
        return Payment.query.filter_by(
            payment_status="FAILED"
        ).all()

    def receipt_exists(self, receipt_number):
        return (
            Payment.query.filter_by(
                receipt_number=receipt_number
            ).first()
            is not None
        )

    def get_by_receipt_number(self, receipt_number):
        return Payment.query.filter_by(
            receipt_number=receipt_number
        ).first()

    def get_refunded_payments(self):
        return Payment.query.filter_by(
            payment_status="REFUNDED"
        ).all()