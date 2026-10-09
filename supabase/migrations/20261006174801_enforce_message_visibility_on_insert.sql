alter policy message_threads_insert on public.message_threads
with check (
  (
    (select auth.uid()) = counterpart_id
    and (
      select p.message_visibility
      from public.profiles p
      join public.farms f on f.owner_id = p.id
      where f.id = message_threads.farm_id
    ) != 'nobody'
    and (
      (
        select p.message_visibility
        from public.profiles p
        join public.farms f on f.owner_id = p.id
        where f.id = message_threads.farm_id
      ) = 'everyone'
      or exists (
        select 1 from public.farms f2
        where f2.owner_id = (select auth.uid()) and f2.published = true
      )
    )
  )
  or (select auth.uid()) = (select farms.owner_id from public.farms where farms.id = message_threads.farm_id)
);
