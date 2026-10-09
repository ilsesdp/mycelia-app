-- Fix: security_invoker=true made this view apply the *querying* user's RLS
-- to the profiles join, which only allows a user to see their own profile —
-- so it returned nothing for anyone else's farm. A public, visibility-aware
-- view has to run with elevated privileges and do its own filtering instead,
-- which it already does via the CASE expressions below.
drop view if exists public.farm_public_contact;

create view public.farm_public_contact as
select
  f.id as farm_id,
  p.contact_name,
  case
    when p.email_visibility = 'everyone' then p.contact_email
    when p.email_visibility = 'growers_only' and auth.uid() is not null then p.contact_email
    else null
  end as contact_email,
  case
    when p.phone_visibility = 'everyone' then p.contact_phone
    when p.phone_visibility = 'growers_only' and auth.uid() is not null then p.contact_phone
    else null
  end as contact_phone,
  p.email_visibility,
  p.phone_visibility,
  p.message_channel
from public.farms f
join public.profiles p on p.id = f.owner_id
where f.published = true;

grant select on public.farm_public_contact to anon, authenticated;
