-- ============================================================
-- Contact Messages table for Agarly
-- Run this in: Supabase → SQL Editor → New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id         serial primary key,
  name       text not null,
  email      text,
  phone      text,
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);
