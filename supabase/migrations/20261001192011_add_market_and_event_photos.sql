create table public.market_photos (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.market_photos enable row level security;
alter table public.event_photos enable row level security;

-- market_photos: same shape as markets itself — anyone can read, any
-- authenticated user can add (matches markets_insert_authenticated, since
-- a market has no single owning farm).
create policy market_photos_select_all on public.market_photos for select using (true);
create policy market_photos_insert_authenticated on public.market_photos for insert with check ((select auth.uid()) is not null);
create policy market_photos_delete_authenticated on public.market_photos for delete using ((select auth.uid()) is not null);

-- event_photos: mirrors events' own RLS — readable when the parent event
-- is readable (farm published or you own it), writable only by the
-- event's farm owner.
create policy event_photos_select on public.event_photos for select using (
  exists (select 1 from public.events e join public.farms f on f.id = e.farm_id
          where e.id = event_photos.event_id and (f.published or f.owner_id = (select auth.uid())))
);
create policy event_photos_insert on public.event_photos for insert with check (
  exists (select 1 from public.events e join public.farms f on f.id = e.farm_id
          where e.id = event_photos.event_id and f.owner_id = (select auth.uid()))
);
create policy event_photos_delete on public.event_photos for delete using (
  exists (select 1 from public.events e join public.farms f on f.id = e.farm_id
          where e.id = event_photos.event_id and f.owner_id = (select auth.uid()))
);
