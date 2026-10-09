create table public.products (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  category public.category_t,
  availability public.availability_t not null default 'ready_now',
  qty text, -- "20" for Ready now, or free text like "Ready in ~3 weeks" for Producing/Planning
  unit public.unit_t,
  roughly_when text,
  photo_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_farm_id_idx on public.products(farm_id);

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Shared registry, not per-farm (multiple farms can list the same market).
create table public.markets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  schedule_text text,
  created_at timestamptz not null default now()
);

create table public.farm_markets (
  farm_id uuid not null references public.farms(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade,
  primary key (farm_id, market_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  event_date date not null,
  starts_at time,
  ends_at time,
  notes text,
  photo_url text, -- event photo upload went real in v85 (ev.photo)
  created_at timestamptz not null default now()
);

create index events_farm_id_date_idx on public.events(farm_id, event_date);
