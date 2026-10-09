-- Both triggers on public.messages run as the inserting (authenticated)
-- user by default, which breaks them:
--   - notify_new_message() reads vault.decrypted_secrets, which only the
--     postgres/service_role may access. Under SECURITY INVOKER this raises
--     "permission denied for schema vault" inside the AFTER INSERT trigger,
--     which rolls back the whole insert -- every message send fails
--     silently.
--   - bump_thread_last_message() updates message_threads, which has no
--     UPDATE RLS policy for authenticated users, so under SECURITY INVOKER
--     it silently matches zero rows and last_message_at never advances.
-- Marking both SECURITY DEFINER runs them as their owner (postgres),
-- which has the needed access, without opening up vault reads or a new
-- client-facing UPDATE policy on message_threads.
alter function public.notify_new_message() security definer;
alter function public.bump_thread_last_message() security definer;

-- SECURITY DEFINER functions ignore the caller's search_path, so lock
-- each one down explicitly (already partially set on notify_new_message;
-- restated here for clarity and applied fresh to bump_thread_last_message)
-- to avoid a search-path hijack via a function/table shadowing one these
-- rely on.
alter function public.notify_new_message() set search_path = 'public', 'vault';
alter function public.bump_thread_last_message() set search_path = 'public';
