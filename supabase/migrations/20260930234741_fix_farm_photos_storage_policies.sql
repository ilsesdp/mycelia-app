-- The farm_photos_* policies were comparing farms.name (the farm's own
-- name field) to the storage path instead of the object's own storage
-- path, because the subquery's unqualified `name` resolved to `farms.name`
-- rather than the storage.objects row being checked. Fix: qualify the
-- object path explicitly as storage.objects.name so it can't be shadowed
-- by farms.name inside the correlated subquery.

drop policy if exists farm_photos_owner_insert on storage.objects;
create policy farm_photos_owner_insert on storage.objects
for insert
with check (
  bucket_id = 'farm-photos'
  and exists (
    select 1 from farms f
    where f.id::text = (storage.foldername(storage.objects.name))[1]
      and f.owner_id = auth.uid()
  )
);

drop policy if exists farm_photos_owner_update on storage.objects;
create policy farm_photos_owner_update on storage.objects
for update
using (
  bucket_id = 'farm-photos'
  and exists (
    select 1 from farms f
    where f.id::text = (storage.foldername(storage.objects.name))[1]
      and f.owner_id = auth.uid()
  )
);

drop policy if exists farm_photos_owner_delete on storage.objects;
create policy farm_photos_owner_delete on storage.objects
for delete
using (
  bucket_id = 'farm-photos'
  and exists (
    select 1 from farms f
    where f.id::text = (storage.foldername(storage.objects.name))[1]
      and f.owner_id = auth.uid()
  )
);
