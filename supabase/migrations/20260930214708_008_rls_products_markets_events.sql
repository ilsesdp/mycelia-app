alter table public.products enable row level security;
alter table public.markets enable row level security;
alter table public.farm_markets enable row level security;
alter table public.events enable row level security;

create policy "products_select" on public.products
  for select using (
    exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = auth.uid()))
  );
create policy "products_write" on public.products
  for all using (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  );

-- markets: a shared, lightweight registry (1.10/1.17/4.22) — readable by
-- everyone, addable by any signed-in grower. No update/delete policy yet:
-- editing a shared market a farm doesn't own isn't a modeled flow in the
-- prototype, so it's locked out rather than guessed at.
create policy "markets_select_all" on public.markets
  for select using (true);
create policy "markets_insert_authenticated" on public.markets
  for insert with check (auth.uid() is not null);

create policy "farm_markets_select" on public.farm_markets
  for select using (
    exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = auth.uid()))
  );
create policy "farm_markets_write" on public.farm_markets
  for all using (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  );

create policy "events_select" on public.events
  for select using (
    exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = auth.uid()))
  );
create policy "events_write" on public.events
  for all using (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  );
