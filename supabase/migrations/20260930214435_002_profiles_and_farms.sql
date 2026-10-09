-- profiles: 1:1 with auth.users. Supabase Auth owns email/password (1.14-1.16
-- map onto it almost exactly — see dev-handoff-audit §5).
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  message_channel public.message_channel_t not null default 'both',
  email_visibility public.visibility_t not null default 'growers_only',
  phone_visibility public.visibility_t not null default 'nobody',
  notif_msg_on boolean not null default true,
  notif_market_on boolean not null default true,
  notif_pause boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- One farm per grower for v1 (owner_id unique). Pods/collectives (Andy's
-- Aug 26 ask) are an explicitly parked Phase 2 idea, not modeled here.
create table public.farms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  google_place_id text, -- set only when address was matched via Google (1.5 "found" state); never fabricated
  about text,
  cover_photo_url text,
  today_status public.today_status_t, -- manual same-day override only, see enum comment
  today_status_note text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index farms_owner_id_idx on public.farms(owner_id);
create index farms_published_idx on public.farms(published) where published;

create trigger set_farms_updated_at
  before update on public.farms
  for each row execute function public.set_updated_at();

-- One row per farm per weekday, normalized (not JSON) so "who's open now"
-- can be queried across farms for the map/filters.
create table public.farm_hours (
  farm_id uuid not null references public.farms(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=Mon .. 6=Sun, matches DAY_ORDER in the app
  open_time time,
  close_time time,
  closed boolean not null default false,
  primary key (farm_id, day_of_week)
);

create table public.farm_categories (
  farm_id uuid not null references public.farms(id) on delete cascade,
  category public.category_t not null,
  primary key (farm_id, category)
);
