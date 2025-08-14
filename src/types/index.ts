// Re-export database types
export * from './database';

// Re-export settings types
export * from './settings';

// Walker onboarding types
export interface WalkerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  experience: string;
  bio: string;
  petTypes: string[];
  services: string[];
  certifications: string[];
  homeType: string;
  gardenType: string;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  advanceNotice: string;
  toiletBreaks: string;
  baseRate: number;
  walkRate: number;
  dayRate: number;
  profilePhoto: string;
  galleryPhotos: string[];
  testimonialEmails: string[];
  verificationDocuments: {
    type: string;
    front: string;
    back: string;
  };
  quizAnswers: Record<string, any>;
}

// Walker profile types
export interface WalkerProfile {
  id: string;
  user_id: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  services: string[];
  availability: Record<string, boolean>;
  rating: number;
  total_walks: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Walker service types
export interface WalkerService {
  id: string;
  walker_id: string;
  service_type: 'walk' | 'sitting' | 'boarding' | 'daycare';
  price: number;
  duration_minutes?: number;
  description?: string;
  is_active: boolean;
}

// Walker availability types
export interface WalkerAvailabilitySlot {
  id: string;
  walker_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
}
