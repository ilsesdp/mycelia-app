drop policy "farms_select_own" on public.farms;
drop policy "farms_select_published" on public.farms;
create policy "farms_select" on public.farms
  for select using (published = true or (select auth.uid()) = owner_id);
