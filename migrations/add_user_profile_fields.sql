-- Add name fields and points system to profiles table
-- Run this in Supabase SQL Editor

-- Add first_name and last_name columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Add points column for future awards system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;

-- Add badges/achievements column (JSONB for flexibility)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]';

-- Add created_at if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Create index for searching by name
CREATE INDEX IF NOT EXISTS profiles_name_idx ON public.profiles(first_name, last_name);

-- Comment on columns for documentation
COMMENT ON COLUMN public.profiles.first_name IS 'User first name collected during registration';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name collected during registration';
COMMENT ON COLUMN public.profiles.points IS 'Points earned through reports and activities';
COMMENT ON COLUMN public.profiles.badges IS 'Array of badge objects: [{id, name, earned_at}]';

