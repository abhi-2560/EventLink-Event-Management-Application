# Event Management Platform — Final API Documentation

> Generated from the Flask backend implementation (`backend/app/`).  
> Last aligned with source: application version **0.1.0** (`APP_VERSION`).

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Standard Formats](#standard-formats)
4. [Health & Root](#health--root)
5. [Authentication Endpoints](#authentication-endpoints)
6. [Public Endpoints](#public-endpoints)
7. [Organizer Endpoints](#organizer-endpoints)
8. [Admin Endpoints](#admin-endpoints)
9. [Cross-Cutting Flows](#cross-cutting-flows)
10. [Common Workflows](#common-workflows)
11. [Environment Variables](#environment-variables)

---

## Overview

| Property | Value |
|----------|-------|
| **API version** | `0.1.0` (metadata only; exposed in `GET /health` as `version`) |
| **URL versioning** | None (no `/v1` prefix) |
| **Flask base URL (dev)** | `http://localhost:5000` |
| **Frontend proxy prefix** | `/api` (Vite strips `/api` before forwarding to Flask) |
| **Effective browser base URL** | `http://localhost:5173/api` (user), `http://localhost:5174/api` (admin) |
| **Content-Type** | `application/json` unless noted (multipart for uploads) |
| **CORS** | Enabled with credentials; origins from `CORS_ORIGINS` |
| **Request tracing** | All responses include `X-Request-ID` |

### Blueprint map

| Blueprint | Prefix | Auth |
|-----------|--------|------|
| Health | *(none)* | Public |
| Auth | `/auth` | Mixed |
| Public | *(none)* | Public |
| Organizer | `/organizer` | Organizer JWT |
| Admin | `/admin` | Admin JWT |

---

## Authentication & Authorization

### Actor types

| Actor | Authentication | Access |
|-------|----------------|--------|
| **Public user** (registrant) | None | Browse events, register, pay, view receipt |
| **Organizer** | JWT (`actor_type: organizer`) | Own events, registrations, sales, profile, media |
| **Admin** | JWT (`actor_type: admin`) | Platform management, reports, audit logs, settings |

Registrants are **not** account holders. Identity at booking time is contact info (name, phone, optional email).

### Access token

- **Header:** `Authorization: Bearer <access_token>`
- **JWT claims:** `sub` (actor UUID), `actor_type`, `email`, `name`
- **TTL:** `JWT_ACCESS_TOKEN_EXPIRES_SECONDS` (default **900** / 15 minutes)
- **Library:** `flask-jwt-extended`

### Refresh token

- **Delivery:** HttpOnly cookie (`refresh_token_admin` or `refresh_token_organizer`)
- **TTL:** `JWT_REFRESH_TOKEN_EXPIRES_SECONDS` (default **30 days**)
- **Rotation:** Family-based replay detection; reused tokens revoke the whole family
- **Storage:** SHA-256 hash only (raw token never stored)

**Refresh request requirements:**

```http
POST /auth/refresh
X-Refresh-Request: 1
X-Actor-Type: admin|organizer
Cookie: refresh_token_<actor_type>=<token>
```

If `Origin` header is present, it must be in `CORS_ORIGINS`.

### Authorization decorators

| Decorator | Requirement |
|-----------|-------------|
| `@jwt_required()` | Valid access token (logout routes) |
| `@admin_required` | JWT + `actor_type == "admin"` |
| `@organizer_required` | JWT + `actor_type == "organizer"` |

Wrong actor type → **403** `{"error": "Admin access required"}` or `{"error": "Organizer access required"}`.

### Password rules (registration & reset)

- Minimum 8 characters
- At least one lowercase, one uppercase, one digit

---

## Standard Formats

### Success responses

- JSON body (object or array)
- Status codes: **200**, **201**
- Decimal money values serialized as **strings** (e.g. `"500.00"`)
- Datetimes as **ISO-8601** strings

### Error responses

```json
{
  "error": "Human-readable message"
}
```

JWT errors additionally include:

```json
{
  "error": "Authentication is required",
  "reason": "Token has expired"
}
```

| Exception | HTTP Status |
|-----------|-------------|
| `ServiceError` (base) | 400 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError`, `SeatsUnavailableError`, `PaymentAlreadyProcessedError` | 409 |
| `ValidationError`, `CouponInvalidError` | 422 |
| `ServiceUnavailableError` | 503 |
| Unhandled exception | 500 |

### Pagination (audit logs only)

**Request:** `page` (default 1), `page_size` (default 20, max 100)

**Response:**

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 42,
  "total_pages": 3
}
```

### Filtering & sorting

| Area | Mechanism |
|------|-----------|
| Public event search | Query params (AND filters); ordered by `start_datetime` ASC |
| Audit logs | Query filters + pagination; ordered by `created_at` DESC |
| Reports | `start_date`, `end_date` (ISO-8601, `Z` supported); admin monthly also accepts `months` |
| Other list endpoints | Full arrays (no server pagination) |

---

## Health & Root

### `GET /`

| | |
|---|---|
| **Purpose** | API liveness check |
| **Auth** | None |
| **Success (200)** | `{"message": "Event Management API is running"}` |

### `GET /health`

| | |
|---|---|
| **Purpose** | Readiness check (includes DB connectivity) |
| **Auth** | None |

**Success (200):**

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-08-05T12:00:00+00:00",
  "version": "0.1.0"
}
```

**Failure (503):**

```json
{
  "status": "unavailable",
  "database": "unavailable",
  "timestamp": "2026-08-05T12:00:00+00:00",
  "version": "0.1.0"
}
```

---

## Authentication Endpoints

Base path: `/auth`

### `POST /auth/login` — Unified login

| | |
|---|---|
| **Roles** | Public |
| **Body** | `actor_type` (`admin` \| `organizer`), `email`, `password` |

**Validation:** All three fields required; `actor_type` must be `admin` or `organizer`.

**Success (200):**

```json
{
  "access_token": "eyJ...",
  "actor_type": "organizer",
  "expires_in": 900
}
```

**Set-Cookie:** `refresh_token_<actor_type>` (HttpOnly)

**Errors:** 422 invalid credentials / inactive account; audit log `Failed Login` on bad password.

**Side effects:** Updates `last_login`; audit `Admin Login` / `Organizer Login`; issues refresh token.

---

### `POST /auth/admin/login` | `POST /auth/organizer/login`

Same as unified login but actor type is implicit from the path.

---

### `POST /auth/refresh`

| | |
|---|---|
| **Roles** | Public (cookie-based) |
| **Headers** | `X-Refresh-Request: 1`, `X-Actor-Type: admin\|organizer` |
| **Cookies** | `refresh_token_admin` or `refresh_token_organizer` |

**Success (200):** Same shape as login; rotates refresh cookie.

**Errors (422):** Missing header, invalid/expired/replayed refresh token, inactive account.

---

### `POST /auth/logout` | `POST /auth/admin/logout` | `POST /auth/organizer/logout`

| | |
|---|---|
| **Auth** | Bearer access token |
| **Actor check** | Path-specific logout validates `actor_type` |

**Success (200):** `{"message": "Logged out"}`

**Side effects:** Revokes refresh token; clears cookie; audit `Logout`.

---

### `POST /auth/register/organizer` | `POST /organizers/register`

| | |
|---|---|
| **Roles** | Public |
| **Body** | `organizer_name`, `contact_person`, `email`, `phone`, `password` |

**Validation:**
- All fields required
- Email format check; phone `^[0-9+\-\s()]{10,15}$`
- Password strength rules
- Duplicate email → 409

**Success (201):** `serialize_organizer()` object.

**Side effects:** Creates organizer (`status: ACTIVE`); password stored as hash.

---

### Password reset

| Endpoint | Body |
|----------|------|
| `POST /auth/password-reset/request` | `actor_type`, `email` |
| `POST /auth/admin/forgot-password` | `email` |
| `POST /auth/organizer/forgot-password` | `email` |
| `POST /auth/password-reset/confirm` | `token`, `new_password` |
| `POST /auth/admin/reset-password` | `token`, `new_password` |
| `POST /auth/organizer/reset-password` | `token`, `new_password` |

**Request response (always 200):** `{"message": "If that email exists, a reset link has been sent."}`

**Confirm success (200):** `{"message": "Password updated"}`

**Token:** Signed with `SECRET_KEY`, salt `password-reset`, **30-minute** expiry.

**Side effects:** Password hash update; audit `Password Reset`.

> **Note:** Token generation occurs server-side; no email delivery is implemented in the API layer.

---

## Public Endpoints

No authentication required unless noted.

### Events

#### `GET /events`

List all **PUBLISHED**, non-archived events ordered by start date.

**Success (200):** Array of event objects with platform fees included.

#### `GET /events/search`

| Query param | Aliases | Description |
|-------------|---------|-------------|
| `title` | — | Partial match (ILIKE) |
| `city` | `location` | Partial match |
| `category_id` | — | Exact UUID |
| `category` | — | Category name (ILIKE) |
| `type` | — | `ONLINE`, `OFFLINE`, `HYBRID` |
| `organizer` | — | Organizer name (ILIKE) |
| `keyword` | — | Keywords array match |
| `date` | — | Single day (sets day range) |
| `date_from`, `date_to` | — | ISO-8601 range on `start_datetime` |

**Success (200):** Filtered event array.

**Errors (422):** Invalid date format.

#### `GET /events/<event_id>`

**Success (200):** Event with `images`, `videos`, platform fees.

**Errors (404):** Not published or archived.

**Event object (public):**

```json
{
  "event_id": "uuid",
  "organizer_id": "uuid",
  "organizer_name": "Acme Events",
  "category_id": "uuid",
  "category_name": "Conference",
  "title": "Indore Tech Summit",
  "description": "...",
  "event_type": "OFFLINE",
  "venue": "Convention Center",
  "city": "Indore",
  "state": "MP",
  "country": "India",
  "meeting_link": null,
  "keywords": ["tech"],
  "ticket_price": "100.00",
  "is_free": false,
  "convenience_fee": "5.00",
  "gateway_fee": "2.00",
  "capacity": 100,
  "available_seats": 50,
  "registration_start": "2026-08-01T00:00:00+00:00",
  "registration_end": "2026-08-30T23:59:59+00:00",
  "start_datetime": "2026-09-01T10:00:00+00:00",
  "status": "PUBLISHED",
  "registration_status": "OPEN",
  "banner_url": "https://...",
  "images": [{"media_id": "uuid", "media_type": "IMAGE", "media_url": "...", "display_order": 0, "created_at": "..."}],
  "videos": []
}
```

---

### Registrations

#### `POST /registrations`

| | |
|---|---|
| **Purpose** | Create booking with 15-minute seat hold |
| **Body** | See below |

**Request body:**

```json
{
  "event_id": "uuid",
  "registrant_name": "Jane Doe",
  "registrant_phone": "9876543210",
  "seats_booked": 2,
  "registrant_email": "jane@example.com",
  "coupon_code": "SAVE10"
}
```

**Validation (`validate_registration_payload`):**
- `event_id`: valid UUID
- `registrant_name`: required, max 255
- `registrant_phone`: required, 10–15 chars pattern
- `seats_booked`: positive integer (default 1)
- `registrant_email`: optional, valid email

**Business rules:**
- Event must be `PUBLISHED`, not archived, `registration_status == OPEN`
- Atomic seat reservation; 409 if insufficient seats
- Expired holds swept lazily before booking
- Coupon validated and redeemed if provided
- Total = `(ticket_price × seats) + convenience_fee + gateway_fee − discount` (min 0)
- Free events: `ticket_price` treated as 0
- Auto-creates payment + `order_id`

**Success (201):**

```json
{
  "registration_id": "uuid",
  "event_id": "uuid",
  "event_title": "Indore Tech Summit",
  "registrant_name": "Jane Doe",
  "registrant_phone": "9876543210",
  "seats_booked": 2,
  "ticket_price": "100.00",
  "discount_amount": "10.00",
  "convenience_fee": "5.00",
  "gateway_fee": "2.00",
  "total_amount": "197.00",
  "reservation_status": "RESERVED",
  "registration_status": "PENDING",
  "reservation_expires_at": "2026-08-05T12:15:00+00:00",
  "coupon_code": "SAVE10",
  "payment_id": "uuid",
  "order_id": "ORD-A1B2C3D4",
  "amount": "197.00"
}
```

**Errors:** 404 event not found; 409 registration closed / no seats; 422 validation; 422 coupon invalid.

**Side effects:** Seat decrement; registration row; payment initiated; audit `Registration Created`, `Seats Reserved`, optional `Coupon Applied`.

#### `GET /registrations/<registration_id>`

**Success (200):** Registration object; includes `payment_id` and `order_id` if payment exists.

---

### Coupons

#### `POST /coupons/validate`

**Body:** `coupon_code`, `event_id`, `seat_count` (default 1, min 1)

**Success (200):**

```json
{
  "coupon_code": "SAVE10",
  "discount": "10.00",
  "subtotal": "207.00",
  "final_amount": "197.00"
}
```

**Errors (422):** Missing fields; invalid/inactive/expired coupon.

> Coupon is **not** consumed by validate — consumption happens at registration.

---

### Payments (simulated gateway)

Payments are **simulated in-process**. Column names reuse Razorpay naming but no external gateway is called.

#### `POST /payments/create-order`

**Body:** `registration_id`

**Success (200):**

```json
{
  "payment_id": "uuid",
  "registration_id": "uuid",
  "order_id": "ORD-A1B2C3D4",
  "amount": "197.00",
  "currency": "INR"
}
```

**Errors:** 409 registration not pending / already paid.

#### `POST /payments/verify`

**Body:** `registration_id`, `order_id`

**Success (200):** Full `serialize_payment()` receipt snapshot.

**Idempotency:** If payment already `SUCCESS` or `FAILED`, returns existing payment (no-op).

**Side effects:** Payment → `SUCCESS`; generates `PAY-*` ref and `RCPT-*` receipt; confirms registration; bumps event/organizer/category sales totals; audit `Payment Success`, `Receipt Generated`.

#### `POST /payments/failure`

**Body:** `registration_id`, optional `failure_reason`

**Success (200):** Payment object with `payment_status: "FAILED"`.

**Side effects:** Releases seats; registration → `FAILED`; audit `Payment Failed`.

#### `GET /payments/<payment_id>/receipt`

**Success (200):** Payment/receipt object (only `SUCCESS` payments).

**Errors (404):** Payment not found or not successful.

---

## Organizer Endpoints

Base path: `/organizer`  
**Auth:** `Authorization: Bearer <organizer_token>`

### Events

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/organizer/events` | List own events (internal fields + fees) |
| GET | `/organizer/events/browse` | Read-only all events |
| POST | `/organizer/events` | Create draft event |
| GET | `/organizer/events/<event_id>` | Own event detail + media |
| PUT | `/organizer/events/<event_id>` | Update event |
| PUT | `/organizer/events/<event_id>/capacity` | Update capacity only |
| POST/PATCH | `/organizer/events/<event_id>/publish` | Publish event |
| POST | `/organizer/events/<event_id>/close-registration` | Close registration |
| POST | `/organizer/events/<event_id>/archive` | Archive event |

#### `POST /organizer/events` — Create event

**Body (validated via `validate_event_payload`, `creating=true`):**

| Field | Required | Rules |
|-------|----------|-------|
| `category_id` | Yes | Valid UUID, existing category |
| `title` | Yes | Non-empty, max 255 |
| `capacity` | Yes | Positive integer |
| `description` | No | — |
| `event_type` | No | `ONLINE`, `OFFLINE`, `HYBRID` |
| `ticket_price` | No | Non-negative decimal |
| `venue`, `city`, `state`, `country` | No | — |
| `meeting_link` | No | Valid HTTP(S) URL |
| `keywords` | No | Array |
| `start_datetime` | No | ISO-8601 |
| `registration_start`, `registration_end` | No | ISO-8601; end > start; end ≤ event start |
| `registration_status` | No | `OPEN` \| `CLOSED` |
| `is_free` | No | Boolean |

**Success (201):** Event object with internal fields.

**Side effects:** Increments organizer/category event counts; audit `Event Created`.

#### `POST /organizer/events/<event_id>/publish`

**Publish validation (`_validate_event_for_publish`):**
- Title ≥ 3 characters
- `category_id`, `event_type`, `start_datetime`, `capacity` required
- OFFLINE → `city` required
- ONLINE/HYBRID → `meeting_link` required
- Free events → `ticket_price` must be 0
- Paid events → `ticket_price ≥ 0`
- Registration window valid if both dates set

**Errors:** 409 if status not `DRAFT` or `ARCHIVED`; 422 validation failures.

**Side effects:** Status → `PUBLISHED`; may restore counts if re-publishing archived event; audit `Event Published`.

#### `PUT /organizer/events/<event_id>/capacity`

**Body:** `capacity` (positive integer)

**Business rule:** Cannot reduce below already-booked seats (`capacity - available_seats`).

**Errors (422):** `Cannot reduce capacity to X; Y seats are already booked`

**Ownership:** 403 if organizer does not own event.

---

### Media uploads

| Method | Path | Content-Type | Fields |
|--------|------|--------------|--------|
| POST | `/organizer/events/<event_id>/banner` | `multipart/form-data` | `file` |
| DELETE | `/organizer/events/<event_id>/banner` | — | — |
| POST | `/organizer/events/<event_id>/media` | `multipart/form-data` | `file`, `media_type` (`IMAGE` \| `VIDEO`) |
| DELETE | `/organizer/events/<event_id>/media/<media_id>` | — | — |

**Validation:**
- Images: `image/jpeg`, `image/png`, `image/webp` — max **5 MB** (`MAX_IMAGE_UPLOAD_BYTES`)
- Videos: `video/mp4`, `video/webm` — max **50 MB** (`MAX_VIDEO_UPLOAD_BYTES`)

**Errors (503):** Cloudinary not configured (`CLOUDINARY_*` env vars missing).

**Side effects:** Cloudinary upload/destroy; updates `banner_url` or `EventMedia` rows; audit `Banner uploaded/updated/deleted`, `Image/Video uploaded/deleted`.

**Media upload success (201):**

```json
{
  "media_id": "uuid",
  "media_type": "IMAGE",
  "media_url": "https://res.cloudinary.com/...",
  "display_order": 0
}
```

---

### Registrations & sales

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/organizer/events/<event_id>/registrations` | List registrations + payment status |
| GET | `/organizer/events/<event_id>/registrations/<registration_id>` | Registration detail |
| GET | `/organizer/sales` | Total sales amount |
| GET | `/organizer/sales/summary` | Totals + 20 recent transactions |
| GET | `/organizer/events/<event_id>/sales` | Per-event sales breakdown |

---

### Dashboard & reports

| Method | Path | Query params |
|--------|------|--------------|
| GET | `/organizer/dashboard` | — |
| GET | `/organizer/reports/period` | `start_date`, `end_date` |
| GET | `/organizer/reports/monthly` | `start_date`, `end_date` |
| GET | `/organizer/reports/category` | `start_date`, `end_date` |

**Dashboard response (200):**

```json
{
  "total_events": 5,
  "active_events": 3,
  "draft_events": 1,
  "closed_events": 1,
  "archived_events": 0,
  "total_registrations": 25,
  "total_revenue": "5000.00",
  "total_tickets_sold": 40,
  "upcoming_events": [
    {
      "event_id": "uuid",
      "title": "Indore Tech Summit",
      "start_datetime": "2026-09-01T10:00:00+00:00",
      "city": "Indore",
      "available_seats": 50
    }
  ]
}
```

---

### Profile

| Method | Path | Body |
|--------|------|------|
| GET | `/organizer/profile` | — |
| PUT | `/organizer/profile` | `organizer_name`, `contact_person`, `phone` (any subset) |
| POST | `/organizer/profile/change-password` | `current_password`, `new_password` |

**Side effects (profile update):** Cascades organizer name/contact to non-archived event snapshots; audit `Organizer Updated`.

---

### Categories

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/organizer/categories` | List all categories (read-only) |

---

## Admin Endpoints

Base path: `/admin`  
**Auth:** `Authorization: Bearer <admin_token>`

### Organizers

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/organizers` | List all |
| GET | `/admin/organizers/<organizer_id>` | Detail |
| PUT | `/admin/organizers/<organizer_id>` | Update (`organizer_name`, `contact_person`, `email`, `phone`) |
| PATCH/POST | `/admin/organizers/<organizer_id>/archive` | Set `INACTIVE`, `archived_at` |
| DELETE | `/admin/organizers/<organizer_id>` | Soft delete (same as archive, different audit action) |

---

### Events

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/events` | List all events |
| GET | `/admin/events/<event_id>` | Event detail |
| PUT | `/admin/events/<event_id>` | Update event fields |
| PATCH/POST | `/admin/events/<event_id>/archive` | Archive event |
| DELETE | `/admin/events/<event_id>` | Soft delete |

> Admins **cannot create** events.

---

### Categories

| Method | Path | Body / notes |
|--------|------|--------------|
| GET | `/admin/categories` | — |
| POST | `/admin/categories` | `name`, `description`, `is_default` |
| PUT | `/admin/categories/<category_id>` | Partial update |
| DELETE | `/admin/categories/<category_id>` | Hard delete if no events |
| PATCH | `/admin/categories/<category_id>/archive` | Archive; returns category if had events |

---

### Coupons

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/coupons` | List all |
| POST | `/admin/coupons` | Create |
| GET | `/admin/coupons/<coupon_id>` | Detail |
| PUT | `/admin/coupons/<coupon_id>` | Update |
| DELETE | `/admin/coupons/<coupon_id>` | Soft delete (`is_active = false`) |

**Create body:** `code`, `flat_discount`, optional `description`, `expiry_date`, `is_active`

**Validation:** Code uppercased, max 100 chars, unique; `flat_discount > 0`; future `expiry_date` if set.

**Side effects:** Audit `Coupon Created/Updated/Deleted`.

---

### Reports

| Method | Path | Query | Response |
|--------|------|-------|----------|
| GET | `/admin/reports/summary` | — | Platform totals |
| GET | `/admin/reports/dashboard` | — | Same as summary |
| GET | `/admin/reports/period` | `start_date`, `end_date` | Period metrics |
| GET | `/admin/reports/monthly` | `months` or date range | Monthly bar chart array |
| GET | `/admin/reports/category` | `start_date`, `end_date` | Category breakdown |
| GET | `/admin/reports/category-breakdown` | same | Legacy alias |

**Dashboard summary (200):**

```json
{
  "total_organizers": 4,
  "total_events": 10,
  "active_events": 6,
  "total_registrations": 25,
  "total_tickets_sold": 40,
  "total_revenue": "5000.00",
  "total_value_earned": "5000.00"
}
```

---

### Audit logs

#### `GET /admin/audit-logs`

| Query param | Description |
|-------------|-------------|
| `page`, `page_size` | Pagination |
| `entity_type` | Filter by entity type |
| `entity_id` | Filter by entity UUID |
| `actor_type` | `ADMIN`, `ORGANIZER`, `SYSTEM` |
| `action` | Partial match (ILIKE) |
| `search`, `keyword` | Search entity name, actor name/email, action |
| `organizer`, `event` | Filter `entity_name` (ILIKE) |

**Success (200):** Paginated `serialize_audit_log` items.

#### `GET /admin/audit-logs/<log_id>`

**Success (200):** Single audit log object.

**Audit log shape:**

```json
{
  "log_id": "uuid",
  "actor_type": "ADMIN",
  "actor_id": "uuid",
  "actor_name": "Admin User",
  "actor_email": "admin@test.local",
  "entity_type": "coupon",
  "entity_id": "uuid",
  "entity_name": "SAVE10",
  "action": "Coupon Created",
  "old_value": null,
  "new_value": null,
  "created_at": "2026-08-01T10:00:00+00:00"
}
```

> Audit logs are **write-only via services** — no public create endpoint.

---

### Platform settings

| Method | Path | Body |
|--------|------|------|
| GET | `/admin/settings/platform-fees` | — |
| PUT | `/admin/settings/platform-fees` | `convenience_fee`, `gateway_fee` |

**GET success (200):**

```json
{
  "convenience_fee": "5.00",
  "gateway_fee": "2.00",
  "updated_at": "2026-08-01T10:00:00+00:00"
}
```

**Validation:** Both fees required; non-negative decimals; applied to all admin rows.

---

### Admin profile

| Method | Path | Body |
|--------|------|------|
| GET | `/admin/profile` | — |
| PUT | `/admin/profile` | `name` |
| POST | `/admin/profile/change-password` | `current_password`, `new_password` |

---

## Cross-Cutting Flows

### Event registration flow

```
1. GET /events or /events/search          → Browse
2. GET /events/<id>                       → Event detail
3. POST /coupons/validate (optional)      → Preview discount
4. POST /registrations                    → Hold seats (15 min), create payment
5. POST /payments/create-order (optional) → Re-initiate order if needed
6. POST /payments/verify                  → Confirm booking + receipt
   OR POST /payments/failure             → Release seats
7. GET /payments/<payment_id>/receipt     → Download/print receipt
```

**Hold expiry:** After 15 minutes, unconfirmed `RESERVED` registrations expire; seats released on next registration attempt for that event.

### Payment & receipt flow

- Receipt data is **frozen on the Payment row** at success time (event snapshot, buyer info, fees).
- `receipt_number` format: `RCPT-<hex>`
- `order_id` format: `ORD-<hex>`
- Payment ref format: `PAY-<hex>`

### Coupon flow

1. Admin creates coupon → platform-wide, not event-specific
2. Public validates → preview only
3. Registration applies → `redeem()` increments `times_used` atomically
4. Invalid at registration if coupon became inactive between validate and book

### File upload flow

1. Organizer uploads banner/media to draft or published event
2. File validated (type, size)
3. Uploaded to Cloudinary under `event-management/<event_id>/...`
4. URL stored on event or `EventMedia` table
5. Previous banner destroyed on replacement

---

## Common Workflows

### 1. Organizer login & create event

```http
POST /auth/organizer/login
Content-Type: application/json

{"email": "organizer@test.local", "password": "Organizer@123"}
```

```http
POST /organizer/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "category_id": "cat-uuid",
  "title": "Indore Tech Summit",
  "capacity": 100,
  "event_type": "OFFLINE",
  "city": "Indore",
  "ticket_price": 100,
  "start_datetime": "2026-09-01T10:00:00+00:00"
}
```

```http
POST /organizer/events/<event_id>/publish
Authorization: Bearer <token>
```

### 2. Public registration & payment

```http
POST /registrations
Content-Type: application/json

{
  "event_id": "event-uuid",
  "registrant_name": "Jane Doe",
  "registrant_phone": "9876543210",
  "seats_booked": 2,
  "coupon_code": "SAVE10"
}
```

```http
POST /payments/verify
Content-Type: application/json

{
  "registration_id": "reg-uuid",
  "order_id": "ORD-A1B2C3D4"
}
```

```http
GET /payments/<payment_id>/receipt
```

### 3. Upload event banner

```http
POST /organizer/events/<event_id>/banner
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=<image binary>
```

### 4. Admin refresh token

```http
POST /auth/refresh
X-Refresh-Request: 1
X-Actor-Type: admin
Cookie: refresh_token_admin=...
```

### 5. Token refresh from frontend (with credentials)

The user/admin frontends call `/api/auth/refresh` with `withCredentials: true` so the HttpOnly cookie is sent.

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `SECRET_KEY` | — | Flask secret; password-reset signing |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET_KEY` | `SECRET_KEY` | JWT signing key |
| `JWT_ACCESS_TOKEN_EXPIRES_SECONDS` | `900` | Access token TTL |
| `JWT_REFRESH_TOKEN_EXPIRES_SECONDS` | `2592000` | Refresh token TTL (30 days) |
| `REFRESH_COOKIE_SECURE` | `false` | HTTPS-only refresh cookies |
| `REFRESH_COOKIE_SAMESITE` | `Lax` | Cookie SameSite policy |
| `REFRESH_COOKIE_DOMAIN` | — | Optional cookie domain |
| `REFRESH_COOKIE_PATH` | `/api/auth` | Refresh cookie path |
| `CORS_ORIGINS` | localhost Vite ports | Allowed origins (comma-separated) |
| `CLOUDINARY_CLOUD_NAME` | — | Media upload (required for uploads) |
| `CLOUDINARY_API_KEY` | — | Media upload |
| `CLOUDINARY_API_SECRET` | — | Media upload |
| `MAX_IMAGE_UPLOAD_BYTES` | `5242880` | 5 MB image limit |
| `MAX_VIDEO_UPLOAD_BYTES` | `52428800` | 50 MB video limit |
| `APP_VERSION` | `0.1.0` | Health endpoint version |
| `LOG_LEVEL` | `INFO` | Logging verbosity |
| `FLASK_ENV` | `development` | Environment label |

**Test-only:**

| Variable | Purpose |
|----------|---------|
| `TEST_DATABASE_URL` | Isolated test database |
| `TEST_SECRET_KEY` | Test Flask secret |
| `TEST_JWT_SECRET_KEY` | Test JWT secret |

---

## Implementation Notes

1. **No email delivery** — password reset tokens are generated but not emailed by the API.
2. **No real payment gateway** — `verify`/`failure` endpoints simulate payment outcomes.
3. **List endpoints** — most return full arrays; only audit logs paginate server-side.
4. **Soft deletes** — organizers, events, coupons use status/archive flags rather than hard DELETE in most cases.
5. **Decimal serialization** — all monetary values returned as strings to avoid float precision issues.
6. **Ownership enforcement** — organizer event routes call `_owns_event()` → 403 if mismatch.
7. **Registration phone lookup** — `booking_service.get_for_receipt()` exists for phone-verified receipt access but has **no dedicated HTTP route**; use `GET /payments/<payment_id>/receipt` with the `payment_id` from registration.

---

## Source Reference

| Module | Path |
|--------|------|
| App factory | `backend/app/__init__.py` |
| Auth routes | `backend/app/routes/auth/routes.py` |
| Public routes | `backend/app/routes/public/` |
| Organizer routes | `backend/app/routes/organizer/` |
| Admin routes | `backend/app/routes/admin/` |
| Serializers | `backend/app/utils/serializers.py` |
| Validation | `backend/app/validation/` |
| Services | `backend/app/services/` |
| Auth decorators | `backend/app/middleware/auth_decorators.py` |
