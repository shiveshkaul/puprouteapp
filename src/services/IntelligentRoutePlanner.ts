// Advanced Route Planning Service
// Implements intelligent route planning with multi-objective scoring

import { GoogleMapsService } from './GoogleMapsService';

interface PetConstraints {
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
}

interface RoutePreferences {
  preferParks: boolean;
  avoidBusyRoads: boolean;
  lowSlope: boolean;
  shade: boolean;
  avoidDogParks: boolean;
  waterFountains: boolean;
  benches: boolean;
}

interface RoutePlanRequest {
  start: { lat: number; lng: number } | { placeId: string };
  endPolicy: 'loop' | 'point';
  end?: { lat: number; lng: number } | { placeId: string };
  target: {
    durationMin?: number;
    distanceM?: number;
  };
  pets: PetConstraints[];
  preferences: RoutePreferences;
  time: {
    startISO: string;
  };
}

interface RouteCandidate {
  id: string;
  polyline: string;
  legs: any[];
  distanceMeters: number;
  durationSec: number;
  waypoints: Array<{
    placeId?: string;
    name: string;
    types: string[];
    location: { lat: number; lng: number };
  }>;
  elevationGainM: number;
  crossingsEstimate: number;
  parksRatio: number;
  advisories: Array<{
    type: 'warning' | 'info' | 'tip';
    message: string;
  }>;
  score: number;
  reasons: string[];
  thumbnails: string[];
  weatherSuitability: number;
}

interface RoutePlanResponse {
  routes: RouteCandidate[];
  weather: {
    tempC: number;
    precipProb: number;
    heatIndex: number;
    daylightMinsLeft: number;
    uvIndex?: number;
    windSpeedKmh?: number;
  };
  context: {
    searchRadius: number;
    considerationFactors: string[];
    petConstraints: string[];
  };
}

export class IntelligentRoutePlanner {
  private mapsService: GoogleMapsService;
  private weatherApiKey: string;

  constructor() {
    this.mapsService = new GoogleMapsService();
    this.weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  }

  async planRoutes(request: RoutePlanRequest): Promise<RoutePlanResponse> {
    console.log('🧠 Starting intelligent route planning...', request);

    // 1. Normalize start/end coordinates
    const startCoords = await this.resolveCoordinates(request.start);
    const endCoords = request.endPolicy === 'point' && request.end 
      ? await this.resolveCoordinates(request.end)
      : startCoords;

    // 2. Get weather context
    const weather = await this.getWeatherContext(startCoords, request.time.startISO);

    // 3. Merge pet constraints
    const combinedConstraints = this.mergePetConstraints(request.pets);

    // 4. Calculate search parameters
    const searchRadius = this.calculateSearchRadius(request.target, combinedConstraints);

    // 5. Find candidate waypoints
    const waypoints = await this.findCandidateWaypoints(
      startCoords,
      searchRadius,
      request.preferences,
      combinedConstraints
    );

    // 6. Generate route candidates
    const candidates = await this.generateRouteCandidates(
      startCoords,
      endCoords,
      waypoints,
      request.endPolicy,
      request.target
    );

    // 7. Score and rank routes
    const scoredRoutes = await this.scoreAndRankRoutes(
      candidates,
      request,
      combinedConstraints,
      weather
    );

    // 8. Generate advisories and reasons
    const finalRoutes = await this.enhanceRoutesWithContext(
      scoredRoutes.slice(0, 3), // Top 3
      weather,
      combinedConstraints
    );

    return {
      routes: finalRoutes,
      weather,
      context: {
        searchRadius,
        considerationFactors: this.getConsiderationFactors(request.preferences, combinedConstraints),
        petConstraints: this.describePetConstraints(combinedConstraints)
      }
    };
  }

  private async resolveCoordinates(location: { lat: number; lng: number } | { placeId: string }): Promise<{ lat: number; lng: number }> {
    if ('lat' in location) {
      return location;
    }
    
    // Use geocoding to resolve place ID to coordinates
    const geocodeResult = await this.mapsService.geocodePlace(location.placeId);
    return geocodeResult;
  }

  private async getWeatherContext(coords: { lat: number; lng: number }, timeISO: string): Promise<any> {
    if (!this.weatherApiKey) {
      // Return mock weather data
      return {
        tempC: 22,
        precipProb: 10,
        heatIndex: 24,
        daylightMinsLeft: 240,
        uvIndex: 5,
        windSpeedKmh: 8
      };
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${this.weatherApiKey}&units=metric`
      );
      const data = await response.json();

      // Calculate daylight remaining
      const now = new Date(timeISO);
      const sunset = new Date(data.sys.sunset * 1000);
      const daylightMinsLeft = Math.max(0, Math.floor((sunset.getTime() - now.getTime()) / 60000));

      return {
        tempC: data.main.temp,
        precipProb: (data.clouds?.all || 0) > 70 ? 60 : 20,
        heatIndex: data.main.feels_like,
        daylightMinsLeft,
        uvIndex: 5, // Would need UV API for real data
        windSpeedKmh: (data.wind?.speed || 0) * 3.6
      };
    } catch (error) {
      console.error('Weather fetch failed:', error);
      return {
        tempC: 20,
        precipProb: 0,
        heatIndex: 22,
        daylightMinsLeft: 180
      };
    }
  }

  private mergePetConstraints(pets: PetConstraints[]): PetConstraints {
    if (pets.length === 0) {
      throw new Error('At least one pet must be selected');
    }

    if (pets.length === 1) {
      return pets[0];
    }

    // Take most conservative constraints
    return {
      id: 'combined',
      weightKg: Math.max(...pets.map(p => p.weightKg)), // Use heaviest for calorie calc
      energy: this.mostConservativeEnergy(pets.map(p => p.energy)),
      ageYears: Math.max(...pets.map(p => p.ageYears)), // Use oldest
      heatSensitive: pets.some(p => p.heatSensitive),
      reactive: {
        dogs: pets.some(p => p.reactive?.dogs),
        bikes: pets.some(p => p.reactive?.bikes),
        kids: pets.some(p => p.reactive?.kids)
      },
      mobility: this.mostConservativeMobility(pets.map(p => p.mobility || 'excellent'))
    };
  }

  private mostConservativeEnergy(energies: string[]): 'low' | 'medium' | 'high' {
    if (energies.includes('low')) return 'low';
    if (energies.includes('medium')) return 'medium';
    return 'high';
  }

  private mostConservativeMobility(mobilities: string[]): 'excellent' | 'good' | 'limited' {
    if (mobilities.includes('limited')) return 'limited';
    if (mobilities.includes('good')) return 'good';
    return 'excellent';
  }

  private calculateSearchRadius(target: any, constraints: PetConstraints): number {
    const baseRadius = target.distanceM ? target.distanceM / 2 : 
                     target.durationMin ? target.durationMin * 40 : // ~40m per minute walking
                     1000; // 1km default

    // Adjust for pet constraints
    let radius = baseRadius;
    
    if (constraints.energy === 'low' || constraints.mobility === 'limited') {
      radius *= 0.7; // Smaller search area for lower energy pets
    }
    
    if (constraints.energy === 'high') {
      radius *= 1.3; // Larger search area for high energy pets
    }

    return Math.min(Math.max(radius, 500), 3000); // Between 500m and 3km
  }

  private async findCandidateWaypoints(
    center: { lat: number; lng: number },
    radius: number,
    preferences: RoutePreferences,
    constraints: PetConstraints
  ): Promise<any[]> {
    const waypoints: any[] = [];

    // Build search types based on preferences
    const searchTypes: string[] = [];
    
    if (preferences.preferParks) {
      searchTypes.push('park', 'dog_park');
    }
    
    if (preferences.waterFountains) {
      searchTypes.push('tourist_attraction'); // Many fountains are tagged as this
    }

    if (preferences.shade) {
      searchTypes.push('park', 'cemetery'); // Often tree-covered
    }

    // Default types for any walk
    searchTypes.push('park', 'point_of_interest');

    // Remove dog parks if pet is reactive to dogs
    if (constraints.reactive?.dogs && preferences.avoidDogParks) {
      const dogParkIndex = searchTypes.indexOf('dog_park');
      if (dogParkIndex > -1) {
        searchTypes.splice(dogParkIndex, 1);
      }
    }

    // Search for places using Google Places API
    for (const type of [...new Set(searchTypes)]) {
      try {
        const places = await this.mapsService.findNearbyParks(center, radius);
        
        // Filter and score places
        for (const place of places) {
          if (this.isValidWaypoint(place, preferences, constraints)) {
            waypoints.push({
              placeId: place.place_id,
              name: place.name,
              types: place.types || [type],
              location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              },
              rating: place.rating || 3.0,
              suitability: this.scorePlaceSuitability(place, preferences, constraints)
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to search for ${type}:`, error);
      }
    }

    // Sort by suitability and return top candidates
    waypoints.sort((a, b) => b.suitability - a.suitability);
    return waypoints.slice(0, 15); // Limit to top 15 waypoints
  }

  private isValidWaypoint(place: any, preferences: RoutePreferences, constraints: PetConstraints): boolean {
    // Basic validation
    if (!place.geometry?.location) return false;

    // Check if it's a dog park and we should avoid them
    if (constraints.reactive?.dogs && place.types?.includes('dog_park')) {
      return false;
    }

    // Check rating threshold
    if (place.rating && place.rating < 3.0) {
      return false;
    }

    return true;
  }

  private scorePlaceSuitability(place: any, preferences: RoutePreferences, constraints: PetConstraints): number {
    let score = 0.5; // Base score

    // Rating bonus
    if (place.rating) {
      score += (place.rating - 3.0) * 0.1; // 0-0.2 bonus for rating above 3.0
    }

    // Type bonuses
    const types = place.types || [];
    
    if (preferences.preferParks && types.includes('park')) {
      score += 0.3;
    }
    
    if (preferences.waterFountains && types.includes('tourist_attraction')) {
      score += 0.2;
    }

    // Energy level matching
    if (constraints.energy === 'high' && types.includes('dog_park')) {
      score += 0.2;
    }
    
    if (constraints.energy === 'low' && types.includes('cemetery')) {
      score += 0.1; // Quiet, peaceful
    }

    return Math.min(score, 1.0);
  }

  private async generateRouteCandidates(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    waypoints: any[],
    endPolicy: string,
    target: any
  ): Promise<any[]> {
    const candidates: any[] = [];

    // Generate different route types
    
    // 1. Direct route (baseline)
    try {
      const directRoute = await this.mapsService.calculateRoute(start, end);
      candidates.push({
        ...directRoute,
        id: 'direct',
        waypoints: [],
        type: 'direct'
      });
    } catch (error) {
      console.warn('Failed to generate direct route:', error);
    }

    // 2. Single waypoint routes
    for (let i = 0; i < Math.min(waypoints.length, 8); i++) {
      const waypoint = waypoints[i];
      
      try {
        const route = endPolicy === 'loop' 
          ? await this.generateLoopRoute(start, [waypoint])
          : await this.generatePointToPointRoute(start, end, [waypoint]);
        
        candidates.push({
          ...route,
          id: `single-${i}`,
          waypoints: [waypoint],
          type: 'single-waypoint'
        });
      } catch (error) {
        console.warn(`Failed to generate route via ${waypoint.name}:`, error);
      }
    }

    // 3. Multi-waypoint routes (for longer walks)
    if (target.durationMin && target.durationMin > 30) {
      const topWaypoints = waypoints.slice(0, 4);
      
      for (let i = 0; i < topWaypoints.length - 1; i++) {
        for (let j = i + 1; j < topWaypoints.length; j++) {
          try {
            const route = endPolicy === 'loop'
              ? await this.generateLoopRoute(start, [topWaypoints[i], topWaypoints[j]])
              : await this.generatePointToPointRoute(start, end, [topWaypoints[i], topWaypoints[j]]);
            
            candidates.push({
              ...route,
              id: `multi-${i}-${j}`,
              waypoints: [topWaypoints[i], topWaypoints[j]],
              type: 'multi-waypoint'
            });
          } catch (error) {
            console.warn(`Failed to generate multi-waypoint route:`, error);
          }
        }
      }
    }

    return candidates.filter(c => c && c.distanceMeters > 0);
  }

  private async generateLoopRoute(start: { lat: number; lng: number }, waypoints: any[]): Promise<any> {
    // Create a loop by going through waypoints and back to start
    const points = [start, ...waypoints.map(w => w.location), start];
    return await this.mapsService.calculateMultiPointRoute(points);
  }

  private async generatePointToPointRoute(
    start: { lat: number; lng: number }, 
    end: { lat: number; lng: number }, 
    waypoints: any[]
  ): Promise<any> {
    const points = [start, ...waypoints.map(w => w.location), end];
    return await this.mapsService.calculateMultiPointRoute(points);
  }

  private async scoreAndRankRoutes(
    candidates: any[],
    request: RoutePlanRequest,
    constraints: PetConstraints,
    weather: any
  ): Promise<RouteCandidate[]> {
    const scoredRoutes: RouteCandidate[] = [];

    for (const candidate of candidates) {
      try {
        const score = await this.calculateRouteScore(candidate, request, constraints, weather);
        const enhancedRoute: RouteCandidate = {
          ...candidate,
          score,
          reasons: [],
          advisories: [],
          thumbnails: [],
          elevationGainM: 0, // Will be filled by elevation API
          crossingsEstimate: 0, // Will be estimated
          parksRatio: 0, // Will be calculated
          weatherSuitability: this.calculateWeatherSuitability(weather, constraints)
        };
        
        scoredRoutes.push(enhancedRoute);
      } catch (error) {
        console.warn('Failed to score route:', error);
      }
    }

    return scoredRoutes.sort((a, b) => b.score - a.score);
  }

  private async calculateRouteScore(
    route: any,
    request: RoutePlanRequest,
    constraints: PetConstraints,
    weather: any
  ): Promise<number> {
    // Multi-objective scoring function
    let score = 0;

    // 1. Distance/Duration fit (w7)
    const targetDistance = request.target.distanceM || (request.target.durationMin || 30) * 80; // 80m/min avg
    const distanceFit = 1 - Math.min(1, Math.abs(route.distanceMeters - targetDistance) / targetDistance);
    score += 0.25 * distanceFit;

    // 2. Scenic score (w1) - based on waypoints
    const scenicScore = this.calculateScenicScore(route);
    score += 0.20 * scenicScore;

    // 3. Safety score (w2)
    const safetyScore = this.calculateSafetyScore(route, request.preferences);
    score += 0.18 * safetyScore;

    // 4. Comfort score (w3)
    const comfortScore = this.calculateComfortScore(route, request.preferences);
    score += 0.15 * comfortScore;

    // 5. Pet suitability
    const petScore = this.calculatePetSuitabilityScore(route, constraints);
    score += 0.12 * petScore;

    // 6. Weather suitability
    const weatherScore = this.calculateWeatherSuitability(weather, constraints);
    score += 0.10 * weatherScore;

    return Math.min(1.0, Math.max(0.0, score));
  }

  private calculateScenicScore(route: any): number {
    if (!route.waypoints || route.waypoints.length === 0) {
      return 0.3; // Direct routes get base scenic score
    }

    let scenicPoints = 0;
    let totalPoints = route.waypoints.length;

    for (const waypoint of route.waypoints) {
      const types = waypoint.types || [];
      
      if (types.includes('park') || types.includes('natural_feature')) {
        scenicPoints += 1;
      } else if (types.includes('tourist_attraction') || types.includes('point_of_interest')) {
        scenicPoints += 0.7;
      } else {
        scenicPoints += 0.3;
      }
    }

    return totalPoints > 0 ? scenicPoints / totalPoints : 0.3;
  }

  private calculateSafetyScore(route: any, preferences: RoutePreferences): number {
    let score = 0.7; // Base safety score

    // Boost for avoiding busy roads preference
    if (preferences.avoidBusyRoads) {
      score += 0.2;
    }

    // Parks are generally safer
    if (route.waypoints?.some((w: any) => w.types?.includes('park'))) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  private calculateComfortScore(route: any, preferences: RoutePreferences): number {
    let score = 0.5; // Base comfort

    if (preferences.shade) {
      score += 0.2;
    }

    if (preferences.waterFountains && route.waypoints?.some((w: any) => 
      w.types?.includes('tourist_attraction') || w.name?.toLowerCase().includes('fountain')
    )) {
      score += 0.2;
    }

    if (preferences.benches) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  private calculatePetSuitabilityScore(route: any, constraints: PetConstraints): number {
    let score = 0.7; // Base suitability

    // Energy level matching
    if (constraints.energy === 'high' && route.distanceMeters > 2000) {
      score += 0.2;
    } else if (constraints.energy === 'low' && route.distanceMeters < 1000) {
      score += 0.2;
    }

    // Reactivity considerations
    if (constraints.reactive?.dogs && route.waypoints?.some((w: any) => w.types?.includes('dog_park'))) {
      score -= 0.3;
    }

    // Age considerations
    if (constraints.ageYears > 10 && route.distanceMeters < 1500) {
      score += 0.1; // Shorter routes for senior pets
    }

    return Math.max(0.0, Math.min(1.0, score));
  }

  private calculateWeatherSuitability(weather: any, constraints: PetConstraints): number {
    let score = 0.7;

    // Temperature considerations
    if (weather.tempC > 25 && constraints.heatSensitive) {
      score -= 0.3;
    } else if (weather.tempC < 5) {
      score -= 0.2;
    } else if (weather.tempC >= 15 && weather.tempC <= 25) {
      score += 0.2;
    }

    // Precipitation
    if (weather.precipProb > 70) {
      score -= 0.2;
    }

    // Wind
    if (weather.windSpeedKmh > 30) {
      score -= 0.1;
    }

    return Math.max(0.0, Math.min(1.0, score));
  }

  private async enhanceRoutesWithContext(
    routes: RouteCandidate[],
    weather: any,
    constraints: PetConstraints
  ): Promise<RouteCandidate[]> {
    for (const route of routes) {
      // Generate reasons
      route.reasons = this.generateRouteReasons(route, weather, constraints);
      
      // Generate advisories
      route.advisories = this.generateRouteAdvisories(route, weather, constraints);
      
      // Generate thumbnails (Street View URLs)
      route.thumbnails = await this.generateRouteThumbnails(route);
    }

    return routes;
  }

  private generateRouteReasons(route: RouteCandidate, weather: any, constraints: PetConstraints): string[] {
    const reasons: string[] = [];

    if (route.score > 0.8) {
      reasons.push('Excellent route match');
    }

    if (route.waypoints.some(w => w.types?.includes('park'))) {
      reasons.push('Includes scenic parks');
    }

    if (weather.tempC >= 15 && weather.tempC <= 25) {
      reasons.push('Perfect weather conditions');
    }

    if (constraints.energy === 'high' && route.distanceMeters > 2000) {
      reasons.push('Great for high-energy pets');
    }

    if (constraints.energy === 'low' && route.distanceMeters < 1500) {
      reasons.push('Suitable for gentle walks');
    }

    if (route.waypoints.length === 0) {
      reasons.push('Direct, efficient route');
    }

    return reasons.slice(0, 3); // Limit to top 3 reasons
  }

  private generateRouteAdvisories(route: RouteCandidate, weather: any, constraints: PetConstraints): Array<{type: 'warning' | 'info' | 'tip', message: string}> {
    const advisories: Array<{type: 'warning' | 'info' | 'tip', message: string}> = [];

    if (weather.tempC > 25 && constraints.heatSensitive) {
      advisories.push({
        type: 'warning',
        message: 'High temperature - bring extra water and consider shorter route'
      });
    }

    if (weather.precipProb > 50) {
      advisories.push({
        type: 'info',
        message: 'Rain possible - consider bringing rain gear'
      });
    }

    if (constraints.ageYears > 10) {
      advisories.push({
        type: 'tip',
        message: 'Senior pet - allow extra time for sniff breaks'
      });
    }

    if (route.waypoints.some(w => w.types?.includes('dog_park'))) {
      advisories.push({
        type: 'info',
        message: 'Route includes dog parks - great for socialization'
      });
    }

    return advisories;
  }

  private async generateRouteThumbnails(route: RouteCandidate): Promise<string[]> {
    const thumbnails: string[] = [];
    
    // Generate Street View thumbnails for key points
    const points = [
      ...(route.waypoints.map(w => w.location) || [])
    ];

    for (const point of points.slice(0, 3)) { // Limit to 3 thumbnails
      try {
        const streetViewUrl = this.mapsService.getStreetViewUrl(point, 0);
        thumbnails.push(streetViewUrl);
      } catch (error) {
        console.warn('Failed to generate street view thumbnail:', error);
      }
    }

    return thumbnails;
  }

  private getConsiderationFactors(preferences: RoutePreferences, constraints: PetConstraints): string[] {
    const factors: string[] = [];

    if (preferences.preferParks) factors.push('Park preference');
    if (preferences.avoidBusyRoads) factors.push('Traffic avoidance');
    if (preferences.shade) factors.push('Shade seeking');
    if (constraints.heatSensitive) factors.push('Heat sensitivity');
    if (constraints.reactive?.dogs) factors.push('Dog reactivity');
    if (constraints.energy) factors.push(`${constraints.energy} energy level`);

    return factors;
  }

  private describePetConstraints(constraints: PetConstraints): string[] {
    const descriptions: string[] = [];

    descriptions.push(`${constraints.energy} energy`);
    
    if (constraints.ageYears > 10) {
      descriptions.push('Senior pet considerations');
    }

    if (constraints.heatSensitive) {
      descriptions.push('Heat sensitive');
    }

    if (constraints.reactive?.dogs) {
      descriptions.push('Dog reactive - avoiding dog parks');
    }

    if (constraints.mobility === 'limited') {
      descriptions.push('Limited mobility - shorter distances');
    }

    return descriptions;
  }
}

export default IntelligentRoutePlanner;
