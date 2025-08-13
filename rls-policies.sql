-- Row-Level Security Policies for PupRoute
-- Run this in your Supabase SQL Editor to fix RLS policy issues

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable RLS on pets table if not already enabled
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Drop existing pet policies if they exist
DROP POLICY IF EXISTS "Users can view own pets" ON pets;
DROP POLICY IF EXISTS "Users can insert own pets" ON pets;
DROP POLICY IF EXISTS "Users can update own pets" ON pets;

-- Policy: Users can view their own pets
CREATE POLICY "Users can view own pets" ON pets
  FOR SELECT 
  USING (auth.uid() = owner_id);

-- Policy: Users can insert their own pets
CREATE POLICY "Users can insert own pets" ON pets
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own pets
CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE 
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing booking policies if they exist
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Walkers can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Walkers can update assigned bookings" ON bookings;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT 
  USING (auth.uid() = owner_id);

-- Policy: Users can insert their own bookings
CREATE POLICY "Users can insert own bookings" ON bookings
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE 
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Walkers can view bookings assigned to them
CREATE POLICY "Walkers can view assigned bookings" ON bookings
  FOR SELECT 
  USING (
    walker_id IN (
      SELECT w.id FROM walkers w WHERE w.user_id = auth.uid()
    )
  );

-- Policy: Walkers can update bookings assigned to them
CREATE POLICY "Walkers can update assigned bookings" ON bookings
  FOR UPDATE 
  USING (
    walker_id IN (
      SELECT w.id FROM walkers w WHERE w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    walker_id IN (
      SELECT w.id FROM walkers w WHERE w.user_id = auth.uid()
    )
  );

-- Enable RLS on walker_profiles table
ALTER TABLE walker_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing walker profile policies if they exist
DROP POLICY IF EXISTS "Walker profiles are viewable by all" ON walker_profiles;
DROP POLICY IF EXISTS "Users can insert own walker profile" ON walker_profiles;
DROP POLICY IF EXISTS "Users can update own walker profile" ON walker_profiles;

-- Policy: All authenticated users can view walker profiles (for browsing)
CREATE POLICY "Walker profiles are viewable by all" ON walker_profiles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policy: Users can insert their own walker profile
CREATE POLICY "Users can insert own walker profile" ON walker_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own walker profile
CREATE POLICY "Users can update own walker profile" ON walker_profiles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tables that should be readable by all authenticated users (no RLS needed)
-- These are reference/lookup tables

-- Disable RLS on reference tables
ALTER TABLE service_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE pet_breeds DISABLE ROW LEVEL SECURITY;

-- Enable public read access to these tables
GRANT SELECT ON service_types TO authenticated;
GRANT SELECT ON pet_breeds TO authenticated;

-- For notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing notification policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (via service role)
-- This will be handled by triggers or server-side functions

COMMIT;
