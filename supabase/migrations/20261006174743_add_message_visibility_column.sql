alter table public.profiles add column message_visibility public.visibility_t not null default 'growers_only';
