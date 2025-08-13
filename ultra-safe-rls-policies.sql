-- Ultra-Safe RLS Policies Fix - Checks for column existence
-- This is the safest version that adapts to your actual database structure

-- Create the user profile creation function
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

-- Enable RLS on core tables (safe to run multiple times)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pets' AND table_schema = 'public') THEN
    ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings' AND table_schema = 'public') THEN
    ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'walker_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.walker_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Users table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
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
  END IF;
END $$;

-- Pets table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pets' AND table_schema = 'public') THEN
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
  END IF;
END $$;

-- Bookings table policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings' AND table_schema = 'public') THEN
    -- Drop existing booking policies
    DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Walkers can view assigned bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Walkers can update assigned bookings" ON public.bookings;

    -- Check if bookings table has customer_id column
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'customer_id' AND table_schema = 'public') THEN
      -- Bookings table policies (using customer_id)
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
    ELSIF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'owner_id' AND table_schema = 'public') THEN
      -- Bookings table policies (using owner_id as fallback)
      CREATE POLICY "Users can view own bookings" ON public.bookings
        FOR SELECT 
        USING (auth.uid() = owner_id);

      CREATE POLICY "Users can insert own bookings" ON public.bookings
        FOR INSERT 
        WITH CHECK (auth.uid() = owner_id);

      CREATE POLICY "Users can update own bookings" ON public.bookings
        FOR UPDATE 
        USING (auth.uid() = owner_id)
        WITH CHECK (auth.uid() = owner_id);
    END IF;
  END IF;
END $$;

-- Walker profiles policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'walker_profiles' AND table_schema = 'public') THEN
    -- Drop existing walker profile policies
    DROP POLICY IF EXISTS "Walker profiles are viewable by all" ON public.walker_profiles;
    DROP POLICY IF EXISTS "Users can insert own walker profile" ON public.walker_profiles;
    DROP POLICY IF EXISTS "Users can update own walker profile" ON public.walker_profiles;
    
    -- Walker profiles policies (check for is_active column)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'walker_profiles' AND column_name = 'is_active' AND table_schema = 'public') THEN
      CREATE POLICY "Walker profiles are viewable by all" ON public.walker_profiles
        FOR SELECT 
        TO authenticated
        USING (is_active = true);
    ELSE
      -- If no is_active column, allow viewing all walker profiles
      CREATE POLICY "Walker profiles are viewable by all" ON public.walker_profiles
        FOR SELECT 
        TO authenticated
        USING (true);
    END IF;

    CREATE POLICY "Users can insert own walker profile" ON public.walker_profiles
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own walker profile" ON public.walker_profiles
      FOR UPDATE 
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
      
    -- Walker booking access policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings' AND table_schema = 'public') THEN
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
    END IF;
  END IF;
END $$;

-- Notifications policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
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
  END IF;
END $$;

-- Make sure reference tables are accessible
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'service_types' AND table_schema = 'public') THEN
    ALTER TABLE public.service_types DISABLE ROW LEVEL SECURITY;
    GRANT SELECT ON public.service_types TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pet_breeds' AND table_schema = 'public') THEN
    ALTER TABLE public.pet_breeds DISABLE ROW LEVEL SECURITY;
    GRANT SELECT ON public.pet_breeds TO authenticated;
  END IF;
END $$;

-- Grant necessary permissions on existing tables
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    GRANT ALL ON public.users TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pets' AND table_schema = 'public') THEN
    GRANT ALL ON public.pets TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings' AND table_schema = 'public') THEN
    GRANT ALL ON public.bookings TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'walker_profiles' AND table_schema = 'public') THEN
    GRANT ALL ON public.walker_profiles TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    GRANT ALL ON public.notifications TO authenticated;
  END IF;
END $$;

-- Create essential indexes (safe to run multiple times)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users (id);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pets' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets (owner_id);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings' AND table_schema = 'public') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'customer_id' AND table_schema = 'public') THEN
      CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings (customer_id);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'walker_profiles' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_walker_profiles_user_id ON public.walker_profiles (user_id);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
  END IF;
END $$;

COMMIT;
