ALTER TABLE farm_hours ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY;
