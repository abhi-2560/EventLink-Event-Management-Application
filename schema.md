# Schema

## V1

1. Admin
admin_id (PK)
name
email
password_hash
status
last_login
created_at
updated_at
2. Organizer
organizer_id (PK)
organization_name
contact_person
email
phone
password_hash
status
created_at
updated_at
archived_at

3. Category
category_id (PK)
name
description
is_default
created_at
updated_at

Examples:

Conference
Workshop
Movie
Seminar
Other

4. Event
event_id (PK)

organizer_id (FK)
category_id (FK)

title
description

event_type            // ONLINE | OFFLINE | HYBRID

venue
city
state
country

meeting_link          // nullable

start_datetime
end_datetime

registration_start
registration_end

capacity
available_seats

ticket_price
convenience_fee
gateway_fee

status                // DRAFT | PUBLISHED | COMPLETED | ARCHIVED
registration_status   // OPEN | CLOSED

keywords

created_at
updated_at
archived_at
5. Registration
registration_id (PK)

event_id (FK)

registrant_name
registrant_email
registrant_phone

seats_booked

reservation_status     // RESERVED | EXPIRED

registration_status    // CONFIRMED | FAILED

coupon_id (FK, nullable)

ticket_price
discount_amount
convenience_fee
gateway_fee
total_amount

reservation_expires_at

created_at
confirmed_at

This table itself stores the reservation information, so no separate SeatReservation table is required.

6. Payment
payment_id (PK)

registration_id (FK)

razorpay_order_id
razorpay_payment_id

amount

payment_status      // INITIATED | SUCCESS | FAILED

failure_reason

initiated_at
completed_at
7. Receipt
receipt_id (PK)

registration_id (FK)
payment_id (FK)

receipt_number

ticket_price
discount_amount
convenience_fee
gateway_fee

total_amount

generated_at
8. Coupon
coupon_id (PK)

code

description

flat_discount

is_active

expiry_date

created_at
updated_at
9. AuditLog
log_id (PK)

actor_type        // ADMIN | ORGANIZER | SYSTEM

actor_id

entity_type       // EVENT | ORGANIZER | PAYMENT | etc.

entity_id

action

old_value

new_value

ip_address

created_at


---

## V2

### Changes to be made:
- remove country attributs
- 


1. Admin
admin_id (PK)

name
email
password_hash

status

last_login

created_at
updated_at
2. Organizer
organizer_id (PK)

organization_name
contact_person

email
phone

password_hash

status

total_events
active_events

total_registrations
total_tickets_sold

total_sales
platform_fee_generated

created_at
updated_at
archived_at
Why denormalize?

Organizer dashboard becomes

SELECT * FROM Organizer WHERE organizer_id = ?;

instead of aggregating across multiple tables.

3. Category
category_id (PK)

name

description

is_default

total_events

total_registrations

total_tickets_sold

total_sales

created_at
updated_at

No joins needed for category reports.

4. Event (Highly Denormalized)
event_id (PK)

organizer_id

------------------------
Organizer Snapshot
------------------------

organizer_name
organizer_email
organizer_phone

------------------------
Category Snapshot
------------------------

category_id
category_name

------------------------
Event
------------------------

title
description

event_type

venue
city
state
country

meeting_link

keywords

------------------------
Pricing
------------------------

ticket_price
convenience_fee
gateway_fee

------------------------
Capacity
------------------------

capacity
available_seats

total_registrations
total_tickets_sold

total_sales

------------------------
Dates
------------------------

registration_start
registration_end

start_datetime
end_datetime

------------------------
Status
------------------------

status
registration_status

created_at
updated_at
archived_at

Now an event card requires zero joins.

5. Registration (Booking Snapshot)
registration_id (PK)

event_id

------------------------
Event Snapshot
------------------------

event_title

event_city

event_type

category_id
category_name

organizer_id
organizer_name

------------------------
Registrant
------------------------

registrant_name

registrant_email

registrant_phone

------------------------
Booking
------------------------

seats_booked

ticket_price

discount_amount

convenience_fee

gateway_fee

platform_fee

total_amount

------------------------
Status
------------------------

reservation_status

registration_status

reservation_expires_at

------------------------
Coupon
------------------------

coupon_id

coupon_code

------------------------

created_at
confirmed_at

This table alone can answer most organizer and admin queries.

6. Payment (Finance Snapshot)
payment_id (PK)

registration_id

------------------------
Razorpay
------------------------

razorpay_order_id

razorpay_payment_id

------------------------
Event Snapshot
------------------------

event_id

event_title

category_id
category_name

organizer_id
organizer_name

------------------------
Buyer Snapshot
------------------------

buyer_name

buyer_phone

buyer_email

------------------------
Finance
------------------------

ticket_price

discount

convenience_fee

gateway_fee

platform_fee

amount

------------------------
Status
------------------------

payment_status

failure_reason

initiated_at

completed_at

Now every finance report reads only Payment.

7. Receipt

Receipts should never depend on any other table.

receipt_id (PK)

payment_id

receipt_number

------------------------
Buyer
------------------------

buyer_name

buyer_phone

buyer_email

------------------------
Event
------------------------

event_title

event_date

event_city

organizer_name

------------------------
Pricing
------------------------

ticket_price

discount

convenience_fee

gateway_fee

platform_fee

total_amount

generated_at

A receipt remains accurate even if the event or organizer is later edited.

8. Coupon
coupon_id (PK)

code

description

flat_discount

is_active

expiry_date

times_used

total_discount_given

created_at
updated_at

Dashboard metrics are available without scanning registrations.

9. Audit Log
log_id (PK)

actor_type

actor_id

actor_name

actor_email

entity_type

entity_id

entity_name

action

old_value

new_value

ip_address

created_at

No joins required when viewing audit history.


---

V3
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
  "ticket_price" NUMERIC(10,2) [default: 0]
  "is_free" BOOLEAN [default: false]
  "convenience_fee" NUMERIC(10,2) [default: 0]
  "gateway_fee" NUMERIC(10,2) [default: 0]
  "capacity" INT [not null]
  "available_seats" INT [not null]
  "total_registrations" INT [default: 0]
  "total_tickets_sold" INT [default: 0]
  "total_sales" NUMERIC(12,2) [default: 0]
  "registration_start" TIMESTAMPTZ
  "registration_end" TIMESTAMPTZ
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
  "ticket_price" NUMERIC(10,2) [not null]
  "discount_amount" NUMERIC(10,2) [default: 0]
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
  "razorpay_order_id" TEXT
  "razorpay_payment_id" TEXT
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


#
#
#

V4

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
  "convenience_fee" NUMERIC(10,2) [default: 0, check: `convenience_fee >= 0`]
  "gateway_fee" NUMERIC(10,2) [default: 0, check: `gateway_fee >= 0`]
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
  "razorpay_order_id" TEXT
  "razorpay_payment_id" TEXT
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
