-- The prior revoke only targeted anon/authenticated, but Postgres grants
-- EXECUTE to the implicit PUBLIC pseudo-role on every new function by
-- default, which both of those roles still pick up. Revoke from PUBLIC too
-- so only postgres/service_role (and trigger firing, which doesn't need
-- EXECUTE) can invoke these.
revoke execute on function public.notify_new_message() from public;
revoke execute on function public.bump_thread_last_message() from public;
