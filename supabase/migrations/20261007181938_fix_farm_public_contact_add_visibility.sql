
create or replace view public.farm_public_contact as
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
  p.message_channel,
  p.message_visibility
from farms f
join profiles p on p.id = f.owner_id
where f.published = true;
