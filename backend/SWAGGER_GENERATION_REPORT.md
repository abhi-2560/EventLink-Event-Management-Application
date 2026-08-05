# Swagger / OpenAPI Generation Report

## Overview

A complete **OpenAPI 3.1** specification was generated from the Flask backend implementation and integrated with **Swagger UI** at runtime.

| Artifact | Location |
|----------|----------|
| OpenAPI YAML (generated) | `backend/openapi.yaml` |
| OpenAPI JSON (generated) | `backend/swagger.json` |
| Spec builder (source of truth) | `backend/app/openapi/` |
| Export & validation script | `backend/scripts/export_openapi.py` |
| Swagger UI blueprint | `backend/app/routes/docs.py` |

**Live endpoints (Flask):**

| URL | Purpose |
|-----|---------|
| `GET /docs` | Swagger UI |
| `GET /openapi.yaml` | OpenAPI YAML download |
| `GET /swagger.json` | OpenAPI JSON download |

---

## Coverage Summary

| Metric | Count |
|--------|-------|
| Flask API operations (excl. docs routes) | **89** |
| OpenAPI path entries | **71** |
| OpenAPI operations (methods per path) | **89** |
| Reusable component schemas | **38** |
| Security scheme | `BearerAuth` (JWT) |

**Parity check:** All 89 Flask API operations match the OpenAPI document (Flask `<param>` vs OpenAPI `{param}` naming only).

**Documentation routes** (`/docs`, `/openapi.yaml`, `/swagger.json`) are served by Flask but intentionally excluded from the API spec body.

---

## Modules Documented

### Root & Health (2 operations)
- `GET /` — API root message
- `GET /health` — readiness with DB check

### Auth — `/auth` (16 operations)
- Unified and role-specific login/logout
- Refresh token (`X-Actor-Type`, `X-Refresh-Request`, HttpOnly cookie)
- Organizer registration
- Password reset request/confirm (unified + admin/organizer variants)

### Public (13 operations)
- Events list, search, detail
- Organizer registration (`/organizers/register`)
- Coupon validation
- Registration create/get
- Payment create-order, verify, failure, receipt

### Organizer — `/organizer` (30 operations)
- Events CRUD, publish (POST + PATCH), archive, capacity, close registration
- Banner & media upload/delete (`multipart/form-data`)
- Registrations, sales, dashboard, reports, profile, categories

### Admin — `/admin` (28 operations)
- Organizers, categories, coupons, events (no create)
- Profile, platform fees, reports, audit logs (paginated)

---

## Implementation Details

### Spec generation approach

The spec is built programmatically in Python (`app/openapi/build.py`) from:

- `schemas.py` — component schemas aligned with `app/utils/serializers.py`
- `paths.py` — every route handler mapped to OpenAPI operations

Generated files are written by:

```bash
cd backend
python scripts/export_openapi.py
```

This validates the spec twice (in-memory + file) using `openapi-spec-validator`.

### Security

- **BearerAuth** — JWT access token (`Authorization: Bearer <token>`)
- Public endpoints set `security: []`
- Refresh documented with required headers (cookie auth not fully automatable in Swagger UI; `credentials: 'include'` enabled for Try-it-out)

### Multipart endpoints

| Endpoint | Fields |
|----------|--------|
| `POST /organizer/events/{event_id}/banner` | `file` (binary) |
| `POST /organizer/events/{event_id}/media` | `file`, `media_type` (`IMAGE` \| `VIDEO`) |

### Dual-method routes

These Flask routes accept both POST and PATCH; both are documented:

- `POST|PATCH /admin/organizers/{organizer_id}/archive`
- `POST|PATCH /admin/events/{event_id}/archive`
- `POST|PATCH /organizer/events/{event_id}/publish`

---

## Production Code Changes

| File | Change |
|------|--------|
| `backend/app/openapi/` | New OpenAPI builder package |
| `backend/app/routes/docs.py` | Swagger UI + spec serving blueprint |
| `backend/app/__init__.py` | Register docs blueprint; add `GET /` root route |
| `backend/run.py` | Remove duplicate root route (now in app factory) |
| `backend/requirements.txt` | Added `PyYAML`, `openapi-spec-validator` |
| `backend/scripts/export_openapi.py` | Export & validation script |

No changes to business logic, services, or existing API behavior.

---

## Validation Performed

| Check | Result |
|-------|--------|
| `openapi-spec-validator` on Python dict | **PASS** |
| `openapi-spec-validator` on `openapi.yaml` | **PASS** |
| Flask route ↔ OpenAPI parity | **89/89 match** |
| `GET /docs` | **200** (HTML) |
| `GET /swagger.json` | **200** (OpenAPI 3.1.0) |
| `GET /openapi.yaml` | **200** (YAML) |
| `GET /health` via test client | **200** |
| `GET /` via test client | **200** |

---

## Dependencies Added

```
PyYAML==6.0.2
openapi-spec-validator==0.7.1
```

---

## Usage

### Regenerate spec files

```bash
cd backend
pip install -r requirements.txt
python scripts/export_openapi.py
```

### Start API with Swagger UI

```bash
cd backend
python run.py
```

Open: [http://localhost:5000/docs](http://localhost:5000/docs)

### Authenticate in Swagger UI

1. Call `POST /auth/admin/login` or `POST /auth/organizer/login`
2. Copy `access_token` from response
3. Click **Authorize** → enter `Bearer <token>` or paste token (Swagger adds Bearer prefix depending on UI version)
4. Call protected endpoints

---

## Known Limitations

1. **Refresh token** — Uses HttpOnly cookies; Swagger UI cannot fully automate refresh without manual cookie setup. Documented via headers on `POST /auth/refresh`.
2. **Set-Cookie on login** — Swagger Try-it-out may not persist cookies across origins; use same-origin (`localhost:5000`) for refresh testing.
3. **Cloudinary uploads** — Return 503 if `CLOUDINARY_*` env vars are unset; documented as possible error response on media routes.
4. **Spec is code-generated** — After API changes, re-run `scripts/export_openapi.py` to refresh `openapi.yaml` / `swagger.json`.

---

## Final Summary

The Event Management Platform backend now has a **validated OpenAPI 3.1 specification** covering all **89 API operations**, served interactively at **`/docs`** with downloadable **`/openapi.yaml`** and **`/swagger.json`**. The spec uses reusable schemas, JWT Bearer security, multipart support, and examples derived from the actual serializers and route handlers.
