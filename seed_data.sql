-- Seed Parking Zones
INSERT INTO public.parking_zones (name, rate, capacity, occupied) VALUES
('Zone A (Center)', 50.0, 100, 45),
('Zone B (Market)', 30.0, 150, 120),
('Zone C (Park)', 20.0, 80, 10);

-- Seed News
INSERT INTO public.news (title, description, type, start_date) VALUES
('City Water Maintenance', 'Scheduled maintenance for the water supply system in Sector 4.', 'alert', NOW()),
('New Park Opening', 'The new city park is officially open for visitors.', 'news', NOW() - INTERVAL '2 days');

-- Seed Events
INSERT INTO public.events (title, date, type) VALUES
('Summer Festival', NOW() + INTERVAL '10 days', 'municipal'),
('Independence Day', NOW() + INTERVAL '20 days', 'holiday');
