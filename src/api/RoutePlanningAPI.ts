// Route Planning API Handler
// POST /api/routes/plan

import { IntelligentRoutePlanner } from '../services/IntelligentRoutePlanner';

interface RouteRequestBody {
  start: { lat: number; lng: number } | { placeId: string };
  endPolicy: 'loop' | 'point';
  end?: { lat: number; lng: number } | { placeId: string };
  target: {
    durationMin?: number;
    distanceM?: number;
  };
  pets: Array<{
    id: string;
    weightKg: number;
    energy: 'low' | 'medium' | 'high';
    ageYears: number;
    heatSensitive?: boolean;
    reactive?: {
      dogs?: boolean;
      bikes?: boolean;
      kids?: boolean;
    };
    mobility?: 'excellent' | 'good' | 'limited';
  }>;
  preferences: {
    preferParks: boolean;
    avoidBusyRoads: boolean;
    lowSlope: boolean;
    shade: boolean;
    avoidDogParks: boolean;
    waterFountains: boolean;
    benches: boolean;
  };
  time: {
    startISO: string;
  };
}

export class RoutePlanningAPI {
  private planner: IntelligentRoutePlanner;

  constructor() {
    this.planner = new IntelligentRoutePlanner();
  }

  async planRoutes(request: RouteRequestBody) {
    try {
      console.log('🗺️ Route planning request received:', {
        start: request.start,
        endPolicy: request.endPolicy,
        pets: request.pets.length,
        target: request.target
      });

      // Validate request
      this.validateRequest(request);

      // Plan routes using intelligent planner
      const result = await this.planner.planRoutes(request);

      console.log('✅ Route planning completed:', {
        routeCount: result.routes.length,
        topScore: result.routes[0]?.score,
        weather: result.weather
      });

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Route planning failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private validateRequest(request: RouteRequestBody) {
    // Validate start location
    if (!request.start) {
      throw new Error('Start location is required');
    }

    if (!('lat' in request.start) && !('placeId' in request.start)) {
      throw new Error('Start location must have either lat/lng or placeId');
    }

    // Validate end policy
    if (!['loop', 'point'].includes(request.endPolicy)) {
      throw new Error('End policy must be either "loop" or "point"');
    }

    if (request.endPolicy === 'point' && !request.end) {
      throw new Error('End location is required for point-to-point routes');
    }

    // Validate pets
    if (!request.pets || request.pets.length === 0) {
      throw new Error('At least one pet must be selected');
    }

    for (const pet of request.pets) {
      if (!pet.id || typeof pet.weightKg !== 'number' || !pet.energy || typeof pet.ageYears !== 'number') {
        throw new Error('Pet information is incomplete');
      }

      if (!['low', 'medium', 'high'].includes(pet.energy)) {
        throw new Error('Pet energy level must be low, medium, or high');
      }

      if (pet.weightKg <= 0 || pet.weightKg > 100) {
        throw new Error('Pet weight must be between 0 and 100 kg');
      }

      if (pet.ageYears < 0 || pet.ageYears > 30) {
        throw new Error('Pet age must be between 0 and 30 years');
      }
    }

    // Validate target
    if (!request.target.durationMin && !request.target.distanceM) {
      throw new Error('Either target duration or distance must be specified');
    }

    if (request.target.durationMin && (request.target.durationMin < 5 || request.target.durationMin > 180)) {
      throw new Error('Target duration must be between 5 and 180 minutes');
    }

    if (request.target.distanceM && (request.target.distanceM < 100 || request.target.distanceM > 20000)) {
      throw new Error('Target distance must be between 100m and 20km');
    }

    // Validate time
    if (!request.time.startISO) {
      throw new Error('Start time is required');
    }

    try {
      new Date(request.time.startISO);
    } catch {
      throw new Error('Start time must be a valid ISO string');
    }

    // Validate preferences
    if (!request.preferences || typeof request.preferences !== 'object') {
      throw new Error('Preferences object is required');
    }
  }

  // Get cached route plans for performance
  async getCachedRoutes(cacheKey: string) {
    // In a real app, this would check Redis/Memcached
    // For now, return null to indicate no cache
    return null;
  }

  // Cache successful route plans
  async cacheRoutes(cacheKey: string, routes: any, ttlMinutes: number = 30) {
    // In a real app, this would store in Redis/Memcached
    console.log(`Would cache routes with key: ${cacheKey} for ${ttlMinutes} minutes`);
  }

  // Generate cache key for route requests
  generateCacheKey(request: RouteRequestBody): string {
    const key = {
      start: request.start,
      endPolicy: request.endPolicy,
      end: request.end,
      target: request.target,
      petConstraints: this.extractPetConstraints(request.pets),
      preferences: request.preferences,
      timeWindow: this.getTimeWindow(request.time.startISO)
    };

    return btoa(JSON.stringify(key)).substring(0, 32);
  }

  private extractPetConstraints(pets: any[]) {
    return {
      count: pets.length,
      energyLevels: pets.map(p => p.energy).sort(),
      maxWeight: Math.max(...pets.map(p => p.weightKg)),
      maxAge: Math.max(...pets.map(p => p.ageYears)),
      heatSensitive: pets.some(p => p.heatSensitive),
      reactive: {
        dogs: pets.some(p => p.reactive?.dogs),
        bikes: pets.some(p => p.reactive?.bikes),
        kids: pets.some(p => p.reactive?.kids)
      }
    };
  }

  private getTimeWindow(isoString: string): string {
    const date = new Date(isoString);
    const hour = date.getHours();
    
    // Group into time windows for caching
    if (hour < 6) return 'early-morning';
    if (hour < 10) return 'morning';
    if (hour < 14) return 'midday';
    if (hour < 18) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }
}

export default RoutePlanningAPI;
