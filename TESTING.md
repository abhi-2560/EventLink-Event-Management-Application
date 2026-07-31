# Testing Guide

## Prerequisites

- Python 3.11+ and PostgreSQL 14+
- Node.js 20+
- A dedicated PostgreSQL database exposed as `TEST_DATABASE_URL`

`TEST_DATABASE_URL` is mandatory for backend tests. The test configuration never falls back to `DATABASE_URL`; this prevents test execution from modifying development data.

## Backend

```powershell
cd backend
pip install -r requirements-dev.txt
$env:TEST_DATABASE_URL = "postgresql://user:password@localhost/event_mgmt_test"
pytest
pytest --cov=app --cov-report=term-missing
```

Tests are organized by purpose:

```text
backend/tests/
  conftest.py          # app, PostgreSQL cleanup, factories, JWT helpers
  api/                 # HTTP/auth/RBAC/health/payment/report flows
  database/            # PostgreSQL constraints
  test_auth_service.py # isolated unit test example
```

Integration fixtures truncate all application tables before and after each test because repository writes commit internally. Unit tests should mock repositories or collaborators and avoid requiring PostgreSQL.

## Frontend

Run each app independently:

```powershell
cd frontend/user
npm install
npm test
npm run test:coverage

cd ../admin
npm install
npm test
npm run test:coverage
```

Frontend test helpers live under `src/test/`. They render components with a memory router, an isolated React Query client (`retry: false`), and the app contexts. Mock API boundaries rather than implementation details inside components.

## Testing Philosophy

- Use Arrange → Act → Assert.
- Prefer user-visible behavior (text, navigation, form submission, loading/error UI) over component internals.
- Test the booking/payment lifecycle and role checks against PostgreSQL, because the application relies on PostgreSQL UUID, JSONB, ARRAY, GIN index, and constraint behavior.
- Keep API failures normalized through the Axios clients; verify friendly network/server messages rather than raw transport strings.
- Run lint and production builds after test changes:

```powershell
cd frontend/user; npm run lint; npm run build
cd ../admin; npm run lint; npm run build
```
