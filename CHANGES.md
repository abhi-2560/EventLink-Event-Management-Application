# Changes: Refresh Tokens, Validation, and Event Media

## Database migrations

Run `flask db upgrade` before deploying this release.

- `d4e5f6a7b8c9_add_refresh_tokens_and_event_media`
  - Adds `refresh_token` for hashed, rotating, revocable refresh sessions.
  - Adds nullable `event.banner_url` and `event.banner_public_id`.
  - Adds optional `event_media` rows for IMAGE/VIDEO Cloudinary assets.

Existing events and clients remain compatible: banner and media are optional, and existing JSON event create/update payloads are unchanged.

## Authentication

- Access JWTs default to 15 minutes through `JWT_ACCESS_TOKEN_EXPIRES_SECONDS`.
- Login still returns `access_token` and `actor_type`, and additionally sets a role-specific HttpOnly refresh cookie.
- Added `POST /auth/refresh`; it requires `X-Refresh-Request: 1` and `X-Actor-Type: admin|organizer`.
- Refresh tokens are opaque, hashed in PostgreSQL, rotated at use, and their token family is revoked when reuse is detected.
- Logout revokes the refresh cookie session and clears the cookie.
- Frontend authenticated axios clients coordinate a single refresh request and retry each failed request once.

## Validation

- Added `backend/app/validation/` for shared UUID, text, email, phone, datetime, URL, numeric, event, and registration validation.
- Event JSON requests now normalize ISO datetimes and reject invalid IDs, negative pricing, invalid URLs/enums, invalid registration windows, and invalid capacity.
- Registration requests validate attendee name, phone, optional email, event UUID, and positive seats before business logic.

## Cloudinary media

- Added organizer multipart endpoints:
  - `POST` / `DELETE /organizer/events/<event_id>/banner`
  - `POST /organizer/events/<event_id>/media`
  - `DELETE /organizer/events/<event_id>/media/<media_id>`
- Images accept JPEG/PNG/WebP up to 5 MB; videos accept MP4/WebM up to 50 MB by default.
- Missing Cloudinary configuration returns 503 only from media operations.
- Public list responses add nullable `banner_url`; public event details add `images` and `videos`.
- Event cards use the banner when present and retain the existing visual fallback otherwise.
- Event details render banner/gallery/video sections only when data exists.

## Required environment variables

```text
JWT_ACCESS_TOKEN_EXPIRES_SECONDS=900
JWT_REFRESH_TOKEN_EXPIRES_SECONDS=2592000
REFRESH_COOKIE_SECURE=false
REFRESH_COOKIE_SAMESITE=Lax
REFRESH_COOKIE_DOMAIN=
CORS_ORIGINS=http://localhost:5173,http://localhost:5175
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAX_IMAGE_UPLOAD_BYTES=5242880
MAX_VIDEO_UPLOAD_BYTES=52428800
```

Set `REFRESH_COOKIE_SECURE=true` and use `SameSite=None` only for HTTPS cross-site production deployments.

## Compatibility notes

- Access token JSON responses and Bearer authentication remain available.
- Refresh cookies are additive, so older clients can continue until their access token expires.
- Existing admin “delete event” remains a soft archive; media is intentionally retained on archive so a republished event keeps its assets.
