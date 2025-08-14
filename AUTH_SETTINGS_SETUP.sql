-- FIXED SETTINGS SETUP - Works with Supabase Auth
-- Copy and paste this into your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER SETTINGS TABLE (references auth.users directly)
DROP TABLE IF EXISTS public.user_settings CASCADE;
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL, -- References auth.users.id (no foreign key constraint needed)
  
  -- Notification preferences
  walk_reminders boolean NOT NULL DEFAULT true,
  walker_updates boolean NOT NULL DEFAULT true,
  photo_sharing boolean NOT NULL DEFAULT true,
  promotions boolean NOT NULL DEFAULT false,
  weekly_reports boolean NOT NULL DEFAULT true,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  sms_notifications boolean NOT NULL DEFAULT false,
  
  -- App preferences
  theme text NOT NULL DEFAULT 'light',
  language text NOT NULL DEFAULT 'en',
  currency text NOT NULL DEFAULT 'USD',
  distance_unit text NOT NULL DEFAULT 'miles',
  time_format text NOT NULL DEFAULT '12h',
  
  -- Privacy settings
  profile_visibility text NOT NULL DEFAULT 'public',
  location_sharing boolean NOT NULL DEFAULT true,
  analytics_consent boolean NOT NULL DEFAULT true,
  marketing_consent boolean NOT NULL DEFAULT false,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id),
  UNIQUE (user_id)
);

-- 2. PAYMENT METHODS TABLE
DROP TABLE IF EXISTS public.payment_methods CASCADE;
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL, -- References auth.users.id
  
  provider text NOT NULL DEFAULT 'stripe',
  provider_payment_method_id text NOT NULL,
  
  card_brand text NULL,
  card_last_four text NULL,
  card_exp_month integer NULL,
  card_exp_year integer NULL,
  
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  nickname text NULL,
  
  billing_name text NULL,
  billing_address_line1 text NULL,
  billing_city text NULL,
  billing_state text NULL,
  billing_zip text NULL,
  billing_country text NOT NULL DEFAULT 'US',
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id)
);

-- 3. BILLING TRANSACTIONS TABLE
DROP TABLE IF EXISTS public.billing_transactions CASCADE;
CREATE TABLE public.billing_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL, -- References auth.users.id
  payment_method_id uuid NULL REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  
  transaction_type text NOT NULL DEFAULT 'payment',
  status text NOT NULL DEFAULT 'completed',
  provider text NOT NULL DEFAULT 'stripe',
  provider_transaction_id text NOT NULL,
  
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  description text NOT NULL,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id)
);

-- 4. CREATE INDEXES
CREATE INDEX idx_user_settings_user_id ON public.user_settings (user_id);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods (user_id);
CREATE INDEX idx_payment_methods_is_primary ON public.payment_methods (is_primary) WHERE is_primary = true;
CREATE INDEX idx_billing_transactions_user_id ON public.billing_transactions (user_id);

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES (using auth.uid() which matches auth.users.id)
CREATE POLICY "Users can manage their own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON public.billing_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 7. CREATE SETTINGS FOR CURRENT AUTH USER (if logged in)
-- This will create settings for the currently authenticated user
INSERT INTO public.user_settings (user_id)
SELECT auth.uid()
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 8. ADD SAMPLE DATA FOR CURRENT USER
-- Add sample payment method for current user
INSERT INTO public.payment_methods (
  user_id,
  provider,
  provider_payment_method_id,
  card_brand,
  card_last_four,
  card_exp_month,
  card_exp_year,
  is_primary,
  nickname,
  billing_name
)
SELECT 
  auth.uid(),
  'stripe',
  'pm_sample_' || auth.uid(),
  'visa',
  '1234',
  12,
  2027,
  true,
  'Personal Card',
  'Sample User'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add sample transaction for current user
INSERT INTO public.billing_transactions (
  user_id, 
  transaction_type, 
  status, 
  provider, 
  provider_transaction_id, 
  amount_cents, 
  description
)
SELECT 
  auth.uid(),
  'payment',
  'completed',
  'stripe',
  'pi_sample_' || auth.uid() || '_001',
  2999,
  'Premium Walk Service'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'Settings tables created successfully!' as message;
