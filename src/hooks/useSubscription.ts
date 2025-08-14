import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: 'free' | 'plus' | 'pro' | 'elite';
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionLimits {
  walks_per_month: number | 'unlimited';
  max_pets: number | 'unlimited';
  real_time_tracking: boolean;
  ai_walk_planning: boolean;
  premium_walkers: boolean;
  emergency_support: boolean;
  photo_updates: boolean;
  custom_routes: boolean;
  priority_booking: boolean;
  walker_selection: boolean;
  behavioral_insights: boolean;
  health_monitoring: boolean;
}

export interface UsageStats {
  walks_this_month: number;
  total_pets: number;
  can_book_walk: boolean;
  can_add_pet: boolean;
  remaining_walks: number | 'unlimited';
}

const PLAN_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    walks_per_month: 3,
    max_pets: 1,
    real_time_tracking: false,
    ai_walk_planning: false,
    premium_walkers: false,
    emergency_support: false,
    photo_updates: false,
    custom_routes: false,
    priority_booking: false,
    walker_selection: false,
    behavioral_insights: false,
    health_monitoring: false,
  },
  plus: {
    walks_per_month: 12,
    max_pets: 3,
    real_time_tracking: true,
    ai_walk_planning: true,
    premium_walkers: false,
    emergency_support: true,
    photo_updates: true,
    custom_routes: false,
    priority_booking: false,
    walker_selection: true,
    behavioral_insights: false,
    health_monitoring: false,
  },
  pro: {
    walks_per_month: 30,
    max_pets: 6,
    real_time_tracking: true,
    ai_walk_planning: true,
    premium_walkers: true,
    emergency_support: true,
    photo_updates: true,
    custom_routes: true,
    priority_booking: true,
    walker_selection: true,
    behavioral_insights: true,
    health_monitoring: true,
  },
  elite: {
    walks_per_month: 'unlimited',
    max_pets: 'unlimited',
    real_time_tracking: true,
    ai_walk_planning: true,
    premium_walkers: true,
    emergency_support: true,
    photo_updates: true,
    custom_routes: true,
    priority_booking: true,
    walker_selection: true,
    behavioral_insights: true,
    health_monitoring: true,
  },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no subscription found, user is on free plan
      if (!data) {
        return {
          id: 'free-default',
          user_id: user.id,
          plan_id: 'free' as const,
          status: 'active' as const,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return data as UserSubscription;
    },
    enabled: !!user,
  });

  // Get usage stats for current month
  const { data: usageStats, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-stats', user?.id],
    queryFn: async () => {
      if (!user || !subscription) return null;

      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Get walks this month
      const { data: walks, error: walksError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString())
        .lte('created_at', lastDayOfMonth.toISOString());

      if (walksError) throw walksError;

      // Get total pets
      const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', user.id);

      if (petsError) throw petsError;

      const limits = PLAN_LIMITS[subscription.plan_id];
      const walksThisMonth = walks?.length || 0;
      const totalPets = pets?.length || 0;

      const canBookWalk = limits.walks_per_month === 'unlimited' || 
                         walksThisMonth < limits.walks_per_month;
      
      const canAddPet = limits.max_pets === 'unlimited' || 
                       totalPets < limits.max_pets;

      const remainingWalks = limits.walks_per_month === 'unlimited' 
        ? 'unlimited' as const
        : Math.max(0, limits.walks_per_month - walksThisMonth);

      return {
        walks_this_month: walksThisMonth,
        total_pets: totalPets,
        can_book_walk: canBookWalk,
        can_add_pet: canAddPet,
        remaining_walks: remainingWalks,
      } as UsageStats;
    },
    enabled: !!user && !!subscription,
  });

  // Get current plan limits
  const planLimits = subscription ? PLAN_LIMITS[subscription.plan_id] : PLAN_LIMITS.free;

  // Upgrade subscription mutation
  const upgradePlan = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['usage-stats'] });
      
      toast({
        title: "Plan upgraded successfully! 🎉",
        description: `Welcome to ${data.plan_id.charAt(0).toUpperCase() + data.plan_id.slice(1)} plan!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upgrade failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    subscription,
    usageStats,
    planLimits,
    isLoading: subscriptionLoading || usageLoading,
    upgradePlan: upgradePlan.mutate,
    isUpgrading: upgradePlan.isPending,
  };
};

// Hook for checking if a feature is available
export const useFeatureAccess = (feature: keyof SubscriptionLimits) => {
  const { planLimits } = useSubscription();
  return planLimits[feature];
};

// Hook for checking usage limits
export const useUsageLimits = () => {
  const { usageStats, planLimits } = useSubscription();
  
  return {
    canBookWalk: usageStats?.can_book_walk ?? false,
    canAddPet: usageStats?.can_add_pet ?? false,
    walksRemaining: usageStats?.remaining_walks ?? 0,
    walksUsed: usageStats?.walks_this_month ?? 0,
    walksLimit: planLimits.walks_per_month,
    petsUsed: usageStats?.total_pets ?? 0,
    petsLimit: planLimits.max_pets,
  };
};
