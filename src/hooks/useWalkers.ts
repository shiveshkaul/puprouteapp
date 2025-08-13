import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type WalkerProfile = Database['public']['Tables']['walker_profiles']['Row']

export const useWalkers = () => {
  return useQuery({
    queryKey: ['walkers'],
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
        .eq('is_available_now', true)
        .order('average_rating', { ascending: false })
      
      if (error) throw error
      return data as (WalkerProfile & { users: any })[]
    },
  })
}

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
        .limit(6)
      
      if (error) throw error
      return data as (WalkerProfile & { users: any })[]
    },
  })
}

export const useNearbyWalkers = (lat?: number, lon?: number, radius = 10) => {
  return useQuery({
    queryKey: ['nearby-walkers', lat, lon, radius],
    queryFn: async () => {
      if (!lat || !lon) return []
      
      const { data, error } = await supabase.rpc('find_nearby_walkers', {
        customer_lat: lat,
        customer_lon: lon,
        radius_miles: radius,
      })
      
      if (error) throw error
      return data
    },
    enabled: !!lat && !!lon,
  })
}
