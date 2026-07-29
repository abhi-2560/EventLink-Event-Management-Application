# Event Management Platform — Database Schema

Aligned with `backend/schema.sql` and current SQLAlchemy models.

## Tables (8)

| Table | Purpose |
|-------|---------|
| `admin` | Platform administrators; stores global `convenience_fee` and `gateway_fee` |
| `audit_log` | Business action audit trail |
| `category` | Event categories with denormalized counters |
| `coupon` | Discount codes |
| `organizer` | Event organizers |
| `event` | Event catalog (denormalized organizer/category snapshots) |
| `registration` | Bookings with frozen fee snapshots |
| `payment` | Payment/receipt records |

## Platform fees

Global convenience and gateway fees live on **`admin`** (`convenience_fee`, `gateway_fee`). All admin rows are kept in sync when fees are updated. At booking time, fees are copied to `registration` and `payment` rows as snapshots.

## Denormalized fields (intentional)

- `event`: `organizer_name`, `organizer_email`, `organizer_phone`, `category_name`
- `registration` / `payment`: event, category, organizer snapshots
- Counter columns on `organizer`, `category`, `event`

## Removed legacy objects

- **`platform_settings`** table — replaced by fee columns on `admin`
- **`registration.platform_fee`** — never populated
- **`registration.event_type`** — unused snapshot
- **`payment.platform_fee`** — always zero (`PLATFORM_FEE_RATE` was 0)
- **`organizer.platform_fee_generated`** — depended on unused platform fee
- **`event.convenience_fee` / `event.gateway_fee`** — removed in migration `a1b2c3d4e5f6`

## Executable schema

See [`schema.sql`](schema.sql) for the full PostgreSQL DDL.
