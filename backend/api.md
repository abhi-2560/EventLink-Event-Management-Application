# This file contains api designing; changes required

Based **strictly on your elicited requirements** (nothing out of scope), these are the APIs I would design. I've grouped them by actor and functionality.

---

# 1. Authentication APIs

## Admin

| Method | Endpoint                          | Purpose         |
| ------ | --------------------------------- | --------------- |
| POST   | `/auth/admin/login`           | Admin login     |
| POST   | `/auth/admin/logout`          | Logout          |
| POST   | `/auth/admin/forgot-password` | Send reset mail |
| POST   | `/auth/admin/reset-password`  | Reset password  |

---

## Organizer

| Method | Endpoint                              | Purpose         |
| ------ | ------------------------------------- | --------------- |
| POST   | `/auth/organizer/login`           | Organizer login |
| POST   | `/auth/organizer/logout`          | Logout          |
| POST   | `/auth/organizer/forgot-password` | Send reset mail |
| POST   | `/auth/organizer/reset-password`  | Reset password  |

---

# 2. Admin APIs

## Organizer Management
Do not need: Create and Update organizer / registrant
| Method | Endpoint                             | Purpose               |
| ------ | ------------------------------------ | --------------------- |
| GET    | `/admin/organizers`              | List organizers       |
| GET    | `/admin/organizers/{id}`         | Organizer details     |
| DELETE | `/admin/organizers/{id}`         | Hard delete organizer |
| PATCH  | `/admin/organizers/{id}/archive` | Soft delete organizer |

---

## Event Management

Admin cannot create events.

| Method | Endpoint                         | Purpose           |
| ------ | -------------------------------- | ----------------- |
| GET    | `/admin/events`              | View all events   |
| GET    | `/admin/events/{id}`         | Event details     |
| PATCH  | `/admin/events/{id}/archive` | Archive event     |
| DELETE | `/admin/events/{id}`         | Hard delete event |

---

## Category Management

| Method | Endpoint                     | Purpose         |
| ------ | ---------------------------- | --------------- |
| POST   | `/admin/categories`      | Create category |
| GET    | `/admin/categories`      | List categories |
| PUT    | `/admin/categories/{id}` | Update category |
| DELETE | `/admin/categories/{id}` | Delete category |

---

## Coupon Management

| Method | Endpoint                  | Purpose       |
| ------ | ------------------------- | ------------- |
| POST   | `/admin/coupons`      | Create coupon |
| GET    | `/admin/coupons`      | List coupons  |
| PUT    | `/admin/coupons/{id}` | Update coupon |
| DELETE | `/admin/coupons/{id}` | Delete coupon |

---

## Reports

| Method | Endpoint                       | Purpose                     |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/admin/reports/dashboard` | Overall platform statistics |
| GET    | `/admin/reports/monthly`   | Monthly report              |
| GET    | `/admin/reports/category`  | Category-wise report        |

---

## Audit Logs

| Method | Endpoint                     | Purpose     |
| ------ | ---------------------------- | ----------- |
| GET    | `/admin/audit-logs`      | View logs   |
| GET    | `/admin/audit-logs/{id}` | Log details |

---

# 3. Organizer APIs

## Event Management

| Method | Endpoint                                        | Purpose            |
| ------ | ----------------------------------------------- | ------------------ |
| POST   | `/organizer/events`                         | Create event       |
| GET    | `/organizer/events`                         | My events          |
| GET    | `/organizer/events/{id}`                    | Event details      |
| PUT    | `/organizer/events/{id}`                    | Update event       |
| PATCH  | `/organizer/events/{id}/publish`            | Publish draft      |
| PATCH  | `/organizer/events/{id}/close-registration` | Close registration |
| PATCH  | `/organizer/events/{id}/archive`            | Archive event      |
| DELETE | `/organizer/events/{id}`                    | Hard delete        |

---

## Registration Management

| Method | Endpoint                                   | Purpose           |
| ------ | ------------------------------------------ | ----------------- |
| GET    | `/organizer/events/{id}/registrations` | View participants |
| GET    | `/organizer/events/{id}/sales`         | View total sales  |

---

# 4. Public Event APIs

No authentication.

## Event Discovery

| Method | Endpoint           | Purpose       |
| ------ | ------------------ | ------------- |
| GET    | `/events`      | List events   |
| GET    | `/events/{id}` | Event details |

---

## Search

Single search endpoint with filters.

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | `/events/search` |

Supported query params

```text
title
location
city
category
organizer
date
type
keyword
```

Example

```text
/events/search?city=Indore&type=OFFLINE
```

---

# 5. Registration APIs

No login required.

---

## Create Registration

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | `/registrations` |

This API

* validates seats
* reserves seats
* applies coupon
* creates pending registration
* Leads to payment simulation page

Returns

```text
Registration ID

Reservation expiry

Random order id
```

---

## Registration Details

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | `/registrations/{id}` |

Useful for receipt page.

---

# 6. Coupon API

| Method | Endpoint                |
| ------ | ----------------------- |
| POST   | `/coupons/validate` |

Input

```text
coupon_code

event_id

seat_count
```

Returns

```text
discount

final amount
```

---

# 7. Payment APIs

## Create Order

| Method | Endpoint                     |
| ------ | ---------------------------- |
| POST   | `/payments/create-order` |

---

## Verify Payment

| Method | Endpoint               |
| ------ | ---------------------- |
| POST   | `/payments/verify` |

On success

* confirm registration
* decrease seats permanently
* increment coupon usage
* generate receipt

---

## Payment Failure

| Method | Endpoint                |
| ------ | ----------------------- |
| POST   | `/payments/failure` |

This releases reserved seats.

---

## Receipt

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | `/payments/{paymentId}/receipt` |

---

# 8. Dashboard APIs

## Organizer Dashboard

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | `/organizer/dashboard` |

Returns

```text
Total Events

Total Registrations

Revenue

Upcoming Events
```

---

# Total API Count

| Module         |        APIs |
| -------------- | ----------: |
| Authentication |           8 |
| Admin          |          15 |
| Organizer      |           9 |
| Public Events  |           3 |
| Dashboard      |           1 |
| Registration   |           2 |
| Coupon         |           1 |
| Payments       |           4 |
| **Total**      | **43 APIs** |

---

# APIs intentionally **not included** (because they are out of scope)

I have **not** included the following since your requirements explicitly exclude or do not mention them:

* ❌ User registration/login/profile APIs
* ❌ Email verification
* ❌ Organizer approval workflow
* ❌ QR code generation/scanning
* ❌ Attendance marking
* ❌ Ticket cancellation
* ❌ Registration editing
* ❌ Organizer dashboard analytics beyond the stated sales/summary
* ❌ Notification management
* ❌ File/document upload APIs
* ❌ Wishlist/favorites
* ❌ Reviews or ratings
* ❌ Bulk import/export APIs
* ❌ Role/permission management APIs
* ❌ WebSocket endpoints

This API set stays aligned with the scope you've documented while covering the complete functionality required by your event registration platform.

---

# V2

Based **only on your finalized requirements**, this is the complete REST API list. I've intentionally excluded anything that is out of scope.

---

# 1. Authentication APIs

## Organizer Authentication

| Method | Endpoint                              | Description               |
| ------ | ------------------------------------- | ------------------------- |
| POST   | `/auth/organizer/login`           | Organizer login           |
| POST   | `/auth/organizer/logout`          | Organizer logout          |
| POST   | `/auth/organizer/forgot-password` | Send password reset email |
| POST   | `/auth/organizer/reset-password`  | Reset password            |

---

## Admin Authentication

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| POST   | `/auth/admin/login`           | Admin login               |
| POST   | `/auth/admin/logout`          | Admin logout              |
| POST   | `/auth/admin/forgot-password` | Send password reset email |
| POST   | `/auth/admin/reset-password`  | Reset password            |

---

# 2. Organizer Registration

Public endpoint.

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| POST   | `/organizers/register` | Register as organizer |

---

# 3. Admin APIs

## Organizer Management

| Method | Endpoint                                      | Description              |
| ------ | --------------------------------------------- | ------------------------ |
| GET    | `/admin/organizers`                       | View all organizers      |
| GET    | `/admin/organizers/{organizerId}`         | View organizer details   |
| PUT    | `/admin/organizers/{organizerId}`         | Update organizer details |
| PATCH  | `/admin/organizers/{organizerId}/archive` | Archive organizer        |

---

## Event Monitoring

Admin only views.

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| GET    | `/admin/events`           | View all events    |
| GET    | `/admin/events/{eventId}` | View event details |

---

## Category Management

| Method | Endpoint                             | Description     |
| ------ | ------------------------------------ | --------------- |
| POST   | `/admin/categories`              | Create category |
| GET    | `/admin/categories`              | View categories |
| PUT    | `/admin/categories/{categoryId}` | Update category |
| DELETE | `/admin/categories/{categoryId}` | Delete category |

---

## Coupon Management

| Method | Endpoint                        | Description   |
| ------ | ------------------------------- | ------------- |
| POST   | `/admin/coupons`            | Create coupon |
| GET    | `/admin/coupons`            | View coupons  |
| GET    | `/admin/coupons/{couponId}` | Coupon details |
| PUT    | `/admin/coupons/{couponId}` | Update coupon |
| DELETE | `/admin/coupons/{couponId}` | Delete coupon |

---

## Reports

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/admin/reports/dashboard` | Platform statistics (all-time) |
| GET    | `/admin/reports/period`    | Period summary (`start_date`, `end_date`) |
| GET    | `/admin/reports/monthly`   | Monthly report       |
| GET    | `/admin/reports/category`  | Category-wise report |

---

## Platform Fee Settings

| Method | Endpoint                            | Description                    |
| ------ | ----------------------------------- | ------------------------------ |
| GET    | `/admin/settings/platform-fees` | View convenience & gateway fees |
| PUT    | `/admin/settings/platform-fees` | Update convenience & gateway fees |

---

## Audit Logs

| Method | Endpoint                        | Description       |
| ------ | ------------------------------- | ----------------- |
| GET    | `/admin/audit-logs`         | View audit logs   |
| GET    | `/admin/audit-logs/{logId}` | Audit log details |

---

# 4. Organizer APIs

## Event Management

| Method | Endpoint                                             | Description         |
| ------ | ---------------------------------------------------- | ------------------- |
| POST   | `/organizer/events`                              | Create draft event  |
| GET    | `/organizer/events`                              | View own events     |
| GET    | `/organizer/events/{eventId}`                    | View event details  |
| PUT    | `/organizer/events/{eventId}`                    | Edit event          |
| PATCH  | `/organizer/events/{eventId}/open-registration`  | Make event public   |
| PATCH  | `/organizer/events/{eventId}/close-registration` | Close registrations |
| PATCH  | `/organizer/events/{eventId}/archive`            | Archive event       |

---

## Event Participants

| Method | Endpoint                                        | Description       |
| ------ | ----------------------------------------------- | ----------------- |
| GET    | `/organizer/events/{eventId}/registrations` | View participants |

---

## Event Sales

| Method | Endpoint                                | Description        |
| ------ | --------------------------------------- | ------------------ |
| GET    | `/organizer/events/{eventId}/sales` | View sales summary |

---

## Organizer Dashboard

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| GET    | `/organizer/dashboard` | Organizer dashboard |

---

## Organizer Reports

| Method | Endpoint                         | Description                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/organizer/reports/period`  | Period summary (`start_date`, `end_date`) |
| GET    | `/organizer/reports/monthly` | Monthly report                           |
| GET    | `/organizer/reports/category`| Category-wise report                     |

---

# 5. Public Event APIs

Accessible without login.

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| GET    | `/events`           | View all public events |
| GET    | `/events/{eventId}` | Event details          |

---

## Event Search

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/events/search` | Search/filter events |

Supported filters:

* title
* organizer
* location
* city
* category
* date
* event type
* keyword

Example

```http
GET /events/search?city=Indore&category=Workshop&type=OFFLINE
```

---

# 6. Registration APIs

No login required.

## Register

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| POST   | `/registrations` | Register for an event |

Request body:

```json
{
  "event_id": "uuid",
  "registrant_name": "string",
  "registrant_phone": "string",
  "registrant_email": "string (optional)",
  "seats_booked": 1,
  "coupon_code": "string (optional)"
}
```

This API:

* validates seat availability
* validates coupon
* reserves seats temporarily
* creates pending registration
* initiates payment simulation page

---

## Registration Details

| Method | Endpoint                              | Description               |
| ------ | ------------------------------------- | ------------------------- |
| GET    | `/registrations/{registrationId}` | View registration details |

---

# 7. Coupon APIs

| Method | Endpoint                | Description                            |
| ------ | ----------------------- | -------------------------------------- |
| POST   | `/coupons/validate` | Validate coupon and calculate discount |

---

# 8. Payment APIs


Create a fake simulation page
User selects seats
        ↓
Click "Proceed to Payment"
        ↓
Fake Payment Screen
    ├── Success
    └── Failure
        ↓
Backend updates booking


---

## Payment Failure

| Method | Endpoint                | Description                                      |
| ------ | ----------------------- | ------------------------------------------------ |
| POST   | `/payments/failure` | Handle failed payment and release reserved seats |

---

## Receipt

| Method | Endpoint                            | Description           |
| ------ | ----------------------------------- | --------------------- |
| GET    | `/payments/{paymentId}/receipt` | Download/view receipt |

---

# Final API Summary

| Module                   |        APIs |
| ------------------------ | ----------: |
| Organizer Authentication |           4 |
| Admin Authentication     |           4 |
| Organizer Registration   |           1 |
| Admin                    |          14 |
| Organizer                |          10 |
| Public Events            |           3 |
| Registration             |           2 |
| Coupons                  |           1 |
| Payments                 |           4 |
| **Total**                | **43 APIs** |

---

## APIs intentionally excluded

These are **not** included because they are outside your finalized scope:

* ❌ Registrant login/account/profile
* ❌ Event approval workflow
* ❌ QR code generation/scanning
* ❌ Attendance marking
* ❌ Registration edit/cancel
* ❌ Ticket transfer
* ❌ Notifications
* ❌ Document upload
* ❌ Reviews/Ratings
* ❌ Favorites/Wishlist
* ❌ Bulk import/export
* ❌ Role & permission management
* ❌ Chat/WebSocket APIs

This API set matches the requirements you've documented while keeping the scope focused on the agreed functionality.
