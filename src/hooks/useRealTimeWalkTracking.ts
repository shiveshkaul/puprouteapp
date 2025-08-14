import { useState, useEffect, useCallback, useRef } from 'react';
import { AdvancedMapsService, LocationData, EnvironmentalIntelligence, PlaceIntelligence } from '@/services/AdvancedMapsService';

interface WalkState {
  status: 'planning' | 'starting' | 'active' | 'paused' | 'completed';
  startTime: number | null;
  endTime: number | null;
  currentLocation: LocationData | null;
  route: LocationData[];
  distance: number;
  duration: number;
  steps: number;
  calories: number;
  avgSpeed: number;
  maxSpeed: number;
  elevationGain: number;
  photos: Array<{
    url: string;
    location: LocationData;
    timestamp: number;
    caption?: string;
  }>;
}

interface EnvironmentalState {
  current: EnvironmentalIntelligence | null;
  history: Array<{
    timestamp: number;
    data: EnvironmentalIntelligence;
  }>;
  alerts: Array<{
    type: 'air_quality' | 'weather' | 'pollen';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: number;
  }>;
}

interface AIInsights {
  realTimeCoaching: string;
  routeOptimization: string;
  healthRecommendations: string;
  environmentalGuidance: string;
  petBehaviorAnalysis: string;
  emergencyAlerts: string[];
}

interface PetProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  energy_level: 'low' | 'medium' | 'high';
  health_conditions?: string[];
  allergies?: string[];
  preferences?: string[];
}

const GEMINI_API_KEY = 'AIzaSyBafk7WqRslUyt3UFz0BFg6hqTyUy_nxow';

export const useRealTimeWalkTracking = (petProfile: PetProfile, walkDuration: number = 30) => {
  const [walkState, setWalkState] = useState<WalkState>({
    status: 'planning',
    startTime: null,
    endTime: null,
    currentLocation: null,
    route: [],
    distance: 0,
    duration: 0,
    steps: 0,
    calories: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    elevationGain: 0,
    photos: []
  });

  const [environmentalState, setEnvironmentalState] = useState<EnvironmentalState>({
    current: null,
    history: [],
    alerts: []
  });

  const [placeIntelligence, setPlaceIntelligence] = useState<PlaceIntelligence | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights>({
    realTimeCoaching: '',
    routeOptimization: '',
    healthRecommendations: '',
    environmentalGuidance: '',
    petBehaviorAnalysis: '',
    emergencyAlerts: []
  });

  const mapsService = useRef<AdvancedMapsService>(new AdvancedMapsService());
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start real-time location tracking
  const startWalk = useCallback(async () => {
    const startTime = Date.now();
    setWalkState(prev => ({ 
      ...prev, 
      status: 'starting', 
      startTime,
      route: [],
      distance: 0,
      duration: 0 
    }));

    // Get initial location
    try {
      const position = await getCurrentPosition();
      const initialLocation: LocationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: Date.now()
      };

      setWalkState(prev => ({ 
        ...prev, 
        currentLocation: initialLocation,
        route: [initialLocation],
        status: 'active'
      }));

      // Start continuous tracking
      startLocationTracking();
      
      // Start environmental monitoring
      startEnvironmentalMonitoring(initialLocation);
      
      // Start AI insights generation
      startAIInsights(initialLocation);

    } catch (error) {
      console.error('Failed to start walk:', error);
    }
  }, []);

  // Pause walk tracking
  const pauseWalk = useCallback(() => {
    setWalkState(prev => ({ ...prev, status: 'paused' }));
    stopLocationTracking();
    stopEnvironmentalMonitoring();
  }, []);

  // Resume walk tracking
  const resumeWalk = useCallback(() => {
    setWalkState(prev => ({ ...prev, status: 'active' }));
    startLocationTracking();
    if (walkState.currentLocation) {
      startEnvironmentalMonitoring(walkState.currentLocation);
    }
  }, [walkState.currentLocation]);

  // End walk tracking
  const endWalk = useCallback(async () => {
    const endTime = Date.now();
    setWalkState(prev => ({ ...prev, status: 'completed', endTime }));
    
    stopLocationTracking();
    stopEnvironmentalMonitoring();
    
    // Generate final AI walk report
    await generateFinalWalkReport();
  }, []);

  // Location tracking with high precision
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000
    };

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        
        // Throttle updates to every 2 seconds
        if (now - lastUpdateRef.current < 2000) return;
        lastUpdateRef.current = now;

        const newLocation: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: now
        };

        // Update walk state with new location
        setWalkState(prev => {
          const newRoute = [...prev.route, newLocation];
          const distance = calculateTotalDistance(newRoute);
          const duration = prev.startTime ? Math.floor((now - prev.startTime) / 1000 / 60) : 0;
          const steps = Math.floor(distance * 1312); // Rough steps calculation
          const calories = calculateCalories(distance, duration, petProfile);
          const avgSpeed = duration > 0 ? (distance / duration) * 60 : 0; // km/h
          const maxSpeed = Math.max(prev.maxSpeed, (newLocation.speed || 0) * 3.6); // km/h

          return {
            ...prev,
            currentLocation: newLocation,
            route: newRoute,
            distance,
            duration,
            steps,
            calories,
            avgSpeed,
            maxSpeed
          };
        });

        // Update environmental data periodically
        if (now % 30000 < 2000) { // Every 30 seconds
          updateEnvironmentalData(newLocation);
        }

        // Generate real-time AI insights
        if (now % 15000 < 2000) { // Every 15 seconds
          generateRealTimeInsights(newLocation);
        }
      },
      (error) => console.error('Location tracking error:', error),
      options
    );

    watchIdRef.current = watchId;
  }, []);

  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Environmental monitoring
  const startEnvironmentalMonitoring = useCallback(async (location: LocationData) => {
    try {
      const service = mapsService.current;
      const googleLocation = new google.maps.LatLng(location.lat, location.lng);
      
      const [airQuality, pollen, places] = await Promise.all([
        service.getAirQualityData(googleLocation),
        service.getPollenData(googleLocation),
        service.getPlaceIntelligence(googleLocation, 500)
      ]);

      const environmentalData: EnvironmentalIntelligence = {
        airQuality,
        pollen,
        weather: {
          temperature: 22, // Would fetch from weather API
          humidity: 65,
          windSpeed: 2.5,
          windDirection: 180,
          pressure: 1013,
          visibility: 10,
          uvIndex: 3,
          condition: 'Partly cloudy',
          forecast: []
        }
      };

      setEnvironmentalState(prev => ({
        current: environmentalData,
        history: [...prev.history, { timestamp: Date.now(), data: environmentalData }],
        alerts: generateEnvironmentalAlerts(environmentalData, petProfile)
      }));

      setPlaceIntelligence(places);

    } catch (error) {
      console.error('Environmental monitoring error:', error);
    }
  }, [petProfile]);

  const stopEnvironmentalMonitoring = useCallback(() => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
  }, []);

  const updateEnvironmentalData = useCallback(async (location: LocationData) => {
    if (walkState.status === 'active') {
      await startEnvironmentalMonitoring(location);
    }
  }, [walkState.status, startEnvironmentalMonitoring]);

  // AI Insights Generation
  const startAIInsights = useCallback(async (location: LocationData) => {
    await generateRealTimeInsights(location);
  }, []);

  const generateRealTimeInsights = useCallback(async (location: LocationData) => {
    try {
      const prompt = `
        Generate real-time walking insights for this situation:
        
        PET: ${petProfile.name} (${petProfile.breed}, ${petProfile.age} years, ${petProfile.size}, ${petProfile.energy_level} energy)
        HEALTH CONDITIONS: ${petProfile.health_conditions?.join(', ') || 'None'}
        ALLERGIES: ${petProfile.allergies?.join(', ') || 'None'}
        
        CURRENT STATUS:
        - Walk duration: ${walkState.duration} minutes
        - Distance: ${walkState.distance.toFixed(2)} km
        - Current speed: ${location.speed ? (location.speed * 3.6).toFixed(1) : '0'} km/h
        - Avg speed: ${walkState.avgSpeed.toFixed(1)} km/h
        
        ENVIRONMENTAL DATA:
        - Air Quality: ${environmentalState.current?.airQuality?.category || 'Unknown'}
        - Pollen Level: ${environmentalState.current?.pollen?.overall || 'Unknown'}
        - Temperature: ${environmentalState.current?.weather?.temperature || 'Unknown'}°C
        
        PLACES NEARBY: ${placeIntelligence?.nearbyParks?.length || 0} parks, ${placeIntelligence?.petServices?.length || 0} pet services
        
        Provide JSON response with these insights:
        {
          "realTimeCoaching": "Current pace and activity guidance",
          "routeOptimization": "Route suggestions based on location",
          "healthRecommendations": "Health-specific advice for this pet",
          "environmentalGuidance": "Environmental safety recommendations",
          "petBehaviorAnalysis": "Analysis of pet's likely behavior/enjoyment",
          "emergencyAlerts": ["any urgent alerts"]
        }
        
        Keep each insight under 50 words, actionable and specific to this dog breed.
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
      const insightText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const insights = JSON.parse(insightText);

      setAiInsights({
        realTimeCoaching: insights.realTimeCoaching || `Great pace for ${petProfile.name}!`,
        routeOptimization: insights.routeOptimization || 'Continue on current path',
        healthRecommendations: insights.healthRecommendations || 'Maintain steady pace',
        environmentalGuidance: insights.environmentalGuidance || 'Conditions are good',
        petBehaviorAnalysis: insights.petBehaviorAnalysis || `${petProfile.name} is enjoying the walk`,
        emergencyAlerts: insights.emergencyAlerts || []
      });

    } catch (error) {
      console.error('AI insights generation error:', error);
      setAiInsights(prev => ({
        ...prev,
        realTimeCoaching: `Perfect walk for ${petProfile.name}! Keep up the great pace.`
      }));
    }
  }, [petProfile, walkState, environmentalState.current, placeIntelligence]);

  const generateFinalWalkReport = useCallback(async () => {
    // Generate comprehensive walk report using all collected data
    const walkSummary = {
      pet: petProfile,
      metrics: walkState,
      environmental: environmentalState,
      places: placeIntelligence,
      insights: aiInsights
    };

    console.log('Final Walk Report:', walkSummary);
    // This would typically save to database
  }, [petProfile, walkState, environmentalState, placeIntelligence, aiInsights]);

  // Helper functions
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  };

  const calculateTotalDistance = (route: LocationData[]): number => {
    if (route.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < route.length; i++) {
      total += calculateDistance(route[i-1], route[i]);
    }
    return total;
  };

  const calculateDistance = (loc1: LocationData, loc2: LocationData): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateCalories = (distance: number, duration: number, pet: PetProfile): number => {
    // Breed-specific calorie calculation
    const baseRate = pet.size === 'large' ? 80 : pet.size === 'medium' ? 60 : 40;
    const energyMultiplier = pet.energy_level === 'high' ? 1.3 : pet.energy_level === 'low' ? 0.8 : 1.0;
    return Math.floor(distance * baseRate * energyMultiplier);
  };

  const generateEnvironmentalAlerts = (env: EnvironmentalIntelligence, pet: PetProfile): Array<{
    type: 'air_quality' | 'weather' | 'pollen';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: number;
  }> => {
    const alerts = [];
    const now = Date.now();

    // Air quality alerts
    if (env.airQuality.aqi > 100) {
      alerts.push({
        type: 'air_quality' as const,
        severity: env.airQuality.aqi > 150 ? 'high' as const : 'medium' as const,
        message: `Air quality is ${env.airQuality.category}. Consider shorter walk.`,
        timestamp: now
      });
    }

    // Pollen alerts for pets with allergies
    if (pet.allergies?.includes('pollen') && env.pollen.overall > 3) {
      alerts.push({
        type: 'pollen' as const,
        severity: 'medium' as const,
        message: 'High pollen levels detected. Monitor for allergy symptoms.',
        timestamp: now
      });
    }

    // Weather alerts
    if (env.weather.temperature > 25 && pet.size === 'large') {
      alerts.push({
        type: 'weather' as const,
        severity: 'medium' as const,
        message: 'Warm weather - ensure adequate hydration breaks.',
        timestamp: now
      });
    }

    return alerts;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
      stopEnvironmentalMonitoring();
    };
  }, [stopLocationTracking, stopEnvironmentalMonitoring]);

  return {
    walkState,
    environmentalState,
    placeIntelligence,
    aiInsights,
    startWalk,
    pauseWalk,
    resumeWalk,
    endWalk,
    isTracking: walkState.status === 'active'
  };
};
