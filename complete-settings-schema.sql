-- Complete Settings Page Database Schema
-- This creates all tables needed for a fully functional settings page

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Settings table for all user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
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

-- Payment Methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Payment provider details
  provider text NOT NULL CHECK (provider IN ('stripe', 'paypal', 'apple_pay', 'google_pay')),
  provider_payment_method_id text NOT NULL, -- Stripe payment method ID, etc.
  
  -- Card details (for display purposes only - never store actual card numbers)
  card_brand text NULL, -- 'visa', 'mastercard', 'amex', etc.
  card_last_four text NULL,
  card_exp_month integer NULL,
  card_exp_year integer NULL,
  
  -- Alternative payment method details
  paypal_email text NULL,
  
  -- Metadata
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  nickname text NULL, -- User-friendly name like "Personal Card", "Business Card"
  
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

-- Billing History / Transactions table
CREATE TABLE IF NOT EXISTS public.billing_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payment_method_id uuid NULL REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  booking_id uuid NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type text NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'subscription', 'tip', 'fee')),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  
  -- Payment provider info
  provider text NOT NULL CHECK (provider IN ('stripe', 'paypal', 'apple_pay', 'google_pay')),
  provider_transaction_id text NOT NULL,
  provider_fee_amount numeric(10,2) NULL,
  
  -- Amounts (in cents to avoid floating point issues)
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

-- User Sessions table for login history
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Session details
  session_token text NOT NULL,
  device_type text NULL, -- 'mobile', 'desktop', 'tablet'
  device_name text NULL, -- 'iPhone 14', 'Chrome on Windows', etc.
  ip_address inet NULL,
  user_agent text NULL,
  
  -- Location info (optional)
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

-- Update function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_primary ON public.payment_methods (is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_billing_transactions_user_id ON public.billing_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_status ON public.billing_transactions (status);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_created_at ON public.billing_transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions (is_active) WHERE is_active = true;

-- Function to automatically create default user settings when a user is created
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default settings for new users
DROP TRIGGER IF EXISTS create_user_settings_on_user_creation ON public.users;
CREATE TRIGGER create_user_settings_on_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();

-- Function to ensure only one primary payment method per user
CREATE OR REPLACE FUNCTION ensure_single_primary_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- If this payment method is being set as primary
  IF NEW.is_primary = true THEN
    -- Set all other payment methods for this user to non-primary
    UPDATE public.payment_methods 
    SET is_primary = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one primary payment method per user
DROP TRIGGER IF EXISTS ensure_single_primary_payment_method_trigger ON public.payment_methods;
CREATE TRIGGER ensure_single_primary_payment_method_trigger
  BEFORE INSERT OR UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_payment_method();

-- Insert default settings for existing users (if any)
INSERT INTO public.user_settings (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- Sample data for demonstration (you can remove this in production)
-- Create sample billing transactions for users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, subscription_tier FROM public.users LOOP
    -- Add sample billing transactions
    INSERT INTO public.billing_transactions (
      user_id, 
      transaction_type, 
      status, 
      provider, 
      provider_transaction_id, 
      amount_cents, 
      description,
      created_at
    ) VALUES 
    (
      user_record.id,
      'payment',
      'completed',
      'stripe',
      'pi_sample_' || user_record.id || '_1',
      2999, -- $29.99
      'Premium Walk Service - Central Park',
      now() - interval '7 days'
    ),
    (
      user_record.id,
      'payment',
      'completed',
      'stripe',
      'pi_sample_' || user_record.id || '_2',
      1999, -- $19.99
      'Basic Walk Service - Local Park',
      now() - interval '14 days'
    ),
    (
      user_record.id,
      'payment',
      'completed',
      'stripe',
      'pi_sample_' || user_record.id || '_3',
      4999, -- $49.99
      'Premium Pet Sitting Service',
      now() - interval '21 days'
    )
    ON CONFLICT (provider_transaction_id) DO NOTHING;
    
    -- Add sample payment method
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
    ) VALUES (
      user_record.id,
      'stripe',
      'pm_sample_' || user_record.id,
      'visa',
      '1234',
      12,
      2027,
      true,
      'Personal Card',
      'User ' || user_record.id
    ) ON CONFLICT (user_id, provider_payment_method_id) DO NOTHING;
  END LOOP;
END $$;

-- Row Level Security (RLS) policies
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- User Settings policies
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment Methods policies
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;

CREATE POLICY "Users can view their own payment methods" ON public.payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Billing Transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.billing_transactions;

CREATE POLICY "Users can view their own transactions" ON public.billing_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- User Sessions policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);
