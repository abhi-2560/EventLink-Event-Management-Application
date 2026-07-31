# Test Case Summary

This document inventories the automated test cases currently present in both applications.

## Backend (Pytest)

| Area | Test | Behavior verified |
|---|---|---|
| Authentication | `test_register_organizer_creates_active_organizer` | Registration creates an ACTIVE organizer and hashes the password. |
| Authentication | `test_admin_login_returns_access_token` | Valid admin credentials return an admin JWT. |
| Authentication | `test_login_rejects_invalid_credentials` | Invalid credentials return the application 422 error contract. |
| RBAC | `test_organizer_token_cannot_access_admin_route` | A valid organizer token is forbidden from admin endpoints. |
| Error handling | `test_missing_token_uses_json_error_contract` | Missing JWT returns JSON 401 rather than an HTML response. |
| Health | `test_health_returns_database_readiness` | `/health` reports app and PostgreSQL readiness. |
| Health | `test_health_returns_503_when_database_is_unavailable` | Database probe failures produce a safe 503 response. |
| Event lifecycle | `test_organizer_can_publish_own_event` | Organizer creates a draft then publishes it. |
| Validation | `test_publish_validation_requires_offline_city` | Offline events without a city are rejected at publishing. |
| Reports/dashboard | `test_admin_dashboard_and_reports_are_authorized` | Admin dashboard and monthly report calls are authorized and return expected shapes. |
| Registration/payment | `test_registration_payment_and_receipt_flow` | Registration reserves seats, applies a coupon, verifies simulated payment, and retrieves a receipt. |
| Registration | `test_registration_rejects_insufficient_capacity` | Seat overbooking produces a 409 conflict. |
| Coupons | `test_coupon_validation_requires_positive_seat_count` | Coupon validation rejects zero seats. |
| Database constraints | `test_coupon_code_is_unique` | Coupon code unique constraint is enforced by PostgreSQL. |
| Database constraints | `test_database_rejects_negative_coupon_discount` | Coupon non-negative-discount CHECK constraint is enforced by PostgreSQL. |

Backend integration tests require `TEST_DATABASE_URL`; shared fixtures seed the platform-fee admin row and truncate the dedicated test database around every test.

## User Frontend (Jest + RTL)

| Area | Test | Behavior verified |
|---|---|---|
| Search persistence | `useListSearchParams.test.jsx` | URL query values are read and list page updates reset default values. |
| Protected routing | `ProtectedRoute.test.jsx` | Unauthenticated organizers are redirected to login. |
| Server outage UI | `ServerUnavailable.test.jsx` | Friendly server outage copy is displayed and retry invokes the supplied action. |

## Admin Frontend (Jest + RTL)

| Area | Test | Behavior verified |
|---|---|---|
| Route protection | `RouteGuards.test.jsx` | Unauthenticated admins are redirected to login. |
| Error mapping | `apiError.test.js` | Network errors use friendly outage text. |
| Error mapping | `apiError.test.js` | Forbidden responses use a safe permission message. |

## Commands

See [TESTING.md](TESTING.md) for install, test, and coverage commands.
