import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';

export interface ServiceArea {
  id: string;
  name: string;
  boundaries: google.maps.LatLng[];
  is_active: boolean;
  base_price_multiplier: number;
  travel_surcharge: number;
  walker_count: number;
}

export interface SafeZone {
  id: string;
  pet_id: string;
  name: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  zone_type: 'safe' | 'restricted' | 'preferred';
  is_active: boolean;
}

export interface LocationService {
  // Core location utilities
  getCurrentLocation: () => Promise<GeolocationPosition>;
  calculateDistance: (point1: LatLng, point2: LatLng) => number;
  isWithinRadius: (center: LatLng, point: LatLng, radiusKm: number) => boolean;
  
  // Address services
  geocodeAddress: (address: string) => Promise<google.maps.GeocoderResult[]>;
  reverseGeocode: (lat: number, lng: number) => Promise<string>;
  validateServiceArea: (lat: number, lng: number) => Promise<boolean>;
  
  // Route optimization
  calculateOptimalRoute: (waypoints: LatLng[]) => Promise<google.maps.DirectionsResult>;
  estimateTravelTime: (origin: LatLng, destination: LatLng) => Promise<number>;
  findNearbyPOIs: (center: LatLng, type: string, radius: number) => Promise<google.maps.places.PlaceResult[]>;
}

interface LatLng {
  lat: number;
  lng: number;
}

export const useLocationService = (): LocationService => {
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const calculateDistance = (point1: LatLng, point2: LatLng): number => {
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

  const isWithinRadius = (center: LatLng, point: LatLng, radiusKm: number): boolean => {
    const distance = calculateDistance(center, point);
    return distance <= radiusKm;
  };

  const geocodeAddress = async (address: string): Promise<google.maps.GeocoderResult[]> => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  };

  const validateServiceArea = async (lat: number, lng: number): Promise<boolean> => {
    // Check if coordinates are within any active service area
    const { data, error } = await supabase
      .from('service_areas')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    // For now, simple radius check - can be enhanced with polygon boundaries
    return data?.some(area => {
      const center = { lat: area.center_lat, lng: area.center_lng };
      const point = { lat, lng };
      return isWithinRadius(center, point, area.radius_km);
    }) || false;
  };

  const calculateOptimalRoute = async (waypoints: LatLng[]): Promise<google.maps.DirectionsResult> => {
    return new Promise((resolve, reject) => {
      if (!window.google || waypoints.length < 2) {
        reject(new Error('Invalid waypoints or Google Maps not loaded'));
        return;
      }

      const directionsService = new google.maps.DirectionsService();
      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];
      const waypointsArray = waypoints.slice(1, -1).map(point => ({
        location: point,
        stopover: true,
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints: waypointsArray,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(`Route calculation failed: ${status}`));
          }
        }
      );
    });
  };

  const estimateTravelTime = async (origin: LatLng, destination: LatLng): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.WALKING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK' && response && response.rows[0]?.elements[0]) {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK' && element.duration) {
              resolve(element.duration.value); // Returns time in seconds
            } else {
              reject(new Error('No route found'));
            }
          } else {
            reject(new Error(`Travel time calculation failed: ${status}`));
          }
        }
      );
    });
  };

  const findNearbyPOIs = async (
    center: LatLng, 
    type: string, 
    radius: number
  ): Promise<google.maps.places.PlaceResult[]> => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.nearbySearch(
        {
          location: center,
          radius,
          type: type as any,
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`POI search failed: ${status}`));
          }
        }
      );
    });
  };

  return {
    getCurrentLocation,
    calculateDistance,
    isWithinRadius,
    geocodeAddress,
    reverseGeocode,
    validateServiceArea,
    calculateOptimalRoute,
    estimateTravelTime,
    findNearbyPOIs,
  };
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Hook for managing geofencing and safety zones
export const useSafeZones = (petId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['safe-zones', petId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const query = supabase
        .from('pet_safe_zones')
        .select('*')
        .eq('is_active', true);

      if (petId) {
        query.eq('pet_id', petId);
      } else {
        // Get safe zones for all user's pets
        const { data: pets } = await supabase
          .from('pets')
          .select('id')
          .eq('user_id', user.id);

        if (pets) {
          query.in('pet_id', pets.map(p => p.id));
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SafeZone[];
    },
    enabled: !!user,
  });
};

// Hook for geofence violation detection
export const useGeofenceMonitoring = (petId: string, currentLocation?: LatLng) => {
  const { data: safeZones } = useSafeZones(petId);
  const [violations, setViolations] = useState<SafeZone[]>([]);
  const locationService = useLocationService();

  useEffect(() => {
    if (!currentLocation || !safeZones) return;

    const newViolations: SafeZone[] = [];

    safeZones.forEach(zone => {
      const zoneCenter = { lat: zone.center_lat, lng: zone.center_lng };
      const distance = locationService.calculateDistance(zoneCenter, currentLocation);
      const radiusKm = zone.radius_meters / 1000;

      if (zone.zone_type === 'safe' && distance > radiusKm) {
        newViolations.push(zone);
      } else if (zone.zone_type === 'restricted' && distance < radiusKm) {
        newViolations.push(zone);
      }
    });

    setViolations(newViolations);
  }, [currentLocation, safeZones, locationService]);

  return violations;
};

// Hook for finding nearby services (vets, pet stores, dog parks)
export const useNearbyPetServices = (location?: LatLng, radius = 2000) => {
  const locationService = useLocationService();

  return useQuery({
    queryKey: ['nearby-pet-services', location?.lat, location?.lng, radius],
    queryFn: async () => {
      if (!location) throw new Error('Location required');

      const [veterinarians, petStores, dogParks] = await Promise.all([
        locationService.findNearbyPOIs(location, 'veterinary_care', radius),
        locationService.findNearbyPOIs(location, 'pet_store', radius),
        locationService.findNearbyPOIs(location, 'park', radius),
      ]);

      return {
        veterinarians,
        petStores,
        dogParks: dogParks.filter(park => 
          park.name?.toLowerCase().includes('dog') || 
          park.types?.includes('park')
        ),
      };
    },
    enabled: !!location,
  });
};

// Hook for route optimization for walkers with multiple bookings
export const useRouteOptimization = () => {
  const locationService = useLocationService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      walkerLocation, 
      pickupAddresses, 
      dropoffAddresses 
    }: {
      walkerLocation: LatLng;
      pickupAddresses: string[];
      dropoffAddresses: string[];
    }) => {
      // Geocode all addresses
      const pickupCoords = await Promise.all(
        pickupAddresses.map(async (address) => {
          const results = await locationService.geocodeAddress(address);
          return results[0]?.geometry?.location ? {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          } : null;
        })
      );

      const dropoffCoords = await Promise.all(
        dropoffAddresses.map(async (address) => {
          const results = await locationService.geocodeAddress(address);
          return results[0]?.geometry?.location ? {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          } : null;
        })
      );

      // Filter out failed geocodes
      const validPickups = pickupCoords.filter(coord => coord !== null) as LatLng[];
      const validDropoffs = dropoffCoords.filter(coord => coord !== null) as LatLng[];

      // Create optimized route: walker -> pickups -> dropoffs
      const waypoints = [walkerLocation, ...validPickups, ...validDropoffs];
      const optimizedRoute = await locationService.calculateOptimalRoute(waypoints);

      return {
        route: optimizedRoute,
        estimatedDuration: optimizedRoute.routes[0]?.legs?.reduce(
          (total, leg) => total + (leg.duration?.value || 0), 0
        ) || 0,
        totalDistance: optimizedRoute.routes[0]?.legs?.reduce(
          (total, leg) => total + (leg.distance?.value || 0), 0
        ) || 0,
      };
    },
  });
};

// Hook for dynamic pricing based on location
export const useLocationBasedPricing = (pickupLocation?: LatLng, walkerId?: string) => {
  const locationService = useLocationService();

  return useQuery({
    queryKey: ['location-pricing', pickupLocation?.lat, pickupLocation?.lng, walkerId],
    queryFn: async () => {
      if (!pickupLocation || !walkerId) throw new Error('Location and walker required');

      // Get walker's base location
      const { data: walker } = await supabase
        .from('walker_profiles')
        .select(`
          users!inner (
            latitude,
            longitude
          ),
          hourly_rate
        `)
        .eq('id', walkerId)
        .single();

      if (!walker?.users) throw new Error('Walker location not found');

      const walkerLocation = {
        lat: (walker.users as any)?.latitude || 0,
        lng: (walker.users as any)?.longitude || 0,
      };

      // Calculate travel distance and time
      const distance = locationService.calculateDistance(walkerLocation, pickupLocation);
      const travelTime = await locationService.estimateTravelTime(walkerLocation, pickupLocation);

      // Get service area pricing rules
      const { data: serviceArea } = await supabase
        .from('service_areas')
        .select('*')
        .eq('is_active', true)
        .single(); // Simplified - in reality you'd find the right service area

      const basePriceMultiplier = serviceArea?.base_price_multiplier || 1.0;
      const travelSurcharge = distance > 2 ? (distance - 2) * (serviceArea?.travel_surcharge || 5) : 0;

      return {
        baseRate: walker.hourly_rate,
        multiplier: basePriceMultiplier,
        travelSurcharge,
        finalRate: walker.hourly_rate * basePriceMultiplier + travelSurcharge,
        distance,
        estimatedTravelTime: travelTime / 60, // Convert to minutes
      };
    },
    enabled: !!pickupLocation && !!walkerId,
  });
};
