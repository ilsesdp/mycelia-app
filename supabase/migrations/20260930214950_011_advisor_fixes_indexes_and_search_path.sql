-- Missing covering indexes on FKs (performance advisor)
create index farm_markets_market_id_idx on public.farm_markets(market_id);
create index messages_sender_id_idx on public.messages(sender_id);
create index notification_log_user_id_idx on public.notification_log(user_id);

-- Pin search_path on SECURITY DEFINER-adjacent trigger functions (security advisor)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.bump_thread_last_message()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.message_threads
    set last_message_at = new.created_at
    where id = new.thread_id;
  return new;
end;
$$;

-- handle_new_user is meant to run only via the on_auth_user_created trigger,
-- never called directly over the API — revoke the RPC surface the advisor flagged.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
