alter table public.message_threads enable row level security;
alter table public.messages enable row level security;
alter table public.notification_log enable row level security;
-- notification_log gets no policies at all: it's written only by a
-- server-side trigger/Edge Function (service role), and never read by the
-- client — see dev-handoff-audit §4/§5 on the SMS provider needing a
-- server-side trigger, not a browser call.

create policy "message_threads_select" on public.message_threads
  for select using (
    auth.uid() = counterpart_id
    or auth.uid() = (select owner_id from public.farms where id = farm_id)
  );
create policy "message_threads_insert" on public.message_threads
  for insert with check (
    auth.uid() = counterpart_id
    or auth.uid() = (select owner_id from public.farms where id = farm_id)
  );

create policy "messages_select" on public.messages
  for select using (
    exists (
      select 1 from public.message_threads t
      where t.id = thread_id
        and (auth.uid() = t.counterpart_id or auth.uid() = (select owner_id from public.farms where id = t.farm_id))
    )
  );
create policy "messages_insert" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.message_threads t
      where t.id = thread_id
        and (auth.uid() = t.counterpart_id or auth.uid() = (select owner_id from public.farms where id = t.farm_id))
    )
  );
