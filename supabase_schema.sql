-- ============================================================
-- AGARLY DATABASE SCHEMA — FULL MIGRATION
-- Run this in: Supabase → SQL Editor → New Query
-- ============================================================

-- ────────────────────────────────────────
-- 1. EXTENSIONS
-- ────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────
-- 2. CORE TABLES
-- ────────────────────────────────────────

-- Cities
create table if not exists cities (
  id          serial primary key,
  name        text not null,
  governorate text,
  created_at  timestamptz default now()
);

-- Universities
create table if not exists universities (
  id         serial primary key,
  name       text not null,
  city_id    int references cities(id) on delete set null,
  created_at timestamptz default now()
);

-- Amenities
create table if not exists amenities (
  id         serial primary key,
  name       text not null unique,
  icon       text,
  created_at timestamptz default now()
);

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  first_name  text not null default 'User',
  last_name   text not null default '',
  phone       text,
  avatar      text,
  role        text not null default 'tenant' check (role in ('tenant','student','broker','owner','admin')),
  is_broker_account boolean not null default false,
  is_verified boolean not null default false,
  status      text not null default 'active' check (status in ('active','suspended','deleted')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Broker Profiles
create table if not exists broker_profiles (
  id              serial primary key,
  user_id         uuid not null references profiles(id) on delete cascade,
  company_name    text,
  bio             text,
  experience_years int default 0,
  verified_badge  boolean default false,
  rating          numeric(3,2) default 0,
  review_count    int default 0,
  response_time   text,
  response_rate   int default 0,
  slug            text unique,
  created_at      timestamptz default now()
);

-- QR Codes
create table if not exists qr_codes (
  id         serial primary key,
  broker_id  int references broker_profiles(id) on delete cascade,
  code       text not null unique,
  url        text not null,
  scan_count int default 0,
  created_at timestamptz default now()
);

-- ────────────────────────────────────────
-- 3. PROPERTY TABLES
-- ────────────────────────────────────────

-- Properties
create table if not exists properties (
  id             serial primary key,
  title          text not null,
  description    text default '',
  city_id        int references cities(id),
  university_id  int references universities(id),
  district       text default '',
  address        text default '',
  latitude       numeric,
  longitude      numeric,
  floor          int default 0,
  area           numeric default 0,
  bedrooms       int default 1,
  bathrooms      int default 1,
  furnished      boolean default false,
  gender_allowed text default 'any' check (gender_allowed in ('any','male','female')),
  for_students   boolean default false,
  broker_id      int references broker_profiles(id) on delete set null,
  owner_id       uuid references profiles(id) on delete set null,
  status         text default 'pending' check (status in ('pending','active','inactive','rejected','archived','booked')),
  rejection_reason text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Property Images
create table if not exists property_images (
  id            serial primary key,
  property_id   int not null references properties(id) on delete cascade,
  image_url     text not null,
  is_cover      boolean default false,
  display_order int default 0,
  created_at    timestamptz default now()
);

-- Property ↔ Amenities (junction table)
create table if not exists property_amenities (
  property_id int not null references properties(id) on delete cascade,
  amenity_id  int not null references amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

-- Rooms
create table if not exists rooms (
  id          serial primary key,
  property_id int not null references properties(id) on delete cascade,
  name        text not null default 'Room 1',
  beds_count  int default 1,
  gender      text default 'any' check (gender in ('any','male','female')),
  available   boolean default true,
  created_at  timestamptz default now()
);

-- Beds
create table if not exists beds (
  id          serial primary key,
  room_id     int not null references rooms(id) on delete cascade,
  bed_number  text not null default 'A',
  price       numeric not null default 0,
  status      text default 'available' check (status in ('available','occupied','reserved')),
  created_at  timestamptz default now()
);

-- Listings
create table if not exists listings (
  id              serial primary key,
  property_id     int not null references properties(id) on delete cascade,
  room_id         int references rooms(id) on delete set null,
  bed_id          int references beds(id) on delete set null,
  listing_type    text not null default 'entire_apartment'
                    check (listing_type in ('entire_apartment','private_room','shared_bed')),
  price           numeric not null default 0,
  deposit         numeric default 0,
  minimum_months  int default 1,
  available_from  date default current_date,
  status          text default 'active' check (status in ('active','inactive','deleted')),
  created_at      timestamptz default now()
);

-- ────────────────────────────────────────
-- 4. STUDENT INTERACTION TABLES
-- ────────────────────────────────────────

-- Favorites
create table if not exists favorites (
  id          serial primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  property_id int not null references properties(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, property_id)
);

-- Visits / Booking Requests
create table if not exists visits (
  id             serial primary key,
  student_id     uuid references profiles(id) on delete set null,
  broker_id      int references broker_profiles(id) on delete set null,
  listing_id     int references listings(id) on delete set null,
  visit_date     date,
  visit_time     time,
  status         text default 'pending' check (status in ('pending','confirmed','completed','cancelled','no_show')),
  notes          text,
  booking_fee    numeric default 50,
  payment_status text default 'pending' check (payment_status in ('pending','paid','refunded')),
  created_at     timestamptz default now()
);

-- Reviews
create table if not exists reviews (
  id          serial primary key,
  property_id int not null references properties(id) on delete cascade,
  student_id  uuid references profiles(id) on delete set null,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id         serial primary key,
  user_id    uuid not null references profiles(id) on delete cascade,
  title      text not null,
  body       text,
  type       text default 'info',
  is_read    boolean default false,
  link       text,
  created_at timestamptz default now()
);

-- ────────────────────────────────────────
-- 5. INDEXES (for performance)
-- ────────────────────────────────────────
create index if not exists idx_properties_broker_id     on properties(broker_id);
create index if not exists idx_properties_city_id       on properties(city_id);
create index if not exists idx_properties_status        on properties(status);
create index if not exists idx_property_images_prop_id  on property_images(property_id);
create index if not exists idx_listings_property_id     on listings(property_id);
create index if not exists idx_rooms_property_id        on rooms(property_id);
create index if not exists idx_beds_room_id             on beds(room_id);
create index if not exists idx_favorites_user_id        on favorites(user_id);
create index if not exists idx_visits_student_id        on visits(student_id);
create index if not exists idx_visits_broker_id         on visits(broker_id);
create index if not exists idx_notifications_user_id    on notifications(user_id);
create index if not exists idx_broker_profiles_user_id  on broker_profiles(user_id);
create index if not exists idx_reviews_property_id      on reviews(property_id);

-- ────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────
alter table profiles           enable row level security;
alter table broker_profiles    enable row level security;
alter table properties         enable row level security;
alter table property_images    enable row level security;
alter table property_amenities enable row level security;
alter table listings           enable row level security;
alter table rooms              enable row level security;
alter table beds               enable row level security;
alter table favorites          enable row level security;
alter table visits             enable row level security;
alter table reviews            enable row level security;
alter table notifications      enable row level security;
alter table qr_codes           enable row level security;
alter table cities             enable row level security;
alter table universities       enable row level security;
alter table amenities          enable row level security;

-- Public read access for lookup tables
create policy "public read cities"        on cities        for select using (true);
create policy "public read universities"  on universities  for select using (true);
create policy "public read amenities"     on amenities     for select using (true);
create policy "public read properties"    on properties    for select using (status = 'active');
create policy "public read prop images"   on property_images    for select using (true);
create policy "public read prop amenities" on property_amenities for select using (true);
create policy "public read listings"      on listings      for select using (status = 'active');
create policy "public read rooms"         on rooms         for select using (true);
create policy "public read beds"          on beds          for select using (true);
create policy "public read broker_profiles" on broker_profiles for select using (true);
create policy "public read reviews"       on reviews       for select using (true);

-- Profiles: user sees their own
create policy "user reads own profile"   on profiles for select using (auth.uid() = id);
create policy "user updates own profile" on profiles for update using (auth.uid() = id);

-- Favorites: user manages their own
create policy "user manages favorites"   on favorites for all using (auth.uid() = user_id);

-- Visits: student sees own visits
create policy "student sees own visits"  on visits for select using (auth.uid() = student_id);
create policy "student creates visits"   on visits for insert with check (auth.uid() = student_id);

-- Notifications: user sees their own
create policy "user sees own notifications" on notifications for all using (auth.uid() = user_id);

-- ────────────────────────────────────────
-- 7. SERVICE ROLE BYPASS POLICIES
-- (For our API server using service_role key)
-- ────────────────────────────────────────
-- The service_role key already bypasses RLS automatically.
-- No extra policies needed for the backend API.

-- ────────────────────────────────────────
-- 8. SEED DATA (optional - delete if not needed)
-- ────────────────────────────────────────

-- Sample Cities
insert into cities (name, governorate) values
  ('Cairo', 'Cairo'),
  ('Alexandria', 'Alexandria'),
  ('Giza', 'Giza'),
  ('Kafr El-Sheikh', 'Kafr El-Sheikh'),
  ('Mansoura', 'Dakahlia'),
  ('Tanta', 'Gharbia')
on conflict do nothing;

-- Sample Amenities
insert into amenities (name, icon) values
  ('WiFi', 'wifi'),
  ('AC', 'wind'),
  ('Kitchen', 'utensils'),
  ('Laundry', 'washing-machine'),
  ('Elevator', 'arrow-up'),
  ('Parking', 'car'),
  ('TV', 'tv'),
  ('Closet', 'archive'),
  ('Desk', 'monitor'),
  ('Security', 'shield'),
  ('Water Heater', 'flame'),
  ('Microwave', 'box')
on conflict (name) do nothing;
