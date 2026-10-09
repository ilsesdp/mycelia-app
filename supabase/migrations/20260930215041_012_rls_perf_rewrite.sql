-- Rewrites every RLS policy to (a) wrap auth.uid() as (select auth.uid())
-- so Postgres evaluates it once per query instead of once per row, and
-- (b) split each "for all" owner policy into insert/update/delete only,
-- since select was already covered by a separate _select policy — having
-- both meant Postgres ran two permissive policies per SELECT for nothing.

-- profiles
drop policy "profiles_select_own" on public.profiles;
drop policy "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update using ((select auth.uid()) = id);

-- farms
drop policy "farms_select_own" on public.farms;
drop policy "farms_insert_own" on public.farms;
drop policy "farms_update_own" on public.farms;
drop policy "farms_delete_own" on public.farms;
create policy "farms_select_own" on public.farms for select using ((select auth.uid()) = owner_id);
create policy "farms_insert_own" on public.farms for insert with check ((select auth.uid()) = owner_id);
create policy "farms_update_own" on public.farms for update using ((select auth.uid()) = owner_id);
create policy "farms_delete_own" on public.farms for delete using ((select auth.uid()) = owner_id);

-- farm_hours
drop policy "farm_hours_select" on public.farm_hours;
drop policy "farm_hours_write" on public.farm_hours;
create policy "farm_hours_select" on public.farm_hours for select using (
  exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = (select auth.uid())))
);
create policy "farm_hours_insert" on public.farm_hours for insert with check (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);
create policy "farm_hours_update" on public.farm_hours for update using (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);
create policy "farm_hours_delete" on public.farm_hours for delete using (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);

-- farm_categories
drop policy "farm_categories_select" on public.farm_categories;
drop policy "farm_categories_write" on public.farm_categories;
create policy "farm_categories_select" on public.farm_categories for select using (
  exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = (select auth.uid())))
);
create policy "farm_categories_insert" on public.farm_categories for insert with check (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);
create policy "farm_categories_delete" on public.farm_categories for delete using (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);

-- products
drop policy "products_select" on public.products;
drop policy "products_write" on public.products;
create policy "products_select" on public.products for select using (
  exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = (select auth.uid())))
);
create policy "products_insert" on public.products for insert with check (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);
create policy "products_update" on public.products for update using (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);
create policy "products_delete" on public.products for delete using (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);

-- markets
drop policy "markets_insert_authenticated" on public.markets;
create policy "markets_insert_authenticated" on public.markets for insert with check ((select auth.uid()) is not null);

-- farm_markets
drop policy "farm_markets_select" on public.farm_markets;
drop policy "farm_markets_write" on public.farm_markets;
create policy "farm_markets_select" on public.farm_markets for select using (
  exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = (select auth.uid())))
);
create policy "farm_markets_insert" on public.farm_markets for insert with check (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);
create policy "farm_markets_delete" on public.farm_markets for delete using (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);

-- events
drop policy "events_select" on public.events;
drop policy "events_write" on public.events;
create policy "events_select" on public.events for select using (
  exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = (select auth.uid())))
);
create policy "events_insert" on public.events for insert with check (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);
create policy "events_update" on public.events for update using (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);
create policy "events_delete" on public.events for delete using (
  exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid()))
);

-- message_threads
drop policy "message_threads_select" on public.message_threads;
drop policy "message_threads_insert" on public.message_threads;
create policy "message_threads_select" on public.message_threads for select using (
  (select auth.uid()) = counterpart_id or (select auth.uid()) = (select owner_id from public.farms where id = farm_id)
);
create policy "message_threads_insert" on public.message_threads for insert with check (
  (select auth.uid()) = counterpart_id or (select auth.uid()) = (select owner_id from public.farms where id = farm_id)
);

-- messages
drop policy "messages_select" on public.messages;
drop policy "messages_insert" on public.messages;
create policy "messages_select" on public.messages for select using (
  exists (
    select 1 from public.message_threads t
    where t.id = thread_id
      and ((select auth.uid()) = t.counterpart_id or (select auth.uid()) = (select owner_id from public.farms where id = t.farm_id))
  )
);
create policy "messages_insert" on public.messages for insert with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.message_threads t
    where t.id = thread_id
      and ((select auth.uid()) = t.counterpart_id or (select auth.uid()) = (select owner_id from public.farms where id = t.farm_id))
  )
);
