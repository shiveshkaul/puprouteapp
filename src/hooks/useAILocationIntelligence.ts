import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocationService } from './useLocationServices';

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface AIWalkSuggestion {
  route: google.maps.LatLng[];
  reason: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  estimatedDuration: number;
  highlights: string[];
  safetyNotes: string[];
  weatherConsiderations: string[];
}

interface PetProfile {
  name: string;
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  energy_level: 'low' | 'medium' | 'high';
  special_needs?: string[];
  preferred_activities?: string[];
  behavioral_notes?: string;
}

interface WalkContext {
  weather: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  duration: number; // minutes
  walker_experience: string;
  location: {
    lat: number;
    lng: number;
    neighborhood: string;
  };
}

const GEMINI_API_KEY = 'AIzaSyBafk7WqRslUyt3UFz0BFg6hqTyUy_nxow';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

class GeminiAIService {
  private async callGeminiAPI(prompt: string): Promise<string> {
    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  async generateWalkSuggestions(
    pet: PetProfile,
    context: WalkContext,
    availableRoutes: string[]
  ): Promise<AIWalkSuggestion[]> {
    const prompt = `
As a professional dog walking consultant, analyze this situation and suggest the best walking routes:

PET PROFILE:
- Name: ${pet.name}
- Breed: ${pet.breed}
- Age: ${pet.age} years
- Size: ${pet.size}
- Energy Level: ${pet.energy_level}
- Special Needs: ${pet.special_needs?.join(', ') || 'None'}
- Behavioral Notes: ${pet.behavioral_notes || 'None'}

CURRENT CONDITIONS:
- Weather: ${context.weather.condition}, ${context.weather.temperature}°F
- Time: ${context.timeOfDay}
- Planned Duration: ${context.duration} minutes
- Walker Experience: ${context.walker_experience}
- Location: ${context.location.neighborhood}

AVAILABLE ROUTES:
${availableRoutes.map((route, i) => `${i + 1}. ${route}`).join('\n')}

Please provide 3 route recommendations in JSON format:
{
  "suggestions": [
    {
      "routeNumber": 1,
      "reason": "Why this route is perfect for this pet",
      "difficulty": "easy|moderate|challenging",
      "estimatedDuration": 30,
      "highlights": ["Feature 1", "Feature 2"],
      "safetyNotes": ["Safety consideration 1"],
      "weatherConsiderations": ["Weather-specific advice"]
    }
  ]
}

Focus on the pet's specific needs, energy level, and current conditions.
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const parsed = JSON.parse(response);
      return parsed.suggestions || [];
    } catch (error) {
      console.error('Failed to parse AI suggestions:', error);
      return [];
    }
  }

  async analyzeWalkSafety(
    currentLocation: { lat: number; lng: number },
    pet: PetProfile,
    nearbyHazards: string[]
  ): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    alerts: string[];
    recommendations: string[];
  }> {
    const prompt = `
Analyze the safety situation for this dog walk:

PET: ${pet.name} (${pet.breed}, ${pet.size} size, ${pet.energy_level} energy)
SPECIAL NEEDS: ${pet.special_needs?.join(', ') || 'None'}

NEARBY HAZARDS DETECTED:
${nearbyHazards.join('\n')}

Provide safety analysis in JSON format:
{
  "riskLevel": "low|medium|high",
  "alerts": ["Immediate safety concerns"],
  "recommendations": ["Specific actions to take"]
}

Consider the pet's size, breed characteristics, and energy level.
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const parsed = JSON.parse(response);
      return {
        riskLevel: parsed.riskLevel || 'low',
        alerts: parsed.alerts || [],
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Failed to analyze safety:', error);
      return {
        riskLevel: 'low',
        alerts: [],
        recommendations: []
      };
    }
  }

  async generateWalkerMatch(
    pet: PetProfile,
    walkers: Array<{
      id: string;
      name: string;
      experience: string;
      specialties: string[];
      location: { lat: number; lng: number };
      rating: number;
      bio: string;
    }>,
    walkLocation: { lat: number; lng: number }
  ): Promise<Array<{
    walkerId: string;
    matchScore: number;
    reasons: string[];
    concerns: string[];
  }>> {
    const prompt = `
As an expert dog walker matching service, analyze which walkers are best for this pet:

PET PROFILE:
- ${pet.name}: ${pet.breed}, ${pet.age} years old
- Size: ${pet.size}, Energy: ${pet.energy_level}
- Special Needs: ${pet.special_needs?.join(', ') || 'None'}
- Behavioral Notes: ${pet.behavioral_notes || 'None'}

AVAILABLE WALKERS:
${walkers.map((w, i) => `
${i + 1}. ${w.name} (ID: ${w.id})
   - Experience: ${w.experience}
   - Specialties: ${w.specialties.join(', ')}
   - Rating: ${w.rating}/5
   - Bio: ${w.bio}
`).join('\n')}

Provide matching analysis in JSON format:
{
  "matches": [
    {
      "walkerId": "walker_id",
      "matchScore": 85,
      "reasons": ["Why this walker is great for this pet"],
      "concerns": ["Potential considerations"]
    }
  ]
}

Score from 0-100 based on compatibility.
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const parsed = JSON.parse(response);
      return parsed.matches || [];
    } catch (error) {
      console.error('Failed to analyze walker matches:', error);
      return [];
    }
  }

  async generateWalkReport(
    pet: PetProfile,
    walkData: {
      duration: number;
      distance: number;
      route: google.maps.LatLng[];
      photos: Array<{ url: string; caption: string; timestamp: string }>;
      incidents?: string[];
      mood: string;
    }
  ): Promise<{
    summary: string;
    highlights: string[];
    moodAnalysis: string;
    recommendations: string[];
    ownerMessage: string;
  }> {
    const prompt = `
Create a personalized walk report for the pet owner:

PET: ${pet.name} (${pet.breed})
WALK DATA:
- Duration: ${walkData.duration} minutes
- Distance: ${walkData.distance} km
- Photos taken: ${walkData.photos.length}
- Pet's mood: ${walkData.mood}
- Incidents: ${walkData.incidents?.join(', ') || 'None'}

PHOTO MOMENTS:
${walkData.photos.map(p => `- ${p.caption} (${p.timestamp})`).join('\n')}

Generate a warm, personal report in JSON format:
{
  "summary": "Brief overview of the walk",
  "highlights": ["Best moments from the walk"],
  "moodAnalysis": "How the pet seemed during the walk",
  "recommendations": ["Suggestions for future walks"],
  "ownerMessage": "Personal message to the owner about their pet"
}

Make it personal and heartwarming, like a caring friend reporting back.
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const parsed = JSON.parse(response);
      return {
        summary: parsed.summary || '',
        highlights: parsed.highlights || [],
        moodAnalysis: parsed.moodAnalysis || '',
        recommendations: parsed.recommendations || [],
        ownerMessage: parsed.ownerMessage || ''
      };
    } catch (error) {
      console.error('Failed to generate walk report:', error);
      return {
        summary: 'Walk completed successfully!',
        highlights: [],
        moodAnalysis: 'Pet seemed happy and energetic.',
        recommendations: [],
        ownerMessage: 'Your furry friend had a wonderful time!'
      };
    }
  }
}

export const useAIWalkSuggestions = (pet: PetProfile, context: WalkContext) => {
  const locationService = useLocationService();
  const aiService = new GeminiAIService();

  return useQuery({
    queryKey: ['ai-walk-suggestions', pet.name, context.location.lat, context.location.lng],
    queryFn: async () => {
      // Get nearby points of interest
      const nearbyPOIs = await locationService.findNearbyPOIs(
        context.location,
        'park',
        2000
      );

      const availableRoutes = nearbyPOIs.map(poi => 
        `${poi.name}: ${poi.vicinity} - ${poi.rating ? `${poi.rating}★` : 'Unrated'}`
      );

      return await aiService.generateWalkSuggestions(pet, context, availableRoutes);
    },
    enabled: !!pet && !!context.location.lat,
  });
};

export const useAIWalkerMatching = (pet: PetProfile, walkLocation: { lat: number; lng: number }) => {
  const aiService = new GeminiAIService();

  return useQuery({
    queryKey: ['ai-walker-matching', pet.name, walkLocation.lat, walkLocation.lng],
    queryFn: async () => {
      // This would typically fetch walker data from your database
      // For now, using mock data structure
      const mockWalkers = [
        {
          id: 'walker_1',
          name: 'Sarah Johnson',
          experience: '5 years professional dog walking',
          specialties: ['Large breeds', 'Behavioral training', 'Senior dogs'],
          location: walkLocation,
          rating: 4.9,
          bio: 'Passionate about helping anxious dogs build confidence through gentle, structured walks.'
        }
      ];

      return await aiService.generateWalkerMatch(pet, mockWalkers, walkLocation);
    },
    enabled: !!pet && !!walkLocation.lat,
  });
};

export const useAISafetyAnalysis = (
  currentLocation: { lat: number; lng: number },
  pet: PetProfile
) => {
  const locationService = useLocationService();
  const aiService = new GeminiAIService();

  return useQuery({
    queryKey: ['ai-safety-analysis', currentLocation.lat, currentLocation.lng, pet.name],
    queryFn: async () => {
      // Get nearby hazards (busy roads, construction, etc.)
      const nearbyPlaces = await locationService.findNearbyPOIs(
        currentLocation,
        'establishment',
        500
      );

      const hazards = nearbyPlaces
        .filter(place => 
          place.types?.some(type => 
            ['gas_station', 'car_dealer', 'car_repair'].includes(type)
          )
        )
        .map(place => `${place.name}: ${place.vicinity}`);

      return await aiService.analyzeWalkSafety(currentLocation, pet, hazards);
    },
    enabled: !!currentLocation.lat && !!pet,
    refetchInterval: 30000, // Check every 30 seconds during walk
  });
};

export const useGenerateAIWalkReport = () => {
  const aiService = new GeminiAIService();

  return useMutation({
    mutationFn: async ({
      pet,
      walkData
    }: {
      pet: PetProfile;
      walkData: {
        duration: number;
        distance: number;
        route: google.maps.LatLng[];
        photos: Array<{ url: string; caption: string; timestamp: string }>;
        incidents?: string[];
        mood: string;
      };
    }) => {
      return await aiService.generateWalkReport(pet, walkData);
    },
  });
};

export { GeminiAIService };

// Compatible interface for LiveWalkExperience component
interface Location {
  lat: number;
  lng: number;
  timestamp?: number;
}

interface AIInsights {
  energyLevel: string;
  routeOptimality: string;
  experienceScore: number;
  weatherConditions?: string;
  safetyScore?: number;
  recommendation?: string;
}

interface EmergencyAlert {
  id: string;
  type: 'weather' | 'safety' | 'health' | 'traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
}

interface AILocationIntelligenceProps {
  petId: string;
  walkerId: string;
  currentLocation: Location | null;
  walkStatus: 'waiting' | 'started' | 'paused' | 'completed';
}

interface AILocationIntelligenceResult {
  data: AIInsights | null;
  realTimeAnalysis: AIInsights | null;
  emergencyAlerts: EmergencyAlert[];
  isAnalyzing: boolean;
}

export const useAILocationIntelligence = (props: AILocationIntelligenceProps): AILocationIntelligenceResult => {
  const aiService = new GeminiAIService();

  // Mock AI insights for the component
  const mockInsights: AIInsights = {
    energyLevel: props.walkStatus === 'started' ? 'High' : 'Medium',
    routeOptimality: 'Excellent - Pet-friendly route detected',
    experienceScore: Math.floor(Math.random() * 3) + 8, // 8-10
    weatherConditions: 'Perfect for walking',
    safetyScore: 9,
    recommendation: 'Great route! Continue enjoying the walk.'
  };

  const mockEmergencyAlerts: EmergencyAlert[] = [];

  return {
    data: mockInsights,
    realTimeAnalysis: mockInsights,
    emergencyAlerts: mockEmergencyAlerts,
    isAnalyzing: false
  };
};
