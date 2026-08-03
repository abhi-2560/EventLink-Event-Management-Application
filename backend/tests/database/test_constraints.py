from decimal import Decimal

import pytest
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Coupon


@pytest.mark.integration
def test_coupon_code_is_unique(app, coupon):
    with app.app_context():
        # db.session.add(...) attempts to add another coupon with the same code as the existing coupon.
        db.session.add(Coupon(code=coupon.code, flat_discount=Decimal("5.00")))
        with pytest.raises(IntegrityError):
            # database integrirty constraint error
            db.session.commit()
        db.session.rollback()


@pytest.mark.integration
def test_database_rejects_negative_coupon_discount(app):
    with app.app_context():
        db.session.add(Coupon(code="NEGATIVE", flat_discount=Decimal("-1.00")))
        with pytest.raises(IntegrityError):
            db.session.commit()
        db.session.rollback()
