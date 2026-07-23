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
