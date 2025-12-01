-- Migration: Add parking reminders table for push notification scheduling
-- Run this in Supabase SQL Editor

-- Create parking_reminders table
CREATE TABLE IF NOT EXISTS parking_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parking_zone TEXT,
    plate_number TEXT,
    end_time TIMESTAMPTZ NOT NULL,
    reminder_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- Create index for efficient querying of pending reminders
CREATE INDEX IF NOT EXISTS idx_parking_reminders_pending 
ON parking_reminders(reminder_time) 
WHERE status = 'pending';

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_parking_reminders_user 
ON parking_reminders(user_id);

-- Enable RLS
ALTER TABLE parking_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reminders
CREATE POLICY "Users can view own reminders"
ON parking_reminders FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own reminders
CREATE POLICY "Users can create own reminders"
ON parking_reminders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reminders
CREATE POLICY "Users can update own reminders"
ON parking_reminders FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for backend)
CREATE POLICY "Service role full access"
ON parking_reminders FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Add columns to notifications table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'sent_count') THEN
        ALTER TABLE notifications ADD COLUMN sent_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'failed_count') THEN
        ALTER TABLE notifications ADD COLUMN failed_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON parking_reminders TO authenticated;
GRANT ALL ON parking_reminders TO service_role;

