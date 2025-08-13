import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { useAuth } from './useAuth'

type UserProfile = Database['public']['Tables']['users']['Row']
type UserProfileInsert = Database['public']['Tables']['users']['Insert']
type UserProfileUpdate = Database['public']['Tables']['users']['Update']

export const useUserProfile = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
          console.error('Error fetching user profile:', error)
          throw error
        }
        
        return data
      } catch (error) {
        console.error('User profile query failed:', error)
        // Return null instead of throwing for missing profiles
        return null
      }
    },
    enabled: !!user,
    retry: 3,
    retryDelay: 1000,
  })
}

export const useCreateUserProfile = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (profile?: Partial<UserProfileInsert>) => {
      if (!user) throw new Error('User not authenticated')
      
      console.log('Creating user profile with auth UUID:', user.id)
      
      // Method 1: Try using the database function first
      try {
        const { data: functionResult, error: functionError } = await supabase
          .rpc('create_user_profile_from_auth')
        
        if (!functionError && functionResult?.success) {
          console.log('Profile created via database function:', functionResult)
          return functionResult
        }
        
        if (functionError) {
          console.log('Database function failed, trying direct insert:', functionError)
        }
      } catch (error) {
        console.log('Database function not available, using direct insert')
      }
      
      // Method 2: Direct insert with auth UUID
      const defaultProfile: UserProfileInsert = {
        id: user.id, // Use auth UUID directly
        email: user.email || '',
        first_name: user.user_metadata?.first_name || 
                   user.user_metadata?.full_name?.split(' ')[0] || 
                   (user.email ? user.email.split('@')[0] : 'User'),
        last_name: user.user_metadata?.last_name || 
                  user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                  '',
        phone: user.user_metadata?.phone || user.phone || null,
        address: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...profile
      }
      
      console.log('Direct insert with profile data:', defaultProfile)
      
      const { data, error } = await supabase
        .from('users')
        .insert(defaultProfile)
        .select('id, email, first_name, last_name')
        .single()
      
      if (error) {
        console.error('Direct insert failed:', error)
        
        // If profile already exists, try to fetch it
        if (error.code === '23505') {
          const { data: existingProfile } = await supabase
            .from('users')
            .select('id, email, first_name, last_name')
            .eq('id', user.id)
            .single()
          
          if (existingProfile) {
            console.log('Found existing profile:', existingProfile)
            return existingProfile
          }
        }
        
        throw new Error(`Failed to create profile: ${error.message}`)
      }
      
      console.log('Profile created successfully:', data)
      return data
    },
    onSuccess: (data) => {
      console.log('Profile creation succeeded:', data)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
    onError: (error) => {
      console.error('Profile creation failed:', error)
    }
  })
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...profile }: UserProfileUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}

// Hook to ensure user profile exists
export const useEnsureUserProfile = () => {
  const { user } = useAuth()
  const { data: userProfile, isLoading, refetch } = useUserProfile()
  const createProfile = useCreateUserProfile()
  
  const ensureProfile = async () => {
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    console.log('Ensuring user profile exists for user:', user.id)
    
    // If we already have a profile, return it
    if (userProfile) {
      console.log('Profile already exists:', userProfile)
      return userProfile
    }
    
    // If we're still loading, wait and refetch
    if (isLoading) {
      console.log('Profile query is loading, waiting...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      await refetch()
      if (userProfile) return userProfile
    }
    
    // Try to create the profile
    try {
      console.log('Creating new user profile...')
      const newProfile = await createProfile.mutateAsync({})
      console.log('Profile created successfully:', newProfile)
      return newProfile
    } catch (error: any) {
      console.error('Failed to create profile:', error)
      
      // As a last resort, try to fetch the profile again
      // (it might have been created by a trigger)
      console.log('Attempting final profile fetch...')
      await refetch()
      if (userProfile) {
        console.log('Profile found after refetch:', userProfile)
        return userProfile
      }
      
      throw error
    }
  }
  
  return {
    userProfile,
    isLoading: isLoading || createProfile.isPending,
    ensureProfile,
    isCreating: createProfile.isPending,
    refetch
  }
}
