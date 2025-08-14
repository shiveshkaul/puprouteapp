-- COMPLETE SETTINGS PAGE SQL SETUP
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and run it

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update function for timestamps (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. USER SETTINGS TABLE
DROP TABLE IF EXISTS public.user_settings CASCADE;
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
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
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language text NOT NULL DEFAULT 'en',
  currency text NOT NULL DEFAULT 'USD',
  distance_unit text NOT NULL DEFAULT 'miles' CHECK (distance_unit IN ('miles', 'kilometers')),
  time_format text NOT NULL DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  
  -- Privacy settings
  profile_visibility text NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends')),
  location_sharing boolean NOT NULL DEFAULT true,
  analytics_consent boolean NOT NULL DEFAULT true,
  marketing_consent boolean NOT NULL DEFAULT false,
  
  -- Other preferences
  auto_booking_confirmation boolean NOT NULL DEFAULT false,
  emergency_contact_notifications boolean NOT NULL DEFAULT true,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id),
  UNIQUE (user_id)
);

-- 2. PAYMENT METHODS TABLE
DROP TABLE IF EXISTS public.payment_methods CASCADE;
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Payment provider details
  provider text NOT NULL CHECK (provider IN ('stripe', 'paypal', 'apple_pay', 'google_pay')),
  provider_payment_method_id text NOT NULL,
  
  -- Card details (for display only)
  card_brand text NULL,
  card_last_four text NULL,
  card_exp_month integer NULL,
  card_exp_year integer NULL,
  
  -- Alternative payment details
  paypal_email text NULL,
  
  -- Metadata
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  nickname text NULL,
  
  -- Billing address
  billing_name text NULL,
  billing_address_line1 text NULL,
  billing_address_line2 text NULL,
  billing_city text NULL,
  billing_state text NULL,
  billing_zip text NULL,
  billing_country text NOT NULL DEFAULT 'US',
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id),
  UNIQUE (user_id, provider_payment_method_id)
);

-- 3. BILLING TRANSACTIONS TABLE
DROP TABLE IF EXISTS public.billing_transactions CASCADE;
CREATE TABLE public.billing_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payment_method_id uuid NULL REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  booking_id uuid NULL,
  
  -- Transaction details
  transaction_type text NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'subscription', 'tip', 'fee')),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  
  -- Payment provider info
  provider text NOT NULL CHECK (provider IN ('stripe', 'paypal', 'apple_pay', 'google_pay')),
  provider_transaction_id text NOT NULL,
  provider_fee_amount numeric(10,2) NULL,
  
  -- Amounts (in cents)
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  
  -- Additional details
  description text NOT NULL,
  receipt_url text NULL,
  invoice_url text NULL,
  
  -- Refund information
  refunded_amount_cents integer NOT NULL DEFAULT 0,
  refund_reason text NULL,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id),
  UNIQUE (provider_transaction_id)
);

-- 4. USER SESSIONS TABLE
DROP TABLE IF EXISTS public.user_sessions CASCADE;
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Session details
  session_token text NOT NULL,
  device_type text NULL,
  device_name text NULL,
  ip_address inet NULL,
  user_agent text NULL,
  
  -- Location info
  login_location_city text NULL,
  login_location_country text NULL,
  
  -- Session tracking
  login_at timestamp with time zone NOT NULL DEFAULT now(),
  last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
  logout_at timestamp with time zone NULL,
  is_active boolean NOT NULL DEFAULT true,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id),
  UNIQUE (session_token)
);

-- 5. CREATE TRIGGERS
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods;
DROP TRIGGER IF EXISTS update_billing_transactions_updated_at ON public.billing_transactions;

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON public.user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at 
  BEFORE UPDATE ON public.payment_methods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_transactions_updated_at 
  BEFORE UPDATE ON public.billing_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_primary ON public.payment_methods (is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_billing_transactions_user_id ON public.billing_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_status ON public.billing_transactions (status);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_created_at ON public.billing_transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions (is_active) WHERE is_active = true;

-- 7. AUTOMATIC USER SETTINGS CREATION
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_user_settings_on_user_creation ON public.users;
CREATE TRIGGER create_user_settings_on_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();

-- 8. SINGLE PRIMARY PAYMENT METHOD FUNCTION
CREATE OR REPLACE FUNCTION ensure_single_primary_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.payment_methods 
    SET is_primary = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_primary_payment_method_trigger ON public.payment_methods;
CREATE TRIGGER ensure_single_primary_payment_method_trigger
  BEFORE INSERT OR UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_payment_method();

-- 9. ROW LEVEL SECURITY
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 10. RLS POLICIES FOR USER SETTINGS
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. RLS POLICIES FOR PAYMENT METHODS
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;

CREATE POLICY "Users can view their own payment methods" ON public.payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- 12. RLS POLICIES FOR BILLING TRANSACTIONS
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.billing_transactions;

CREATE POLICY "Users can view their own transactions" ON public.billing_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 13. RLS POLICIES FOR USER SESSIONS
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- 14. CREATE DEFAULT SETTINGS FOR EXISTING USERS
INSERT INTO public.user_settings (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- 15. INSERT SAMPLE DATA FOR DEMONSTRATION
-- Sample payment methods
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
  u.id,
  'stripe',
  'pm_sample_' || u.id,
  'visa',
  '1234',
  12,
  2027,
  true,
  'Personal Card',
  COALESCE(u.first_name || ' ' || u.last_name, 'User')
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_methods pm WHERE pm.user_id = u.id
)
LIMIT 10; -- Limit to avoid too many inserts

-- Sample billing transactions
INSERT INTO public.billing_transactions (
  user_id, 
  transaction_type, 
  status, 
  provider, 
  provider_transaction_id, 
  amount_cents, 
  description,
  created_at
)
SELECT 
  u.id,
  'payment',
  'completed',
  'stripe',
  'pi_sample_' || u.id || '_' || generate_random_uuid(),
  2999, -- $29.99
  'Premium Walk Service - Central Park',
  now() - interval '7 days'
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.billing_transactions bt WHERE bt.user_id = u.id
)
LIMIT 5; -- Limit sample data

-- Additional sample transactions
INSERT INTO public.billing_transactions (
  user_id, 
  transaction_type, 
  status, 
  provider, 
  provider_transaction_id, 
  amount_cents, 
  description,
  created_at
)
SELECT 
  u.id,
  'payment',
  'completed',
  'stripe',
  'pi_sample_' || u.id || '_' || generate_random_uuid(),
  1999, -- $19.99
  'Basic Walk Service - Local Park',
  now() - interval '14 days'
FROM public.users u
WHERE EXISTS (
  SELECT 1 FROM public.billing_transactions bt WHERE bt.user_id = u.id
)
LIMIT 3;

-- 16. VERIFY SETUP
SELECT 'Settings tables created successfully!' as status;
SELECT 'user_settings' as table_name, count(*) as row_count FROM public.user_settings
UNION ALL
SELECT 'payment_methods', count(*) FROM public.payment_methods
UNION ALL
SELECT 'billing_transactions', count(*) FROM public.billing_transactions
UNION ALL
SELECT 'user_sessions', count(*) FROM public.user_sessions;
