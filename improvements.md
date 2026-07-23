### This file contains improvements that can be made

- (Points would be removed once implemented)

Yes — a handful of these will bite you specifically because of choices already implied in the spec. Here's what to watch for, grouped by where the pain shows up.

## Identity model: three actor types, one auth system

Admins and organizers both use "simple mail auth" but have completely different permissions, while registrants have no account at all. Resist the urge to model this as one `users` table with a `role` column — organizer and admin have almost no shared fields or behavior (organizers have payout/sales data, admins don't; admins approve nothing but read everything). Two separate tables (`admins`, `organizers`) with a shared auth mechanism (email + magic link/OTP, not necessarily shared table) tends to stay cleaner than a single polymorphic users table as permissions diverge later. Registrant contact info (name/phone/email) should live as columns on the booking/attendee record itself, not a users table — there's no account to link it to.

## Money: the part that's easy to get subtly wrong

- **Store money as integers (paise), never floats.** `amount NUMERIC` or an integer minor-unit column — floating point will eventually produce receipts that don't reconcile with Razorpay's ledger.
- **Snapshot price and fees at booking time.** If you just store `event.price` and compute fees live, a price change or fee-percentage change after the fact silently rewrites history — old receipts would recompute differently if regenerated. Store the actual base amount, convenience fee, gateway fee, tax, and coupon discount as columns on the booking/payment record itself, not as something derived from the event at read time.
- **Coupons need a usage-tracking table**, not just a flag. "Flat discount" coupons likely have a redemption limit — if two people redeem the last use simultaneously, that's the exact same race condition as seat booking, and needs the same atomic-update pattern (`UPDATE coupons SET uses = uses + 1 WHERE uses < max_uses`).
- **Free events still need a payment record shape**, just with `amount = 0` and no Razorpay order — don't make the payment relationship mandatory-and-non-nullable on booking, or you'll special-case free events everywhere in application code instead of once in the schema.

## Status fields will multiply — decide the pattern early

You've got status-like fields on events (draft/published/closed/archived/completed/hard-deleted), bookings (held/confirmed/cancelled/expired), and payments (pending/success/failed). Two traps:

- **Postgres native `ENUM` types are painful to modify** — adding a value requires an `ALTER TYPE` outside a transaction in older Postgres versions. A `VARCHAR` with a `CHECK` constraint or an application-level enum is usually less friction as requirements evolve.
- **"Completed but hidden from registrants" needs two independent fields, not one.** If `status = 'completed'` also drives visibility, you'll eventually need a status value that means something is both completed and still visible (e.g., for the organizer's own dashboard). Separate `status` from `is_public` or similar.

## Soft delete vs. hard delete will fight your foreign keys

"Archive is soft delete, but even hard deletes must be logged" is a real schema tension: if you hard-delete an event, any `booking.event_id` foreign key either cascades (destroying booking history you need for reports) or blocks the delete (contradicting "hard delete allowed"). The usual resolution is to **never actually run `DELETE`** — even "hard delete" becomes a status flag (`status = 'hard_deleted'`) with the row retained but excluded from all normal queries and scrubbed of PII if that's the intent, while the audit log stores a snapshot of what the row looked like before that transition. True `DELETE` statements and audit trails are fundamentally in tension; pick soft-everything with status flags, or accept losing the "log the hard delete" requirement.

## Denormalize event details onto the booking for receipts

You flagged "event details (figure out what)" for receipts as unresolved — the schema implication is that receipts shouldn't join live to the `events` table. If an organizer edits the event name or venue after someone's booked, their receipt shouldn't retroactively change. Copy the relevant event fields onto the booking or a `booking_snapshot` at confirmation time.

## Search and reporting want different shapes than transactional queries

- Full-text search across title/location/keywords is much cheaper with a `tsvector` generated column plus a GIN index than `ILIKE '%...%'` scans — worth adding from the start rather than retrofitting once search feels slow.
- **Category should be a foreign key to a `categories` table, not a free-text column** — your pie charts group by category, and typo'd or inconsistently-cased free text will fragment the chart into duplicate slices.
- Monthly/period reports need clarity on which timestamp drives "month" — booking date or event date give different (and both valid) answers, and this should be an explicit column choice, not implicit from `created_at`.

## Two more worth flagging now rather than later

- **Timezones**: event start/end times should be stored `timestamptz`, and given every event has a location, consider whether "closes at 6pm" means the organizer's local time or the venue's — ambiguous today, annoying to retrofit.
- **Audit log table will grow fast** if genuinely everything is logged — plan for it to be append-only, indexed on `(entity_type, entity_id)` and `created_at`, and consider table partitioning by month once volume grows, rather than one flat table you query directly for reports.

If it'd help, I can turn this into an actual ERD next, incorporating these fixes — that'll surface any remaining ambiguities faster than more discussion will.