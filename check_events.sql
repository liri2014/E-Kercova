-- Check if events exist in your database
SELECT * FROM public.events ORDER BY date;

-- If no events exist, run this to add some test events:
INSERT INTO public.events (title, date, type) VALUES
('Summer Festival', NOW() + INTERVAL '10 days', 'event'),
('Independence Day', NOW() + INTERVAL '20 days', 'event');

-- Check the schema to see what fields events has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events';
