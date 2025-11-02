-- ====================================================================
-- # Create Users and Mentors Tables for Mentor API
--
-- ## Overview
-- This migration creates the database schema for a mentorship platform 
-- with user authentication, onboarding, and mentor-specific features.
--
-- ## New Tables
--
-- ### 1. users table
--   - id (uuid, primary key) - Unique user identifier
--   - email (text, unique, required) - User's email address
--   - phone (text, unique, required) - User's phone number
--   - password (text) - Hashed password for email/password auth
--   - otp (text) - Hashed OTP for phone verification
--   - otp_expiry (timestamptz) - OTP expiration timestamp
--   - verified (boolean) - Email/phone verification status
--   - role (text) - User role (mentor or mentee)
--   - onboarding_completed (boolean) - Onboarding status
--   - login_attempts (integer) - Failed login attempt counter
--   - lock_until (timestamptz) - Account lock expiration timestamp
--   - personal_info (jsonb) - Personal details
--   - professional_info (jsonb) - Professional details
--   - competencies (jsonb) - User competencies
--   - created_at, updated_at (timestamptz) - Timestamps
--
-- ### 2. mentors table
--   - id (uuid, primary key) - Unique mentor identifier
--   - user_id (uuid, foreign key) - Reference to users table
--   - expertise_areas (text[]) - Array of expertise domains
--   - experience_years (integer) - Years of experience
--   - availability (jsonb) - Availability schedule
--   - bio, linkedin, website (text) - Profile information
--   - rating_average, rating_total_reviews - Rating metrics
--   - mentee_count_limit (integer) - Max mentees allowed
--   - active_mentees (uuid[]) - Active mentee IDs
--   - status (text) - Approval status
--   - created_at, updated_at (timestamptz) - Timestamps
--
-- ## Security
-- - Enable RLS on both tables
-- - Authenticated users can manage their own data
-- - Users can view approved mentors
--
-- ## Indexes
-- - Email and phone indexes for fast lookups
-- - User ID and status indexes on mentors table
-- ====================================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  password text,
  otp text,
  otp_expiry timestamptz,
  verified boolean DEFAULT false,
  role text DEFAULT 'mentee' CHECK (role IN ('mentor', 'mentee')),
  onboarding_completed boolean DEFAULT false,
  login_attempts integer DEFAULT 0,
  lock_until timestamptz,
  personal_info jsonb DEFAULT '{}'::jsonb,
  professional_info jsonb DEFAULT '{}'::jsonb,
  competencies jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes on users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_otp_expiry ON users(otp_expiry);

-- Create mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expertise_areas text[] DEFAULT ARRAY[]::text[],
  experience_years integer DEFAULT 0,
  availability jsonb DEFAULT '{}'::jsonb,
  bio text DEFAULT '',
  linkedin text DEFAULT '',
  website text DEFAULT '',
  rating_average numeric(3,2) DEFAULT 0,
  rating_total_reviews integer DEFAULT 0,
  mentee_count_limit integer DEFAULT 5,
  active_mentees uuid[] DEFAULT ARRAY[]::uuid[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes on mentors table
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_status ON mentors(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table

-- Users can view their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Users can insert their own data (for registration)
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid)
  WITH CHECK (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- RLS Policies for mentors table

-- Authenticated users can view approved mentors
CREATE POLICY "Users can view approved mentors"
  ON mentors FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- Mentors can view their own profile (including pending/rejected)
CREATE POLICY "Mentors can view own profile"
  ON mentors FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Users can insert mentor profile
CREATE POLICY "Users can create mentor profile"
  ON mentors FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Mentors can update their own profile
CREATE POLICY "Mentors can update own profile"
  ON mentors FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid)
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at
  BEFORE UPDATE ON mentors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();