-- Migration: Add is_broker_account column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_broker_account boolean NOT NULL DEFAULT false;
