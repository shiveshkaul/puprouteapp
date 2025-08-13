-- Complete Database Schema for PupRoute
-- This SQL creates all necessary tables with the correct structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NULL,
  avatar_url text NULL,
  date_of_birth date NULL,
  address text NULL,
  city text NULL,
  state text NULL,
  zip_code text NULL,
  country text NULL DEFAULT 'US',
  location geography NULL,
  emergency_contact_name text NULL,
  emergency_contact_phone text NULL,
  user_type text NULL DEFAULT 'customer' CHECK (user_type IN ('customer', 'walker', 'admin')),
  subscription_tier text NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  is_verified boolean NULL DEFAULT false,
  background_check_status text NULL DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  last_login_at timestamp with time zone NULL,
  is_active boolean NULL DEFAULT true,
  timezone text NULL DEFAULT 'America/New_York',
  preferred_language text NULL DEFAULT 'en',
  marketing_consent boolean NULL DEFAULT false,
  terms_accepted_at timestamp with time zone NULL,
  privacy_policy_accepted_at timestamp with time zone NULL,
  PRIMARY KEY (id),
  UNIQUE (email)
);

-- Pet breeds table
CREATE TABLE IF NOT EXISTS public.pet_breeds (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  size_category text NULL CHECK (size_category IN ('small', 'medium', 'large', 'extra_large')),
  typical_weight_min numeric(5,2) NULL,
  typical_weight_max numeric(5,2) NULL,
  exercise_needs text NULL CHECK (exercise_needs IN ('low', 'moderate', 'high', 'very_high')),
  temperament text[] NULL DEFAULT '{}',
  grooming_needs text NULL CHECK (grooming_needs IN ('low', 'moderate', 'high')),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Pets table
CREATE TABLE IF NOT EXISTS public.pets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  breed_id uuid NULL REFERENCES public.pet_breeds(id),
  custom_breed text NULL,
  date_of_birth date NULL,
  estimated_age_months integer NULL,
  gender text NULL CHECK (gender IN ('male', 'female', 'unknown')),
  is_neutered_spayed boolean NULL,
  weight numeric(5, 2) NULL,
  color text NULL,
  microchip_id text NULL,
  avatar_url text NULL,
  personality_traits text[] NULL DEFAULT '{}',
  energy_level text NULL CHECK (energy_level IN ('low', 'medium', 'high', 'very_high')),
  socialization_level text NULL CHECK (socialization_level IN ('shy', 'selective', 'friendly', 'very_social')),
  training_level text NULL CHECK (training_level IN ('none', 'basic', 'intermediate', 'advanced')),
  allergies text[] NULL DEFAULT '{}',
  medical_conditions text[] NULL DEFAULT '{}',
  medications text[] NULL DEFAULT '{}',
  dietary_restrictions text[] NULL DEFAULT '{}',
  special_instructions text NULL,
  emergency_vet_name text NULL,
  emergency_vet_phone text NULL,
  emergency_vet_address text NULL,
  good_with_dogs boolean NULL DEFAULT true,
  good_with_cats boolean NULL DEFAULT true,
  good_with_children boolean NULL DEFAULT true,
  leash_behavior text NULL CHECK (leash_behavior IN ('excellent', 'good', 'fair', 'needs_work')),
  recall_reliability text NULL CHECK (recall_reliability IN ('excellent', 'good', 'fair', 'poor')),
  separation_anxiety boolean NULL DEFAULT false,
  resource_guarding boolean NULL DEFAULT false,
  fear_triggers text[] NULL DEFAULT '{}',
  preferred_walk_times text[] NULL DEFAULT '{}',
  max_walk_duration integer NULL DEFAULT 60,
  preferred_terrain text[] NULL DEFAULT '{}',
  weather_restrictions text[] NULL DEFAULT '{}',
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Service types table
CREATE TABLE IF NOT EXISTS public.service_types (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text NULL,
  base_price numeric(10,2) NOT NULL,
  duration_minutes integer NOT NULL,
  max_dogs integer NULL DEFAULT 1,
  is_group_walk boolean NULL DEFAULT false,
  requires_special_training boolean NULL DEFAULT false,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Walker profiles table
CREATE TABLE IF NOT EXISTS public.walker_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bio text NULL,
  experience_years integer NULL DEFAULT 0,
  hourly_rate numeric(10,2) NULL,
  service_radius numeric(5,2) NULL DEFAULT 5.0,
  is_available_now boolean NULL DEFAULT false,
  max_dogs_per_walk integer NULL DEFAULT 3,
  accepts_group_walks boolean NULL DEFAULT true,
  accepts_puppies boolean NULL DEFAULT true,
  accepts_senior_dogs boolean NULL DEFAULT true,
  accepts_large_dogs boolean NULL DEFAULT true,
  accepts_reactive_dogs boolean NULL DEFAULT false,
  emergency_contact_name text NULL,
  emergency_contact_phone text NULL,
  transportation_type text NULL,
  has_own_insurance boolean NULL DEFAULT false,
  insurance_provider text NULL,
  insurance_policy_number text NULL,
  background_check_date date NULL,
  background_check_status text NULL DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'approved', 'rejected')),
  walker_license_number text NULL,
  first_aid_certified boolean NULL DEFAULT false,
  first_aid_cert_expiry date NULL,
  total_walks integer NULL DEFAULT 0,
  average_rating numeric(3,2) NULL DEFAULT 0.0,
  total_reviews integer NULL DEFAULT 0,
  response_time_minutes integer NULL DEFAULT 60,
  profile_status text NULL DEFAULT 'pending' CHECK (profile_status IN ('pending', 'approved', 'suspended', 'deactivated')),
  is_featured boolean NULL DEFAULT false,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  walker_id uuid NULL REFERENCES public.walker_profiles(id),
  pet_id uuid NOT NULL REFERENCES public.pets(id),
  service_type_id uuid NOT NULL REFERENCES public.service_types(id),
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  duration_minutes integer NOT NULL,
  timezone text NULL DEFAULT 'America/New_York',
  pickup_address text NOT NULL,
  pickup_location geography NULL,
  dropoff_address text NULL,
  dropoff_location geography NULL,
  walking_area_preference text NULL,
  base_price numeric(10,2) NOT NULL,
  additional_fees numeric(10,2) NULL DEFAULT 0.0,
  discount_amount numeric(10,2) NULL DEFAULT 0.0,
  tax_amount numeric(10,2) NULL DEFAULT 0.0,
  tip_amount numeric(10,2) NULL DEFAULT 0.0,
  total_amount numeric(10,2) NOT NULL,
  status text NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'walker_assigned', 'in_progress', 'completed', 'cancelled', 'refunded')),
  cancellation_reason text NULL,
  cancellation_fee numeric(10,2) NULL DEFAULT 0.0,
  weather_conditions text NULL,
  special_instructions text NULL,
  emergency_contact_phone text NULL,
  walker_arrived_at timestamp with time zone NULL,
  walk_started_at timestamp with time zone NULL,
  walk_ended_at timestamp with time zone NULL,
  walker_notes text NULL,
  customer_rating integer NULL CHECK (customer_rating >= 1 AND customer_rating <= 5),
  walker_rating integer NULL CHECK (walker_rating >= 1 AND walker_rating <= 5),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'booking', 'payment', 'system')),
  is_read boolean NULL DEFAULT false,
  action_url text NULL,
  booking_id uuid NULL REFERENCES public.bookings(id),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create triggers for updated_at columns (drop existing ones first)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_pets_updated_at ON public.pets;
DROP TRIGGER IF EXISTS update_service_types_updated_at ON public.service_types;
DROP TRIGGER IF EXISTS update_walker_profiles_updated_at ON public.walker_profiles;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
DROP TRIGGER IF EXISTS update_pet_breeds_updated_at ON public.pet_breeds;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_walker_profiles_updated_at BEFORE UPDATE ON public.walker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pet_breeds_updated_at BEFORE UPDATE ON public.pet_breeds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users (user_type);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users (is_active);

CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets (owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_breed_id ON public.pets (breed_id);
CREATE INDEX IF NOT EXISTS idx_pets_active ON public.pets (is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_walker_id ON public.bookings (walker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON public.bookings (pet_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON public.bookings (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

CREATE INDEX IF NOT EXISTS idx_walker_profiles_user_id ON public.walker_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_walker_profiles_active ON public.walker_profiles (is_active);
CREATE INDEX IF NOT EXISTS idx_walker_profiles_available ON public.walker_profiles (is_available_now);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (is_read);

-- Insert default service types
INSERT INTO public.service_types (name, description, base_price, duration_minutes) VALUES
('Quick Walk', 'A 30-minute neighborhood walk perfect for daily exercise', 25.00, 30),
('Adventure Walk', 'A 60-minute exciting walk with exploration and playtime', 45.00, 60),
('Extended Adventure', 'A 90-minute comprehensive walk with training and socialization', 65.00, 90),
('Puppy Special', 'A gentle 20-minute walk designed for puppies under 6 months', 20.00, 20)
ON CONFLICT (name) DO NOTHING;

-- Insert common pet breeds
INSERT INTO public.pet_breeds (name, size_category, exercise_needs, temperament) VALUES
('Golden Retriever', 'large', 'high', '{"friendly", "intelligent", "devoted"}'),
('Labrador Retriever', 'large', 'high', '{"friendly", "outgoing", "active"}'),
('French Bulldog', 'small', 'moderate', '{"adaptable", "playful", "smart"}'),
('German Shepherd', 'large', 'high', '{"confident", "courageous", "smart"}'),
('Poodle', 'medium', 'moderate', '{"intelligent", "active", "alert"}'),
('Chihuahua', 'small', 'low', '{"graceful", "charming", "sassy"}'),
('Border Collie', 'medium', 'very_high', '{"energetic", "intelligent", "alert"}'),
('Bulldog', 'medium', 'low', '{"willful", "friendly", "calm"}'),
('Beagle', 'medium', 'moderate', '{"amiable", "determined", "excitable"}'),
('Rottweiler', 'large', 'moderate', '{"loyal", "loving", "confident"}')
ON CONFLICT (name) DO NOTHING;

COMMIT;
