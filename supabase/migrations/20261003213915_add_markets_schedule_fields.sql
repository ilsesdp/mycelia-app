ALTER TABLE public.markets
  ADD COLUMN day_of_week smallint CHECK (day_of_week BETWEEN 0 AND 6),
  ADD COLUMN open_time time,
  ADD COLUMN close_time time;

COMMENT ON COLUMN public.markets.day_of_week IS 'Day the market runs, 0 = Sunday .. 6 = Saturday, same convention as farm_hours.day_of_week. Nullable: older/free-text-only markets may not have a structured day yet.';
COMMENT ON COLUMN public.markets.open_time IS 'Structured open time for day_of_week, parsed from the Hours picker. Paired with close_time to compute a real open/closed status instead of relying on schedule_text alone.';
COMMENT ON COLUMN public.markets.close_time IS 'Structured close time for day_of_week — see open_time.';
