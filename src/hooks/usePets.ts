import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { useAuth } from './useAuth'

type Pet = Database['public']['Tables']['pets']['Row']
type PetInsert = Database['public']['Tables']['pets']['Insert']
type PetUpdate = Database['public']['Tables']['pets']['Update']

export const usePets = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          pet_breeds (
            name,
            size_category,
            exercise_needs,
            temperament
          )
        `)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as (Pet & { pet_breeds: any })[]
    },
    enabled: !!user,
  })
}

export const useAddPet = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (pet: Omit<PetInsert, 'owner_id'>) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('pets')
        .insert({ ...pet, owner_id: user.id })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
    },
  })
}

export const useUpdatePet = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...pet }: PetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('pets')
        .update(pet)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
    },
  })
}

export const usePetBreeds = () => {
  return useQuery({
    queryKey: ['pet-breeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_breeds')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    },
  })
}
