import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useState, useEffect, useCallback } from 'react';

export interface LocationPoint {
  id: string;
  booking_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  created_at: string;
}

export interface WalkRoute {
  id: string;
  booking_id: string;
  total_distance: number;
  total_duration: number;
  start_location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  end_location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  route_points: LocationPoint[];
  created_at: string;
  updated_at: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      } as GeolocationPositionError);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000, // 30 seconds
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position);
        setError(null);
      },
      (error) => {
        setError(error);
      },
      options
    );

    setIsTracking(true);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
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
  }, []);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentLocation,
  };
};

export const useWalkRouteTracking = (bookingId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['walk-route', bookingId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('walk_routes')
        .select(`
          *,
          walk_route_points (
            id,
            latitude,
            longitude,
            accuracy,
            altitude,
            heading,
            speed,
            timestamp,
            created_at
          )
        `)
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
      
      return data as WalkRoute | null;
    },
    enabled: !!user && !!bookingId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
};

export const useRealTimeLocationUpdates = (bookingId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !bookingId) return;

    const channel = supabase
      .channel(`walk-tracking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'walk_route_points',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          // Invalidate and refetch walk route data
          queryClient.invalidateQueries({ queryKey: ['walk-route', bookingId] });
          queryClient.invalidateQueries({ queryKey: ['live-location', bookingId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'walk_routes',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['walk-route', bookingId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, bookingId, queryClient]);
};

export const useStartWalkTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, startLocation }: {
      bookingId: string;
      startLocation: {
        latitude: number;
        longitude: number;
        address?: string;
      };
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Create walk route record
      const { data: walkRoute, error: routeError } = await supabase
        .from('walk_routes')
        .insert({
          booking_id: bookingId,
          start_location: startLocation,
          total_distance: 0,
          total_duration: 0,
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Add first location point
      const { error: pointError } = await supabase
        .from('walk_route_points')
        .insert({
          booking_id: bookingId,
          walk_route_id: walkRoute.id,
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
          timestamp: new Date().toISOString(),
        });

      if (pointError) throw pointError;

      // Update booking status to "in_progress"
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'in_progress' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      return walkRoute;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['walk-route', data.booking_id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useAddLocationPoint = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      latitude, 
      longitude, 
      accuracy,
      altitude,
      heading,
      speed 
    }: {
      bookingId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
      altitude?: number;
      heading?: number;
      speed?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get the current walk route
      const { data: route } = await supabase
        .from('walk_routes')
        .select('id')
        .eq('booking_id', bookingId)
        .single();

      if (!route) throw new Error('Walk route not found');

      const { data, error } = await supabase
        .from('walk_route_points')
        .insert({
          booking_id: bookingId,
          walk_route_id: route.id,
          latitude,
          longitude,
          accuracy,
          altitude,
          heading,
          speed,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['walk-route', data.booking_id] });
    },
  });
};

export const useEndWalkTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      endLocation,
      totalDistance,
      totalDuration 
    }: {
      bookingId: string;
      endLocation: {
        latitude: number;
        longitude: number;
        address?: string;
      };
      totalDistance: number;
      totalDuration: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Update walk route with final data
      const { data: walkRoute, error: routeError } = await supabase
        .from('walk_routes')
        .update({
          end_location: endLocation,
          total_distance: totalDistance,
          total_duration: totalDuration,
        })
        .eq('booking_id', bookingId)
        .select()
        .single();

      if (routeError) throw routeError;

      // Add final location point
      const { error: pointError } = await supabase
        .from('walk_route_points')
        .insert({
          booking_id: bookingId,
          walk_route_id: walkRoute.id,
          latitude: endLocation.latitude,
          longitude: endLocation.longitude,
          timestamp: new Date().toISOString(),
        });

      if (pointError) throw pointError;

      // Update booking status to "completed"
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      return walkRoute;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['walk-route', data.booking_id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useLiveWalkerLocation = (bookingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['live-location', bookingId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('walk_route_points')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as LocationPoint | null;
    },
    enabled: !!user && !!bookingId,
    refetchInterval: 3000, // Refetch every 3 seconds for live tracking
  });
};

export const useWalkingStatistics = (bookingId: string) => {
  const { data: route } = useWalkRouteTracking(bookingId);

  const calculateDistance = (points: LocationPoint[]): number => {
    if (points.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      totalDistance += getDistanceBetweenPoints(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }
    return totalDistance;
  };

  const calculateDuration = (points: LocationPoint[]): number => {
    if (points.length < 2) return 0;

    const startTime = new Date(points[0].timestamp);
    const endTime = new Date(points[points.length - 1].timestamp);
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // Duration in minutes
  };

  const calculateAverageSpeed = (distance: number, duration: number): number => {
    if (duration === 0) return 0;
    return (distance / duration) * 60; // km/h
  };

  const routePoints = route?.route_points || [];
  const distance = calculateDistance(routePoints);
  const duration = calculateDuration(routePoints);
  const averageSpeed = calculateAverageSpeed(distance, duration);

  return {
    distance,
    duration,
    averageSpeed,
    pointsCount: routePoints.length,
    isActive: route && !route.end_location,
  };
};

// Utility function to calculate distance between two GPS points
const getDistanceBetweenPoints = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const useWalkPhotos = (bookingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['walk-photos', bookingId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('walk_photos')
        .select(`
          *,
          walk_route_points (
            latitude,
            longitude
          )
        `)
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!bookingId,
  });
};

export const useAddWalkPhoto = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      photoUrl,
      caption,
      latitude,
      longitude,
    }: {
      bookingId: string;
      photoUrl: string;
      caption?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('walk_photos')
        .insert({
          booking_id: bookingId,
          photo_url: photoUrl,
          caption,
          latitude,
          longitude,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['walk-photos', data.booking_id] });
    },
  });
};
