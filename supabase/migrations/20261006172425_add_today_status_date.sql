alter table public.farms add column today_status_date date;
update public.farms set today_status = null, today_status_note = null where id = '0a126cf9-d622-46e3-b810-3fa08213c0d0';
