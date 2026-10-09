
create policy messages_update_read on public.messages
for update
using (
  exists (
    select 1 from message_threads t
    where t.id = messages.thread_id
      and (auth.uid() = t.counterpart_id or auth.uid() = (select farms.owner_id from farms where farms.id = t.farm_id))
  )
)
with check (
  exists (
    select 1 from message_threads t
    where t.id = messages.thread_id
      and (auth.uid() = t.counterpart_id or auth.uid() = (select farms.owner_id from farms where farms.id = t.farm_id))
  )
);
