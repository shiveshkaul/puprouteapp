import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export const useWalkHistory = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['walk-history', user?.id],
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
          ),
          walk_reports (
            id,
            distance_walked,
            notes,
            weather_conditions,
            photos
          )
        `)
        .eq('owner_id', user.id)
        .eq('status', 'completed')
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useBookingDetails = (bookingId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['booking-details', bookingId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          pets (
            name,
            avatar_url,
            age,
            weight,
            pet_breeds (name),
            medical_notes,
            special_instructions
          ),
          walkers (
            id,
            users (first_name, last_name, avatar_url, phone),
            hourly_rate,
            average_rating,
            bio,
            certifications,
            experience_years
          ),
          service_types (
            name,
            duration_minutes,
            base_price
          ),
          walk_reports (
            id,
            distance_walked,
            notes,
            weather_conditions,
            photos,
            start_time,
            end_time,
            route_map_url
          ),
          reviews (
            id,
            rating,
            comment,
            created_at
          )
        `)
        .eq('id', bookingId)
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!bookingId,
  });
};

export const useCreateReview = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      walkerId, 
      rating, 
      comment 
    }: { 
      bookingId: string; 
      walkerId: string; 
      rating: number; 
      comment: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          walker_id: walkerId,
          owner_id: user.id,
          rating,
          comment,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};
