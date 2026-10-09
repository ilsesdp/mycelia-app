-- Categories: rename two existing values to match the corrected/updated
-- wording, and add three new categories Ilse asked for.
ALTER TYPE category_t RENAME VALUE 'Hand Crafts' TO 'Handmade Crafts';
ALTER TYPE category_t RENAME VALUE 'Baked goods' TO 'Baked Goods';
ALTER TYPE category_t ADD VALUE IF NOT EXISTS 'Fiber Goods';
ALTER TYPE category_t ADD VALUE IF NOT EXISTS 'Mushrooms';
ALTER TYPE category_t ADD VALUE IF NOT EXISTS 'Dry Goods';

-- Units: add the new values Ilse asked for. 'kg' stays in the enum type
-- (no products use it, and Postgres can't drop an enum value in place
-- without rebuilding the type/column) but the app's UNITS list no longer
-- offers it, so it simply won't appear as a choice anymore.
ALTER TYPE unit_t ADD VALUE IF NOT EXISTS 'fl oz';
ALTER TYPE unit_t ADD VALUE IF NOT EXISTS 'gallon';
ALTER TYPE unit_t ADD VALUE IF NOT EXISTS 'pack';
ALTER TYPE unit_t ADD VALUE IF NOT EXISTS 'bag';
ALTER TYPE unit_t ADD VALUE IF NOT EXISTS 'loaf';
