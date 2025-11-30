-- Notifications table for storing push notification history
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    body text NOT NULL,
    target_type text NOT NULL DEFAULT 'all', -- 'all', 'citizens', 'admins', 'specific'
    target_count integer DEFAULT 0,
    data jsonb DEFAULT '{}',
    status text DEFAULT 'sent',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admins can view notifications" ON public.notifications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can insert notifications
CREATE POLICY "Admins can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can delete notifications
CREATE POLICY "Admins can delete notifications" ON public.notifications
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);

