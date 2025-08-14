import { GoogleMapsService } from './GoogleMapsService';

// Gemini AI configuration
const GEMINI_API_KEY = 'AIzaSyBafk7WqRslUyt3UFz0BFg6hqTyUy_nxow';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteRequestBody {
  start: { lat: number; lng: number };
  endPolicy: 'loop' | 'point';
  end?: { lat: number; lng: number };
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
    avoidBusy: boolean;
    lowSlope: boolean;
    shade: boolean;
    avoidDogParks: boolean;
    waterFountains: boolean;
    restSpots: boolean;
  };
  time: {
    startISO: string;
  };
}

export interface RouteResponse {
  routes: Array<{
    id: string;
    title?: string; // Add title field for route names
    polyline: string;
    distanceMeters: number;
    durationSec: number;
    waypoints: Array<{
      name: string;
      types: string[];
      location: { lat: number; lng: number };
    }>;
    score: number;
    reasons: string[];
    advisories: Array<{
      type: 'warning' | 'info' | 'tip';
      message: string;
    }>;
    thumbnails: string[];
    weatherSuitability: number;
  }>;
  weather: {
    tempC: number;
    precipProb: number;
    heatIndex: number;
    daylightMinsLeft: number;
  };
}

export class RouteAPI {
  private static instance: RouteAPI;
  private googleMapsService: GoogleMapsService;
  
  constructor() {
    this.googleMapsService = new GoogleMapsService();
  }
  
  static getInstance(): RouteAPI {
    if (!RouteAPI.instance) {
      RouteAPI.instance = new RouteAPI();
    }
    return RouteAPI.instance;
  }

  async planRoutes(request: RouteRequestBody): Promise<{ success: boolean; data?: RouteResponse; error?: string }> {
    try {
      console.log('🗺️ Planning routes with request:', request);
      
      // Wait for Google Maps API to load
      await this.waitForGoogleMaps();
      
      // Step 1: Find nearby places for waypoints based on preferences
      const waypoints = await this.findWaypoints(request);
      console.log('📍 Found waypoints:', waypoints);
      
      // Step 2: Generate route candidates using Google Maps
      const routes = await this.generateRealRoutes(request, waypoints as any[]);
      console.log('🛣️ Generated routes:', routes);
      
      // Step 3: Generate AI titles for routes
      const routesWithTitles = await this.generateRouteTitles(routes, request);
      console.log('🤖 Routes with AI-generated titles:', routesWithTitles);
      
      const weather = {
        tempC: 22,
        precipProb: 10,
        heatIndex: 24,
        daylightMinsLeft: 240
      };

      const response: RouteResponse = {
        routes: routesWithTitles.slice(0, 3), // Top 3 routes
        weather
      };

      console.log('✅ Routes generated successfully:', response);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Route planning error:', error);
      
      // Fallback to mock routes if Google Maps fails
      console.log('🔄 Falling back to mock routes');
      const mockRoutes = this.generateMockRoutes(request);
      
      return {
        success: true,
        data: {
          routes: mockRoutes,
          weather: {
            tempC: 22,
            precipProb: 10,
            heatIndex: 24,
            daylightMinsLeft: 240
          }
        }
      };
    }
  }

  private waitForGoogleMaps(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          console.warn('Google Maps API loading timeout, continuing with fallback');
          resolve();
        }, 10000);
      }
    });
  }

  private async findWaypoints(request: RouteRequestBody) {
    try {
      // Use Google Maps JavaScript API instead of REST API to avoid CORS
      if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps JavaScript API not loaded, using fallback waypoints');
        return this.getFallbackWaypoints(request.start);
      }

      return new Promise((resolve) => {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        const searchRequest = {
          location: new google.maps.LatLng(request.start.lat, request.start.lng),
          radius: 1500,
          type: request.preferences.preferParks ? 'park' : 'point_of_interest'
        };

        service.nearbySearch(searchRequest, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            console.log('📍 Found Google Places:', results);
            resolve(results.slice(0, 5));
          } else {
            console.warn('Google Places search failed:', status);
            resolve(this.getFallbackWaypoints(request.start));
          }
        });
      });
    } catch (error) {
      console.error('Failed to find waypoints:', error);
      return this.getFallbackWaypoints(request.start);
    }
  }

  private getFallbackWaypoints(start: LatLng) {
    // Generate some realistic waypoints around the start location
    const offset = 0.003; // ~300m offset
    return [
      {
        name: 'Park Area',
        geometry: {
          location: {
            lat: start.lat + offset,
            lng: start.lng + offset/2
          }
        },
        place_id: 'fallback_1'
      },
      {
        name: 'Green Space', 
        geometry: {
          location: {
            lat: start.lat + offset/2,
            lng: start.lng + offset
          }
        },
        place_id: 'fallback_2'
      },
      {
        name: 'Walking Path',
        geometry: {
          location: {
            lat: start.lat - offset/2,
            lng: start.lng + offset/2
          }
        },
        place_id: 'fallback_3'
      }
    ];
  }

  private async generateRealRoutes(request: RouteRequestBody, waypoints: any[]) {
    const routes = [];
    
    try {
      // Route 1: Loop with 1-2 waypoints
      if (waypoints.length > 0) {
        const selectedWaypoints = waypoints.slice(0, 2);
        const route1 = await this.createRealRoute(request.start, selectedWaypoints, 'Scenic Park Loop', request.endPolicy);
        if (route1) routes.push(route1);
      }
      
      // Route 2: Different waypoint combination  
      if (waypoints.length > 1) {
        const alternateWaypoints = waypoints.slice(1, 3);
        const route2 = await this.createRealRoute(request.start, alternateWaypoints, 'Community Garden Route', request.endPolicy);
        if (route2) routes.push(route2);
      }
      
      // Route 3: Direct route with single waypoint
      if (waypoints.length > 0) {
        const route3 = await this.createRealRoute(request.start, [waypoints[0]], 'Direct Walking Path', request.endPolicy);
        if (route3) routes.push(route3);
      }
      
      // If no routes generated, create a simple direct route
      if (routes.length === 0) {
        const directRoute = await this.createDirectRoute(request);
        if (directRoute) routes.push(directRoute);
      }
    } catch (error) {
      console.error('Failed to generate real routes:', error);
    }
    
    return routes;
  }

  private async createRealRoute(start: LatLng, waypoints: any[], name: string, endPolicy: 'loop' | 'point') {
    try {
      // Use Google Maps JavaScript API instead of REST API to avoid CORS
      if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps JavaScript API not loaded, creating fallback route');
        return this.createFallbackRoute(start, waypoints, name, endPolicy);
      }

      return new Promise((resolve) => {
        const directionsService = new google.maps.DirectionsService();
        
        const waypointLocations = waypoints.map(wp => {
          // Handle different waypoint structures
          const lat = wp.geometry?.location?.lat() || wp.geometry?.location?.lat || wp.lat;
          const lng = wp.geometry?.location?.lng() || wp.geometry?.location?.lng || wp.lng;
          
          if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
            console.warn('Invalid waypoint coordinates:', wp);
            return null;
          }
          
          return { lat, lng };
        }).filter(Boolean); // Remove null waypoints
        
        // Determine end point based on policy
        const end = endPolicy === 'loop' ? start : waypointLocations[waypointLocations.length - 1];
        
        const request = {
          origin: new google.maps.LatLng(start.lat, start.lng),
          destination: new google.maps.LatLng(end.lat, end.lng),
          waypoints: endPolicy === 'loop' 
            ? waypointLocations.map(loc => ({ location: new google.maps.LatLng(loc.lat, loc.lng) }))
            : waypointLocations.slice(0, -1).map(loc => ({ location: new google.maps.LatLng(loc.lat, loc.lng) })),
          travelMode: google.maps.TravelMode.WALKING,
          optimizeWaypoints: true
        };

        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            console.log('🛣️ Google Directions result:', result);
            
            const route = result.routes[0];
            let totalDistance = 0;
            let totalDuration = 0;
            
            route.legs.forEach(leg => {
              totalDistance += leg.distance!.value;
              totalDuration += leg.duration!.value;
            });
            
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              title: name, // Use the provided name as title
              polyline: route.overview_polyline,
              distanceMeters: totalDistance,
              durationSec: totalDuration,
              waypoints: waypoints.map(wp => ({
                name: wp.name || wp.vicinity || 'Point of Interest',
                location: {
                  lat: wp.geometry?.location?.lat() || wp.geometry?.location?.lat || wp.lat || 0,
                  lng: wp.geometry?.location?.lng() || wp.geometry?.location?.lng || wp.lng || 0
                }
              })),
              score: 0.85 + Math.random() * 0.1,
              reasons: this.generateRouteReasons(name, waypoints.length),
              advisories: this.generateAdvisories(waypoints, name),
              thumbnails: [] // Empty for now, can be populated with Street View images later
            });
          } else {
            console.warn('Google Directions failed:', status);
            resolve(this.createFallbackRoute(start, waypoints, name, endPolicy));
          }
        });
      });
    } catch (error) {
      console.error('Failed to create real route:', error);
      return this.createFallbackRoute(start, waypoints, name, endPolicy);
    }
  }

  private createFallbackRoute(start: LatLng, waypoints: any[], name: string, endPolicy: 'loop' | 'point') {
    // Create a simple mock route when Google Maps fails
    const distance = 800 + Math.random() * 800; // 800-1600m
    const duration = distance / 1.3; // ~1.3 m/s walking speed
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: name, // Use the provided name as title
      polyline: this.generateMockPolyline(start, distance),
      distanceMeters: Math.round(distance),
      durationSec: Math.round(duration),
      waypoints: waypoints.map(wp => ({
        name: wp.name || 'Point of Interest',
        location: {
          lat: wp.geometry?.location?.lat() || wp.geometry?.location?.lat || wp.lat || 0,
          lng: wp.geometry?.location?.lng() || wp.geometry?.location?.lng || wp.lng || 0
        }
      })),
      score: 0.75 + Math.random() * 0.15,
      reasons: this.generateRouteReasons(name, waypoints.length),
      advisories: this.generateAdvisories(waypoints, name),
      thumbnails: [] // Empty for now, can be populated with Street View images later
    };
  }

  private generateMockPolyline(start: LatLng, distance: number): string {
    // Generate a simple polyline path for fallback
    const points = [start];
    const numPoints = Math.max(3, Math.floor(distance / 100));
    
    for (let i = 1; i < numPoints; i++) {
      const offset = 0.001 * (i / numPoints);
      points.push({
        lat: start.lat + offset * Math.cos(i),
        lng: start.lng + offset * Math.sin(i)
      });
    }
    
    // Add return to start for loop
    points.push(start);
    
    // Simple polyline encoding (mock)
    return `mock_polyline_${Date.now()}`;
  }

  private async createDirectRoute(request: RouteRequestBody) {
    try {
      // Create a simple fallback route when no waypoints are found
      const targetDistance = (request.target.durationMin || 30) * 60 * 1.3; // ~1.3 m/s walking speed
      const offsetDistance = 0.005; // ~500m offset
      
      const destination = {
        lat: request.start.lat + offsetDistance,
        lng: request.start.lng + offsetDistance
      };
      
      // Always create fallback route since we can't use REST API from frontend
      return this.createFallbackRoute(
        request.start, 
        [{ name: 'Destination Point', lat: destination.lat, lng: destination.lng }],
        'Direct Walking Route',
        request.endPolicy
      );
    } catch (error) {
      console.error('Failed to create direct route:', error);
    }
    
    return null;
  }

  private generateRouteReasons(routeName: string, waypointCount: number): string[] {
    const reasons = [];
    
    if (routeName.includes('Park')) {
      reasons.push('70% park coverage', 'Good for exercise', 'Pet-friendly areas');
    }
    if (routeName.includes('Garden')) {
      reasons.push('Scenic greenery', 'Quiet paths', 'Rest areas available');
    }
    if (routeName.includes('Direct')) {
      reasons.push('Shortest path', 'Easy navigation', 'Good for beginners');
    }
    
    if (waypointCount > 1) {
      reasons.push('Multiple points of interest');
    }
    
    reasons.push('Optimized for walking');
    
    return reasons.slice(0, 3); // Limit to 3 reasons
  }

  private generateAdvisories(waypoints: any[], routeName: string): Array<{type: string, message: string}> {
    const advisories = [];
    
    if (waypoints.length === 0) {
      advisories.push({
        type: 'info',
        message: 'Using fallback route - limited waypoint data available'
      });
    }
    
    if (routeName.includes('Park')) {
      advisories.push({
        type: 'tip',
        message: 'Great choice! Parks provide excellent exercise opportunities'
      });
    }
    
    if (waypoints.length > 3) {
      advisories.push({
        type: 'warning', 
        message: 'Multiple stops planned - allow extra time for sniff breaks'
      });
    }
    
    return advisories;
  }

  private async generateRouteTitles(routes: any[], request: RouteRequestBody): Promise<any[]> {
    try {
      const petNames = request.pets.map(pet => `${pet.energy}-energy pet`).join(', ');
      const preferences = Object.entries(request.preferences)
        .filter(([_, enabled]) => enabled)
        .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
        .join(', ');

      const prompt = `Generate creative, descriptive titles for these 3 dog walking routes. Each title should be catchy, specific to the location features, and appealing to dog owners.

Context:
- Pet types: ${petNames}
- Preferences: ${preferences}
- Duration: ${request.target.durationMin} minutes
- Start location: ${request.start.lat}, ${request.start.lng}

Routes to name:
${routes.map((route, index) => `
Route ${index + 1}:
- Distance: ${(route.distanceMeters / 1000).toFixed(1)}km
- Duration: ${Math.round(route.durationSec / 60)} minutes
- Waypoints: ${route.waypoints.map((w: any) => w.name).join(', ')}
- Score: ${Math.round(route.score * 100)}%
- Reasons: ${route.reasons.join(', ')}
`).join('\n')}

Please respond with ONLY a JSON array of 3 creative route titles:
["Title 1", "Title 2", "Title 3"]

Examples of good titles:
- "Riverside Park Adventure Loop"
- "Quiet Neighborhood Discovery Walk"
- "Shaded Forest Path Explorer"
- "Urban Garden Tour Route"
- "Lakeside Morning Circuit"`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiResponse) {
        try {
          const titles = JSON.parse(aiResponse.trim());
          if (Array.isArray(titles) && titles.length >= routes.length) {
            return routes.map((route, index) => ({
              ...route,
              title: titles[index] || `Route ${index + 1}`
            }));
          }
        } catch (parseError) {
          console.warn('Failed to parse Gemini AI response, using fallback titles:', parseError);
        }
      }
    } catch (error) {
      console.error('Failed to generate route titles with Gemini AI:', error);
    }

    // Fallback to generic titles if AI fails
    return routes.map((route, index) => ({
      ...route,
      title: this.generateFallbackTitle(route, index)
    }));
  }

  private generateFallbackTitle(route: any, index: number): string {
    const titles = [
      'Scenic Neighborhood Loop',
      'Park Explorer Route',
      'Quiet Path Adventure',
      'Urban Discovery Walk',
      'Nature Trail Circuit'
    ];
    
    if (route.waypoints.some((w: any) => w.name.toLowerCase().includes('park'))) {
      return `${route.waypoints[0]?.name || 'Park'} Adventure Loop`;
    }
    
    if (route.waypoints.some((w: any) => w.name.toLowerCase().includes('garden'))) {
      return `Garden District Walking Tour`;
    }
    
    return titles[index] || `Walking Route ${index + 1}`;
  }

  private generateMockRoutes(request: RouteRequestBody) {
    const { start, target, preferences, pets } = request;
    const targetDuration = target.durationMin || 30;
    const avgSpeed = 4; // km/h walking speed
    const targetDistance = (targetDuration / 60) * avgSpeed * 1000; // meters
    
    // Generate 3 different route variations
    const routes = [];
    
    // Route 1: Park-focused route
    routes.push({
      id: 'route-1',
      title: 'Riverside Park Adventure Loop',
      polyline: this.generateMockPolyline(start, targetDistance),
      distanceMeters: targetDistance,
      durationSec: targetDuration * 60,
      waypoints: [
        {
          name: 'Riverside Park',
          types: ['park', 'establishment'],
          location: { lat: start.lat + 0.005, lng: start.lng + 0.003 }
        },
        {
          name: 'Dog Exercise Area',
          types: ['park', 'dog_park'],
          location: { lat: start.lat + 0.003, lng: start.lng - 0.004 }
        }
      ],
      score: 0.85,
      reasons: ['70% park coverage', 'Shade available', 'Low traffic crossings'],
      advisories: [
        { type: 'tip' as const, message: 'Mostly shaded path through parks' },
        { type: 'info' as const, message: 'Water fountain available at Riverside Park' }
      ],
      thumbnails: [],
      weatherSuitability: 0.9
    });

    // Route 2: Balanced urban route
    routes.push({
      id: 'route-2',
      title: 'Community Garden Discovery Walk',
      polyline: this.generateMockPolyline(start, targetDistance * 0.9),
      distanceMeters: targetDistance * 0.9,
      durationSec: Math.round(targetDuration * 0.9) * 60,
      waypoints: [
        {
          name: 'Quiet Residential Street',
          types: ['route'],
          location: { lat: start.lat - 0.004, lng: start.lng + 0.002 }
        },
        {
          name: 'Community Garden',
          types: ['park', 'point_of_interest'],
          location: { lat: start.lat + 0.002, lng: start.lng + 0.005 }
        }
      ],
      score: 0.72,
      reasons: ['Good sidewalk coverage', 'Moderate elevation', 'Mixed scenery'],
      advisories: [
        { type: 'info' as const, message: 'Mix of parks and quiet streets' },
        { type: 'warning' as const, message: 'One moderate hill section' }
      ],
      thumbnails: [],
      weatherSuitability: 0.7
    });

    // Route 3: Efficiency route
    routes.push({
      id: 'route-3',
      title: 'Direct Neighborhood Path',
      polyline: this.generateMockPolyline(start, targetDistance * 1.1),
      distanceMeters: targetDistance * 1.1,
      durationSec: Math.round(targetDuration * 1.1) * 60,
      waypoints: [
        {
          name: 'Main Walking Path',
          types: ['route'],
          location: { lat: start.lat + 0.006, lng: start.lng - 0.003 }
        }
      ],
      score: 0.68,
      reasons: ['Minimal elevation change', 'Direct path', 'Few intersections'],
      advisories: [
        { type: 'tip' as const, message: 'Flat terrain, easy walking' },
        { type: 'info' as const, message: 'Direct route with minimal stops' }
      ],
      thumbnails: [],
      weatherSuitability: 0.6
    });

    // Adjust scores based on preferences
    routes.forEach(route => {
      if (preferences.preferParks && route.parksRatio > 0.5) route.score += 0.1;
      if (preferences.lowSlope && route.elevationGainM < 20) route.score += 0.05;
      if (preferences.avoidBusy && route.crossingsEstimate < 3) route.score += 0.05;
    });

    // Sort by score (highest first)
    return routes.sort((a, b) => b.score - a.score);
  }
}
