-- RUN THIS IN: Supabase → SQL Editor → New Query

-- 1. Add beds_booked, room_id, and booked_rooms columns to visits table
ALTER TABLE visits ADD COLUMN IF NOT EXISTS beds_booked INT DEFAULT 1;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS room_id INT REFERENCES rooms(id) ON DELETE SET NULL;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS booked_rooms TEXT;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_visits_room_id ON visits(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);
