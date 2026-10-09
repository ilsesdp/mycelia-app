-- Making these SECURITY DEFINER (previous migration) auto-exposed them as
-- public RPC endpoints (/rest/v1/rpc/...) to anon/authenticated, per the
-- security advisor. Trigger firing doesn't need EXECUTE on the function for
-- the invoking session -- only a direct call does -- so revoke it from the
-- client-facing roles; the triggers keep working exactly as before.
revoke execute on function public.notify_new_message() from anon, authenticated;
revoke execute on function public.bump_thread_last_message() from anon, authenticated;
