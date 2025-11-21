-- Migration: Add multilingual support to news and events tables
-- Run this in Supabase SQL Editor

-- 1. Add multilingual columns to news table
ALTER TABLE public.news 
  ADD COLUMN IF NOT EXISTS title_mk text,
  ADD COLUMN IF NOT EXISTS title_sq text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS description_mk text,
  ADD COLUMN IF NOT EXISTS description_sq text,
  ADD COLUMN IF NOT EXISTS description_en text;

-- 2. Add multilingual columns and holiday flag to events table
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS title_mk text,
  ADD COLUMN IF NOT EXISTS title_sq text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS description_mk text,
  ADD COLUMN IF NOT EXISTS description_sq text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS is_holiday boolean default false;

-- 3. Update existing records to use the new multilingual columns
-- Copy existing title/description to all language columns for backwards compatibility
UPDATE public.news 
SET 
  title_mk = title,
  title_sq = title,
  title_en = title,
  description_mk = description,
  description_sq = description,
  description_en = description
WHERE title_mk IS NULL;

UPDATE public.events 
SET 
  title_mk = title,
  title_sq = title,
  title_en = title,
  description_mk = COALESCE(description, type),
  description_sq = COALESCE(description, type),
  description_en = COALESCE(description, type)
WHERE title_mk IS NULL;
