-- Event Management Platform — PostgreSQL schema
-- Executable on a fresh PostgreSQL 14+ database.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE admin (
    admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login TIMESTAMPTZ,
    convenience_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    gateway_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT ck_admin_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_admin_convenience_fee CHECK (convenience_fee >= 0),
    CONSTRAINT ck_admin_gateway_fee CHECK (gateway_fee >= 0)
);

CREATE TABLE audit_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type VARCHAR(50) NOT NULL,
    actor_id UUID,
    actor_name VARCHAR(255),
    actor_email VARCHAR(255),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    entity_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id);

CREATE TABLE category (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    total_events INTEGER DEFAULT 0,
    total_registrations INTEGER DEFAULT 0,
    total_tickets_sold INTEGER DEFAULT 0,
    total_sales NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT ck_category_name_not_null CHECK (name IS NOT NULL)
);

CREATE TABLE coupon (
    coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    flat_discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expiry_date TIMESTAMPTZ,
    times_used INTEGER DEFAULT 0,
    total_discount_given NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE organizer (
    organizer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    total_events INTEGER DEFAULT 0,
    active_events INTEGER DEFAULT 0,
    total_registrations INTEGER DEFAULT 0,
    total_tickets_sold INTEGER DEFAULT 0,
    total_sales NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    archived_at TIMESTAMPTZ,
    CONSTRAINT ck_organizer_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE event (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES organizer (organizer_id),
    organizer_name VARCHAR(255) NOT NULL,
    organizer_email VARCHAR(255) NOT NULL,
    organizer_phone VARCHAR(50) NOT NULL,
    category_id UUID REFERENCES category (category_id),
    category_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(20) NOT NULL,
    venue VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    meeting_link TEXT,
    keywords TEXT[],
    ticket_price NUMERIC(10, 2) DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    capacity INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    total_registrations INTEGER DEFAULT 0,
    total_tickets_sold INTEGER DEFAULT 0,
    total_sales NUMERIC(12, 2) DEFAULT 0,
    registration_start TIMESTAMPTZ,
    registration_end TIMESTAMPTZ,
    start_datetime TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) DEFAULT 'DRAFT',
    registration_status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    archived_at TIMESTAMPTZ,
    CONSTRAINT ck_event_type CHECK (event_type IN ('ONLINE', 'OFFLINE', 'HYBRID')),
    CONSTRAINT ck_event_ticket_price_nonnegative CHECK (ticket_price >= 0),
    CONSTRAINT ck_event_is_free_ticket_price CHECK ((NOT is_free) OR ticket_price = 0),
    CONSTRAINT ck_event_capacity_positive CHECK (capacity > 0),
    CONSTRAINT ck_event_available_seats_range CHECK (available_seats >= 0 AND available_seats <= capacity),
    CONSTRAINT ck_event_total_registrations_nonnegative CHECK (total_registrations >= 0),
    CONSTRAINT ck_event_total_tickets_sold_nonnegative CHECK (total_tickets_sold >= 0),
    CONSTRAINT ck_event_total_sales_nonnegative CHECK (total_sales >= 0),
    CONSTRAINT ck_event_registration_window CHECK (
        registration_end IS NULL OR registration_start IS NULL OR registration_end > registration_start
    ),
    CONSTRAINT ck_event_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'COMPLETED', 'ARCHIVED')),
    CONSTRAINT ck_event_registration_status CHECK (registration_status IN ('OPEN', 'CLOSED'))
);

CREATE INDEX idx_event_search ON event (city, category_name, event_type);
CREATE INDEX idx_event_status ON event (status, registration_status);
CREATE INDEX idx_event_keywords ON event USING gin (keywords);

CREATE TABLE registration (
    registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES event (event_id),
    event_title VARCHAR(255) NOT NULL,
    event_city VARCHAR(255),
    category_id UUID REFERENCES category (category_id),
    category_name VARCHAR(255),
    organizer_id UUID REFERENCES organizer (organizer_id),
    organizer_name VARCHAR(255),
    registrant_name VARCHAR(255) NOT NULL,
    registrant_email VARCHAR(255),
    registrant_phone VARCHAR(50) NOT NULL,
    seats_booked INTEGER NOT NULL,
    ticket_price NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    convenience_fee NUMERIC(10, 2) DEFAULT 0,
    gateway_fee NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    reservation_status VARCHAR(20) DEFAULT 'RESERVED',
    registration_status VARCHAR(20) DEFAULT 'PENDING',
    reservation_expires_at TIMESTAMPTZ,
    coupon_id UUID REFERENCES coupon (coupon_id),
    coupon_code VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    CONSTRAINT ck_registration_seats_booked_positive CHECK (seats_booked > 0),
    CONSTRAINT ck_registration_ticket_price_nonnegative CHECK (ticket_price >= 0),
    CONSTRAINT ck_registration_discount_amount_nonnegative CHECK (discount_amount >= 0),
    CONSTRAINT ck_registration_reservation_status CHECK (reservation_status IN ('RESERVED', 'EXPIRED')),
    CONSTRAINT ck_registration_status CHECK (registration_status IN ('PENDING', 'CONFIRMED', 'FAILED'))
);

CREATE INDEX idx_registration_event ON registration (event_id);
CREATE INDEX idx_registration_org ON registration (organizer_id);

CREATE TABLE payment (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID UNIQUE REFERENCES registration (registration_id),
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    receipt_number VARCHAR(255) UNIQUE,
    receipt_generated_at TIMESTAMPTZ,
    event_id UUID,
    event_title VARCHAR(255),
    category_id UUID,
    category_name VARCHAR(255),
    organizer_id UUID,
    organizer_name VARCHAR(255),
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(50),
    buyer_email VARCHAR(255),
    ticket_price NUMERIC(10, 2),
    discount NUMERIC(10, 2) DEFAULT 0,
    convenience_fee NUMERIC(10, 2) DEFAULT 0,
    gateway_fee NUMERIC(10, 2) DEFAULT 0,
    amount NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'INITIATED',
    failure_reason TEXT,
    initiated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT ck_payment_status CHECK (payment_status IN ('INITIATED', 'SUCCESS', 'FAILED'))
);

CREATE INDEX idx_payment_org ON payment (organizer_id);
CREATE INDEX idx_payment_status ON payment (payment_status);
