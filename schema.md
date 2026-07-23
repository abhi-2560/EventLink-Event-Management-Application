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