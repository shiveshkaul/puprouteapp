-- Updated RLS Policies and Triggers for User Profile Creation
-- This fixes the "Unable to create user profile" error

-- First, let's create a function to automatically create user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all relevant tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Auto insert user profile" ON public.users;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow the trigger function to insert profiles (system operation)
CREATE POLICY "Auto insert user profile" ON public.users
  FOR INSERT 
  WITH CHECK (true);

-- Drop existing pet policies
DROP POLICY IF EXISTS "Users can view own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete own pets" ON public.pets;

-- Pets table policies
CREATE POLICY "Users can view own pets" ON public.pets
  FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own pets" ON public.pets
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own pets" ON public.pets
  FOR UPDATE 
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own pets" ON public.pets
  FOR DELETE 
  USING (auth.uid() = owner_id);

-- Drop existing booking policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Walkers can view assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Walkers can update assigned bookings" ON public.bookings;

-- Bookings table policies
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT 
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own bookings" ON public.bookings
  FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE 
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Walkers can view assigned bookings" ON public.bookings
  FOR SELECT 
  USING (
    walker_id IN (
      SELECT w.id FROM public.walker_profiles w WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Walkers can update assigned bookings" ON public.bookings
  FOR UPDATE 
  USING (
    walker_id IN (
      SELECT w.id FROM public.walker_profiles w WHERE w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    walker_id IN (
      SELECT w.id FROM public.walker_profiles w WHERE w.user_id = auth.uid()
    )
  );

-- Drop existing walker profile policies
DROP POLICY IF EXISTS "Walker profiles are viewable by all" ON public.walker_profiles;
DROP POLICY IF EXISTS "Users can insert own walker profile" ON public.walker_profiles;
DROP POLICY IF EXISTS "Users can update own walker profile" ON public.walker_profiles;

-- Walker profiles policies
CREATE POLICY "Walker profiles are viewable by all" ON public.walker_profiles
  FOR SELECT 
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can insert own walker profile" ON public.walker_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own walker profile" ON public.walker_profiles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drop existing notification policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT 
  WITH CHECK (true);

-- Make sure reference tables are accessible
ALTER TABLE public.service_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_breeds DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON public.service_types TO authenticated;
GRANT SELECT ON public.pet_breeds TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.pets TO authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.walker_profiles TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users (id);
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets (owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_walker_profiles_user_id ON public.walker_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

COMMIT;
