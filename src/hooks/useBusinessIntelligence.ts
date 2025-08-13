import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useLocationService } from './useLocationServices';

// Walker Efficiency Dashboard
export const useWalkerEfficiencyDashboard = (walkerId?: string) => {
  const { user } = useAuth();
  const locationService = useLocationService();

  const getWalkerMetrics = useQuery({
    queryKey: ['walker-efficiency', walkerId || user?.id],
    queryFn: async () => {
      const targetWalkerId = walkerId || user?.id;
      if (!targetWalkerId) throw new Error('Walker ID required');

      // Get all completed bookings for the walker
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          walk_routes (
            total_distance,
            total_duration
          ),
          users!bookings_user_id_fkey (
            latitude,
            longitude
          )
        `)
        .eq('walker_id', targetWalkerId)
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (error) throw error;

      // Calculate efficiency metrics
      const totalWalks = bookings?.length || 0;
      const totalEarnings = bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const totalDistance = bookings?.reduce((sum, b) => sum + (b.walk_routes?.[0]?.total_distance || 0), 0) || 0;
      const totalDuration = bookings?.reduce((sum, b) => sum + (b.walk_routes?.[0]?.total_duration || 0), 0) || 0;

      // Calculate earnings by area
      const earningsByArea = bookings?.reduce((acc: any, booking) => {
        if (!booking.pickup_latitude || !booking.pickup_longitude) return acc;
        
        // Reverse geocode to get neighborhood
        const area = `${booking.pickup_latitude.toFixed(2)},${booking.pickup_longitude.toFixed(2)}`;
        acc[area] = (acc[area] || 0) + (booking.total_amount || 0);
        return acc;
      }, {}) || {};

      // Travel time analysis
      const avgTravelTime = bookings?.length 
        ? bookings.reduce((sum, b) => sum + (b.travel_time_minutes || 0), 0) / bookings.length
        : 0;

      // Peak earning hours
      const earningsByHour = bookings?.reduce((acc: any, booking) => {
        const hour = new Date(booking.scheduled_time).getHours();
        acc[hour] = (acc[hour] || 0) + (booking.total_amount || 0);
        return acc;
      }, {}) || {};

      const peakHour = Object.entries(earningsByHour)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];

      return {
        overview: {
          totalWalks,
          totalEarnings,
          averageEarningsPerWalk: totalWalks ? totalEarnings / totalWalks : 0,
          totalDistance,
          totalDuration,
          avgTravelTime,
        },
        geographic: {
          earningsByArea,
          topEarningArea: Object.entries(earningsByArea)
            .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0],
        },
        temporal: {
          earningsByHour,
          peakHour: peakHour ? `${peakHour}:00` : null,
          weekdayVsWeekend: calculateWeekdayWeekendSplit(bookings || []),
        },
        efficiency: {
          earningsPerKm: totalDistance ? totalEarnings / totalDistance : 0,
          earningsPerHour: totalDuration ? (totalEarnings / totalDuration) * 60 : 0,
          walkCompletionRate: calculateCompletionRate(targetWalkerId),
        },
      };
    },
    enabled: !!user,
  });

  const getRouteOptimizationSuggestions = useMutation({
    mutationFn: async ({ 
      currentLocation,
      upcomingBookings 
    }: {
      currentLocation: { lat: number; lng: number };
      upcomingBookings: Array<{
        id: string;
        pickupAddress: string;
        scheduledTime: string;
      }>;
    }) => {
      // Geocode pickup addresses
      const locations = await Promise.all(
        upcomingBookings.map(async (booking) => {
          const results = await locationService.geocodeAddress(booking.pickupAddress);
          return {
            bookingId: booking.id,
            scheduledTime: booking.scheduledTime,
            location: results[0]?.geometry?.location ? {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            } : null,
          };
        })
      );

      const validLocations = locations.filter(l => l.location !== null);

      // Calculate optimal route
      const waypoints = [currentLocation, ...validLocations.map(l => l.location!)];
      const optimizedRoute = await locationService.calculateOptimalRoute(waypoints);

      // Estimate time savings
      const directTravelTimes = await Promise.all(
        validLocations.map(loc => 
          locationService.estimateTravelTime(currentLocation, loc.location!)
        )
      );

      const totalDirectTime = directTravelTimes.reduce((sum, time) => sum + time, 0);
      const optimizedTime = optimizedRoute.routes[0]?.legs?.reduce(
        (sum, leg) => sum + (leg.duration?.value || 0), 0
      ) || 0;

      const timeSavings = totalDirectTime - optimizedTime;
      const fuelSavings = calculateFuelSavings(timeSavings);

      return {
        optimizedRoute,
        timeSavingsMinutes: timeSavings / 60,
        estimatedFuelSavings: fuelSavings,
        suggestions: [
          timeSavings > 600 ? 'Significant time savings possible with route optimization' : null,
          validLocations.length > 3 ? 'Consider grouping nearby pickups' : null,
          'Plan for traffic during peak hours',
        ].filter(Boolean),
      };
    },
  });

  return {
    getWalkerMetrics,
    getRouteOptimizationSuggestions,
  };
};

// Customer Insights & Market Analysis
export const useCustomerInsights = () => {
  const { user } = useAuth();

  const getCustomerDensityMapping = useQuery({
    queryKey: ['customer-density'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data: customers, error } = await supabase
        .from('users')
        .select(`
          id,
          latitude,
          longitude,
          created_at,
          bookings (
            id,
            total_amount,
            created_at
          )
        `)
        .eq('user_type', 'customer')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      // Group customers by geographic clusters
      const clusters = groupCustomersByLocation(customers || [], 0.01); // ~1km clusters

      return clusters.map(cluster => ({
        lat: cluster.centerLat,
        lng: cluster.centerLng,
        customerCount: cluster.customers.length,
        totalBookings: cluster.customers.reduce((sum, c) => sum + (c.bookings?.length || 0), 0),
        totalValue: cluster.customers.reduce((sum, c) => 
          sum + (c.bookings?.reduce((bSum, b) => bSum + (b.total_amount || 0), 0) || 0), 0
        ),
        avgCustomerValue: cluster.customers.length > 0 
          ? cluster.customers.reduce((sum, c) => 
              sum + (c.bookings?.reduce((bSum, b) => bSum + (b.total_amount || 0), 0) || 0), 0
            ) / cluster.customers.length 
          : 0,
      }));
    },
  });

  const getMarketGapAnalysis = useQuery({
    queryKey: ['market-gaps'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get walker coverage
      const { data: walkers } = await supabase
        .from('walker_profiles')
        .select(`
          id,
          users!inner (
            latitude,
            longitude
          )
        `)
        .eq('profile_status', 'approved');

      // Get customer demand
      const { data: bookings } = await supabase
        .from('bookings')
        .select('pickup_latitude, pickup_longitude, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .not('pickup_latitude', 'is', null)
        .not('pickup_longitude', 'is', null);

      // Identify underserved areas
      const demandClusters = groupCustomersByLocation(
        bookings?.map(b => ({ 
          latitude: b.pickup_latitude, 
          longitude: b.pickup_longitude 
        })) || [], 
        0.02
      );

      const gaps = demandClusters.filter(cluster => {
        // Check if there are enough walkers within 5km
        const nearbyWalkers = walkers?.filter(walker => {
          const walkerUser = walker.users as any;
          const distance = calculateDistance(
            { lat: cluster.centerLat, lng: cluster.centerLng },
            { lat: walkerUser?.latitude || 0, lng: walkerUser?.longitude || 0 }
          );
          return distance < 5; // 5km radius
        }) || [];

        return nearbyWalkers.length < cluster.customers.length / 3; // Need 1 walker per 3 customers
      });

      return {
        totalDemandClusters: demandClusters.length,
        underservedAreas: gaps.length,
        expansionOpportunities: gaps.map(gap => ({
          location: { lat: gap.centerLat, lng: gap.centerLng },
          demandLevel: gap.customers.length,
          currentWalkerCount: 0, // Would calculate actual count
          recommendedWalkers: Math.ceil(gap.customers.length / 3),
          estimatedRevenue: gap.customers.length * 150, // Estimate monthly revenue
        })),
      };
    },
  });

  const getSeasonalTrends = useQuery({
    queryKey: ['seasonal-trends'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('created_at, total_amount, scheduled_time')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()); // Last year

      if (error) throw error;

      // Group by month
      const monthlyData = bookings?.reduce((acc: any, booking) => {
        const month = new Date(booking.created_at).getMonth();
        const monthName = new Date(2024, month).toLocaleString('default', { month: 'long' });
        
        if (!acc[monthName]) {
          acc[monthName] = { bookings: 0, revenue: 0 };
        }
        
        acc[monthName].bookings += 1;
        acc[monthName].revenue += booking.total_amount || 0;
        
        return acc;
      }, {}) || {};

      // Identify peak and low seasons
      const monthlyRevenue = Object.entries(monthlyData)
        .map(([month, data]: [string, any]) => ({ month, ...data }))
        .sort((a, b) => b.revenue - a.revenue);

      return {
        monthlyBreakdown: monthlyData,
        peakSeason: monthlyRevenue[0],
        lowSeason: monthlyRevenue[monthlyRevenue.length - 1],
        avgMonthlyRevenue: monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) / monthlyRevenue.length,
        seasonalTrends: {
          spring: calculateSeasonalAverage(monthlyRevenue, [2, 3, 4]), // Mar, Apr, May
          summer: calculateSeasonalAverage(monthlyRevenue, [5, 6, 7]), // Jun, Jul, Aug
          fall: calculateSeasonalAverage(monthlyRevenue, [8, 9, 10]),  // Sep, Oct, Nov
          winter: calculateSeasonalAverage(monthlyRevenue, [11, 0, 1]), // Dec, Jan, Feb
        },
      };
    },
  });

  return {
    getCustomerDensityMapping,
    getMarketGapAnalysis,
    getSeasonalTrends,
  };
};

// AR and Advanced Features
export const useARWalkingExperience = () => {
  const locationService = useLocationService();

  const generateARWaypoints = useMutation({
    mutationFn: async ({
      route,
      pet,
      interests
    }: {
      route: google.maps.LatLng[];
      pet: any;
      interests: string[];
    }) => {
      const waypoints = [];

      for (let i = 0; i < route.length; i++) {
        const point = route[i];
        
        // Find nearby points of interest
        const nearbyPOIs = await locationService.findNearbyPOIs(
          { lat: point.lat(), lng: point.lng() }, 
          'point_of_interest', 
          100
        );
        
        // Filter for pet-relevant POIs
        const relevantPOIs = nearbyPOIs.filter(poi => 
          poi.types?.some(type => 
            ['park', 'pet_store', 'veterinary_care'].includes(type)
          ) || 
          poi.name?.toLowerCase().includes('dog') ||
          poi.name?.toLowerCase().includes('pet')
        );

        if (relevantPOIs.length > 0) {
          waypoints.push({
            location: point,
            arContent: {
              type: 'poi_highlight',
              title: relevantPOIs[0].name,
              description: `Great spot for ${pet.name}!`,
              icon: '🐕',
              actions: ['Take Photo', 'Mark Favorite', 'Share'],
            },
          });
        }

        // Add behavioral annotations based on pet type
        if (i % 5 === 0) { // Every 5th point
          waypoints.push({
            location: point,
            arContent: {
              type: 'behavior_tip',
              title: 'Walking Tip',
              description: generateBehaviorTip(pet, i),
              icon: '💡',
              duration: 5000, // Show for 5 seconds
            },
          });
        }
      }

      return waypoints;
    },
  });

  const trackPetBehavior = useMutation({
    mutationFn: async ({
      bookingId,
      location,
      behaviorType,
      notes,
      photoUrl
    }: {
      bookingId: string;
      location: { lat: number; lng: number };
      behaviorType: 'excited' | 'tired' | 'anxious' | 'playful' | 'aggressive';
      notes?: string;
      photoUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from('pet_behavior_logs')
        .insert({
          booking_id: bookingId,
          latitude: location.lat,
          longitude: location.lng,
          behavior_type: behaviorType,
          notes,
          photo_url: photoUrl,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  return {
    generateARWaypoints,
    trackPetBehavior,
  };
};

// Utility functions
const calculateWeekdayWeekendSplit = (bookings: any[]) => {
  const weekday = bookings.filter(b => {
    const day = new Date(b.scheduled_time).getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  });
  
  const weekend = bookings.filter(b => {
    const day = new Date(b.scheduled_time).getDay();
    return day === 0 || day === 6; // Saturday and Sunday
  });

  return {
    weekday: {
      count: weekday.length,
      earnings: weekday.reduce((sum, b) => sum + (b.total_amount || 0), 0),
    },
    weekend: {
      count: weekend.length,
      earnings: weekend.reduce((sum, b) => sum + (b.total_amount || 0), 0),
    },
  };
};

const calculateCompletionRate = async (walkerId: string) => {
  const { data } = await supabase
    .from('bookings')
    .select('status')
    .eq('walker_id', walkerId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (!data || data.length === 0) return 100;

  const completed = data.filter(b => b.status === 'completed').length;
  return (completed / data.length) * 100;
};

const calculateFuelSavings = (timeSavingsSeconds: number): number => {
  // Rough estimate: $0.30 per minute of driving time saved
  return (timeSavingsSeconds / 60) * 0.30;
};

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

const groupCustomersByLocation = (customers: any[], tolerance: number) => {
  const clusters: any[] = [];
  
  customers.forEach(customer => {
    const lat = customer.latitude;
    const lng = customer.longitude;
    
    if (!lat || !lng) return;
    
    const existingCluster = clusters.find(cluster => 
      Math.abs(cluster.centerLat - lat) < tolerance &&
      Math.abs(cluster.centerLng - lng) < tolerance
    );
    
    if (existingCluster) {
      existingCluster.customers.push(customer);
      // Recalculate center
      existingCluster.centerLat = existingCluster.customers.reduce((sum: number, c: any) => sum + c.latitude, 0) / existingCluster.customers.length;
      existingCluster.centerLng = existingCluster.customers.reduce((sum: number, c: any) => sum + c.longitude, 0) / existingCluster.customers.length;
    } else {
      clusters.push({
        centerLat: lat,
        centerLng: lng,
        customers: [customer],
      });
    }
  });
  
  return clusters;
};

const calculateSeasonalAverage = (monthlyData: any[], months: number[]) => {
  const seasonData = monthlyData.filter((_, index) => months.includes(index));
  return seasonData.reduce((sum, month) => sum + month.revenue, 0) / seasonData.length;
};

const generateBehaviorTip = (pet: any, pointIndex: number): string => {
  const tips = [
    `${pet.name} might enjoy sniffing around here - let them explore!`,
    `Watch for ${pet.name}'s body language - tail wagging means they're happy`,
    `If ${pet.name} seems tired, this could be a good rest spot`,
    `Look out for other dogs - ${pet.name} might want to say hello!`,
    `This is a great photo opportunity with ${pet.name}`,
  ];
  
  return tips[pointIndex % tips.length];
};
