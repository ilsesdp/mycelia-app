
alter policy message_threads_insert on public.message_threads
with check (
  (
    auth.uid() = counterpart_id
    and (select fpc.message_visibility from public.farm_public_contact fpc where fpc.farm_id = message_threads.farm_id) <> 'nobody'
    and (
      (select fpc.message_visibility from public.farm_public_contact fpc where fpc.farm_id = message_threads.farm_id) = 'everyone'
      or exists (select 1 from farms f2 where f2.owner_id = auth.uid() and f2.published = true)
    )
  )
  or auth.uid() = (select farms.owner_id from farms where farms.id = message_threads.farm_id)
);
