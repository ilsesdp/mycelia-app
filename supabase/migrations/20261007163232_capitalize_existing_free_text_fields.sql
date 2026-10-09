
-- One-time backfill to match the new auto-capitalize-first-letter
-- behavior added to the app's name/title/description form fields.
-- Only touches values currently starting with a lowercase letter.
update farms set name = upper(left(name,1)) || substring(name from 2) where name ~ '^[a-z]';
update farms set about = upper(left(about,1)) || substring(about from 2) where about ~ '^[a-z]';
update farms set directions = upper(left(directions,1)) || substring(directions from 2) where directions ~ '^[a-z]';
update profiles set contact_name = upper(left(contact_name,1)) || substring(contact_name from 2) where contact_name ~ '^[a-z]';
update profiles set full_name = upper(left(full_name,1)) || substring(full_name from 2) where full_name ~ '^[a-z]';
update products set name = upper(left(name,1)) || substring(name from 2) where name ~ '^[a-z]';
update products set roughly_when = upper(left(roughly_when,1)) || substring(roughly_when from 2) where roughly_when ~ '^[a-z]';
update markets set name = upper(left(name,1)) || substring(name from 2) where name ~ '^[a-z]';
update markets set location = upper(left(location,1)) || substring(location from 2) where location ~ '^[a-z]';
update events set name = upper(left(name,1)) || substring(name from 2) where name ~ '^[a-z]';
update events set notes = upper(left(notes,1)) || substring(notes from 2) where notes ~ '^[a-z]';
