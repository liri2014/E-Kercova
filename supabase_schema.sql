-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
-- Links to Supabase Auth. Users can only see/edit their own profile.
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  phone text,
  role text check (role in ('citizen', 'admin')) default 'citizen',
  fcm_token text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. REPORTS TABLE
-- Citizens submit reports. Only they can see their own. Admins see all.
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  category text not null,
  description text,
  photo_url text,
  lat double precision,
  lng double precision,
  status text check (status in ('pending', 'investigating', 'resolved', 'rejected')) default 'pending',
  ai_analysis_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.reports enable row level security;

create policy "Citizens can view own reports" on public.reports
  for select using (auth.uid() = user_id);

create policy "Citizens can insert own reports" on public.reports
  for insert with check (auth.uid() = user_id);

create policy "Admins can view all reports" on public.reports
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all reports" on public.reports
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 3. PARKING ZONES TABLE
-- Publicly readable. Only Admins can manage.
create table public.parking_zones (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  rate double precision not null, -- Price per hour
  capacity int not null,
  occupied int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.parking_zones enable row level security;

create policy "Public can view parking zones" on public.parking_zones
  for select using (true);

create policy "Admins can manage parking zones" on public.parking_zones
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 4. TRANSACTIONS TABLE
-- Records parking payments. Users see their own.
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  zone_id uuid references public.parking_zones(id),
  amount double precision not null,
  duration int not null, -- in minutes
  plate_number text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

-- 5. NEWS TABLE
-- Publicly readable. Only Admins can manage.
create table public.news (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  type text check (type in ('news', 'alert', 'maintenance')) default 'news',
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.news enable row level security;

create policy "Public can view news" on public.news
  for select using (true);

create policy "Admins can manage news" on public.news
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. EVENTS TABLE
-- Publicly readable. Only Admins can manage.
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date timestamp with time zone not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.events enable row level security;

create policy "Public can view events" on public.events
  for select using (true);

create policy "Admins can manage events" on public.events
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 7. STORAGE BUCKET SETUP
-- Note: You may need to create the bucket 'app-uploads' manually in the dashboard if this fails.
insert into storage.buckets (id, name, public)
values ('app-uploads', 'app-uploads', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Authenticated users can upload images"
on storage.objects for insert
with check (
  bucket_id = 'app-uploads' and
  auth.role() = 'authenticated'
);

create policy "Public can view images"
on storage.objects for select
using ( bucket_id = 'app-uploads' );

-- 8. TRIGGER FOR NEW USERS
-- Automatically create a profile when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, phone)
  values (new.id, 'citizen', new.phone);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
