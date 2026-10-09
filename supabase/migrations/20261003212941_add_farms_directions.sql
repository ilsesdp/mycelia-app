ALTER TABLE public.farms ADD COLUMN directions text;
COMMENT ON COLUMN public.farms.directions IS 'Free-text driving/arrival directions shown on the About tab, separate from the structured street address (e.g. "Gravel driveway on the left, past the red barn").';
