-- notify_tomorrow_events() is meant to be called only by pg_cron (as the
-- postgres role) -- not by end users via the exposed PostgREST RPC endpoint.
-- Revoke the default PUBLIC/anon/authenticated execute grant that Postgres
-- gives new functions, matching how other internal-only functions in this
-- schema are locked down.
revoke execute on function public.notify_tomorrow_events() from public, anon, authenticated;
