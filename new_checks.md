Here's what's missing, by table — the seat oversell guard in particular is the one to not skip.

**`event` — the most important one is missing entirely**
```sql
CHECK (available_seats >= 0)
CHECK (available_seats <= capacity)
CHECK (capacity > 0)
CHECK (ticket_price >= 0)
CHECK (convenience_fee >= 0)
CHECK (gateway_fee >= 0)
CHECK (total_registrations >= 0)
CHECK (total_tickets_sold >= 0)
CHECK (total_sales >= 0)
CHECK (NOT is_free OR ticket_price = 0)
CHECK (registration_end IS NULL OR registration_start IS NULL OR registration_end > registration_start)
```
`available_seats <= capacity` is the one that actually matters functionally — it's the DB-level backstop for the atomic booking update we designed earlier. Right now nothing in this schema stops `available_seats` from silently exceeding `capacity` if application code has a bug. The `is_free` consistency check catches the case where someone marks an event free but leaves a stale ticket price on it.

**`registration`**
```sql
CHECK (ticket_price >= 0)
CHECK (discount_amount >= 0)
CHECK (convenience_fee >= 0)
CHECK (gateway_fee >= 0)
CHECK (platform_fee >= 0)
CHECK (total_amount >= 0)
CHECK (reservation_status <> 'RESERVED' OR reservation_expires_at IS NOT NULL)
```
That last one enforces that anything sitting in `RESERVED` state always has an expiry — otherwise your hold-expiry sweep job has no way to find it.

**`payment`**
```sql
CHECK (ticket_price >= 0)
CHECK (discount >= 0)
CHECK (convenience_fee >= 0)
CHECK (gateway_fee >= 0)
CHECK (platform_fee >= 0)
CHECK (amount >= 0)
CHECK (payment_status <> 'SUCCESS' OR completed_at IS NOT NULL)
CHECK (payment_status <> 'FAILED' OR failure_reason IS NOT NULL)
```
The last two make it structurally impossible to mark a payment successful without a completion timestamp, or failed without a reason — both currently just nullable text fields nothing enforces.

**`organizer`**
```sql
CHECK (total_events >= 0)
CHECK (active_events >= 0)
CHECK (active_events <= total_events)
CHECK (total_registrations >= 0)
CHECK (total_tickets_sold >= 0)
CHECK (total_sales >= 0)
CHECK (platform_fee_generated >= 0)
```

**`category`**
```sql
CHECK (total_events >= 0)
CHECK (total_registrations >= 0)
CHECK (total_tickets_sold >= 0)
CHECK (total_sales >= 0)
```

**`coupon`**
```sql
CHECK (flat_discount >= 0)
CHECK (times_used >= 0)
CHECK (total_discount_given >= 0)
```

**`audit_log`** — currently has no enum guard on `actor_type` at all
```sql
CHECK (actor_type IN ('ADMIN','ORGANIZER','SYSTEM'))
```

One thing unrelated to checks but worth flagging while I'm looking at this: this version of the schema has dropped the `end_datetime` column from `event` that was present in your earlier version — only `start_datetime` remains now. If that was intentional (single-instant events, no end time needed) that's fine, but if it was an accidental drop during editing, worth restoring before you add these constraints on top of it.

Want me to apply all of this to the file, or do you want to pick and choose from the list first?