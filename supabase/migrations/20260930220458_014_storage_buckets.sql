-- One public bucket, path-namespaced by farm: <farm_id>/cover.jpg,
-- <farm_id>/products/<product_id>.jpg, <farm_id>/events/<event_id>.jpg,
-- <farm_id>/markets/<market_id>.jpg — matches the prototype's photo wells
-- (1.6 cover, 1.9b/4.4/4.5 product, 1.17 market, 4.16 event, 5.3 cover).
-- Public read because a published farm's photos need to render on its
-- public profile with no auth; write restricted to that farm's owner.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('farm-photos', 'farm-photos', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif']);

create policy "farm_photos_public_read" on storage.objects
  for select using (bucket_id = 'farm-photos');

create policy "farm_photos_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'farm-photos'
    and exists (
      select 1 from public.farms f
      where f.id::text = (storage.foldername(name))[1]
        and f.owner_id = (select auth.uid())
    )
  );

create policy "farm_photos_owner_update" on storage.objects
  for update using (
    bucket_id = 'farm-photos'
    and exists (
      select 1 from public.farms f
      where f.id::text = (storage.foldername(name))[1]
        and f.owner_id = (select auth.uid())
    )
  );

create policy "farm_photos_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'farm-photos'
    and exists (
      select 1 from public.farms f
      where f.id::text = (storage.foldername(name))[1]
        and f.owner_id = (select auth.uid())
    )
  );
