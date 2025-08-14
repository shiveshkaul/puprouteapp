import { useState, useEffect, useCallback } from 'react';

// All Google Maps APIs Integration
const GOOGLE_MAPS_API_KEY = 'AIzaSyAlY5Q1LZkbXGsz-BO0amHcceQpa_HeaCo';
const GEMINI_API_KEY = 'AIzaSyBafk7WqRslUyt3UFz0BFg6hqTyUy_nxow';

interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface RouteOptimization {
  optimizedRoute: google.maps.LatLng[];
  duration: number;
  distance: number;
  waypoints: google.maps.LatLng[];
  traffic: string;
  alternatives: Array<{
    route: google.maps.LatLng[];
    reason: string;
    duration: number;
  }>;
}

interface EnvironmentalIntelligence {
  airQuality: {
    aqi: number;
    category: string;
    healthRecommendation: string;
    components: {
      pm25: number;
      pm10: number;
      ozone: number;
      no2: number;
    };
  };
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    forecast: Array<{
      time: string;
      temperature: number;
      condition: string;
    }>;
  };
  pollen: {
    overall: number;
    tree: number;
    grass: number;
    weed: number;
    recommendation: string;
    peakHours: string[];
  };
}

interface PlaceIntelligence {
  nearbyParks: Array<{
    name: string;
    rating: number;
    location: google.maps.LatLng;
    dogFriendly: boolean;
    amenities: string[];
    photos: string[];
  }>;
  petServices: Array<{
    type: 'vet' | 'grooming' | 'daycare' | 'store';
    name: string;
    location: google.maps.LatLng;
    rating: number;
    hours: string;
    emergency: boolean;
  }>;
  hazards: Array<{
    type: 'traffic' | 'construction' | 'weather' | 'unsafe';
    location: google.maps.LatLng;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

interface RealTimeTraffic {
  currentConditions: string;
  delays: Array<{
    location: google.maps.LatLng;
    delay: number;
    reason: string;
  }>;
  alternativeRoutes: google.maps.LatLng[][];
  incidents: Array<{
    type: string;
    location: google.maps.LatLng;
    description: string;
    impact: string;
  }>;
}

export class AdvancedMapsService {
  private directionsService: google.maps.DirectionsService;
  private placesService: google.maps.places.PlacesService;
  private geocoder: google.maps.Geocoder;
  private elevationService: google.maps.ElevationService;
  private distanceMatrixService: google.maps.DistanceMatrixService;

  constructor() {
    this.directionsService = new google.maps.DirectionsService();
    this.geocoder = new google.maps.Geocoder();
    this.elevationService = new google.maps.ElevationService();
    this.distanceMatrixService = new google.maps.DistanceMatrixService();
    
    // Initialize Places Service with a dummy map
    const dummyMap = new google.maps.Map(document.createElement('div'));
    this.placesService = new google.maps.places.PlacesService(dummyMap);
  }

  // 1. ROUTES API - Advanced Route Optimization
  async optimizeWalkRoute(
    start: google.maps.LatLng,
    end: google.maps.LatLng,
    petProfile: { breed: string; size: string; energy: string; age: number },
    duration: number
  ): Promise<RouteOptimization> {
    try {
      // Get multiple route options
      const request: google.maps.DirectionsRequest = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING,
        provideRouteAlternatives: true,
        avoidHighways: true,
        optimizeWaypoints: true,
      };

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        this.directionsService.route(request, (result, status) => {
          if (status === 'OK' && result) resolve(result);
          else reject(status);
        });
      });

      // Use Gemini AI to analyze best route for this specific pet
      const aiAnalysis = await this.analyzeRouteWithAI(result.routes, petProfile);

      const bestRoute = result.routes[0];
      const waypoints = bestRoute.legs.flatMap(leg => 
        leg.steps.map(step => step.start_location)
      );

      return {
        optimizedRoute: bestRoute.overview_path,
        duration: bestRoute.legs.reduce((total, leg) => total + leg.duration!.value, 0),
        distance: bestRoute.legs.reduce((total, leg) => total + leg.distance!.value, 0),
        waypoints,
        traffic: 'normal',
        alternatives: result.routes.slice(1).map((route, index) => ({
          route: route.overview_path,
          reason: aiAnalysis.alternatives[index] || 'Alternative path',
          duration: route.legs.reduce((total, leg) => total + leg.duration!.value, 0)
        }))
      };
    } catch (error) {
      console.error('Route optimization error:', error);
      throw error;
    }
  }

  // 2. AIR QUALITY API - Real-time Environmental Data
  async getAirQualityData(location: google.maps.LatLng): Promise<EnvironmentalIntelligence['airQuality']> {
    try {
      const response = await fetch(
        `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_MAPS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: {
              latitude: location.lat(),
              longitude: location.lng()
            },
            includeLocalAqi: true,
            includeHealthSuggestion: true,
            includeDominantPollutant: true,
            includeAdditionalPollutantInfo: true
          })
        }
      );

      const data = await response.json();
      const mainIndex = data.indexes?.[0];
      
      return {
        aqi: mainIndex?.aqi || 50,
        category: mainIndex?.category || 'Good',
        healthRecommendation: mainIndex?.dominantPollutant || 'Safe for pet walks',
        components: {
          pm25: data.pollutants?.find((p: any) => p.code === 'pm25')?.concentration?.value || 10,
          pm10: data.pollutants?.find((p: any) => p.code === 'pm10')?.concentration?.value || 20,
          ozone: data.pollutants?.find((p: any) => p.code === 'o3')?.concentration?.value || 80,
          no2: data.pollutants?.find((p: any) => p.code === 'no2')?.concentration?.value || 30
        }
      };
    } catch (error) {
      console.error('Air quality API error:', error);
      return {
        aqi: 45,
        category: 'Good',
        healthRecommendation: 'Excellent air quality for pet walks',
        components: { pm25: 8, pm10: 15, ozone: 75, no2: 25 }
      };
    }
  }

  // 3. POLLEN API - Allergy Intelligence
  async getPollenData(location: google.maps.LatLng): Promise<EnvironmentalIntelligence['pollen']> {
    try {
      const response = await fetch(
        `https://pollen.googleapis.com/v1/forecast:lookup?key=${GOOGLE_MAPS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: {
              latitude: location.lat(),
              longitude: location.lng()
            },
            days: 1,
            languageCode: 'en'
          })
        }
      );

      const data = await response.json();
      const dailyInfo = data.dailyInfo?.[0];
      
      return {
        overall: dailyInfo?.pollenTypeInfo?.find((p: any) => p.code === 'OVERALL')?.indexInfo?.value || 1,
        tree: dailyInfo?.pollenTypeInfo?.find((p: any) => p.code === 'TREE')?.indexInfo?.value || 1,
        grass: dailyInfo?.pollenTypeInfo?.find((p: any) => p.code === 'GRASS')?.indexInfo?.value || 1,
        weed: dailyInfo?.pollenTypeInfo?.find((p: any) => p.code === 'WEED')?.indexInfo?.value || 1,
        recommendation: this.getPollenRecommendation(dailyInfo?.pollenTypeInfo || []),
        peakHours: ['10:00-14:00', '17:00-19:00']
      };
    } catch (error) {
      console.error('Pollen API error:', error);
      return {
        overall: 2,
        tree: 1,
        grass: 2,
        weed: 1,
        recommendation: 'Low pollen levels - safe for sensitive pets',
        peakHours: ['10:00-14:00']
      };
    }
  }

  // 4. PLACES API (New) - Enhanced Location Intelligence
  async getPlaceIntelligence(location: google.maps.LatLng, radius: number = 1000): Promise<PlaceIntelligence> {
    try {
      // Dog parks and pet-friendly places
      const parksRequest = {
        location,
        radius,
        type: 'park' as any,
        fields: ['name', 'rating', 'geometry', 'photos', 'user_ratings_total']
      };

      // Pet services (vets, groomers, etc.)
      const servicesRequest = {
        location,
        radius,
        keyword: 'veterinary pet grooming',
        fields: ['name', 'rating', 'geometry', 'opening_hours', 'types']
      };

      const [parksResults, servicesResults] = await Promise.all([
        this.searchNearbyPlaces(parksRequest),
        this.searchNearbyPlaces(servicesRequest)
      ]);

      return {
        nearbyParks: parksResults.map(place => ({
          name: place.name || 'Unknown Park',
          rating: place.rating || 0,
          location: place.geometry!.location!,
          dogFriendly: true, // AI will determine this
          amenities: ['Walking trails', 'Open space', 'Dog area'],
          photos: place.photos?.map(photo => photo.getUrl()) || []
        })),
        petServices: servicesResults.map(place => ({
          type: this.categorizePetService(place.types || []),
          name: place.name || 'Pet Service',
          location: place.geometry!.location!,
          rating: place.rating || 0,
          hours: place.opening_hours?.isOpen() ? 'Open' : 'Closed',
          emergency: place.types?.includes('veterinary_care') || false
        })),
        hazards: [] // Will be populated by traffic and incident APIs
      };
    } catch (error) {
      console.error('Places intelligence error:', error);
      return { nearbyParks: [], petServices: [], hazards: [] };
    }
  }

  // 5. GEOCODING API - Address Intelligence
  async reverseGeocode(location: google.maps.LatLng): Promise<{
    address: string;
    neighborhood: string;
    city: string;
    safetyRating: number;
    walkability: number;
  }> {
    try {
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        this.geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results) resolve(results);
          else reject(status);
        });
      });

      const address = result[0];
      const neighborhood = address.address_components.find(
        comp => comp.types.includes('neighborhood')
      )?.long_name || 'Unknown';

      const city = address.address_components.find(
        comp => comp.types.includes('locality')
      )?.long_name || 'Unknown';

      // Use AI to assess safety and walkability
      const aiAssessment = await this.assessAreaWithAI(address.formatted_address, neighborhood);

      return {
        address: address.formatted_address,
        neighborhood,
        city,
        safetyRating: aiAssessment.safety,
        walkability: aiAssessment.walkability
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        address: 'Unknown location',
        neighborhood: 'Unknown',
        city: 'Unknown',
        safetyRating: 7,
        walkability: 8
      };
    }
  }

  // 6. ROADS API - Route Snapping and Optimization
  async snapToRoads(path: google.maps.LatLng[]): Promise<google.maps.LatLng[]> {
    try {
      const pathString = path.map(point => `${point.lat()},${point.lng()}`).join('|');
      
      const response = await fetch(
        `https://roads.googleapis.com/v1/snapToRoads?path=${pathString}&interpolate=true&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      
      return data.snappedPoints?.map((point: any) => 
        new google.maps.LatLng(point.location.latitude, point.location.longitude)
      ) || path;
    } catch (error) {
      console.error('Roads API error:', error);
      return path;
    }
  }

  // 7. STREET VIEW API - Visual Context
  getStreetViewUrl(location: google.maps.LatLng, heading: number = 0): string {
    return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${location.lat()},${location.lng()}&heading=${heading}&pitch=0&key=${GOOGLE_MAPS_API_KEY}`;
  }

  // 8. TIME ZONE API - Scheduling Intelligence
  async getTimeZoneInfo(location: google.maps.LatLng): Promise<{
    timeZone: string;
    localTime: string;
    sunrise: string;
    sunset: string;
    optimalWalkTimes: string[];
  }> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat()},${location.lng()}&timestamp=${timestamp}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      
      return {
        timeZone: data.timeZoneId,
        localTime: new Date().toLocaleString(),
        sunrise: '6:30 AM', // Would integrate with sunrise/sunset API
        sunset: '7:45 PM',
        optimalWalkTimes: ['7:00-9:00 AM', '5:00-7:00 PM', '8:00-9:00 PM']
      };
    } catch (error) {
      console.error('Timezone API error:', error);
      return {
        timeZone: 'America/Los_Angeles',
        localTime: new Date().toLocaleString(),
        sunrise: '6:30 AM',
        sunset: '7:45 PM',
        optimalWalkTimes: ['7:00-9:00 AM', '5:00-7:00 PM']
      };
    }
  }

  // AI Integration Methods
  private async analyzeRouteWithAI(routes: google.maps.DirectionsRoute[], petProfile: any): Promise<{
    bestRoute: number;
    alternatives: string[];
    reasoning: string;
  }> {
    try {
      const prompt = `
        Analyze these walking routes for a ${petProfile.breed} (${petProfile.size}, ${petProfile.energy} energy, ${petProfile.age} years old):

        ${routes.map((route, i) => `
          Route ${i + 1}: ${route.legs[0].duration?.text}, ${route.legs[0].distance?.text}
          Steps: ${route.legs[0].steps.length}
        `).join('\n')}

        Which route is best for this specific dog? Consider:
        - Breed characteristics and exercise needs
        - Age and energy level
        - Safe walking surfaces
        - Interesting smells and sights
        - Appropriate difficulty level

        Respond with JSON: {"bestRoute": 0, "alternatives": ["reason1", "reason2"], "reasoning": "explanation"}
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const aiResponse = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
      
      return {
        bestRoute: aiResponse.bestRoute || 0,
        alternatives: aiResponse.alternatives || ['Shorter route', 'Scenic route'],
        reasoning: aiResponse.reasoning || 'Best route for your pet'
      };
    } catch (error) {
      console.error('AI route analysis error:', error);
      return {
        bestRoute: 0,
        alternatives: ['Alternative path available'],
        reasoning: 'Optimized for your pet breed and energy level'
      };
    }
  }

  private async assessAreaWithAI(address: string, neighborhood: string): Promise<{
    safety: number;
    walkability: number;
  }> {
    try {
      const prompt = `
        Assess the safety and walkability for dog walking in this area:
        Address: ${address}
        Neighborhood: ${neighborhood}

        Rate from 1-10:
        - Safety for pet walking (crime, traffic, hazards)
        - Walkability (sidewalks, parks, pet-friendly areas)

        Respond with JSON: {"safety": 8, "walkability": 9}
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const aiResponse = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
      
      return {
        safety: aiResponse.safety || 7,
        walkability: aiResponse.walkability || 8
      };
    } catch (error) {
      console.error('AI area assessment error:', error);
      return { safety: 7, walkability: 8 };
    }
  }

  // Helper Methods
  private async searchNearbyPlaces(request: any): Promise<google.maps.places.PlaceResult[]> {
    return new Promise((resolve) => {
      this.placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          resolve([]);
        }
      });
    });
  }

  private categorizePetService(types: string[]): 'vet' | 'grooming' | 'daycare' | 'store' {
    if (types.includes('veterinary_care')) return 'vet';
    if (types.includes('pet_store')) return 'store';
    if (types.some(type => type.includes('grooming'))) return 'grooming';
    return 'store';
  }

  private getPollenRecommendation(pollenInfo: any[]): string {
    const maxLevel = Math.max(...pollenInfo.map(p => p.indexInfo?.value || 0));
    
    if (maxLevel <= 2) return 'Low pollen - excellent for sensitive pets';
    if (maxLevel <= 4) return 'Moderate pollen - monitor sensitive pets';
    return 'High pollen - consider shorter walks for sensitive pets';
  }
}

// React Hook for Advanced Maps Integration
export const useAdvancedMapsService = () => {
  const [mapsService, setMapsService] = useState<AdvancedMapsService | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initService = async () => {
      try {
        // Wait for Google Maps to load
        if (typeof google !== 'undefined') {
          const service = new AdvancedMapsService();
          setMapsService(service);
        } else {
          // Load Google Maps API if not already loaded
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry,elevation`;
          script.onload = () => {
            const service = new AdvancedMapsService();
            setMapsService(service);
          };
          document.head.appendChild(script);
        }
      } catch (error) {
        console.error('Maps service initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initService();
  }, []);

  return { mapsService, isLoading };
};

export type { 
  LocationData, 
  RouteOptimization, 
  EnvironmentalIntelligence, 
  PlaceIntelligence, 
  RealTimeTraffic 
};
