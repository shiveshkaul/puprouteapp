import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export const useLoyaltyAccount = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['loyalty-account', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      const { data, error } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export const useWalkPhotos = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['walk-photos', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('walk_photos')
        .select(`
          *,
          walk_sessions!inner (
            booking_id,
            bookings!inner (
              customer_id
            )
          )
        `)
        .eq('walk_sessions.bookings.customer_id', user.id)
        .order('taken_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export const useWalkSessions = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['walk-sessions', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('walk_sessions')
        .select(`
          *,
          bookings!inner (
            customer_id,
            pets (
              name,
              avatar_url
            )
          ),
          walker_profiles!inner (
            users (
              first_name,
              last_name
            )
          )
        `)
        .eq('bookings.customer_id', user.id)
        .order('actual_start_time', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}
