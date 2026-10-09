
-- Stores each browser/device's Web Push subscription. A user can have more
-- than one (phone + laptop, etc.), so this is keyed by endpoint, not by
-- user_id alone.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users manage their own push subscriptions"
  on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Turn on Realtime delivery for messages (not enabled for any table yet) so
-- ThreadView can live-append incoming messages and BottomNav can live-update
-- the unread badge.
alter publication supabase_realtime add table public.messages;

-- Extend the existing new-message trigger function to also notify the
-- send-push-notification Edge Function, alongside the existing SMS one.
-- Same vault secret + header pattern as the SMS call already uses.
create or replace function public.notify_new_message()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public', 'vault'
as $function$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name = 'webhook_secret'
  limit 1;
  if v_secret is null then
    return new;
  end if;
  perform net.http_post(
    url := 'https://qcsmasqxxrngylxrsbsy.supabase.co/functions/v1/send-sms-notification',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', v_secret),
    body := jsonb_build_object('thread_id', new.thread_id, 'sender_id', new.sender_id, 'body', new.body)
  );
  perform net.http_post(
    url := 'https://qcsmasqxxrngylxrsbsy.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', v_secret),
    body := jsonb_build_object('thread_id', new.thread_id, 'sender_id', new.sender_id, 'body', new.body)
  );
  return new;
end;
$function$;
