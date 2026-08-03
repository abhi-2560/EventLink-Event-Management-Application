# Authentication, Configuration, Reports, and Receipts Change Guide

This guide describes the authentication, frontend configuration, date-range reporting, and receipt-delivery changes introduced together. It supplements the existing deployment and testing documentation.

## Frontend environment configuration

Each frontend has a committed template:

- `frontend/admin/.env.example`
- `frontend/user/.env.example`

Copy the relevant file to `.env` for local configuration. Local `.env` files are ignored by Git; only `.env.example` is committed.

| Variable | Purpose | Default in example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Browser-visible API base URL | `/api` |
| `VITE_IMAGE_MAX_BYTES` | Maximum image upload size accepted by the organizer UI | `5242880` |
| `VITE_VIDEO_MAX_BYTES` | Maximum video upload size accepted by the organizer UI | `52428800` |
| `VITE_HEALTH_CHECK_INTERVAL_MS` | Backend health-poll interval | `60000` |
| `VITE_DEV_SERVER_PORT` | Vite development-server port | `5173` (user) / `5175` (admin) |
| `VITE_API_PROXY_TARGET` | Backend target used by Vite during development | `http://localhost:5000` |
| `VITE_API_PROXY_PATH` | Browser path forwarded by the Vite proxy | `/api` |

Vite removes the configured proxy prefix before forwarding a request. With the defaults, a browser request to `/api/auth/refresh` reaches Flask as `/auth/refresh`.

Do not place Cloudinary credentials in either frontend environment file. Browser uploads continue through authenticated backend endpoints, and Cloudinary secrets remain backend-only.

## Refresh authentication and deployment

Refresh tokens are separate, HttpOnly cookies named per actor (`refresh_token_admin` and `refresh_token_organizer`). The configurable backend settings are:

| Variable | Purpose | Default |
| --- | --- | --- |
| `REFRESH_COOKIE_PATH` | Cookie path shared by login, refresh, and logout | `/api/auth` |
| `REFRESH_COOKIE_SECURE` | Require HTTPS for the refresh cookie | `false` |
| `REFRESH_COOKIE_SAMESITE` | Refresh-cookie SameSite policy | `Lax` |
| `REFRESH_COOKIE_DOMAIN` | Optional shared cookie domain | unset |
| `CORS_ORIGINS` | Comma-separated credentialed CORS origins | local Vite origins |

The default cookie path matches the Vite browser contract: the browser calls `/api/auth/*`, while the proxy forwards to Flask's `/auth/*` routes. If the public API prefix changes, set `REFRESH_COOKIE_PATH` to the matching browser-visible auth path.

For a direct cross-origin frontend/API deployment, use HTTPS and configure:

1. `REFRESH_COOKIE_SAMESITE=None`
2. `REFRESH_COOKIE_SECURE=true`
3. `CORS_ORIGINS` to the exact frontend origins, without wildcard origins
4. `REFRESH_COOKIE_DOMAIN` only when a shared parent-domain cookie is actually required

The Axios clients send credentialed refresh requests with the CSRF-style refresh header, share one in-flight refresh operation, retry each failed request only once, and update the auth context through the shared access-token session. A normal `403` authorization failure does not clear the session.

## Date-range reports

Admin and organizer report ranges are URL-backed as `start` and `end` in `YYYY-MM-DD` format. The six-month range remains only the initial default. Changing either date now resolves functional range updaters before writing URL state, so the React Query keys and report requests receive the selected `start_date` and `end_date`.

This makes report URLs shareable and preserves the selection across reloads. Existing backend date parsing remains responsible for applying the supplied request range.

## Receipt delivery snapshots

Payments now freeze these delivery details when the payment row is created:

- event type
- venue
- city and state
- meeting link

The receipt API exposes the snapshots. The receipt UI renders them according to the stored event type:

- `ONLINE`: a safe `http` or `https` join link only
- `OFFLINE`: venue/location only
- `HYBRID`: both location and join link

Older payments remain compatible: snapshot fields are nullable, and absent data simply does not render as delivery information.

## Migration order

Deploy application code and run the migration before relying on the new receipt fields:

```powershell
cd backend
$env:FLASK_APP = "run.py"
flask db upgrade
```

The migration adds nullable payment snapshot columns and backfills each payment from its linked event when available. New payments then preserve their own event-delivery data even if the event changes later.

Use the project’s Flask-Migrate command rather than invoking `alembic` directly: the migration environment obtains its database configuration from the Flask application.

## Targeted verification

Backend integration tests require a dedicated PostgreSQL database through `TEST_DATABASE_URL`:

```powershell
cd backend
$env:TEST_DATABASE_URL = "postgresql://user:password@localhost/event_mgmt_test"
pytest tests/api/test_refresh_sessions.py tests/api/test_booking_payment.py
```

Run frontend checks independently:

```powershell
cd frontend/user
npm test
npm run lint
npm run build

cd ../admin
npm test
npm run lint
npm run build
```
