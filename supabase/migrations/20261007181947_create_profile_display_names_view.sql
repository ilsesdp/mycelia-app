
create view public.profile_display_names
with (security_invoker = false) as
select id, contact_name, full_name
from public.profiles;

grant select on public.profile_display_names to authenticated, anon;
grant select on public.farm_public_contact to authenticated, anon;
