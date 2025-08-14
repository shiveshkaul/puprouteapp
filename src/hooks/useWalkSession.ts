import { useEffect, useRef, useState } from "react";

type Point = { lat: number; lng: number; ts: number; accuracy?: number; speed?: number };
type State = "idle" | "running" | "paused" | "ended";

export function useWalkSession() {
  const [state, setState] = useState<State>("idle");
  const [points, setPoints] = useState<Point[]>([]);
  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [distanceM, setDistanceM] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [current, setCurrent] = useState<Point | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);
  const pausedAt = useRef<number | null>(null);
  const pausedTotal = useRef<number>(0);
  const timer = useRef<number | null>(null);

  const haversine = (a: Point, b: Point) => {
    const R = 6371000; // Earth's radius in meters
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };

  const startTimer = () => {
    if (timer.current) cancelAnimationFrame(timer.current as number);
    const tick = () => {
      if (startedAt.current && state === "running") {
        setDurationMs(Date.now() - startedAt.current - pausedTotal.current);
      }
      timer.current = requestAnimationFrame(tick);
    };
    timer.current = requestAnimationFrame(tick);
  };

  const startWalk = () => {
    if (state !== "idle" && state !== "ended") return;
    
    setError(null);
    startedAt.current = Date.now();
    pausedTotal.current = 0;
    setPoints([]);
    setDistanceM(0);
    setDurationMs(0);
    setState("running");
    startTimer();

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setState("idle");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p: Point = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: Date.now(),
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed ?? undefined,
        };
        
        setCurrent(p);
        setPoints((prev) => {
          const next = prev.concat(p);
          if (prev.length === 0) {
            // First point - set as start
            setStart(p);
          } else if (prev.length > 0) {
            // Calculate distance from last point
            const last = prev[prev.length - 1];
            const additionalDistance = haversine(last, p);
            // Only add distance if movement is significant (>2m to filter GPS noise)
            if (additionalDistance > 2) {
              setDistanceM((d) => d + additionalDistance);
            }
          }
          return next;
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(`Location error: ${error.message}`);
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 1000, 
        timeout: 15000 
      }
    );
  };

  const pauseWalk = () => {
    if (state !== "running") return;
    setState("paused");
    pausedAt.current = Date.now();
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timer.current) {
      cancelAnimationFrame(timer.current);
      timer.current = null;
    }
  };

  const resumeWalk = () => {
    if (state !== "paused") return;
    setState("running");
    if (pausedAt.current) {
      pausedTotal.current += Date.now() - pausedAt.current;
    }
    startTimer();
    
    // Re-arm geolocation watch
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p: Point = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: Date.now(),
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed ?? undefined,
        };
        setCurrent(p);
        setPoints((prev) => {
          const next = prev.concat(p);
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const additionalDistance = haversine(last, p);
            if (additionalDistance > 2) {
              setDistanceM((d) => d + additionalDistance);
            }
          }
          return next;
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(`Location error: ${error.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  };

  const endWalk = () => {
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
  };

  // Cleanup on unmount
  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    if (timer.current) cancelAnimationFrame(timer.current);
  }, []);

  // Derived metrics
  const avgSpeedMps = durationMs > 0 ? distanceM / (durationMs / 1000) : 0;
  const avgSpeedKmh = avgSpeedMps * 3.6;
  const calories = Math.round(distanceM * 0.05); // Simple calorie calculation
  const pace = avgSpeedMps > 0 ? (1000 / 60) / avgSpeedMps : 0; // minutes per km

  return {
    state,
    start,
    end,
    current,
    points,
    distanceM,
    durationMs,
    avgSpeedMps,
    avgSpeedKmh,
    calories,
    pace,
    error,
    startWalk,
    pauseWalk,
    resumeWalk,
    endWalk,
  };
}
