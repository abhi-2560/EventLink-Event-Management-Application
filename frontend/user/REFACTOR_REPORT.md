# Frontend/User Structural Refactor Report

**Branch:** `restructuring_v2`  
**Scope:** `frontend/user/src` only — structural refactor, no behavior changes

---

## Final Folder Structure

```
frontend/user/src/
├── registrant/
│   ├── api/                    (axios, eventApi, paymentApi, registrationApi)
│   ├── components/
│   │   ├── event/
│   │   ├── layout/
│   │   ├── payment/
│   │   └── registration/
│   ├── context/                (+ tests/)
│   ├── hooks/                  (useDebounce)
│   ├── layouts/                (PublicLayout)
│   ├── pages/
│   │   ├── public/             (+ tests/)
│   │   └── registration/       (+ tests/)
│   ├── schemas/                (registrationSchema)
│   └── utils/                  (eventSearch + tests/)
│
├── organizer/
│   ├── api/                    (+ tests/)
│   ├── components/             (+ tests/)
│   ├── context/                (+ tests/)
│   ├── layouts/                (OrganizerLayout)
│   ├── pages/                  (+ tests/)
│   ├── routes/                 (+ tests/)
│   └── schemas/                (organizerSchemas)
│
├── shared/
│   ├── components/common/      (+ tests/)
│   ├── constants/              (index.ts — formerly utils/constants.ts)
│   ├── hooks/                  (useListSearchParams + tests/)
│   ├── lib/                    (cn.ts — formerly utils/cn.ts)
│   ├── pages/error/            (NotFound)
│   ├── routes/                 (AppRoutes)
│   ├── test/                   (test-utils, fixtures — cross-module test infra)
│   ├── types/                  (api.ts, axios.d.ts)
│   └── utils/                  (apiError, toast + tests/)
│
├── assets/
├── App.tsx                     (new — app shell extracted from main.tsx)
├── main.tsx                    (entry — providers only)
├── index.css
├── setupTests.ts
└── vite-env.d.ts
```

**Total source files:** 108 (including `App.tsx`)

---

## Files Moved (99 relocations)

### Registrant module (52 files)
| From | To |
|------|-----|
| `api/axios.ts` | `registrant/api/axios.ts` |
| `api/eventApi.ts` | `registrant/api/eventApi.ts` |
| `api/paymentApi.ts` | `registrant/api/paymentApi.ts` |
| `api/registrationApi.ts` | `registrant/api/registrationApi.ts` |
| `components/event/*` | `registrant/components/event/*` |
| `components/layout/*` | `registrant/components/layout/*` |
| `components/payment/*` | `registrant/components/payment/*` |
| `components/registration/*` | `registrant/components/registration/*` |
| `context/RegistrationContext.tsx` | `registrant/context/RegistrationContext.tsx` |
| `hooks/useDebounce.ts` | `registrant/hooks/useDebounce.ts` |
| `layouts/PublicLayout.tsx` | `registrant/layouts/PublicLayout.tsx` |
| `pages/public/*` | `registrant/pages/public/*` |
| `pages/registration/*` | `registrant/pages/registration/*` |
| `schemas/registrationSchema.ts` | `registrant/schemas/registrationSchema.ts` |
| `utils/eventSearch.ts` | `registrant/utils/eventSearch.ts` |

### Organizer module (35 files)
| From | To |
|------|-----|
| `api/authApi.ts` | `organizer/api/authApi.ts` |
| `api/authSession.ts` | `organizer/api/authSession.ts` |
| `api/organizerApi.ts` | `organizer/api/organizerApi.ts` |
| `api/organizerAxios.ts` | `organizer/api/organizerAxios.ts` |
| `components/organizer/*` | `organizer/components/*` |
| `context/AuthContext.tsx` | `organizer/context/AuthContext.tsx` |
| `layouts/OrganizerLayout.tsx` | `organizer/layouts/OrganizerLayout.tsx` |
| `pages/organizer/*` | `organizer/pages/*` |
| `routes/OrganizerRoutes.tsx` | `organizer/routes/OrganizerRoutes.tsx` |
| `routes/ProtectedRoute.tsx` | `organizer/routes/ProtectedRoute.tsx` |
| `schemas/organizerSchemas.ts` | `organizer/schemas/organizerSchemas.ts` |

### Shared module (12 files)
| From | To |
|------|-----|
| `components/common/*` | `shared/components/common/*` |
| `hooks/useListSearchParams.ts` | `shared/hooks/useListSearchParams.ts` |
| `pages/error/NotFound.tsx` | `shared/pages/error/NotFound.tsx` |
| `routes/AppRoutes.tsx` | `shared/routes/AppRoutes.tsx` |
| `test/test-utils.tsx` | `shared/test/test-utils.tsx` |
| `test/fixtures.ts` | `shared/test/fixtures.ts` |
| `types/*` | `shared/types/*` |
| `utils/apiError.ts` | `shared/utils/apiError.ts` |
| `utils/toast.ts` | `shared/utils/toast.ts` |
| `utils/constants.ts` | `shared/constants/index.ts` |
| `utils/cn.ts` | `shared/lib/cn.ts` |

---

## Shared Modules Extracted

Code moved to `shared/` because it is used by **both** registrant and organizer flows:

| Module | Consumers |
|--------|-----------|
| `shared/components/common/*` | All pages in both modules |
| `shared/constants` | API clients, event cards, receipts, banners |
| `shared/lib/cn` | Button, Container, Input, sidebar |
| `shared/types/api` | All API modules and forms |
| `shared/utils/apiError` | Registrant axios, organizer axios |
| `shared/utils/toast` | Registration, payment, organizer pages |
| `shared/hooks/useListSearchParams` | Registrant Home (public event listing) |
| `shared/routes/AppRoutes` | Root router wiring both modules |
| `shared/pages/error/NotFound` | Catch-all route |
| `shared/test/*` | All test suites |

---

## Duplicate Code Consolidated

**None.** Registrant and organizer retain their separate implementations where behavior differs (e.g. public `EventDetails` vs organizer `EventDetail`, separate API clients). No logic was merged to avoid behavior changes.

---

## Imports Updated

### Path aliases added

| Alias | Maps to |
|-------|---------|
| `@registrant/*` | `src/registrant/*` |
| `@organizer/*` | `src/organizer/*` |
| `@shared/*` | `src/shared/*` |
| `@/*` | `src/*` |

Configured in: `tsconfig.json`, `vite.config.ts`, `jest.config.cjs`

### Import style
- Cross-module imports use aliases (e.g. `@shared/components/common/Button`)
- All 85+ TypeScript/TSX files updated
- `jest.requireActual()` paths in tests updated to alias form
- `jest.mock()` module paths updated to alias form

### New entry split
- `main.tsx` — `QueryClientProvider`, `BrowserRouter`, `AuthProvider`, `RegistrationProvider`
- `App.tsx` — `AppErrorBoundary`, `ServerAvailabilityBanner`, `AppRoutes`, `Toaster`

---

## Tests Relocated (21 test files)

| Original location | New location |
|-------------------|--------------|
| `api/organizerAxios.test.ts` | `organizer/api/tests/organizerAxios.test.ts` |
| `components/common/ServerUnavailable.test.tsx` | `shared/components/common/tests/ServerUnavailable.test.tsx` |
| `components/organizer/Pagination.test.tsx` | `organizer/components/tests/Pagination.test.tsx` |
| `components/organizer/StatusBadge.test.tsx` | `organizer/components/tests/StatusBadge.test.tsx` |
| `context/AuthContext.test.tsx` | `organizer/context/tests/AuthContext.test.tsx` |
| `context/RegistrationContext.test.tsx` | `registrant/context/tests/RegistrationContext.test.tsx` |
| `hooks/useListSearchParams.test.tsx` | `shared/hooks/tests/useListSearchParams.test.tsx` |
| `pages/organizer/*.test.tsx` (7 files) | `organizer/pages/tests/*.test.tsx` |
| `pages/public/*.test.tsx` (2 files) | `registrant/pages/public/tests/*.test.tsx` |
| `pages/registration/*.test.tsx` (3 files) | `registrant/pages/registration/tests/*.test.tsx` |
| `routes/ProtectedRoute.test.tsx` | `organizer/routes/tests/ProtectedRoute.test.tsx` |
| `utils/apiError.test.ts` | `shared/utils/tests/apiError.test.ts` |
| `utils/eventSearch.test.ts` | `registrant/utils/tests/eventSearch.test.ts` |

Test infrastructure (`shared/test/test-utils.tsx`, `shared/test/fixtures.ts`) remains in `shared/test/` as cross-cutting test support.

---

## Validation Results

| Check | Result |
|-------|--------|
| `npm run dev` | ✅ Pass — Vite dev server starts on `http://localhost:5173/` |
| `npm run build` | ✅ Pass — production bundle built successfully |
| `npm test` | ✅ Pass — **21 suites, 53 tests** |
| `npm run typecheck` | ✅ Pass — `tsc --noEmit` clean |
| `npm run lint` | ✅ Pass — 0 errors (6 pre-existing `react-refresh` warnings) |

---

## Config Changes

| File | Change |
|------|--------|
| `tsconfig.json` | Added `@registrant/*`, `@organizer/*`, `@shared/*` path aliases |
| `vite.config.ts` | Added `resolve.alias` for all path aliases |
| `jest.config.cjs` | Added module mappers; `testMatch` includes `**/tests/**` |
| `eslint.config.js` | Jest/node globals for test and config files |

---

## Migration Scripts (reference)

- `scripts/refactor_structure.py` — initial file moves + `App.tsx` creation
- `scripts/fix_imports.py` — import path rewriting via old-path resolution

These scripts are retained for auditability and can be removed after merge.
