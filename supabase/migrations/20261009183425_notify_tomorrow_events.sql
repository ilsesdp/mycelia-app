-- Scheduled (pg_cron) reminder: "the day before an event you're hosting".
-- Mirrors the existing messages_notify_sms / notify_new_message() pattern --
-- reads the shared webhook secret from Vault and calls an Edge Function via
-- pg_net -- but is time-driven (cron) instead of row-insert-driven (trigger),
-- since this has to fire the day before the event date, not at insert time.
--
-- Covers all three event date shapes from public.events.date_mode:
--   'single'   -- event_date is the (only) day; remind the day before it.
--   'range'    -- event_date is the first day of a range; remind the day
--                 before the range starts (not every day in the range).
--   'selected' -- specific dates live in public.event_dates; remind the day
--                 before EACH selected date (an event can fire more than
--                 once if it has multiple selected dates).
-- The Edge Function (send-event-reminder) resolves farm -> owner, checks
-- notif_event_on / notif_pause, and sends the push -- same division of
-- labor as send-push-notification.
create or replace function public.notify_tomorrow_events()
returns void
language plpgsql
security definer
set search_path to 'public', 'vault'
as $$
declare
  v_secret text;
  v_tomorrow date := (now() at time zone 'utc')::date + 1;
  r record;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name = 'webhook_secret'
  limit 1;
  if v_secret is null then
    return;
  end if;

  for r in
    select e.id as event_id, e.farm_id, e.name as event_name, v_tomorrow as event_date
    from events e
    where e.date_mode in ('single', 'range')
      and e.event_date = v_tomorrow
    union all
    select e.id as event_id, e.farm_id, e.name as event_name, ed.event_date
    from event_dates ed
    join events e on e.id = ed.event_id
    where e.date_mode = 'selected'
      and ed.event_date = v_tomorrow
  loop
    perform net.http_post(
      url := 'https://qcsmasqxxrngylxrsbsy.supabase.co/functions/v1/send-event-reminder',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', v_secret),
      body := jsonb_build_object('event_id', r.event_id, 'farm_id', r.farm_id, 'event_name', r.event_name, 'event_date', r.event_date)
    );
  end loop;
end;
$$;

-- Daily at 13:00 UTC (~8am Eastern / 7am Central) -- a morning heads-up the
-- day before the event, in line with farms defaulting to America/Chicago.
select cron.schedule(
  'notify-tomorrow-events-daily',
  '0 13 * * *',
  $$select public.notify_tomorrow_events();$$
);
