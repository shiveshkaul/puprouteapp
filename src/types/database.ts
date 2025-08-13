export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          date_of_birth: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string
          location: unknown | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          user_type: 'customer' | 'walker' | 'admin'
          subscription_tier: 'free' | 'premium' | 'pro'
          is_verified: boolean
          background_check_status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
          last_login_at: string | null
          is_active: boolean
          timezone: string
          preferred_language: string
          marketing_consent: boolean
          terms_accepted_at: string | null
          privacy_policy_accepted_at: string | null
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          location?: unknown | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          user_type?: 'customer' | 'walker' | 'admin'
          subscription_tier?: 'free' | 'premium' | 'pro'
          is_verified?: boolean
          background_check_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
          timezone?: string
          preferred_language?: string
          marketing_consent?: boolean
          terms_accepted_at?: string | null
          privacy_policy_accepted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          location?: unknown | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          user_type?: 'customer' | 'walker' | 'admin'
          subscription_tier?: 'free' | 'premium' | 'pro'
          is_verified?: boolean
          background_check_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
          timezone?: string
          preferred_language?: string
          marketing_consent?: boolean
          terms_accepted_at?: string | null
          privacy_policy_accepted_at?: string | null
        }
      }
      pets: {
        Row: {
          id: string
          owner_id: string
          name: string
          breed_id: string | null
          custom_breed: string | null
          date_of_birth: string | null
          estimated_age_months: number | null
          gender: 'male' | 'female' | 'unknown' | null
          is_neutered_spayed: boolean | null
          weight: number | null
          color: string | null
          microchip_id: string | null
          avatar_url: string | null
          personality_traits: string[]
          energy_level: 'low' | 'medium' | 'high' | 'very_high' | null
          socialization_level: 'shy' | 'selective' | 'friendly' | 'very_social' | null
          training_level: 'none' | 'basic' | 'intermediate' | 'advanced' | null
          allergies: string[]
          medical_conditions: string[]
          medications: string[]
          dietary_restrictions: string[]
          special_instructions: string | null
          emergency_vet_name: string | null
          emergency_vet_phone: string | null
          emergency_vet_address: string | null
          good_with_dogs: boolean
          good_with_cats: boolean
          good_with_children: boolean
          leash_behavior: 'excellent' | 'good' | 'fair' | 'needs_work' | null
          recall_reliability: 'excellent' | 'good' | 'fair' | 'poor' | null
          separation_anxiety: boolean
          resource_guarding: boolean
          fear_triggers: string[]
          preferred_walk_times: string[]
          max_walk_duration: number
          preferred_terrain: string[]
          weather_restrictions: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          breed_id?: string | null
          custom_breed?: string | null
          date_of_birth?: string | null
          estimated_age_months?: number | null
          gender?: 'male' | 'female' | 'unknown' | null
          is_neutered_spayed?: boolean | null
          weight?: number | null
          color?: string | null
          microchip_id?: string | null
          avatar_url?: string | null
          personality_traits?: string[]
          energy_level?: 'low' | 'medium' | 'high' | 'very_high' | null
          socialization_level?: 'shy' | 'selective' | 'friendly' | 'very_social' | null
          training_level?: 'none' | 'basic' | 'intermediate' | 'advanced' | null
          allergies?: string[]
          medical_conditions?: string[]
          medications?: string[]
          dietary_restrictions?: string[]
          special_instructions?: string | null
          emergency_vet_name?: string | null
          emergency_vet_phone?: string | null
          emergency_vet_address?: string | null
          good_with_dogs?: boolean
          good_with_cats?: boolean
          good_with_children?: boolean
          leash_behavior?: 'excellent' | 'good' | 'fair' | 'needs_work' | null
          recall_reliability?: 'excellent' | 'good' | 'fair' | 'poor' | null
          separation_anxiety?: boolean
          resource_guarding?: boolean
          fear_triggers?: string[]
          preferred_walk_times?: string[]
          max_walk_duration?: number
          preferred_terrain?: string[]
          weather_restrictions?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          breed_id?: string | null
          custom_breed?: string | null
          date_of_birth?: string | null
          estimated_age_months?: number | null
          gender?: 'male' | 'female' | 'unknown' | null
          is_neutered_spayed?: boolean | null
          weight?: number | null
          color?: string | null
          microchip_id?: string | null
          avatar_url?: string | null
          personality_traits?: string[]
          energy_level?: 'low' | 'medium' | 'high' | 'very_high' | null
          socialization_level?: 'shy' | 'selective' | 'friendly' | 'very_social' | null
          training_level?: 'none' | 'basic' | 'intermediate' | 'advanced' | null
          allergies?: string[]
          medical_conditions?: string[]
          medications?: string[]
          dietary_restrictions?: string[]
          special_instructions?: string | null
          emergency_vet_name?: string | null
          emergency_vet_phone?: string | null
          emergency_vet_address?: string | null
          good_with_dogs?: boolean
          good_with_cats?: boolean
          good_with_children?: boolean
          leash_behavior?: 'excellent' | 'good' | 'fair' | 'needs_work' | null
          recall_reliability?: 'excellent' | 'good' | 'fair' | 'poor' | null
          separation_anxiety?: boolean
          resource_guarding?: boolean
          fear_triggers?: string[]
          preferred_walk_times?: string[]
          max_walk_duration?: number
          preferred_terrain?: string[]
          weather_restrictions?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pet_breeds: {
        Row: {
          id: string
          name: string
          size_category: 'toy' | 'small' | 'medium' | 'large' | 'giant' | null
          exercise_needs: 'low' | 'moderate' | 'high' | 'very_high' | null
          typical_weight_min: number | null
          typical_weight_max: number | null
          temperament: string[] | null
          grooming_needs: 'low' | 'moderate' | 'high' | null
          health_considerations: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          size_category?: 'toy' | 'small' | 'medium' | 'large' | 'giant' | null
          exercise_needs?: 'low' | 'moderate' | 'high' | 'very_high' | null
          typical_weight_min?: number | null
          typical_weight_max?: number | null
          temperament?: string[] | null
          grooming_needs?: 'low' | 'moderate' | 'high' | null
          health_considerations?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          size_category?: 'toy' | 'small' | 'medium' | 'large' | 'giant' | null
          exercise_needs?: 'low' | 'moderate' | 'high' | 'very_high' | null
          typical_weight_min?: number | null
          typical_weight_max?: number | null
          temperament?: string[] | null
          grooming_needs?: 'low' | 'moderate' | 'high' | null
          health_considerations?: string[] | null
          created_at?: string
        }
      }
      walker_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          experience_years: number
          hourly_rate: number
          service_radius: number
          default_availability: Json
          is_available_now: boolean
          max_dogs_per_walk: number
          accepts_group_walks: boolean
          accepts_puppies: boolean
          accepts_senior_dogs: boolean
          accepts_large_dogs: boolean
          accepts_reactive_dogs: boolean
          certifications: string[]
          specialties: string[]
          languages_spoken: string[]
          has_own_transportation: boolean
          insurance_provider: string | null
          insurance_policy_number: string | null
          background_check_date: string | null
          background_check_status: 'pending' | 'approved' | 'rejected'
          total_walks_completed: number
          average_rating: number
          total_reviews: number
          response_time_minutes: number
          cancellation_rate: number
          profile_status: 'pending' | 'approved' | 'suspended' | 'deactivated'
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          experience_years?: number
          hourly_rate: number
          service_radius?: number
          default_availability?: Json
          is_available_now?: boolean
          max_dogs_per_walk?: number
          accepts_group_walks?: boolean
          accepts_puppies?: boolean
          accepts_senior_dogs?: boolean
          accepts_large_dogs?: boolean
          accepts_reactive_dogs?: boolean
          certifications?: string[]
          specialties?: string[]
          languages_spoken?: string[]
          has_own_transportation?: boolean
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          background_check_date?: string | null
          background_check_status?: 'pending' | 'approved' | 'rejected'
          total_walks_completed?: number
          average_rating?: number
          total_reviews?: number
          response_time_minutes?: number
          cancellation_rate?: number
          profile_status?: 'pending' | 'approved' | 'suspended' | 'deactivated'
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          experience_years?: number
          hourly_rate?: number
          service_radius?: number
          default_availability?: Json
          is_available_now?: boolean
          max_dogs_per_walk?: number
          accepts_group_walks?: boolean
          accepts_puppies?: boolean
          accepts_senior_dogs?: boolean
          accepts_large_dogs?: boolean
          accepts_reactive_dogs?: boolean
          certifications?: string[]
          specialties?: string[]
          languages_spoken?: string[]
          has_own_transportation?: boolean
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          background_check_date?: string | null
          background_check_status?: 'pending' | 'approved' | 'rejected'
          total_walks_completed?: number
          average_rating?: number
          total_reviews?: number
          response_time_minutes?: number
          cancellation_rate?: number
          profile_status?: 'pending' | 'approved' | 'suspended' | 'deactivated'
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          walker_id: string | null
          pet_id: string
          service_type_id: string
          scheduled_date: string
          scheduled_time: string
          duration_minutes: number
          timezone: string
          pickup_address: string
          pickup_location: unknown | null
          dropoff_address: string | null
          dropoff_location: unknown | null
          walking_area_preference: string | null
          base_price: number
          additional_fees: number
          discount_amount: number
          tax_amount: number
          tip_amount: number
          total_amount: number
          status: 'pending' | 'confirmed' | 'walker_assigned' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'
          cancellation_reason: string | null
          cancelled_by: 'customer' | 'walker' | 'system' | null
          special_instructions: string | null
          emergency_contact_phone: string | null
          key_location_instructions: string | null
          ai_recommendation_score: number | null
          recommendation_factors: string[]
          is_recurring: boolean
          recurring_pattern: string | null
          recurring_days: string[]
          recurring_end_date: string | null
          parent_booking_id: string | null
          confirmed_at: string | null
          started_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          walker_id?: string | null
          pet_id: string
          service_type_id: string
          scheduled_date: string
          scheduled_time: string
          duration_minutes: number
          timezone?: string
          pickup_address: string
          pickup_location?: unknown | null
          dropoff_address?: string | null
          dropoff_location?: unknown | null
          walking_area_preference?: string | null
          base_price: number
          additional_fees?: number
          discount_amount?: number
          tax_amount?: number
          tip_amount?: number
          total_amount: number
          status?: 'pending' | 'confirmed' | 'walker_assigned' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'
          cancellation_reason?: string | null
          cancelled_by?: 'customer' | 'walker' | 'system' | null
          special_instructions?: string | null
          emergency_contact_phone?: string | null
          key_location_instructions?: string | null
          ai_recommendation_score?: number | null
          recommendation_factors?: string[]
          is_recurring?: boolean
          recurring_pattern?: string | null
          recurring_days?: string[]
          recurring_end_date?: string | null
          parent_booking_id?: string | null
          confirmed_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          walker_id?: string | null
          pet_id?: string
          service_type_id?: string
          scheduled_date?: string
          scheduled_time?: string
          duration_minutes?: number
          timezone?: string
          pickup_address?: string
          pickup_location?: unknown | null
          dropoff_address?: string | null
          dropoff_location?: unknown | null
          walking_area_preference?: string | null
          base_price?: number
          additional_fees?: number
          discount_amount?: number
          tax_amount?: number
          tip_amount?: number
          total_amount?: number
          status?: 'pending' | 'confirmed' | 'walker_assigned' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'
          cancellation_reason?: string | null
          cancelled_by?: 'customer' | 'walker' | 'system' | null
          special_instructions?: string | null
          emergency_contact_phone?: string | null
          key_location_instructions?: string | null
          ai_recommendation_score?: number | null
          recommendation_factors?: string[]
          is_recurring?: boolean
          recurring_pattern?: string | null
          recurring_days?: string[]
          recurring_end_date?: string | null
          parent_booking_id?: string | null
          confirmed_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_types: {
        Row: {
          id: string
          name: string
          description: string | null
          base_price: number
          duration_minutes: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          base_price: number
          duration_minutes: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          base_price?: number
          duration_minutes?: number
          is_active?: boolean
          created_at?: string
        }
      }
      walk_sessions: {
        Row: {
          id: string
          booking_id: string
          walker_id: string
          pet_id: string
          actual_start_time: string | null
          actual_end_time: string | null
          total_duration_minutes: number | null
          distance_walked: number | null
          calories_burned_estimate: number | null
          steps_estimate: number | null
          start_location: unknown | null
          end_location: unknown | null
          route_polyline: string | null
          weather_temperature: number | null
          weather_condition: string | null
          weather_description: string | null
          walker_notes: string | null
          pet_mood: 'happy' | 'excited' | 'calm' | 'tired' | 'anxious' | 'playful' | null
          bathroom_breaks: number
          water_breaks: number
          social_interactions: number
          training_moments: string | null
          had_incidents: boolean
          incident_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          walker_id: string
          pet_id: string
          actual_start_time?: string | null
          actual_end_time?: string | null
          total_duration_minutes?: number | null
          distance_walked?: number | null
          calories_burned_estimate?: number | null
          steps_estimate?: number | null
          start_location?: unknown | null
          end_location?: unknown | null
          route_polyline?: string | null
          weather_temperature?: number | null
          weather_condition?: string | null
          weather_description?: string | null
          walker_notes?: string | null
          pet_mood?: 'happy' | 'excited' | 'calm' | 'tired' | 'anxious' | 'playful' | null
          bathroom_breaks?: number
          water_breaks?: number
          social_interactions?: number
          training_moments?: string | null
          had_incidents?: boolean
          incident_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          walker_id?: string
          pet_id?: string
          actual_start_time?: string | null
          actual_end_time?: string | null
          total_duration_minutes?: number | null
          distance_walked?: number | null
          calories_burned_estimate?: number | null
          steps_estimate?: number | null
          start_location?: unknown | null
          end_location?: unknown | null
          route_polyline?: string | null
          weather_temperature?: number | null
          weather_condition?: string | null
          weather_description?: string | null
          walker_notes?: string | null
          pet_mood?: 'happy' | 'excited' | 'calm' | 'tired' | 'anxious' | 'playful' | null
          bathroom_breaks?: number
          water_breaks?: number
          social_interactions?: number
          training_moments?: string | null
          had_incidents?: boolean
          incident_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      walk_photos: {
        Row: {
          id: string
          walk_session_id: string
          photo_url: string
          thumbnail_url: string | null
          caption: string | null
          ai_generated_caption: string | null
          location: unknown | null
          taken_at: string
          uploaded_by: string | null
          is_featured: boolean
          photo_metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          walk_session_id: string
          photo_url: string
          thumbnail_url?: string | null
          caption?: string | null
          ai_generated_caption?: string | null
          location?: unknown | null
          taken_at: string
          uploaded_by?: string | null
          is_featured?: boolean
          photo_metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          walk_session_id?: string
          photo_url?: string
          thumbnail_url?: string | null
          caption?: string | null
          ai_generated_caption?: string | null
          location?: unknown | null
          taken_at?: string
          uploaded_by?: string | null
          is_featured?: boolean
          photo_metadata?: Json
          created_at?: string
        }
      }
      loyalty_accounts: {
        Row: {
          id: string
          user_id: string
          program_id: string
          current_points: number
          lifetime_points_earned: number
          lifetime_points_redeemed: number
          tier_level: 'bronze' | 'silver' | 'gold' | 'platinum'
          tier_progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          program_id: string
          current_points?: number
          lifetime_points_earned?: number
          lifetime_points_redeemed?: number
          tier_level?: 'bronze' | 'silver' | 'gold' | 'platinum'
          tier_progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          program_id?: string
          current_points?: number
          lifetime_points_earned?: number
          lifetime_points_redeemed?: number
          tier_level?: 'bronze' | 'silver' | 'gold' | 'platinum'
          tier_progress?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          reviewer_type: 'customer' | 'walker'
          rating: number
          title: string | null
          comment: string | null
          punctuality_rating: number | null
          communication_rating: number | null
          care_quality_rating: number | null
          professionalism_rating: number | null
          is_verified: boolean
          is_featured: boolean
          helpful_votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          reviewer_type: 'customer' | 'walker'
          rating: number
          title?: string | null
          comment?: string | null
          punctuality_rating?: number | null
          communication_rating?: number | null
          care_quality_rating?: number | null
          professionalism_rating?: number | null
          is_verified?: boolean
          is_featured?: boolean
          helpful_votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          reviewer_id?: string
          reviewee_id?: string
          reviewer_type?: 'customer' | 'walker'
          rating?: number
          title?: string | null
          comment?: string | null
          punctuality_rating?: number | null
          communication_rating?: number | null
          care_quality_rating?: number | null
          professionalism_rating?: number | null
          is_verified?: boolean
          is_featured?: boolean
          helpful_votes?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      booking_details: {
        Row: {
          id: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          duration_minutes: number | null
          status: 'pending' | 'confirmed' | 'walker_assigned' | 'in_progress' | 'completed' | 'cancelled' | 'refunded' | null
          total_amount: number | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_email: string | null
          customer_phone: string | null
          pet_name: string | null
          breed_id: string | null
          breed_name: string | null
          pet_weight: number | null
          energy_level: 'low' | 'medium' | 'high' | 'very_high' | null
          walker_first_name: string | null
          walker_last_name: string | null
          walker_email: string | null
          walker_phone: string | null
          hourly_rate: number | null
          average_rating: number | null
          service_type_name: string | null
          service_description: string | null
          pickup_address: string | null
          special_instructions: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
    }
    Functions: {
      calculate_distance: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
      check_walker_availability: {
        Args: {
          walker_id_param: string
          check_date: string
          check_time: string
          duration_minutes: number
        }
        Returns: boolean
      }
      find_nearby_walkers: {
        Args: {
          customer_lat: number
          customer_lon: number
          radius_miles?: number
        }
        Returns: {
          walker_id: string
          user_id: string
          first_name: string
          last_name: string
          hourly_rate: number
          average_rating: number
          distance_miles: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
