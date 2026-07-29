
Table "admin" {
  "admin_id" UUID [pk, default: `gen_random_uuid()`]
  "name" TEXT [not null]
  "email" TEXT [unique, not null]
  "password_hash" TEXT [not null]
  "status" TEXT [not null, check: `status IN ('ACTIVE','INACTIVE')`, default: 'ACTIVE']
  "last_login" TIMESTAMPTZ
  "created_at" TIMESTAMPTZ [default: `now()`]
  "updated_at" TIMESTAMPTZ [default: `now()`]
}

Table "platform_settings" {
  "id" INT [pk, default: 1, check: `id = 1`]
  "convenience_fee" NUMERIC(10,2) [not null, default: 0, check: `convenience_fee >= 0`]
  "gateway_fee" NUMERIC(10,2) [not null, default: 0, check: `gateway_fee >= 0`]
  "updated_at" TIMESTAMPTZ [default: `now()`]
}

Table "organizer" {
  "organizer_id" UUID [pk, default: `gen_random_uuid()`]
  "organization_name" TEXT [not null]
  "contact_person" TEXT [not null]
  "email" TEXT [unique, not null]
  "phone" TEXT [not null]
  "password_hash" TEXT [not null]
  // "status" TEXT [not null, default: 'ACTIVE']
  "status" TEXT [not null, default: 'ACTIVE', check: `status IN ('ACTIVE','INACTIVE')`]
  "total_events" INT [default: 0]
  "active_events" INT [default: 0]
  "total_registrations" INT [default: 0]
  "total_tickets_sold" INT [default: 0]
  "total_sales" NUMERIC(12,2) [default: 0]
  "platform_fee_generated" NUMERIC(12,2) [default: 0]
  "created_at" TIMESTAMPTZ [default: `now()`]
  "updated_at" TIMESTAMPTZ [default: `now()`]
  "archived_at" TIMESTAMPTZ
}

Table "category" {
  "category_id" UUID [pk, default: `gen_random_uuid()`]
  "name" TEXT [unique, not null]
  "description" TEXT
  "is_default" BOOLEAN [default: false]
  "total_events" INT [default: 0]
  "total_registrations" INT [default: 0]
  "total_tickets_sold" INT [default: 0]
  "total_sales" NUMERIC(12,2) [default: 0]
  "created_at" TIMESTAMPTZ [default: `now()`]
  "updated_at" TIMESTAMPTZ [default: `now()`]
}

Table "coupon" {
  "coupon_id" UUID [pk, default: `gen_random_uuid()`]
  "code" TEXT [unique, not null]
  "description" TEXT
  "flat_discount" NUMERIC(10,2) [not null, default: 0]
  "is_active" BOOLEAN [default: true]
  "expiry_date" TIMESTAMPTZ
  "times_used" INT [default: 0]
  "total_discount_given" NUMERIC(12,2) [default: 0]
  "created_at" TIMESTAMPTZ [default: `now()`]
  "updated_at" TIMESTAMPTZ [default: `now()`]
}

// Table "event" {
//   "event_id" UUID [pk, default: `gen_random_uuid()`]
//   "organizer_id" UUID
//   "organizer_name" TEXT [not null]
//   "organizer_email" TEXT [not null]
//   "organizer_phone" TEXT [not null]
//   "category_id" UUID
//   "category_name" TEXT [not null]
//   "title" TEXT [not null]
//   "description" TEXT
//   "event_type" TEXT [not null, check: `event_type IN ('ONLINE','OFFLINE','HYBRID')`]
//   "venue" TEXT
//   "city" TEXT
//   "state" TEXT
//   "country" TEXT
//   "meeting_link" TEXT
//   "keywords" "TEXT[]"
//   "ticket_price" NUMERIC(10,2) [default: 0]
//   "is_free" BOOLEAN [default: false]
//   "convenience_fee" NUMERIC(10,2) [default: 0]
//   "gateway_fee" NUMERIC(10,2) [default: 0]
//   "capacity" INT [not null]
//   "available_seats" INT [not null]
//   "total_registrations" INT [default: 0]
//   "total_tickets_sold" INT [default: 0]
//   "total_sales" NUMERIC(12,2) [default: 0]
//   "registration_start" TIMESTAMPTZ
//   "registration_end" TIMESTAMPTZ
//   "start_datetime" TIMESTAMPTZ [not null]
//   "status" TEXT [check: `status IN ('DRAFT','PUBLISHED','COMPLETED','ARCHIVED')`, default: 'DRAFT']
//   "registration_status" TEXT [check: `registration_status IN ('OPEN','CLOSED')`, default: 'OPEN']
//   "created_at" TIMESTAMPTZ [default: `now()`]
//   "updated_at" TIMESTAMPTZ [default: `now()`]
//   "archived_at" TIMESTAMPTZ

//   Indexes {
//     (city, category_name, event_type) [name: "idx_event_search"]
//     (status, registration_status) [name: "idx_event_status"]
//     keywords [type: gin, name: "idx_event_keywords"]
//   }
// }

Table "event" {
  "event_id" UUID [pk, default: `gen_random_uuid()`]
  "organizer_id" UUID
  "organizer_name" TEXT [not null]
  "organizer_email" TEXT [not null]
  "organizer_phone" TEXT [not null]
  "category_id" UUID
  "category_name" TEXT [not null]
  "title" TEXT [not null]
  "description" TEXT
  "event_type" TEXT [not null, check: `event_type IN ('ONLINE','OFFLINE','HYBRID')`]
  "venue" TEXT
  "city" TEXT
  "state" TEXT
  "country" TEXT
  "meeting_link" TEXT
  "keywords" "TEXT[]"
  "ticket_price" NUMERIC(10,2) [default: 0, check: `ticket_price >= 0`]
  "is_free" BOOLEAN [default: false, check: `(NOT is_free) OR ticket_price = 0`]
  "capacity" INT [not null, check: `capacity > 0`]
  "available_seats" INT [not null, check: `available_seats >= 0 AND available_seats <= capacity`]
  "total_registrations" INT [default: 0, check: `total_registrations >= 0`]
  "total_tickets_sold" INT [default: 0, check: `total_tickets_sold >= 0`]
  "total_sales" NUMERIC(12,2) [default: 0, check: `total_sales >= 0`]
  "registration_start" TIMESTAMPTZ
  "registration_end" TIMESTAMPTZ [check: `registration_end IS NULL OR registration_start IS NULL OR registration_end > registration_start`]
  "start_datetime" TIMESTAMPTZ [not null]
  "status" TEXT [check: `status IN ('DRAFT','PUBLISHED','COMPLETED','ARCHIVED')`, default: 'DRAFT']
  "registration_status" TEXT [check: `registration_status IN ('OPEN','CLOSED')`, default: 'OPEN']
  "created_at" TIMESTAMPTZ [default: `now()`]
  "updated_at" TIMESTAMPTZ [default: `now()`]
  "archived_at" TIMESTAMPTZ

  Indexes {
    (city, category_name, event_type) [name: "idx_event_search"]
    (status, registration_status) [name: "idx_event_status"]
    keywords [type: gin, name: "idx_event_keywords"]
  }
}

Table "registration" {
  "registration_id" UUID [pk, default: `gen_random_uuid()`]
  "event_id" UUID
  "event_title" TEXT [not null]
  "event_city" TEXT
  "event_type" TEXT
  "category_id" UUID
  "category_name" TEXT
  "organizer_id" UUID
  "organizer_name" TEXT
  "registrant_name" TEXT [not null]
  "registrant_email" TEXT
  "registrant_phone" TEXT [not null]
  "seats_booked" INT [not null, check: `seats_booked>0`]
  "ticket_price" NUMERIC(10,2) [not null, check: `ticket_price >= 0`]
  "discount_amount" NUMERIC(10,2) [default: 0, check: `discount_amount >= 0`]
  "convenience_fee" NUMERIC(10,2) [default: 0]
  "gateway_fee" NUMERIC(10,2) [default: 0]
  "platform_fee" NUMERIC(10,2) [default: 0]
  "total_amount" NUMERIC(12,2) [not null]
  "reservation_status" TEXT [check: `reservation_status IN ('RESERVED','EXPIRED')`, default: 'RESERVED']
  "registration_status" TEXT [check: `registration_status IN ('PENDING','CONFIRMED','FAILED')`, default: 'PENDING']
  "reservation_expires_at" TIMESTAMPTZ
  "coupon_id" UUID
  "coupon_code" TEXT
  "created_at" TIMESTAMPTZ [default: `now()`]
  "confirmed_at" TIMESTAMPTZ

  Indexes {
    event_id [name: "idx_registration_event"]
    organizer_id [name: "idx_registration_org"]
  }
}

Table "payment" {
  "payment_id" UUID [pk, default: `gen_random_uuid()`]
  "registration_id" UUID [unique]
  "razorpay_order_id" TEXT [unique]
  "razorpay_payment_id" TEXT [unique]
  "receipt_number" TEXT [unique]
  "receipt_generated_at" TIMESTAMPTZ
  "event_id" UUID
  "event_title" TEXT
  "category_id" UUID
  "category_name" TEXT
  "organizer_id" UUID
  "organizer_name" TEXT
  "buyer_name" TEXT
  "buyer_phone" TEXT
  "buyer_email" TEXT
  "ticket_price" NUMERIC(10,2)
  "discount" NUMERIC(10,2) [default: 0]
  "convenience_fee" NUMERIC(10,2) [default: 0]
  "gateway_fee" NUMERIC(10,2) [default: 0]
  "platform_fee" NUMERIC(10,2) [default: 0]
  "amount" NUMERIC(12,2) [not null]
  "payment_status" TEXT [check: `payment_status IN ('INITIATED','SUCCESS','FAILED')`, default: 'INITIATED']
  "failure_reason" TEXT
  "initiated_at" TIMESTAMPTZ [default: `now()`]
  "completed_at" TIMESTAMPTZ

  Indexes {
    organizer_id [name: "idx_payment_org"]
    payment_status [name: "idx_payment_status"]
  }
}

Table "audit_log" {
  "log_id" UUID [pk, default: `gen_random_uuid()`]
  "actor_type" TEXT [not null]
  "actor_id" UUID
  "actor_name" TEXT
  "actor_email" TEXT
  "entity_type" TEXT [not null]
  "entity_id" UUID
  "entity_name" TEXT
  "action" TEXT [not null]
  "old_value" JSONB
  "new_value" JSONB
  "ip_address" INET
  "created_at" TIMESTAMPTZ [default: `now()`]

  Indexes {
    (entity_type, entity_id) [name: "idx_audit_entity"]
  }
}

Ref:"organizer"."organizer_id" < "event"."organizer_id"

Ref:"category"."category_id" < "event"."category_id"

Ref:"event"."event_id" < "registration"."event_id"

Ref:"coupon"."coupon_id" < "registration"."coupon_id"

Ref:"registration"."registration_id" < "payment"."registration_id"
