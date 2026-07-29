"""
Plain-dict serializers for API responses. Deliberately explicit field
lists rather than "just dump __dict__" - that's what guarantees
password_hash never leaves this codebase by accident.
"""


def _iso(dt):
    return dt.isoformat() if dt else None


def serialize_admin(admin):
    return {
        "admin_id": str(admin.admin_id),
        "name": admin.name,
        "email": admin.email,
        "status": admin.status,
        "last_login": _iso(admin.last_login),
        "created_at": _iso(admin.created_at),
    }


def serialize_organizer(organizer):
    return {
        "organizer_id": str(organizer.organizer_id),
        "organizer_name": organizer.organizer_name,
        "contact_person": organizer.contact_person,
        "email": organizer.email,
        "phone": organizer.phone,
        "status": organizer.status,
        "total_events": organizer.total_events,
        "active_events": organizer.active_events,
        "total_registrations": organizer.total_registrations,
        "total_tickets_sold": organizer.total_tickets_sold,
        "total_sales": str(organizer.total_sales),
        "platform_fee_generated": str(organizer.platform_fee_generated),
        "created_at": _iso(organizer.created_at),
        "archived_at": _iso(organizer.archived_at),
    }


def serialize_category(category):
    return {
        "category_id": str(category.category_id),
        "name": category.name,
        "description": category.description,
        "is_default": category.is_default,
        "total_events": category.total_events,
        "total_registrations": category.total_registrations,
        "total_tickets_sold": category.total_tickets_sold,
        "total_sales": str(category.total_sales),
    }


def serialize_event(event, include_internal=False, use_platform_fees=False):
    if use_platform_fees:
        from app.services import platform_settings_service
        fees = platform_settings_service.get_fees()
        convenience_fee = fees["convenience_fee"]
        gateway_fee = fees["gateway_fee"]
    else:
        convenience_fee = 0
        gateway_fee = 0

    data = {
        "event_id": str(event.event_id),
        "organizer_id": str(event.organizer_id) if event.organizer_id else None,
        "organizer_name": event.organizer_name,
        "category_id": str(event.category_id) if event.category_id else None,
        "category_name": event.category_name,
        "title": event.title,
        "description": event.description,
        "event_type": event.event_type,
        "venue": event.venue,
        "city": event.city,
        "state": event.state,
        "country": event.country,
        "meeting_link": event.meeting_link,
        "keywords": event.keywords,
        "ticket_price": str(event.ticket_price),
        "is_free": event.is_free,
        "convenience_fee": str(convenience_fee),
        "gateway_fee": str(gateway_fee),
        "capacity": event.capacity,
        "available_seats": event.available_seats,
        "registration_start": _iso(event.registration_start),
        "registration_end": _iso(event.registration_end),
        "start_datetime": _iso(event.start_datetime),
        "status": event.status,
        "registration_status": event.registration_status,
    }
    if include_internal:
        data.update({
            "organizer_email": event.organizer_email,
            "organizer_phone": event.organizer_phone,
            "total_registrations": event.total_registrations,
            "total_tickets_sold": event.total_tickets_sold,
            "total_sales": str(event.total_sales),
            "created_at": _iso(event.created_at),
            "archived_at": _iso(event.archived_at),
        })
    return data


def serialize_registration(registration, payment=None):
    data = {
        "registration_id": str(registration.registration_id),
        "event_id": str(registration.event_id),
        "event_title": registration.event_title,
        "event_city": registration.event_city,
        "registrant_name": registration.registrant_name,
        "registrant_email": registration.registrant_email,
        "registrant_phone": registration.registrant_phone,
        "seats_booked": registration.seats_booked,
        "ticket_price": str(registration.ticket_price),
        "discount_amount": str(registration.discount_amount),
        "convenience_fee": str(registration.convenience_fee),
        "gateway_fee": str(registration.gateway_fee),
        "total_amount": str(registration.total_amount),
        "reservation_status": registration.reservation_status,
        "registration_status": registration.registration_status,
        "reservation_expires_at": _iso(registration.reservation_expires_at),
        "coupon_code": registration.coupon_code,
        "created_at": _iso(registration.created_at),
        "confirmed_at": _iso(registration.confirmed_at),
    }
    if payment is not None:
        data["payment_id"] = str(payment.payment_id)
        data["payment_status"] = payment.payment_status
        data["receipt_number"] = payment.receipt_number
        data["receipt_available"] = payment.payment_status == "SUCCESS" and payment.receipt_number is not None
    return data


def serialize_payment(payment):
    return {
        "payment_id": str(payment.payment_id),
        "registration_id": str(payment.registration_id),
        "order_id": payment.razorpay_order_id,
        "receipt_number": payment.receipt_number,
        "event_title": payment.event_title,
        "category_name": payment.category_name,
        "organizer_name": payment.organizer_name,
        "buyer_name": payment.buyer_name,
        "buyer_phone": payment.buyer_phone,
        "buyer_email": payment.buyer_email,
        "ticket_price": str(payment.ticket_price) if payment.ticket_price is not None else None,
        "discount": str(payment.discount),
        "convenience_fee": str(payment.convenience_fee),
        "gateway_fee": str(payment.gateway_fee),
        "platform_fee": str(payment.platform_fee) if payment.platform_fee is not None else "0",
        "amount": str(payment.amount),
        "payment_status": payment.payment_status,
        "failure_reason": payment.failure_reason,
        "initiated_at": _iso(payment.initiated_at),
        "completed_at": _iso(payment.completed_at),
        "receipt_generated_at": _iso(payment.receipt_generated_at),
    }


def serialize_coupon(coupon):
    return {
        "coupon_id": str(coupon.coupon_id),
        "code": coupon.code,
        "description": coupon.description,
        "flat_discount": str(coupon.flat_discount),
        "is_active": coupon.is_active,
        "expiry_date": _iso(coupon.expiry_date),
        "times_used": coupon.times_used,
        "total_discount_given": str(coupon.total_discount_given),
        "created_at": _iso(coupon.created_at),
        "updated_at": _iso(coupon.updated_at),
    }


def serialize_audit_log(log):
    return {
        "log_id": str(log.log_id),
        "actor_type": log.actor_type,
        "actor_id": str(log.actor_id) if log.actor_id else None,
        "actor_name": log.actor_name,
        "actor_email": log.actor_email,
        "entity_type": log.entity_type,
        "entity_id": str(log.entity_id) if log.entity_id else None,
        "entity_name": log.entity_name,
        "action": log.action,
        "old_value": log.old_value,
        "new_value": log.new_value,
        "created_at": _iso(log.created_at),
    }
