import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useLocationService } from './useLocationServices';
import { GeminiAIService } from './useAILocationIntelligence';

// Emergency Features
export const useEmergencyFeatures = () => {
  const { user } = useAuth();
  const locationService = useLocationService();
  const aiService = new GeminiAIService();

  const triggerPanicButton = useMutation({
    mutationFn: async ({ 
      bookingId, 
      location, 
      emergencyType,
      description 
    }: {
      bookingId: string;
      location: { lat: number; lng: number };
      emergencyType: 'medical' | 'lost_pet' | 'accident' | 'other';
      description?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Log emergency incident
      const { data: incident, error } = await supabase
        .from('emergency_incidents')
        .insert({
          booking_id: bookingId,
          user_id: user.id,
          emergency_type: emergencyType,
          latitude: location.lat,
          longitude: location.lng,
          description,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Find nearest emergency services
      const nearbyVets = await locationService.findNearbyPOIs(
        location,
        'veterinary_care',
        5000
      );

      // Send emergency notifications
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'emergency',
        title: 'Emergency Alert Triggered',
        message: `Emergency assistance requested for booking ${bookingId}`,
        data: {
          incident_id: incident.id,
          location,
          nearest_vets: nearbyVets.slice(0, 3),
        },
      });

      return { incident, nearbyVets };
    },
  });

  const findNearestVets = useQuery({
    queryKey: ['nearest-vets'],
    queryFn: async () => {
      const position = await locationService.getCurrentLocation();
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const vets = await locationService.findNearbyPOIs(location, 'veterinary_care', 10000);
      
      return vets.map(vet => ({
        name: vet.name,
        address: vet.vicinity,
        rating: vet.rating,
        phone: vet.formatted_phone_number,
        distance: locationService.calculateDistance(location, {
          lat: vet.geometry?.location?.lat() || 0,
          lng: vet.geometry?.location?.lng() || 0,
        }),
      }));
    },
    enabled: false, // Only run when manually triggered
  });

  return {
    triggerPanicButton,
    findNearestVets,
  };
};

// Geofencing & Safety Zones
export const useGeofencing = (petId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createSafeZone = useMutation({
    mutationFn: async ({
      petId,
      name,
      centerLat,
      centerLng,
      radiusMeters,
      zoneType,
    }: {
      petId: string;
      name: string;
      centerLat: number;
      centerLng: number;
      radiusMeters: number;
      zoneType: 'safe' | 'restricted' | 'preferred';
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pet_safe_zones')
        .insert({
          pet_id: petId,
          user_id: user.id,
          name,
          center_lat: centerLat,
          center_lng: centerLng,
          radius_meters: radiusMeters,
          zone_type: zoneType,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safe-zones', petId] });
    },
  });

  const checkGeofenceViolations = useMutation({
    mutationFn: async ({
      petId,
      currentLocation,
    }: {
      petId: string;
      currentLocation: { lat: number; lng: number };
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: zones } = await supabase
        .from('pet_safe_zones')
        .select('*')
        .eq('pet_id', petId)
        .eq('is_active', true);

      const violations: any[] = [];

      zones?.forEach(zone => {
        const distance = calculateDistance(
          { lat: zone.center_lat, lng: zone.center_lng },
          currentLocation
        ) * 1000; // Convert to meters

        if (zone.zone_type === 'safe' && distance > zone.radius_meters) {
          violations.push({
            type: 'outside_safe_zone',
            zone,
            distance,
          });
        } else if (zone.zone_type === 'restricted' && distance < zone.radius_meters) {
          violations.push({
            type: 'inside_restricted_zone',
            zone,
            distance,
          });
        }
      });

      // Log violations
      if (violations.length > 0) {
        await supabase.from('geofence_violations').insert(
          violations.map(v => ({
            pet_id: petId,
            user_id: user.id,
            safe_zone_id: v.zone.id,
            violation_type: v.type,
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            distance_meters: v.distance,
            created_at: new Date().toISOString(),
          }))
        );
      }

      return violations;
    },
  });

  return {
    createSafeZone,
    checkGeofenceViolations,
  };
};

// Walker Density & Service Area Management
export const useServiceAreaAnalytics = () => {
  const { user } = useAuth();

  const getWalkerDensityHeatmap = useQuery({
    queryKey: ['walker-density-heatmap'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('walker_profiles')
        .select(`
          id,
          users!inner (
            latitude,
            longitude
          )
        `)
        .eq('profile_status', 'approved')
        .eq('is_available_now', true);

      if (error) throw error;

      // Group walkers by geographic clusters
      const clusters = groupByLocation(data || [], 0.01); // ~1km clusters
      
      return clusters.map(cluster => ({
        lat: cluster.centerLat,
        lng: cluster.centerLng,
        walkerCount: cluster.walkers.length,
        intensity: Math.min(cluster.walkers.length / 10, 1), // Normalize to 0-1
      }));
    },
  });

  const getDemandHeatmap = useQuery({
    queryKey: ['demand-heatmap'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          pickup_latitude,
          pickup_longitude,
          created_at
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .not('pickup_latitude', 'is', null)
        .not('pickup_longitude', 'is', null);

      if (error) throw error;

      // Group bookings by location
      const clusters = groupByLocation(
        data?.map(b => ({ 
          users: { latitude: b.pickup_latitude, longitude: b.pickup_longitude } 
        })) || [], 
        0.01
      );

      return clusters.map(cluster => ({
        lat: cluster.centerLat,
        lng: cluster.centerLng,
        demandCount: cluster.walkers.length,
        intensity: Math.min(cluster.walkers.length / 20, 1),
      }));
    },
  });

  return {
    getWalkerDensityHeatmap,
    getDemandHeatmap,
  };
};

// Route Optimization for Multi-Pet Pickups
export const useMultiPetRouteOptimization = () => {
  const locationService = useLocationService();

  return useMutation({
    mutationFn: async ({
      walkerLocation,
      bookings,
    }: {
      walkerLocation: { lat: number; lng: number };
      bookings: Array<{
        id: string;
        pickupAddress: string;
        dropoffAddress: string;
        scheduledTime: string;
        pet: { name: string; size: string };
      }>;
    }) => {
      // Geocode all addresses
      const locations = await Promise.all(
        bookings.flatMap(b => [
          locationService.geocodeAddress(b.pickupAddress),
          locationService.geocodeAddress(b.dropoffAddress),
        ])
      );

      // Create pickup and dropoff waypoints
      const pickupPoints = locations
        .filter((_, i) => i % 2 === 0)
        .map((results, i) => ({
          bookingId: bookings[i].id,
          type: 'pickup',
          location: {
            lat: results[0]?.geometry?.location?.lat() || 0,
            lng: results[0]?.geometry?.location?.lng() || 0,
          },
          scheduledTime: bookings[i].scheduledTime,
          pet: bookings[i].pet,
        }));

      const dropoffPoints = locations
        .filter((_, i) => i % 2 === 1)
        .map((results, i) => ({
          bookingId: bookings[i].id,
          type: 'dropoff',
          location: {
            lat: results[0]?.geometry?.location?.lat() || 0,
            lng: results[0]?.geometry?.location?.lng() || 0,
          },
          pet: bookings[i].pet,
        }));

      // Optimize route: walker -> all pickups -> walk together -> all dropoffs
      const allWaypoints = [
        walkerLocation,
        ...pickupPoints.map(p => p.location),
        ...dropoffPoints.map(p => p.location),
      ];

      const optimizedRoute = await locationService.calculateOptimalRoute(allWaypoints);

      return {
        route: optimizedRoute,
        pickupOrder: pickupPoints,
        dropoffOrder: dropoffPoints,
        estimatedTotalTime: optimizedRoute.routes[0]?.legs?.reduce(
          (total, leg) => total + (leg.duration?.value || 0), 0
        ) || 0,
        totalDistance: optimizedRoute.routes[0]?.legs?.reduce(
          (total, leg) => total + (leg.distance?.value || 0), 0
        ) || 0,
      };
    },
  });
};

// Dynamic Pricing Based on Location
export const useDynamicLocationPricing = () => {
  const locationService = useLocationService();

  const calculateDynamicPrice = useMutation({
    mutationFn: async ({
      basePrice,
      pickupLocation,
      timeSlot,
      serviceType,
    }: {
      basePrice: number;
      pickupLocation: { lat: number; lng: number };
      timeSlot: string;
      serviceType: string;
    }) => {
      // Get demand data for this area and time
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('pickup_latitude, pickup_longitude, scheduled_time')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('service_type', serviceType);

      // Calculate demand multiplier
      const nearbyBookings = recentBookings?.filter(booking => {
        if (!booking.pickup_latitude || !booking.pickup_longitude) return false;
        
        const distance = locationService.calculateDistance(
          pickupLocation,
          { lat: booking.pickup_latitude, lng: booking.pickup_longitude }
        );
        
        return distance < 2; // Within 2km
      }) || [];

      const demandMultiplier = Math.min(1 + (nearbyBookings.length * 0.1), 2.0); // Max 2x pricing

      // Check if it's a premium area
      const nearbyPOIs = await locationService.findNearbyPOIs(
        pickupLocation,
        'establishment',
        1000
      );

      const premiumPOIs = nearbyPOIs.filter(poi => 
        poi.types?.some(type => 
          ['shopping_mall', 'university', 'airport', 'tourist_attraction'].includes(type)
        )
      );

      const premiumMultiplier = premiumPOIs.length > 0 ? 1.2 : 1.0;

      // Time-based pricing
      const hour = new Date(timeSlot).getHours();
      const timeMultiplier = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.3 : 1.0; // Peak hours

      const finalPrice = basePrice * demandMultiplier * premiumMultiplier * timeMultiplier;

      return {
        basePrice,
        demandMultiplier,
        premiumMultiplier,
        timeMultiplier,
        finalPrice: Math.round(finalPrice * 100) / 100,
        factors: {
          nearbyDemand: nearbyBookings.length,
          premiumArea: premiumPOIs.length > 0,
          peakTime: timeMultiplier > 1.0,
        },
      };
    },
  });

  return { calculateDynamicPrice };
};

// Weather-Optimized Route Suggestions
export const useWeatherOptimizedRoutes = () => {
  const locationService = useLocationService();
  const aiService = new GeminiAIService();

  return useMutation({
    mutationFn: async ({
      location,
      pet,
      weather,
    }: {
      location: { lat: number; lng: number };
      pet: any;
      weather: {
        temperature: number;
        condition: string;
        precipitation: number;
        windSpeed: number;
        humidity: number;
      };
    }) => {
      // Get nearby parks and walking areas
      const nearbyParks = await locationService.findNearbyPOIs(location, 'park', 3000);
      
      // Get indoor alternatives if weather is bad
      const indoorOptions = weather.precipitation > 50 || weather.temperature < 20 || weather.temperature > 85
        ? await locationService.findNearbyPOIs(location, 'shopping_mall', 5000)
        : [];

      // Use AI to analyze routes based on weather
      const routeAnalysis = await aiService.generateWalkSuggestions(
        pet,
        {
          weather,
          timeOfDay: 'afternoon',
          duration: 30,
          walker_experience: 'experienced',
          location: { ...location, neighborhood: 'Current Area' },
        },
        [
          ...nearbyParks.map(p => `${p.name}: ${p.vicinity}`),
          ...indoorOptions.map(p => `Indoor: ${p.name}: ${p.vicinity}`),
        ]
      );

      return {
        outdoorRoutes: nearbyParks,
        indoorOptions,
        aiRecommendations: routeAnalysis,
        weatherAlert: weather.precipitation > 70 ? 'Heavy rain expected - consider indoor alternatives' : null,
      };
    },
  });
};

// Utility functions
const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(point2.lat - point1.lat);
  const dLon = deg2rad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const groupByLocation = (locations: any[], tolerance: number) => {
  const clusters: any[] = [];
  
  locations.forEach(location => {
    const lat = location.users?.latitude;
    const lng = location.users?.longitude;
    
    if (!lat || !lng) return;
    
    const existingCluster = clusters.find(cluster => 
      Math.abs(cluster.centerLat - lat) < tolerance &&
      Math.abs(cluster.centerLng - lng) < tolerance
    );
    
    if (existingCluster) {
      existingCluster.walkers.push(location);
      // Recalculate center
      existingCluster.centerLat = existingCluster.walkers.reduce((sum: number, w: any) => sum + w.users.latitude, 0) / existingCluster.walkers.length;
      existingCluster.centerLng = existingCluster.walkers.reduce((sum: number, w: any) => sum + w.users.longitude, 0) / existingCluster.walkers.length;
    } else {
      clusters.push({
        centerLat: lat,
        centerLng: lng,
        walkers: [location],
      });
    }
  });
  
  return clusters;
};
