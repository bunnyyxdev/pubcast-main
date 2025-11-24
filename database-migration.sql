-- Migration: Add banned column to users table
-- Run this SQL script to add the banned column for user management

-- Add banned column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'banned'
    ) THEN
        ALTER TABLE users ADD COLUMN banned BOOLEAN DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_users_banned ON users(banned);
    END IF;
END $$;

