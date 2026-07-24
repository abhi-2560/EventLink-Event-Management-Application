# This file contains api designing; changes required

Based **strictly on your elicited requirements** (nothing out of scope), these are the APIs I would design. I've grouped them by actor and functionality.

---

# 1. Authentication APIs

## Admin

| Method | Endpoint                          | Purpose         |
| ------ | --------------------------------- | --------------- |
| POST   | `/api/auth/admin/login`           | Admin login     |
| POST   | `/api/auth/admin/logout`          | Logout          |
| POST   | `/api/auth/admin/forgot-password` | Send reset mail |
| POST   | `/api/auth/admin/reset-password`  | Reset password  |

---

## Organizer

| Method | Endpoint                              | Purpose         |
| ------ | ------------------------------------- | --------------- |
| POST   | `/api/auth/organizer/login`           | Organizer login |
| POST   | `/api/auth/organizer/logout`          | Logout          |
| POST   | `/api/auth/organizer/forgot-password` | Send reset mail |
| POST   | `/api/auth/organizer/reset-password`  | Reset password  |

---

# 2. Admin APIs

## Organizer Management
Do not need: Create and Update organizer / registrant
| Method | Endpoint                             | Purpose               |
| ------ | ------------------------------------ | --------------------- |
| GET    | `/api/admin/organizers`              | List organizers       |
| GET    | `/api/admin/organizers/{id}`         | Organizer details     |
| DELETE | `/api/admin/organizers/{id}`         | Hard delete organizer |
| PATCH  | `/api/admin/organizers/{id}/archive` | Soft delete organizer |

---

## Event Management

Admin cannot create events.

| Method | Endpoint                         | Purpose           |
| ------ | -------------------------------- | ----------------- |
| GET    | `/api/admin/events`              | View all events   |
| GET    | `/api/admin/events/{id}`         | Event details     |
| PATCH  | `/api/admin/events/{id}/archive` | Archive event     |
| DELETE | `/api/admin/events/{id}`         | Hard delete event |

---

## Category Management

| Method | Endpoint                     | Purpose         |
| ------ | ---------------------------- | --------------- |
| POST   | `/api/admin/categories`      | Create category |
| GET    | `/api/admin/categories`      | List categories |
| PUT    | `/api/admin/categories/{id}` | Update category |
| DELETE | `/api/admin/categories/{id}` | Delete category |

---

## Coupon Management

| Method | Endpoint                  | Purpose       |
| ------ | ------------------------- | ------------- |
| POST   | `/api/admin/coupons`      | Create coupon |
| GET    | `/api/admin/coupons`      | List coupons  |
| PUT    | `/api/admin/coupons/{id}` | Update coupon |
| DELETE | `/api/admin/coupons/{id}` | Delete coupon |

---

## Reports

| Method | Endpoint                       | Purpose                     |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/api/admin/reports/dashboard` | Overall platform statistics |
| GET    | `/api/admin/reports/monthly`   | Monthly report              |
| GET    | `/api/admin/reports/category`  | Category-wise report        |

---

## Audit Logs

| Method | Endpoint                     | Purpose     |
| ------ | ---------------------------- | ----------- |
| GET    | `/api/admin/audit-logs`      | View logs   |
| GET    | `/api/admin/audit-logs/{id}` | Log details |

---

# 3. Organizer APIs

## Event Management

| Method | Endpoint                                        | Purpose            |
| ------ | ----------------------------------------------- | ------------------ |
| POST   | `/api/organizer/events`                         | Create event       |
| GET    | `/api/organizer/events`                         | My events          |
| GET    | `/api/organizer/events/{id}`                    | Event details      |
| PUT    | `/api/organizer/events/{id}`                    | Update event       |
| PATCH  | `/api/organizer/events/{id}/publish`            | Publish draft      |
| PATCH  | `/api/organizer/events/{id}/close-registration` | Close registration |
| PATCH  | `/api/organizer/events/{id}/archive`            | Archive event      |
| DELETE | `/api/organizer/events/{id}`                    | Hard delete        |

---

## Registration Management

| Method | Endpoint                                   | Purpose           |
| ------ | ------------------------------------------ | ----------------- |
| GET    | `/api/organizer/events/{id}/registrations` | View participants |
| GET    | `/api/organizer/events/{id}/sales`         | View total sales  |

---

# 4. Public Event APIs

No authentication.

## Event Discovery

| Method | Endpoint           | Purpose       |
| ------ | ------------------ | ------------- |
| GET    | `/api/events`      | List events   |
| GET    | `/api/events/{id}` | Event details |

---

## Search

Single search endpoint with filters.

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | `/api/events/search` |

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
/api/events/search?city=Indore&type=OFFLINE
```

---

# 5. Registration APIs

No login required.

---

## Create Registration

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | `/api/registrations` |

This API

* validates seats
* reserves seats
* applies coupon
* creates pending registration
* creates Razorpay order

Returns

```text
Registration ID

Reservation expiry

Razorpay Order
```

---

## Registration Details

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | `/api/registrations/{id}` |

Useful for receipt page.

---

# 6. Coupon API

| Method | Endpoint                |
| ------ | ----------------------- |
| POST   | `/api/coupons/validate` |

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

# 7. Razorpay APIs

## Create Order

| Method | Endpoint                     |
| ------ | ---------------------------- |
| POST   | `/api/payments/create-order` |

---

## Verify Payment

| Method | Endpoint               |
| ------ | ---------------------- |
| POST   | `/api/payments/verify` |

On success

* confirm registration
* decrease seats permanently
* increment coupon usage
* generate receipt

---

## Payment Failure

| Method | Endpoint                |
| ------ | ----------------------- |
| POST   | `/api/payments/failure` |

This releases reserved seats.

---

## Receipt

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | `/api/payments/{paymentId}/receipt` |

---

# 8. Dashboard APIs

## Organizer Dashboard

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | `/api/organizer/dashboard` |

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
| POST   | `/api/auth/organizer/login`           | Organizer login           |
| POST   | `/api/auth/organizer/logout`          | Organizer logout          |
| POST   | `/api/auth/organizer/forgot-password` | Send password reset email |
| POST   | `/api/auth/organizer/reset-password`  | Reset password            |

---

## Admin Authentication

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| POST   | `/api/auth/admin/login`           | Admin login               |
| POST   | `/api/auth/admin/logout`          | Admin logout              |
| POST   | `/api/auth/admin/forgot-password` | Send password reset email |
| POST   | `/api/auth/admin/reset-password`  | Reset password            |

---

# 2. Organizer Registration

Public endpoint.

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| POST   | `/api/organizers/register` | Register as organizer |

---

# 3. Admin APIs

## Organizer Management

| Method | Endpoint                                      | Description              |
| ------ | --------------------------------------------- | ------------------------ |
| GET    | `/api/admin/organizers`                       | View all organizers      |
| GET    | `/api/admin/organizers/{organizerId}`         | View organizer details   |
| PUT    | `/api/admin/organizers/{organizerId}`         | Update organizer details |
| PATCH  | `/api/admin/organizers/{organizerId}/archive` | Archive organizer        |

---

## Event Monitoring

Admin only views.

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| GET    | `/api/admin/events`           | View all events    |
| GET    | `/api/admin/events/{eventId}` | View event details |

---

## Category Management

| Method | Endpoint                             | Description     |
| ------ | ------------------------------------ | --------------- |
| POST   | `/api/admin/categories`              | Create category |
| GET    | `/api/admin/categories`              | View categories |
| PUT    | `/api/admin/categories/{categoryId}` | Update category |
| DELETE | `/api/admin/categories/{categoryId}` | Delete category |

---

## Coupon Management

| Method | Endpoint                        | Description   |
| ------ | ------------------------------- | ------------- |
| POST   | `/api/admin/coupons`            | Create coupon |
| GET    | `/api/admin/coupons`            | View coupons  |
| PUT    | `/api/admin/coupons/{couponId}` | Update coupon |
| DELETE | `/api/admin/coupons/{couponId}` | Delete coupon |

---

## Reports

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/api/admin/reports/dashboard` | Platform statistics  |
| GET    | `/api/admin/reports/monthly`   | Monthly report       |
| GET    | `/api/admin/reports/category`  | Category-wise report |

---

## Audit Logs

| Method | Endpoint                        | Description       |
| ------ | ------------------------------- | ----------------- |
| GET    | `/api/admin/audit-logs`         | View audit logs   |
| GET    | `/api/admin/audit-logs/{logId}` | Audit log details |

---

# 4. Organizer APIs

## Event Management

| Method | Endpoint                                             | Description         |
| ------ | ---------------------------------------------------- | ------------------- |
| POST   | `/api/organizer/events`                              | Create draft event  |
| GET    | `/api/organizer/events`                              | View own events     |
| GET    | `/api/organizer/events/{eventId}`                    | View event details  |
| PUT    | `/api/organizer/events/{eventId}`                    | Edit event          |
| PATCH  | `/api/organizer/events/{eventId}/open-registration`  | Make event public   |
| PATCH  | `/api/organizer/events/{eventId}/close-registration` | Close registrations |
| PATCH  | `/api/organizer/events/{eventId}/archive`            | Archive event       |

---

## Event Participants

| Method | Endpoint                                        | Description       |
| ------ | ----------------------------------------------- | ----------------- |
| GET    | `/api/organizer/events/{eventId}/registrations` | View participants |

---

## Event Sales

| Method | Endpoint                                | Description        |
| ------ | --------------------------------------- | ------------------ |
| GET    | `/api/organizer/events/{eventId}/sales` | View sales summary |

---

## Organizer Dashboard

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| GET    | `/api/organizer/dashboard` | Organizer dashboard |

---

# 5. Public Event APIs

Accessible without login.

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| GET    | `/api/events`           | View all public events |
| GET    | `/api/events/{eventId}` | Event details          |

---

## Event Search

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/api/events/search` | Search/filter events |

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
GET /api/events/search?city=Indore&category=Workshop&type=OFFLINE
```

---

# 6. Registration APIs

No login required.

## Register

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| POST   | `/api/registrations` | Register for an event |

This API:

* validates seat availability
* validates coupon
* reserves seats temporarily
* creates pending registration
* initiates Razorpay payment

---

## Registration Details

| Method | Endpoint                              | Description               |
| ------ | ------------------------------------- | ------------------------- |
| GET    | `/api/registrations/{registrationId}` | View registration details |

---

# 7. Coupon APIs

| Method | Endpoint                | Description                            |
| ------ | ----------------------- | -------------------------------------- |
| POST   | `/api/coupons/validate` | Validate coupon and calculate discount |

---

# 8. Payment APIs

## Create Razorpay Order

| Method | Endpoint                     | Description           |
| ------ | ---------------------------- | --------------------- |
| POST   | `/api/payments/create-order` | Create Razorpay order |

---

## Verify Payment

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| POST   | `/api/payments/verify` | Verify payment signature |

This API will:

* confirm registration
* permanently allocate seats
* update coupon usage
* generate receipt
* write audit logs

---

## Payment Failure

| Method | Endpoint                | Description                                      |
| ------ | ----------------------- | ------------------------------------------------ |
| POST   | `/api/payments/failure` | Handle failed payment and release reserved seats |

---

## Receipt

| Method | Endpoint                            | Description           |
| ------ | ----------------------------------- | --------------------- |
| GET    | `/api/payments/{paymentId}/receipt` | Download/view receipt |

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
