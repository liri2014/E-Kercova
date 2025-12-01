-- Migration: Add community engagement features (upvotes, comments)
-- Run this in your Supabase SQL editor

-- Add upvotes count to reports table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS upvotes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Create report_upvotes table to track who upvoted
CREATE TABLE IF NOT EXISTS public.report_upvotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_id, user_id)
);

-- Create report_comments table
CREATE TABLE IF NOT EXISTS public.report_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_report_upvotes_report_id ON public.report_upvotes(report_id);
CREATE INDEX IF NOT EXISTS idx_report_upvotes_user_id ON public.report_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_report_id ON public.report_comments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_user_id ON public.report_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports USING GIST (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)
) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE public.report_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;

-- Upvotes policies
CREATE POLICY "Users can view all upvotes" ON public.report_upvotes
    FOR SELECT USING (true);

CREATE POLICY "Users can add their own upvotes" ON public.report_upvotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own upvotes" ON public.report_upvotes
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view all comments" ON public.report_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can add their own comments" ON public.report_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.report_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.report_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update upvotes count
CREATE OR REPLACE FUNCTION update_report_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.reports SET upvotes_count = upvotes_count + 1 WHERE id = NEW.report_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.reports SET upvotes_count = upvotes_count - 1 WHERE id = OLD.report_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_report_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.reports SET comments_count = comments_count + 1 WHERE id = NEW.report_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.reports SET comments_count = comments_count - 1 WHERE id = OLD.report_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_upvotes_count ON public.report_upvotes;
CREATE TRIGGER trigger_update_upvotes_count
    AFTER INSERT OR DELETE ON public.report_upvotes
    FOR EACH ROW EXECUTE FUNCTION update_report_upvotes_count();

DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.report_comments;
CREATE TRIGGER trigger_update_comments_count
    AFTER INSERT OR DELETE ON public.report_comments
    FOR EACH ROW EXECUTE FUNCTION update_report_comments_count();

-- Create city_services table for appointments and requests
CREATE TABLE IF NOT EXISTS public.city_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_mk TEXT,
    name_sq TEXT,
    description_en TEXT,
    description_mk TEXT,
    description_sq TEXT,
    icon TEXT,
    category TEXT NOT NULL, -- 'utility', 'document', 'appointment'
    url TEXT, -- external link if applicable
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.city_services(id),
    service_type TEXT NOT NULL, -- 'utility_bill', 'document_request', 'appointment'
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
    details JSONB,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on city services tables
ALTER TABLE public.city_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- City services policies
CREATE POLICY "Anyone can view active city services" ON public.city_services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage city services" ON public.city_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Service requests policies
CREATE POLICY "Users can view their own requests" ON public.service_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON public.service_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending requests" ON public.service_requests
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all requests" ON public.service_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all requests" ON public.service_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Insert default city services
INSERT INTO public.city_services (name_en, name_mk, name_sq, description_en, icon, category) VALUES
('Pay Water Bill', 'Плати сметка за вода', 'Paguaj faturen e ujit', 'Pay your monthly water utility bill', 'droplet', 'utility'),
('Pay Electricity Bill', 'Плати сметка за струја', 'Paguaj faturen e rrymës', 'Pay your electricity bill', 'zap', 'utility'),
('Pay Property Tax', 'Плати данок на имот', 'Paguaj tatimin në pronë', 'Pay annual property tax', 'home', 'utility'),
('Request Birth Certificate', 'Барај извод од матична книга', 'Kërko certifikatë lindjeje', 'Request official birth certificate', 'file-text', 'document'),
('Request Marriage Certificate', 'Барај венчаница', 'Kërko certifikatë martese', 'Request marriage certificate copy', 'heart', 'document'),
('Request Building Permit', 'Барај градежна дозвола', 'Kërko leje ndërtimi', 'Apply for construction permit', 'building', 'document'),
('Schedule City Hall Visit', 'Закажи посета во општина', 'Cakto vizitë në komunë', 'Book appointment at city hall', 'calendar', 'appointment'),
('Schedule Waste Pickup', 'Закажи собирање отпад', 'Cakto mbledhjen e mbeturinave', 'Schedule large item pickup', 'trash', 'appointment'),
('Report Street Light Issue', 'Пријави проблем со улично осветлување', 'Raporto problem me ndriçimin', 'Report broken street lights', 'lightbulb', 'appointment')
ON CONFLICT DO NOTHING;

