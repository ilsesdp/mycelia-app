-- Three ways an event's dates can work: a single day, a continuous range
-- of days (one shared time each day), or a specific set of individual
-- dates (optionally with their own time each). `events` keeps its
-- existing flat event_date/starts_at/ends_at columns as the "primary"
-- date — the earliest date either way — so every existing "upcoming"
-- query (gte/order on event_date) keeps working unchanged regardless of
-- mode. New columns carry the mode-specific extra info; event_dates
-- holds the actual list of dates for "selected" mode (one row per date,
-- each with its own optional override time).

alter table public.events
  add column date_mode text not null default 'single'
    check (date_mode in ('single', 'range', 'selected')),
  add column end_date date,
  add column all_day boolean not null default false,
  add column same_time_for_all_dates boolean not null default true;

create table public.event_dates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  event_date date not null,
  starts_at time without time zone,
  ends_at time without time zone,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.event_dates enable row level security;

create policy event_dates_select on public.event_dates for select
  using (
    exists (
      select 1 from public.events e join public.farms f on f.id = e.farm_id
      where e.id = event_dates.event_id and (f.published or f.owner_id = (select auth.uid()))
    )
  );

create policy event_dates_insert on public.event_dates for insert
  with check (
    exists (
      select 1 from public.events e join public.farms f on f.id = e.farm_id
      where e.id = event_dates.event_id and f.owner_id = (select auth.uid())
    )
  );

create policy event_dates_delete on public.event_dates for delete
  using (
    exists (
      select 1 from public.events e join public.farms f on f.id = e.farm_id
      where e.id = event_dates.event_id and f.owner_id = (select auth.uid())
    )
  );
