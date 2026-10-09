-- Growers-to-growers messaging for v1 (Phase 1 scope — see andy-aug26-asks).
-- Threads are keyed by farm (the one being contacted) + counterpart, matching
-- the prototype's openThread(farmId) model fixed in v84.
create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  counterpart_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (farm_id, counterpart_id)
);

create index message_threads_farm_id_idx on public.message_threads(farm_id);
create index message_threads_counterpart_id_idx on public.message_threads(counterpart_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_thread_id_idx on public.messages(thread_id, created_at);

-- Bumps last_message_at so thread lists can sort without a join+max() every time.
create or replace function public.bump_thread_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.message_threads
    set last_message_at = new.created_at
    where id = new.thread_id;
  return new;
end;
$$;

create trigger messages_bump_thread
  after insert on public.messages
  for each row execute function public.bump_thread_last_message();

-- Audit/debug trail for SMS + email sends (Twilio trigger fires server-side
-- off a messages insert — see dev-handoff-audit §4, an Andy data/security item).
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  channel text not null check (channel in ('sms','email')),
  event_type text not null,
  sent_at timestamptz not null default now(),
  payload jsonb
);
