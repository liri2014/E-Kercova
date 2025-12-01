-- ============================================
-- RESET USERS AND PARKING REVENUE
-- Run this in Supabase SQL Editor
-- ============================================

-- ⚠️ WARNING: This will permanently delete data!
-- Make sure you have a backup before running.

-- Step 1: Get admin user IDs (to preserve)
-- First, let's see which users are admins
SELECT id, phone, role FROM profiles WHERE role = 'admin';

-- Step 2: Delete all transactions (parking revenue)
-- This resets all parking payments
DELETE FROM transactions;

-- Step 3: Reset parking zone occupancy to 0
UPDATE parking_zones SET occupied = 0;

-- Step 4: Delete parking reminders
DELETE FROM parking_reminders;

-- Step 5: Delete all reports from non-admin users
DELETE FROM reports 
WHERE user_id IN (
    SELECT id FROM profiles WHERE role != 'admin'
);

-- Step 6: Delete report upvotes and comments
DELETE FROM report_upvotes 
WHERE user_id IN (
    SELECT id FROM profiles WHERE role != 'admin'
);

DELETE FROM report_comments 
WHERE user_id IN (
    SELECT id FROM profiles WHERE role != 'admin'
);

-- Step 7: Delete notifications
DELETE FROM notifications;

-- Step 8: Delete non-admin profiles
-- (This will cascade to delete their auth.users via trigger or you need to do it manually)
DELETE FROM profiles WHERE role != 'admin';

-- Step 9: Delete non-admin users from auth.users
-- ⚠️ NOTE: This requires service role access
-- You may need to do this via the Supabase Dashboard > Authentication > Users
-- Or use the Admin API

-- To delete auth users programmatically, you would need to:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Users
-- 3. Select all non-admin users
-- 4. Click Delete

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check remaining users
SELECT 'Remaining profiles:' as info;
SELECT id, phone, role FROM profiles;

-- Check transactions are cleared
SELECT 'Transactions count:' as info;
SELECT COUNT(*) as transaction_count FROM transactions;

-- Check parking zones are reset
SELECT 'Parking zones:' as info;
SELECT name, occupied, capacity FROM parking_zones;

