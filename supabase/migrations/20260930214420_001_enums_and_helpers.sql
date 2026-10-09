-- Mycelia core schema — enums + shared helper
-- Fixed vocabularies pulled directly from the prototype (index.html) so the
-- database can never drift from what the UI actually offers.

create type public.message_channel_t as enum ('text_me','email_me','both');

-- Visibility for a contact channel. 'nobody' matches the prototype's Sep 30
-- rename (was 'Only me') unifying onboarding (1.11) and Settings > Privacy (5.5).
create type public.visibility_t as enum ('growers_only','everyone','nobody');

-- Manual same-day override only (today_status on farms). Null/absent means
-- "derive from farm_hours" — see the app's todayStatus()/todayKey() logic.
create type public.today_status_t as enum ('open','closed_early','closed');

create type public.availability_t as enum ('ready_now','producing','planning');

-- The prototype's unified 10-category taxonomy (CATEGORIES const, index.html).
create type public.category_t as enum (
  'Vegetables','Fruit','Eggs','Dairy','Honey','Flowers','Herbs','Meat','Baked goods','Fiber'
);

-- The prototype's unit list (UNITS const, index.html).
create type public.unit_t as enum ('lb','oz','kg','bunch','dozen','pint','quart','jar','each');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
