alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.farm_hours enable row level security;
alter table public.farm_categories enable row level security;

-- profiles: a grower can only read/write their own row directly. Public
-- contact info is exposed separately through farm_public_contact (next
-- migration), filtered by the visibility settings this row holds.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- farms: anyone (including signed-out visitors) can read a published farm;
-- an owner can always read/manage their own, published or not.
create policy "farms_select_published" on public.farms
  for select using (published = true);
create policy "farms_select_own" on public.farms
  for select using (auth.uid() = owner_id);
create policy "farms_insert_own" on public.farms
  for insert with check (auth.uid() = owner_id);
create policy "farms_update_own" on public.farms
  for update using (auth.uid() = owner_id);
create policy "farms_delete_own" on public.farms
  for delete using (auth.uid() = owner_id);

-- farm_hours / farm_categories: readable wherever the parent farm is
-- readable (published, or owned); writable by that farm's owner only.
create policy "farm_hours_select" on public.farm_hours
  for select using (
    exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = auth.uid()))
  );
create policy "farm_hours_write" on public.farm_hours
  for all using (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  );

create policy "farm_categories_select" on public.farm_categories
  for select using (
    exists (select 1 from public.farms f where f.id = farm_id and (f.published or f.owner_id = auth.uid()))
  );
create policy "farm_categories_write" on public.farm_categories
  for all using (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = auth.uid())
  );

-- Public, visibility-aware contact info for a farm's profile page (2.4/2.11
-- "How to reach you" section) — the only way a visitor ever sees a grower's
-- email/phone, and only the fields that visibility setting allows through.
-- 'nobody' never surfaces here at all, matching the app's privacy pills.
create view public.farm_public_contact
with (security_invoker = true)
as
select
  f.id as farm_id,
  p.contact_name,
  case when p.email_visibility <> 'nobody' then p.contact_email end as contact_email,
  case when p.phone_visibility <> 'nobody' then p.contact_phone end as contact_phone,
  p.email_visibility,
  p.phone_visibility,
  p.message_channel
from public.farms f
join public.profiles p on p.id = f.owner_id
where f.published = true;
