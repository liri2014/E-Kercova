-- Run this in your Supabase SQL Editor to promote your user to Admin.
-- Replace 'YOUR_EMAIL_HERE' with your actual email address.

UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);

-- Verify the change
SELECT * FROM public.profiles WHERE role = 'admin';
