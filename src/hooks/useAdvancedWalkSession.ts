import { useEffect, useRef, useState, useCallback } from "react";

export type Point = { 
  lat: number; 
  lng: number; 
  ts: number; 
  accuracy?: number; 
  speed?: number;
  altitude?: number;
};

export type WalkState = "idle" | "planning" | "running" | "paused" | "ended";

export type WalkPhoto = {
  id: string;
  url: string;
  position: Point;
  caption?: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  dataUrl: string;
};

export interface WalkStats {
  distanceM: number;
  durationMs: number;
  avgSpeedMps: number;
  maxSpeedMps: number;
  calories: number;
  elevationGainM: number;
  pausedTimeMs: number;
  steps: number;
}

export interface EnvironmentalData {
  temperature: number;
  windSpeed: number;
  airQuality: string;
  humidity?: number;
  pressure?: number;
}

export function useAdvancedWalkSession() {
  const [state, setState] = useState<WalkState>("idle");
  const [points, setPoints] = useState<Point[]>([]);
  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [current, setCurrent] = useState<Point | null>(null);
  const [photos, setPhotos] = useState<WalkPhoto[]>([]);
  const [stats, setStats] = useState<WalkStats>({
    distanceM: 0,
    durationMs: 0,
    avgSpeedMps: 0,
    maxSpeedMps: 0,
    calories: 0,
    elevationGainM: 0,
    pausedTimeMs: 0,
    steps: 0
  });

  // Enhanced state for all features
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timing refs
  const watchId = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);
  const pausedAt = useRef<number | null>(null);
  const pausedTotal = useRef<number>(0);
  const timer = useRef<number | null>(null);
  const autoPauseTimer = useRef<number | null>(null);

  // Auto-pause detection
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const lowSpeedStart = useRef<number | null>(null);

  // Distance calculation using Haversine formula
  const haversine = useCallback((a: Point, b: Point): number => {
    const R = 6371000; // Earth's radius in meters
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }, []);

  // Calculate elevation gain
  const calculateElevationGain = useCallback((points: Point[]): number => {
    let gain = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      if (prev.altitude && curr.altitude && curr.altitude > prev.altitude) {
        gain += curr.altitude - prev.altitude;
      }
    }
    return gain;
  }, []);

  // Estimate steps based on distance and movement pattern
  const calculateSteps = useCallback((distanceM: number, avgSpeed: number): number => {
    // Average step length: 0.7-0.8m, varies with speed
    const stepLength = Math.min(0.8, 0.5 + (avgSpeed * 0.1));
    return Math.round(distanceM / stepLength);
  }, []);

  // Timer management
  const startTimer = useCallback(() => {
    if (timer.current) cancelAnimationFrame(timer.current);
    const tick = () => {
      if (startedAt.current && state === "running") {
        const elapsed = Date.now() - startedAt.current - pausedTotal.current;
        setStats(prev => ({ ...prev, durationMs: elapsed }));
      }
      timer.current = requestAnimationFrame(tick);
    };
    timer.current = requestAnimationFrame(tick);
  }, [state]);

  // Auto-pause detection
  const checkAutoPause = useCallback((speed: number | null) => {
    const threshold = 0.3; // m/s (about 1 km/h)
    
    if (state !== "running") return;

    if (speed !== null && speed < threshold) {
      if (!lowSpeedStart.current) {
        lowSpeedStart.current = Date.now();
      } else if (Date.now() - lowSpeedStart.current > 20000) { // 20 seconds
        if (!isAutoPaused) {
          setIsAutoPaused(true);
          pausedAt.current = Date.now();
        }
      }
    } else {
      lowSpeedStart.current = null;
      if (isAutoPaused) {
        setIsAutoPaused(false);
        if (pausedAt.current) {
          pausedTotal.current += Date.now() - pausedAt.current;
          pausedAt.current = null;
        }
      }
    }
  }, [state, isAutoPaused]);

  // Position tracking
  const handlePositionUpdate = useCallback((pos: GeolocationPosition) => {
    const point: Point = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      ts: Date.now(),
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed || undefined,
      altitude: pos.coords.altitude || undefined,
    };

    setCurrent(point);
    
    if (state === "running" && !isAutoPaused) {
      setPoints(prev => {
        const next = [...prev, point];
        
        // Update stats
        if (next.length > 1) {
          const lastPoint = next[next.length - 2];
          const segmentDistance = haversine(lastPoint, point);
          
          setStats(prevStats => {
            const newDistance = prevStats.distanceM + segmentDistance;
            const duration = prevStats.durationMs / 1000; // Convert to seconds
            const avgSpeed = duration > 0 ? newDistance / duration : 0;
            const maxSpeed = Math.max(prevStats.maxSpeedMps, point.speed || 0);
            const calories = newDistance * 0.05; // Simple calorie calculation
            const elevationGain = calculateElevationGain(next);
            const steps = calculateSteps(newDistance, avgSpeed);
            
            return {
              ...prevStats,
              distanceM: newDistance,
              avgSpeedMps: avgSpeed,
              maxSpeedMps: maxSpeed,
              calories,
              elevationGainM: elevationGain,
              steps
            };
          });
        }
        
        return next;
      });
    }

    // Check for auto-pause
    checkAutoPause(point.speed || null);
  }, [state, isAutoPaused, haversine, calculateElevationGain, calculateSteps, checkAutoPause]);

  // Walk control functions
  const startWalk = useCallback(() => {
    if (state !== "idle" && state !== "ended") return;
    
    setState("running");
    startedAt.current = Date.now();
    pausedTotal.current = 0;
    setPoints([]);
    setPhotos([]);
    setStats({
      distanceM: 0,
      durationMs: 0,
      avgSpeedMps: 0,
      maxSpeedMps: 0,
      calories: 0,
      elevationGainM: 0,
      pausedTimeMs: 0,
      steps: 0
    });
    
    startTimer();

    // Start GPS tracking
    watchId.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (error) => {
        console.error('GPS Error:', error);
        // Could show user-friendly error here
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 1000, 
        timeout: 15000 
      }
    );

    // Get initial position for start marker
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const startPoint: Point = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: Date.now(),
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed || undefined,
          altitude: pos.coords.altitude || undefined,
        };
        setStart(startPoint);
        setCurrent(startPoint);
      },
      console.error,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [state, startTimer, handlePositionUpdate]);

  const pauseWalk = useCallback(() => {
    if (state !== "running") return;
    setState("paused");
    pausedAt.current = Date.now();
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, [state]);

  const resumeWalk = useCallback(() => {
    if (state !== "paused") return;
    setState("running");
    
    if (pausedAt.current) {
      pausedTotal.current += Date.now() - pausedAt.current;
      pausedAt.current = null;
    }
    
    setStats(prev => ({ ...prev, pausedTimeMs: pausedTotal.current }));
    
    // Restart GPS tracking
    watchId.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      console.error,
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
    
    startTimer();
  }, [state, handlePositionUpdate, startTimer]);

  const endWalk = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timer.current) {
      cancelAnimationFrame(timer.current);
      timer.current = null;
    }
    
    setEnd(current);
    setState("ended");
    
    // Final stats calculation
    if (pausedAt.current) {
      pausedTotal.current += Date.now() - pausedAt.current;
    }
    setStats(prev => ({ 
      ...prev, 
      pausedTimeMs: pausedTotal.current 
    }));
  }, [current]);

  const addPhoto = useCallback((photoUrl: string, caption?: string) => {
    if (!current) return;
    
    const photo: WalkPhoto = {
      id: Date.now().toString(),
      url: photoUrl,
      position: current,
      caption,
      timestamp: Date.now(),
      latitude: current.lat,
      longitude: current.lng,
      dataUrl: photoUrl
    };
    
    setPhotos(prev => [...prev, photo]);
  }, [current]);

  // Enhanced photo capture with camera
  const takePhoto = useCallback(async () => {
    if (!current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        stream.getTracks().forEach(track => track.stop());
        
        const photo: WalkPhoto = {
          id: Date.now().toString(),
          url: dataUrl,
          position: current,
          timestamp: Date.now(),
          latitude: current.lat,
          longitude: current.lng,
          dataUrl: dataUrl
        };
        
        setPhotos(prev => [...prev, photo]);
      };
    } catch (err) {
      setError('Camera access denied or unavailable');
      console.error('Camera error:', err);
    }
  }, [current]);

  // Environmental data fetching
  const fetchEnvironmentalData = useCallback(async (lat: number, lng: number) => {
    try {
      // Mock environmental data - replace with real API
      const mockData: EnvironmentalData = {
        temperature: Math.round(20 + Math.random() * 15),
        windSpeed: Math.round(Math.random() * 20),
        airQuality: ['Good', 'Moderate', 'Poor'][Math.floor(Math.random() * 3)],
        humidity: Math.round(40 + Math.random() * 40),
        pressure: Math.round(1010 + Math.random() * 30)
      };
      setEnvironmentalData(mockData);
    } catch (err) {
      console.error('Environmental data error:', err);
    }
  }, []);

  const generateShareableLink = useCallback(() => {
    // In real implementation, this would generate a shareable link
    // For now, return a mock URL
    return `${window.location.origin}/walk-share/${Date.now()}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      if (timer.current) {
        cancelAnimationFrame(timer.current);
      }
      if (autoPauseTimer.current) {
        clearTimeout(autoPauseTimer.current);
      }
    };
  }, []);

  return {
    // State
    state,
    start,
    end,
    current,
    points,
    photos,
    stats,
    isAutoPaused,
    environmentalData,
    error,
    
    // Enhanced location properties (aliases for components)
    startLocation: start,
    endLocation: end,
    currentLocation: current,
    routePoints: points,
    
    // Enhanced stats properties (aliases for components)
    distance: stats.distanceM,
    walkDuration: stats.durationMs,
    averageSpeed: stats.avgSpeedMps * 3.6, // Convert to km/h
    currentSpeed: (current?.speed || 0) * 3.6, // Convert to km/h
    calories: Math.round(stats.calories),
    steps: stats.steps,
    elevationGain: Math.round(stats.elevationGainM),
    
    // Actions
    startWalk,
    pauseWalk,
    resumeWalk,
    endWalk,
    addPhoto,
    takePhoto,
    generateShareableLink,
    
    // Computed values
    isActive: state === "running" || state === "paused",
    hasStarted: state !== "idle",
    hasEnded: state === "ended",
    totalTimeMs: stats.durationMs + stats.pausedTimeMs,
    pace: stats.avgSpeedMps > 0 ? (1000 / stats.avgSpeedMps) / 60 : 0, // minutes per km
  };
}
