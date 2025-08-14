import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface WalkerFilters {
  location?: string;
  radius?: number;
  minRating?: number;
  maxPrice?: number;
  availability?: 'today' | 'tomorrow' | 'this_week';
  specialties?: string[];
  experience?: 'novice' | 'experienced' | 'expert';
  certifications?: string[];
}

export const useWalkers = (filters?: WalkerFilters) => {
  return useQuery({
    queryKey: ['walkers', filters],
    queryFn: async () => {
      let query = supabase
        .from('walker_profiles')
        .select(`
          *,
          users!walker_profiles_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            phone,
            created_at,
            city,
            state
          ),
          walker_specialties (
            specialty_types (name, description)
          ),
          walker_certifications (
            certification_types (name, issuer, description),
            issued_date,
            expiry_date
          ),
          walker_availability (
            day_of_week,
            start_time,
            end_time,
            is_available
          ),
          reviews (
            id,
            rating,
            comment,
            created_at
          )
        `)
        .eq('profile_status', 'approved')
        .eq('is_available_now', true);

      // Apply filters
      if (filters?.minRating) {
        query = query.gte('average_rating', filters.minRating);
      }
      
      if (filters?.maxPrice) {
        query = query.lte('hourly_rate', filters.maxPrice);
      }

      if (filters?.experience) {
        const experienceMapping = {
          'novice': [0, 1],
          'experienced': [2, 4],
          'expert': [5, 20]
        };
        const [min, max] = experienceMapping[filters.experience];
        query = query.gte('years_of_experience', min).lte('years_of_experience', max);
      }

      const { data, error } = await query.order('average_rating', { ascending: false });

      if (error) throw error;
      
      let filteredData = data || [];

      // Post-process filters that require complex logic
      if (filters?.specialties && filters.specialties.length > 0) {
        filteredData = filteredData.filter(walker => 
          walker.walker_specialties?.some(ws => 
            filters.specialties!.includes(ws.specialty_types?.name)
          )
        );
      }

      if (filters?.certifications && filters.certifications.length > 0) {
        filteredData = filteredData.filter(walker => 
          walker.walker_certifications?.some(wc => 
            filters.certifications!.includes(wc.certification_types?.name)
          )
        );
      }

      return filteredData;
    },
  });
};

export const useWalkerProfile = (walkerId: string) => {
  return useQuery({
    queryKey: ['walker-profile', walkerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('walker_profiles')
        .select(`
          *,
          users!walker_profiles_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            phone,
            created_at,
            city,
            state
          ),
          walker_specialties (
            specialty_types (name, description)
          ),
          walker_certifications (
            certification_types (name, issuer, description),
            issued_date,
            expiry_date
          ),
          walker_availability (
            day_of_week,
            start_time,
            end_time,
            is_available
          ),
          reviews (
            id,
            rating,
            comment,
            created_at,
            users!reviews_user_id_fkey (
              first_name,
              avatar_url
            )
          ),
          walker_photos (
            photo_url,
            caption,
            created_at
          )
        `)
        .eq('id', walkerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!walkerId,
  });
};

export const useWalkerReviews = (walkerId: string, limit = 10) => {
  return useQuery({
    queryKey: ['walker-reviews', walkerId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users!reviews_user_id_fkey (
            first_name,
            avatar_url
          )
        `)
        .eq('walker_id', walkerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!walkerId,
  });
};

export const useWalkerStats = (walkerId: string) => {
  return useQuery({
    queryKey: ['walker-stats', walkerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('status, total_amount, scheduled_date')
        .eq('walker_id', walkerId)
        .eq('status', 'completed');

      if (error) throw error;

      const stats = {
        totalWalks: data?.length || 0,
        totalEarnings: data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0,
        thisMonthWalks: data?.filter(booking => {
          const bookingDate = new Date(booking.scheduled_date);
          const now = new Date();
          return bookingDate.getMonth() === now.getMonth() && 
                 bookingDate.getFullYear() === now.getFullYear();
        }).length || 0,
        averageWeeklyWalks: Math.round((data?.length || 0) / 4) // Rough estimate
      };

      return stats;
    },
    enabled: !!walkerId,
  });
};

export const useNearbyWalkers = (latitude?: number, longitude?: number, radiusKm = 10) => {
  return useQuery({
    queryKey: ['nearby-walkers', latitude, longitude, radiusKm],
    queryFn: async () => {
      if (!latitude || !longitude) {
        // Fallback to all walkers if no location provided
        const { data, error } = await supabase
          .from('walker_profiles')
          .select(`
            *,
            users!walker_profiles_user_id_fkey (
              first_name,
              last_name,
              avatar_url,
              city,
              state
            )
          `)
          .eq('profile_status', 'approved')
          .eq('is_available_now', true)
          .order('average_rating', { ascending: false });

        if (error) throw error;
        return data || [];
      }

      const { data, error } = await supabase.rpc('find_nearby_walkers', {
        customer_lat: latitude,
        customer_lon: longitude,
        radius_miles: radiusKm * 0.621371 // Convert km to miles
      });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useFeaturedWalkers = () => {
  return useQuery({
    queryKey: ['featured-walkers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('walker_profiles')
        .select(`
          *,
          users!walker_profiles_user_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            city,
            state
          )
        `)
        .eq('profile_status', 'approved')
        .eq('is_featured', true)
        .order('average_rating', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useWalkerAvailability = (walkerId: string, date: string) => {
  return useQuery({
    queryKey: ['walker-availability', walkerId, date],
    queryFn: async () => {
      const dayOfWeek = new Date(date).getDay();
      
      const { data, error } = await supabase
        .from('walker_availability')
        .select('*')
        .eq('walker_id', walkerId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (error) throw error;

      // Also check for existing bookings on that date
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('scheduled_time, service_types(duration_minutes)')
        .eq('walker_id', walkerId)
        .eq('scheduled_date', date)
        .in('status', ['pending', 'confirmed', 'in_progress']);

      if (bookingError) throw bookingError;

      return {
        availability: data || [],
        existingBookings: bookings || []
      };
    },
    enabled: !!walkerId && !!date,
  });
};

export const useFavoriteWalkers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorite-walkers', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_favorite_walkers')
        .select(`
          walker_id,
          walker_profiles!user_favorite_walkers_walker_id_fkey (
            *,
            users!walker_profiles_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(fav => fav.walker_profiles) || [];
    },
    enabled: !!user,
  });
};

export const useToggleFavoriteWalker = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ walkerId, isFavorite }: { walkerId: string; isFavorite: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorite_walkers')
          .delete()
          .eq('user_id', user.id)
          .eq('walker_id', walkerId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorite_walkers')
          .insert({
            user_id: user.id,
            walker_id: walkerId
          });

        if (error) throw error;
      }

      return !isFavorite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-walkers'] });
      queryClient.invalidateQueries({ queryKey: ['walkers'] });
    },
  });
};

export const useWalkerMatchingScore = (walkerId: string, petId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['walker-matching-score', walkerId, petId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Simple matching algorithm based on available data
      const { data: walker } = await supabase
        .from('walker_profiles')
        .select(`
          *,
          walker_specialties (
            specialty_types (name)
          )
        `)
        .eq('id', walkerId)
        .single();

      let score = 0;

      // Base score from rating
      if (walker?.average_rating) {
        score += (walker.average_rating / 5) * 40; // Max 40 points for rating
      }

      // Experience bonus
      if (walker?.years_of_experience) {
        score += Math.min(walker.years_of_experience * 5, 30); // Max 30 points for experience
      }

      // Specialty matching (if pet provided)
      if (petId && walker?.walker_specialties) {
        const { data: pet } = await supabase
          .from('pets')
          .select('pet_breeds!inner(size_category)')
          .eq('id', petId)
          .single();

        const hasMatchingSpecialty = walker.walker_specialties.some(spec => {
          const specialty = spec.specialty_types?.name?.toLowerCase();
          const petSize = (pet?.pet_breeds as any)?.size_category?.toLowerCase();
          
          return specialty?.includes(petSize || '') || 
                 specialty?.includes('all') ||
                 specialty?.includes('general');
        });

        if (hasMatchingSpecialty) {
          score += 30; // Max 30 points for specialty match
        }
      }

      return Math.min(Math.round(score), 100); // Cap at 100
    },
    enabled: !!user && !!walkerId,
  });
};
