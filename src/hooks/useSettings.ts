import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { 
  UserSettings, 
  PaymentMethod, 
  BillingTransaction, 
  UserSettingsInput,
  PaymentMethodInput,
  NotificationSettings,
  PaymentMethodDisplay,
  BillingTransactionDisplay,
  SettingsProfile
} from '@/types/settings';
import { toast } from 'sonner';

// Hook for user settings
export const useUserSettings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user settings:', error);
          // Return default settings if table doesn't exist
          if (error.code === 'PGRST205') {
            return {
              id: 'temp',
              user_id: user.id,
              walk_reminders: true,
              walker_updates: true,
              photo_sharing: true,
              promotions: false,
              weekly_reports: true,
              email_notifications: true,
              push_notifications: true,
              sms_notifications: false,
              theme: 'light',
              language: 'en',
              currency: 'USD',
              distance_unit: 'miles',
              time_format: '12h',
              profile_visibility: 'public',
              location_sharing: true,
              analytics_consent: true,
              marketing_consent: false,
              auto_booking_confirmation: false,
              emergency_contact_notifications: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
          throw error;
        }
        
        return data as UserSettings | null;
      } catch (error) {
        console.error('User settings query failed:', error);
        // Return default settings if query fails
        return {
          id: 'temp',
          user_id: user.id,
          walk_reminders: true,
          walker_updates: true,
          photo_sharing: true,
          promotions: false,
          weekly_reports: true,
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          theme: 'light',
          language: 'en',
          currency: 'USD',
          distance_unit: 'miles',
          time_format: '12h',
          profile_visibility: 'public',
          location_sharing: true,
          analytics_consent: true,
          marketing_consent: false,
          auto_booking_confirmation: false,
          emergency_contact_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    },
    enabled: !!user,
  });
};

// Hook for updating user settings
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (settings: UserSettingsInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as UserSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast.success('Settings updated successfully! ⚙️');
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings. Please try again.');
    }
  });
};

// Hook for payment methods
export const usePaymentMethods = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
      }
      
      return data as PaymentMethod[];
    },
    enabled: !!user,
  });
};

// Hook for billing history
export const useBillingHistory = (limit: number = 10) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['billing-history', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('billing_transactions')
        .select(`
          *,
          payment_methods (
            nickname,
            card_brand,
            card_last_four
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching billing history:', error);
        throw error;
      }
      
      return data as (BillingTransaction & { payment_methods: PaymentMethod | null })[];
    },
    enabled: !!user,
  });
};

// Hook for adding payment method
export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (paymentMethod: PaymentMethodInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          ...paymentMethod,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as PaymentMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method added successfully! 💳');
    },
    onError: (error) => {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method. Please try again.');
    }
  });
};

// Hook for updating payment method
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaymentMethod> & { id: string }) => {
      const { data, error } = await supabase
        .from('payment_methods')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as PaymentMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method updated successfully! 💳');
    },
    onError: (error) => {
      console.error('Failed to update payment method:', error);
      toast.error('Failed to update payment method. Please try again.');
    }
  });
};

// Hook for deleting payment method
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method removed successfully! 🗑️');
    },
    onError: (error) => {
      console.error('Failed to delete payment method:', error);
      toast.error('Failed to remove payment method. Please try again.');
    }
  });
};

// Utility functions for transforming data for display
export const formatPaymentMethodsForDisplay = (methods: PaymentMethod[]): PaymentMethodDisplay[] => {
  return methods.map(method => {
    let display_name = '';
    
    switch (method.provider) {
      case 'stripe':
        if (method.card_brand && method.card_last_four) {
          display_name = `${method.card_brand.charAt(0).toUpperCase() + method.card_brand.slice(1)} ending in ${method.card_last_four}`;
        } else {
          display_name = 'Credit Card';
        }
        break;
      case 'paypal':
        display_name = `PayPal${method.paypal_email ? ` (${method.paypal_email})` : ''}`;
        break;
      case 'apple_pay':
        display_name = 'Apple Pay';
        break;
      case 'google_pay':
        display_name = 'Google Pay';
        break;
      default:
        display_name = method.provider;
    }
    
    const expires = method.card_exp_month && method.card_exp_year 
      ? `${method.card_exp_month.toString().padStart(2, '0')}/${method.card_exp_year.toString().slice(-2)}`
      : undefined;
    
    return {
      id: method.id,
      nickname: method.nickname,
      display_name,
      is_primary: method.is_primary,
      expires,
      provider: method.provider,
    };
  });
};

export const formatBillingTransactionsForDisplay = (
  transactions: (BillingTransaction & { payment_methods: PaymentMethod | null })[]
): BillingTransactionDisplay[] => {
  return transactions.map(transaction => {
    const amount = (transaction.amount_cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: transaction.currency,
    });
    
    const date = new Date(transaction.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    const can_refund = transaction.status === 'completed' && 
                      transaction.transaction_type === 'payment' &&
                      transaction.refunded_amount_cents === 0;
    
    return {
      id: transaction.id,
      date,
      description: transaction.description,
      amount,
      status: transaction.status,
      receipt_url: transaction.receipt_url,
      can_refund,
    };
  });
};

// Hook for getting settings profile data
export const useSettingsProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['settings-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get user data from auth.users via Supabase auth
      const { data: authUser, error } = await supabase.auth.getUser();
      
      if (error || !authUser.user) {
        console.error('Error fetching auth user:', error);
        throw error;
      }
      
      const userData = authUser.user;
      const userMetadata = userData.user_metadata || {};
      
      const memberSince = new Date(userData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      
      const name = userMetadata.full_name || 
                   `${userMetadata.first_name || ''} ${userMetadata.last_name || ''}`.trim() ||
                   userData.email?.split('@')[0] || 
                   'User';
      
      return {
        name,
        email: userData.email || '',
        phone: userData.phone || userMetadata.phone,
        location: userMetadata.location || userMetadata.address,
        avatar_url: userMetadata.avatar_url,
        member_since: memberSince,
        subscription_tier: userMetadata.subscription_tier || 'free',
        raw: userData, // Include raw data for editing
      } as SettingsProfile & { raw: any };
    },
    enabled: !!user,
  });
};

// Hook for updating user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      // Update user metadata in auth
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...profileData,
          updated_at: new Date().toISOString()
        }
      });
      
      if (error) throw error;
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-profile'] });
      toast.success('Profile updated successfully! 👤');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  });
};

// Hook for quick notification toggle
export const useToggleNotification = () => {
  const updateSettings = useUpdateUserSettings();
  const { data: settings } = useUserSettings();
  
  return (key: keyof NotificationSettings) => {
    if (!settings) return;
    
    updateSettings.mutate({
      [key]: !settings[key]
    });
  };
};
