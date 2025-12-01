-- Add translation columns to news table if they don't exist
-- Run this in Supabase SQL Editor

-- Add title translations
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS title_mk TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS title_sq TEXT;

-- Add description translations
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS description_mk TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS description_sq TEXT;

-- Copy existing title/description to English columns as default
UPDATE public.news 
SET title_en = title 
WHERE title_en IS NULL AND title IS NOT NULL;

UPDATE public.news 
SET description_en = description 
WHERE description_en IS NULL AND description IS NOT NULL;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'news' 
AND column_name LIKE '%_en' OR column_name LIKE '%_mk' OR column_name LIKE '%_sq';

