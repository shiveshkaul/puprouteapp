import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export const useSchedule = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['schedule', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          pets (
            name,
            avatar_url,
            pet_breeds (name)
          ),
          walkers (
            users (first_name, last_name),
            hourly_rate,
            average_rating
          ),
          service_types (
            name,
            duration_minutes
          )
        `)
        .eq('owner_id', user.id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useUpcomingBookings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['upcoming-bookings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          pets (
            name,
            avatar_url,
            pet_breeds (name)
          ),
          walkers (
            users (first_name, last_name),
            hourly_rate,
            average_rating
          ),
          service_types (
            name,
            duration_minutes
          )
        `)
        .eq('owner_id', user.id)
        .gte('scheduled_date', today)
        .in('status', ['pending', 'confirmed', 'in_progress'])
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .eq('owner_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('owner_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useBookingStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['booking-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Get this week's stats
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('status, total_amount, pet_id, service_types!inner(duration_minutes)')
        .eq('owner_id', user.id)
        .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
        .lte('scheduled_date', endOfWeek.toISOString().split('T')[0]);

      if (error) throw error;
      
      const stats = {
        totalWalks: data?.filter(b => b.status === 'completed').length || 0,
        totalHours: data?.reduce((acc, booking) => {
          if (booking.status === 'completed' && booking.service_types && 'duration_minutes' in booking.service_types) {
            return acc + ((booking.service_types as any).duration_minutes / 60);
          }
          return acc;
        }, 0) || 0,
        totalSpent: data?.reduce((acc, booking) => {
          if (booking.status === 'completed') {
            return acc + (booking.total_amount || 0);
          }
          return acc;
        }, 0) || 0,
        uniquePets: new Set(data?.map(b => b.pet_id)).size || 0,
      };
      
      return stats;
    },
    enabled: !!user,
  });
};
