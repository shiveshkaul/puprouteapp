// Types for Settings Page functionality

export interface UserSettings {
  id: string;
  user_id: string;
  
  // Notification preferences
  walk_reminders: boolean;
  walker_updates: boolean;
  photo_sharing: boolean;
  promotions: boolean;
  weekly_reports: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  
  // App preferences
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  distance_unit: 'miles' | 'kilometers';
  time_format: '12h' | '24h';
  
  // Privacy settings
  profile_visibility: 'public' | 'private' | 'friends';
  location_sharing: boolean;
  analytics_consent: boolean;
  marketing_consent: boolean;
  
  // Other preferences
  auto_booking_confirmation: boolean;
  emergency_contact_notifications: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  
  // Payment provider details
  provider: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';
  provider_payment_method_id: string;
  
  // Card details (for display only)
  card_brand?: string;
  card_last_four?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  
  // Alternative payment details
  paypal_email?: string;
  
  // Metadata
  is_primary: boolean;
  is_active: boolean;
  nickname?: string;
  
  // Billing address
  billing_name?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country: string;
  
  created_at: string;
  updated_at: string;
}

export interface BillingTransaction {
  id: string;
  user_id: string;
  payment_method_id?: string;
  booking_id?: string;
  
  // Transaction details
  transaction_type: 'payment' | 'refund' | 'subscription' | 'tip' | 'fee';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  
  // Payment provider info
  provider: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';
  provider_transaction_id: string;
  provider_fee_amount?: number;
  
  // Amounts
  amount_cents: number;
  currency: string;
  
  // Additional details
  description: string;
  receipt_url?: string;
  invoice_url?: string;
  
  // Refund information
  refunded_amount_cents: number;
  refund_reason?: string;
  
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  
  // Session details
  session_token: string;
  device_type?: string;
  device_name?: string;
  ip_address?: string;
  user_agent?: string;
  
  // Location info
  login_location_city?: string;
  login_location_country?: string;
  
  // Session tracking
  login_at: string;
  last_activity_at: string;
  logout_at?: string;
  is_active: boolean;
  
  created_at: string;
}

// Input types for creating/updating
export type UserSettingsInput = Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type PaymentMethodInput = Partial<Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// View models for UI
export interface SettingsProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  member_since: string;
  subscription_tier: string;
  raw?: any; // Include raw data for editing
}

export interface NotificationSettings {
  walk_reminders: boolean;
  walker_updates: boolean;
  photo_sharing: boolean;
  promotions: boolean;
  weekly_reports: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

export interface PaymentMethodDisplay {
  id: string;
  nickname?: string;
  display_name: string; // e.g., "Visa ending in 1234" or "PayPal (email@example.com)"
  is_primary: boolean;
  expires?: string; // formatted as "12/27"
  provider: string;
}

export interface BillingTransactionDisplay {
  id: string;
  date: string;
  description: string;
  amount: string; // formatted with currency symbol
  status: string;
  receipt_url?: string;
  can_refund: boolean;
}
