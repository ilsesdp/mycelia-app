
alter table public.notification_log drop constraint if exists notification_log_channel_check;
alter table public.notification_log add constraint notification_log_channel_check check (channel = any (array['sms'::text, 'email'::text, 'push'::text]));
