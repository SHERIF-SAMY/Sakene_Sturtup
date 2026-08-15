-- 1. Update roles in profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role in ('tenant','student','broker','owner','admin','super_admin'));

-- 2. Add featured and rating info to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured boolean default false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS rating_avg numeric(3,2) default 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS review_count int default 0;

-- 3. Prevent duplicate ratings from same student for same property
ALTER TABLE reviews ADD CONSTRAINT IF NOT EXISTS reviews_property_student_unique UNIQUE (property_id, student_id);

-- 4. Add sequential property_number (auto, remains fixed even if property archived)
CREATE SEQUENCE IF NOT EXISTS property_number_seq START 1 INCREMENT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_number int;
-- Backfill existing properties with sequential numbers (run once)
UPDATE properties SET property_number = nextval('property_number_seq') WHERE property_number IS NULL;
-- Create trigger to auto-assign property_number on INSERT
CREATE OR REPLACE FUNCTION assign_property_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.property_number IS NULL THEN
    NEW.property_number := nextval('property_number_seq');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_assign_property_number ON properties;
CREATE TRIGGER trg_assign_property_number
  BEFORE INSERT ON properties
  FOR EACH ROW EXECUTE FUNCTION assign_property_number();

-- 5. Add broker referral fields to visits
ALTER TABLE visits ADD COLUMN IF NOT EXISTS via_broker boolean default false;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS referral_broker_name text;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS referral_broker_phone text;

-- 6. Track which admin processed/completed a visit
ALTER TABLE visits ADD COLUMN IF NOT EXISTS processed_by_admin_id uuid references profiles(id) on delete set null;

-- 7. Admin earnings tracking table
CREATE TABLE IF NOT EXISTS admin_earnings (
  id          serial primary key,
  admin_id    uuid not null references profiles(id) on delete cascade,
  visit_id    int references visits(id) on delete set null,
  amount      numeric not null default 200,
  operation   text not null default 'completed',
  created_at  timestamptz default now()
);
ALTER TABLE admin_earnings ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS automatically; super_admin can read all
CREATE POLICY IF NOT EXISTS "super_admin reads admin_earnings" ON admin_earnings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE INDEX IF NOT EXISTS idx_admin_earnings_admin_id ON admin_earnings(admin_id);
CREATE INDEX IF NOT EXISTS idx_visits_processed_by ON visits(processed_by_admin_id);



-- Add for_students column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS for_students BOOLEAN DEFAULT false;

-- 8. Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id         serial primary key,
  name       text not null,
  email      text,
  phone      text,
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- 9. Add beds_count and tenant_type columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS beds_count INT DEFAULT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'all';

-- 10. Update properties status constraint to include 'booked'
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE properties ADD CONSTRAINT properties_status_check CHECK (status in ('pending','active','inactive','rejected','archived','booked'));

-- 11. Add rent duration fields to visits
ALTER TABLE visits ADD COLUMN IF NOT EXISTS rent_start_date date;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS rent_end_date date;

-- 12. Ensure unique phone numbers in profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;
ALTER TABLE profiles ADD CONSTRAINT profiles_phone_key UNIQUE (phone);

