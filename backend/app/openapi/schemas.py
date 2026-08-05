"""Reusable OpenAPI 3.1 component schemas derived from serializers."""

UUID = {"type": "string", "format": "uuid"}
DECIMAL_STR = {"type": "string", "example": "100.00"}
ISO_DATETIME = {"type": "string", "format": "date-time"}
ISO_DATETIME_NULL = {"type": ["string", "null"], "format": "date-time"}

ERROR = {
    "type": "object",
    "required": ["error"],
    "properties": {"error": {"type": "string"}},
}

JWT_ERROR = {
    "type": "object",
    "required": ["error"],
    "properties": {
        "error": {"type": "string", "example": "Authentication is required"},
        "reason": {"type": "string", "example": "Token has expired"},
    },
}

MESSAGE = {
    "type": "object",
    "required": ["message"],
    "properties": {"message": {"type": "string"}},
}

TOKEN_RESPONSE = {
    "type": "object",
    "required": ["access_token", "actor_type", "expires_in"],
    "properties": {
        "access_token": {"type": "string"},
        "actor_type": {"type": "string", "enum": ["admin", "organizer"]},
        "expires_in": {"type": "integer", "example": 900},
    },
    "example": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "actor_type": "organizer",
        "expires_in": 900,
    },
}

ADMIN = {
    "type": "object",
    "properties": {
        "admin_id": UUID,
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "status": {"type": "string"},
        "last_login": ISO_DATETIME_NULL,
        "created_at": ISO_DATETIME,
    },
}

ORGANIZER = {
    "type": "object",
    "properties": {
        "organizer_id": UUID,
        "organizer_name": {"type": "string"},
        "contact_person": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "phone": {"type": "string"},
        "status": {"type": "string"},
        "total_events": {"type": "integer"},
        "active_events": {"type": "integer"},
        "total_registrations": {"type": "integer"},
        "total_tickets_sold": {"type": "integer"},
        "total_sales": DECIMAL_STR,
        "created_at": ISO_DATETIME,
        "archived_at": ISO_DATETIME_NULL,
    },
}

CATEGORY = {
    "type": "object",
    "properties": {
        "category_id": UUID,
        "name": {"type": "string"},
        "description": {"type": ["string", "null"]},
        "is_default": {"type": "boolean"},
        "total_events": {"type": "integer"},
        "total_registrations": {"type": "integer"},
        "total_tickets_sold": {"type": "integer"},
        "total_sales": DECIMAL_STR,
    },
}

EVENT_BASE = {
    "event_id": UUID,
    "organizer_id": {"type": ["string", "null"], "format": "uuid"},
    "organizer_name": {"type": "string"},
    "category_id": {"type": ["string", "null"], "format": "uuid"},
    "category_name": {"type": "string"},
    "title": {"type": "string"},
    "description": {"type": "string"},
    "event_type": {"type": "string", "enum": ["ONLINE", "OFFLINE", "HYBRID"]},
    "venue": {"type": "string"},
    "city": {"type": "string"},
    "state": {"type": "string"},
    "country": {"type": "string"},
    "meeting_link": {"type": ["string", "null"]},
    "keywords": {"type": "array", "items": {"type": "string"}},
    "ticket_price": DECIMAL_STR,
    "is_free": {"type": "boolean"},
    "convenience_fee": DECIMAL_STR,
    "gateway_fee": DECIMAL_STR,
    "capacity": {"type": "integer"},
    "available_seats": {"type": "integer"},
    "registration_start": ISO_DATETIME_NULL,
    "registration_end": ISO_DATETIME_NULL,
    "start_datetime": ISO_DATETIME_NULL,
    "status": {"type": "string", "enum": ["DRAFT", "PUBLISHED", "ARCHIVED"]},
    "registration_status": {"type": "string", "enum": ["OPEN", "CLOSED"]},
    "banner_url": {"type": ["string", "null"]},
}

EVENT = {"type": "object", "properties": dict(EVENT_BASE)}

EVENT_INTERNAL = {
    "type": "object",
    "properties": {
        **EVENT_BASE,
        "organizer_email": {"type": "string"},
        "organizer_phone": {"type": "string"},
        "total_registrations": {"type": "integer"},
        "total_tickets_sold": {"type": "integer"},
        "total_sales": DECIMAL_STR,
        "created_at": ISO_DATETIME,
        "archived_at": ISO_DATETIME_NULL,
    },
}

MEDIA_ITEM = {
    "type": "object",
    "properties": {
        "media_id": UUID,
        "media_type": {"type": "string", "enum": ["IMAGE", "VIDEO"]},
        "media_url": {"type": "string"},
        "display_order": {"type": "integer"},
        "created_at": ISO_DATETIME,
    },
}

EVENT_WITH_MEDIA = {
    "type": "object",
    "properties": {
        **EVENT_BASE,
        "organizer_email": {"type": "string"},
        "organizer_phone": {"type": "string"},
        "total_registrations": {"type": "integer"},
        "total_tickets_sold": {"type": "integer"},
        "total_sales": DECIMAL_STR,
        "created_at": ISO_DATETIME,
        "archived_at": ISO_DATETIME_NULL,
        "images": {"type": "array", "items": MEDIA_ITEM},
        "videos": {"type": "array", "items": MEDIA_ITEM},
    },
}

EVENT_CREATE = {
    "type": "object",
    "required": ["category_id", "title", "capacity"],
    "properties": {
        "category_id": UUID,
        "title": {"type": "string", "maxLength": 255},
        "capacity": {"type": "integer", "minimum": 1},
        "description": {"type": "string"},
        "event_type": {"type": "string", "enum": ["ONLINE", "OFFLINE", "HYBRID"]},
        "venue": {"type": "string"},
        "city": {"type": "string"},
        "state": {"type": "string"},
        "country": {"type": "string"},
        "meeting_link": {"type": "string", "format": "uri"},
        "keywords": {"type": "array", "items": {"type": "string"}},
        "ticket_price": {"type": "number", "minimum": 0},
        "is_free": {"type": "boolean"},
        "registration_start": ISO_DATETIME,
        "registration_end": ISO_DATETIME,
        "start_datetime": ISO_DATETIME,
        "registration_status": {"type": "string", "enum": ["OPEN", "CLOSED"]},
    },
}

EVENT_UPDATE = {
    "type": "object",
    "properties": EVENT_CREATE["properties"] | {"category_id": UUID},
}

REGISTRATION = {
    "type": "object",
    "properties": {
        "registration_id": UUID,
        "event_id": UUID,
        "event_title": {"type": "string"},
        "event_city": {"type": "string"},
        "registrant_name": {"type": "string"},
        "registrant_email": {"type": ["string", "null"], "format": "email"},
        "registrant_phone": {"type": "string"},
        "seats_booked": {"type": "integer"},
        "ticket_price": DECIMAL_STR,
        "discount_amount": DECIMAL_STR,
        "convenience_fee": DECIMAL_STR,
        "gateway_fee": DECIMAL_STR,
        "total_amount": DECIMAL_STR,
        "reservation_status": {"type": "string"},
        "registration_status": {"type": "string"},
        "reservation_expires_at": ISO_DATETIME_NULL,
        "coupon_code": {"type": ["string", "null"]},
        "created_at": ISO_DATETIME,
        "confirmed_at": ISO_DATETIME_NULL,
        "payment_id": UUID,
        "payment_status": {"type": "string"},
        "receipt_number": {"type": ["string", "null"]},
        "receipt_available": {"type": "boolean"},
        "order_id": {"type": "string"},
    },
}

REGISTRATION_CREATE = {
    "type": "object",
    "required": ["event_id", "registrant_name", "registrant_phone"],
    "properties": {
        "event_id": UUID,
        "registrant_name": {"type": "string", "maxLength": 255},
        "registrant_phone": {"type": "string"},
        "seats_booked": {"type": "integer", "minimum": 1, "default": 1},
        "registrant_email": {"type": "string", "format": "email"},
        "coupon_code": {"type": "string"},
    },
    "example": {
        "event_id": "550e8400-e29b-41d4-a716-446655440000",
        "registrant_name": "Jane Doe",
        "registrant_phone": "9876543210",
        "seats_booked": 2,
        "coupon_code": "SAVE10",
    },
}

REGISTRATION_CREATED = {
    "allOf": [
        REGISTRATION,
        {
            "type": "object",
            "required": ["payment_id", "order_id", "amount"],
            "properties": {
                "payment_id": UUID,
                "order_id": {"type": "string"},
                "amount": DECIMAL_STR,
            },
        },
    ],
}

PAYMENT = {
    "type": "object",
    "properties": {
        "payment_id": UUID,
        "registration_id": UUID,
        "order_id": {"type": "string"},
        "receipt_number": {"type": ["string", "null"]},
        "event_title": {"type": "string"},
        "event_type": {"type": "string"},
        "venue": {"type": "string"},
        "city": {"type": "string"},
        "state": {"type": "string"},
        "meeting_link": {"type": ["string", "null"]},
        "category_name": {"type": "string"},
        "organizer_name": {"type": "string"},
        "buyer_name": {"type": "string"},
        "buyer_phone": {"type": "string"},
        "buyer_email": {"type": ["string", "null"], "format": "email"},
        "ticket_price": {"type": ["string", "null"]},
        "discount": DECIMAL_STR,
        "convenience_fee": DECIMAL_STR,
        "gateway_fee": DECIMAL_STR,
        "amount": DECIMAL_STR,
        "payment_status": {"type": "string"},
        "failure_reason": {"type": ["string", "null"]},
        "initiated_at": ISO_DATETIME,
        "completed_at": ISO_DATETIME_NULL,
        "receipt_generated_at": ISO_DATETIME_NULL,
    },
}

PAYMENT_ORDER = {
    "type": "object",
    "properties": {
        "payment_id": UUID,
        "registration_id": UUID,
        "order_id": {"type": "string"},
        "amount": DECIMAL_STR,
        "currency": {"type": "string", "example": "INR"},
    },
}

COUPON = {
    "type": "object",
    "properties": {
        "coupon_id": UUID,
        "code": {"type": "string"},
        "description": {"type": ["string", "null"]},
        "flat_discount": DECIMAL_STR,
        "is_active": {"type": "boolean"},
        "expiry_date": ISO_DATETIME_NULL,
        "times_used": {"type": "integer"},
        "total_discount_given": DECIMAL_STR,
        "created_at": ISO_DATETIME,
        "updated_at": ISO_DATETIME,
    },
}

COUPON_VALIDATE_RESPONSE = {
    "type": "object",
    "properties": {
        "coupon_code": {"type": "string"},
        "discount": DECIMAL_STR,
        "final_amount": DECIMAL_STR,
        "subtotal": DECIMAL_STR,
    },
}

AUDIT_LOG = {
    "type": "object",
    "properties": {
        "log_id": UUID,
        "actor_type": {"type": "string"},
        "actor_id": {"type": ["string", "null"], "format": "uuid"},
        "actor_name": {"type": "string"},
        "actor_email": {"type": "string"},
        "entity_type": {"type": "string"},
        "entity_id": {"type": ["string", "null"], "format": "uuid"},
        "entity_name": {"type": "string"},
        "action": {"type": "string"},
        "old_value": {},
        "new_value": {},
        "created_at": ISO_DATETIME,
    },
}

AUDIT_LOG_PAGE = {
    "type": "object",
    "properties": {
        "items": {"type": "array", "items": AUDIT_LOG},
        "page": {"type": "integer"},
        "page_size": {"type": "integer"},
        "total": {"type": "integer"},
        "total_pages": {"type": "integer"},
    },
}

PLATFORM_FEES = {
    "type": "object",
    "properties": {
        "convenience_fee": DECIMAL_STR,
        "gateway_fee": DECIMAL_STR,
        "updated_at": ISO_DATETIME_NULL,
    },
}

ADMIN_DASHBOARD = {
    "type": "object",
    "properties": {
        "total_organizers": {"type": "integer"},
        "total_events": {"type": "integer"},
        "active_events": {"type": "integer"},
        "total_registrations": {"type": "integer"},
        "total_tickets_sold": {"type": "integer"},
        "total_revenue": DECIMAL_STR,
        "total_value_earned": DECIMAL_STR,
    },
}

PERIOD_SUMMARY = {
    "type": "object",
    "properties": {
        "total_events": {"type": "integer"},
        "total_registrations": {"type": "integer"},
        "total_revenue": DECIMAL_STR,
        "total_organizers": {"type": "integer"},
    },
}

MONTHLY_BAR_ITEM = {
    "type": "object",
    "properties": {
        "month": {"type": "string", "example": "2026-08"},
        "events": {"type": "integer"},
        "registrations": {"type": "integer"},
        "revenue": DECIMAL_STR,
        "organizers": {"type": "integer"},
    },
}

ORGANIZER_MONTHLY_ITEM = {
    "type": "object",
    "properties": {
        "month": {"type": "string"},
        "events": {"type": "integer"},
        "registrations": {"type": "integer"},
        "revenue": DECIMAL_STR,
    },
}

CATEGORY_BREAKDOWN_ITEM = {
    "type": "object",
    "properties": {
        "category_name": {"type": "string"},
        "event_count": {"type": "integer"},
    },
}

ORGANIZER_DASHBOARD = {
    "type": "object",
    "properties": {
        "total_events": {"type": "integer"},
        "active_events": {"type": "integer"},
        "draft_events": {"type": "integer"},
        "closed_events": {"type": "integer"},
        "archived_events": {"type": "integer"},
        "total_registrations": {"type": "integer"},
        "total_revenue": DECIMAL_STR,
        "total_tickets_sold": {"type": "integer"},
        "upcoming_events": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "event_id": UUID,
                    "title": {"type": "string"},
                    "start_datetime": ISO_DATETIME,
                    "city": {"type": "string"},
                    "available_seats": {"type": "integer"},
                },
            },
        },
    },
}

ORGANIZER_PERIOD = {
    "type": "object",
    "properties": {
        "total_events": {"type": "integer"},
        "total_registrations": {"type": "integer"},
        "total_revenue": DECIMAL_STR,
    },
}

SALES_SUMMARY = {
    "type": "object",
    "properties": {
        "total_sales": DECIMAL_STR,
        "total_registrations": {"type": "integer"},
        "total_tickets_sold": {"type": "integer"},
        "recent_transactions": {"type": "array", "items": PAYMENT},
    },
}

EVENT_SALES = {
    "type": "object",
    "properties": {
        "total_sales": DECIMAL_STR,
        "total_registrations": {"type": "integer"},
        "total_tickets_sold": {"type": "integer"},
    },
}

MEDIA_UPLOAD = {
    "type": "object",
    "properties": {
        "media_id": UUID,
        "media_type": {"type": "string", "enum": ["IMAGE", "VIDEO"]},
        "media_url": {"type": "string"},
        "display_order": {"type": "integer"},
    },
}

HEALTH_OK = {
    "type": "object",
    "properties": {
        "status": {"type": "string", "enum": ["ok"]},
        "database": {"type": "string", "enum": ["connected"]},
        "timestamp": ISO_DATETIME,
        "version": {"type": "string"},
    },
}

HEALTH_UNAVAILABLE = {
    "type": "object",
    "properties": {
        "status": {"type": "string", "enum": ["unavailable"]},
        "database": {"type": "string", "enum": ["unavailable"]},
        "timestamp": ISO_DATETIME,
        "version": {"type": "string"},
    },
}

LOGIN_BODY = {
    "type": "object",
    "required": ["email", "password"],
    "properties": {
        "email": {"type": "string", "format": "email"},
        "password": {"type": "string", "format": "password"},
    },
}

UNIFIED_LOGIN_BODY = {
    "type": "object",
    "required": ["actor_type", "email", "password"],
    "properties": {
        "actor_type": {"type": "string", "enum": ["admin", "organizer"]},
        "email": {"type": "string", "format": "email"},
        "password": {"type": "string", "format": "password"},
    },
}

REGISTER_ORGANIZER_BODY = {
    "type": "object",
    "required": ["organizer_name", "contact_person", "email", "phone", "password"],
    "properties": {
        "organizer_name": {"type": "string"},
        "contact_person": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "phone": {"type": "string"},
        "password": {"type": "string", "format": "password"},
    },
}

PASSWORD_RESET_REQUEST = {
    "type": "object",
    "required": ["actor_type", "email"],
    "properties": {
        "actor_type": {"type": "string", "enum": ["admin", "organizer"]},
        "email": {"type": "string", "format": "email"},
    },
}

PASSWORD_RESET_CONFIRM = {
    "type": "object",
    "required": ["token", "new_password"],
    "properties": {
        "token": {"type": "string"},
        "new_password": {"type": "string", "format": "password"},
    },
}

CHANGE_PASSWORD_BODY = {
    "type": "object",
    "required": ["current_password", "new_password"],
    "properties": {
        "current_password": {"type": "string", "format": "password"},
        "new_password": {"type": "string", "format": "password"},
    },
}

COMPONENTS = {
    "ErrorResponse": ERROR,
    "JwtErrorResponse": JWT_ERROR,
    "MessageResponse": MESSAGE,
    "TokenResponse": TOKEN_RESPONSE,
    "Admin": ADMIN,
    "Organizer": ORGANIZER,
    "Category": CATEGORY,
    "Event": EVENT,
    "EventInternal": EVENT_INTERNAL,
    "EventWithMedia": EVENT_WITH_MEDIA,
    "EventCreate": EVENT_CREATE,
    "EventUpdate": EVENT_UPDATE,
    "Registration": REGISTRATION,
    "RegistrationCreate": REGISTRATION_CREATE,
    "RegistrationCreated": REGISTRATION_CREATED,
    "Payment": PAYMENT,
    "PaymentOrder": PAYMENT_ORDER,
    "Coupon": COUPON,
    "CouponValidateResponse": COUPON_VALIDATE_RESPONSE,
    "AuditLog": AUDIT_LOG,
    "AuditLogPage": AUDIT_LOG_PAGE,
    "PlatformFees": PLATFORM_FEES,
    "AdminDashboard": ADMIN_DASHBOARD,
    "PeriodSummary": PERIOD_SUMMARY,
    "MonthlyBarItem": MONTHLY_BAR_ITEM,
    "OrganizerMonthlyItem": ORGANIZER_MONTHLY_ITEM,
    "CategoryBreakdownItem": CATEGORY_BREAKDOWN_ITEM,
    "OrganizerDashboard": ORGANIZER_DASHBOARD,
    "OrganizerPeriodSummary": ORGANIZER_PERIOD,
    "SalesSummary": SALES_SUMMARY,
    "EventSales": EVENT_SALES,
    "MediaUpload": MEDIA_UPLOAD,
    "HealthOk": HEALTH_OK,
    "HealthUnavailable": HEALTH_UNAVAILABLE,
    "LoginBody": LOGIN_BODY,
    "UnifiedLoginBody": UNIFIED_LOGIN_BODY,
    "RegisterOrganizerBody": REGISTER_ORGANIZER_BODY,
    "PasswordResetRequest": PASSWORD_RESET_REQUEST,
    "PasswordResetConfirm": PASSWORD_RESET_CONFIRM,
    "ChangePasswordBody": CHANGE_PASSWORD_BODY,
}
