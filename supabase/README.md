# Supabase backend (migrations + Edge Functions)

This folder is a **mirror** of what's live on the Supabase project
`qcsmasqxxrngylxrsbsy` ("icastel5@depaul.edu's Project", org "Ilse's
Consultant"), exported on 2026-10-09 so the handoff isn't GitHub-repo-only.
Everything in here was already applied/deployed directly to that project —
these files exist for version control, review, and disaster recovery, not
because anything needs re-running right now.

## What's here

- **`migrations/`** — all 48 schema migrations applied so far, in order
  (enums, tables, RLS policies, storage buckets, the messaging/push/SMS
  notification triggers, and today's `pg_cron` event-reminder job). Same
  SQL that's in the project's migration history
  (`supabase_migrations.schema_migrations`), re-exported as individual
  `.sql` files named the way the Supabase CLI expects
  (`<timestamp>_<name>.sql`).
- **`functions/`** — source for the 3 deployed Edge Functions:
  - `send-sms-notification` — texts a farm owner when they get a new
    message. **Twilio isn't connected yet** — it no-ops safely until
    `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` are
    set as Edge Function secrets.
  - `send-push-notification` — web push for new messages. Live and working.
  - `send-event-reminder` — web push the day before an event a farm is
    hosting, fired daily by the `notify_tomorrow_events()` Postgres
    function via `pg_cron` (see `migrations/20261009183425_notify_tomorrow_events.sql`).
    Live and working.
- **`config.toml`** — links this folder to the right Supabase project for
  the CLI. No secrets in it.

## Required secrets (never in git — set via the Supabase Dashboard →
Edge Functions → *function name* → Secrets, or `supabase secrets set`)

Edge Function secrets are **project-wide** in Supabase — set once, every
function can read them:

- `WEBHOOK_SECRET` — shared secret the database triggers send in an
  `x-webhook-secret` header; must match Vault's `webhook_secret` entry.
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` — Web Push
  credentials. The public key must match the app's
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY` env var (set in Vercel).
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` — **not
  yet set.** SMS notifications are built but inactive until a Twilio
  account is provisioned and these are added.

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by
the Edge Functions runtime — nothing to set for those.

## If you ever need to re-apply any of this from scratch

With the Supabase CLI installed and logged in:

```
supabase link --project-ref qcsmasqxxrngylxrsbsy
supabase db push                              # applies any new migrations
supabase functions deploy send-sms-notification
supabase functions deploy send-push-notification
supabase functions deploy send-event-reminder
```

Going forward, new schema changes or function edits should be written as
files here first, then applied — so this folder stays the source of truth
instead of drifting from what's live in the dashboard.
