import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { useAuth } from './useAuth'

type Booking = Database['public']['Tables']['bookings']['Row']
type BookingInsert = Database['public']['Tables']['bookings']['Insert']
type BookingUpdate = Database['public']['Tables']['bookings']['Update']

export const useBookings = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('booking_details')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (booking: Omit<BookingInsert, 'customer_id'>) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({ ...booking, customer_id: user.id })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useUpdateBooking = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...booking }: BookingUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(booking)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('is_active', true)
        .order('duration_minutes')
      
      if (error) throw error
      return data
    },
  })
}

export const useUpcomingBookings = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['upcoming-bookings', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('booking_details')
        .select('*')
        .eq('customer_id', user.id)
        .gte('scheduled_date', today)
        .in('status', ['pending', 'confirmed', 'walker_assigned'])
        .order('scheduled_date', { ascending: true })
        .limit(5)
      
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}
