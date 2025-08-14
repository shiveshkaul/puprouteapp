import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  Camera, 
  Navigation, 
  MapPin, 
  Clock, 
  Route, 
  Heart,
  Thermometer,
  Footprints,
  Zap,
  Share2,
  AlertTriangle,
  Target,
  Droplets,
  TreePine,
  RotateCcw,
  ScanLine
} from 'lucide-react';
import { GoogleMapsService } from '@/services/GoogleMapsService';
import { useAuth } from '@/hooks/useAuth';

interface WalkStats {
  durationMs: number;
  distanceMeters: number;
  avgPaceMinPerKm: number;
  currentPaceMinPerKm: number;
  calories: number;
  steps: number;
  elevationGainM: number;
  maxSpeedKmh: number;
}

interface WalkEvent {
  id: string;
  type: 'pee' | 'poo' | 'water' | 'treat' | 'note' | 'photo' | 'break';
  timestamp: number;
  location: { lat: number; lng: number };
  notes?: string;
  photoUrl?: string;
  petId?: string;
}

interface SelectedRoute {
  id: string;
  polyline: string;
  waypoints: Array<{
    name: string;
    location: { lat: number; lng: number };
  }>;
  distanceMeters: number;
  durationSec: number;
}

interface RealtimeWalkTrackingProps {
  selectedRoute?: SelectedRoute;
  pets: any[];
  onWalkComplete: (summary: any) => void;
}

export const RealtimeWalkTracking: React.FC<RealtimeWalkTrackingProps> = ({
  selectedRoute,
  pets = [],
  onWalkComplete
}) => {
  const { user } = useAuth();
  
  // Walk state
  const [walkStatus, setWalkStatus] = useState<'idle' | 'starting' | 'active' | 'paused' | 'completed'>('idle');
  const [walkId, setWalkId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  
  // Location tracking
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; accuracy: number; heading?: number } | null>(null);
  const [pathCoordinates, setPathCoordinates] = useState<Array<{ lat: number; lng: number; timestamp: number }>>([]);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [nextWaypoint, setNextWaypoint] = useState<any>(null);
  const [distanceToWaypoint, setDistanceToWaypoint] = useState<number>(0);
  
  // Stats
  const [walkStats, setWalkStats] = useState<WalkStats>({
    durationMs: 0,
    distanceMeters: 0,
    avgPaceMinPerKm: 0,
    currentPaceMinPerKm: 0,
    calories: 0,
    steps: 0,
    elevationGainM: 0,
    maxSpeedKmh: 0
  });
  
  // Events and interactions
  const [walkEvents, setWalkEvents] = useState<WalkEvent[]>([]);
  const [isRecordingEvent, setIsRecordingEvent] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  
  // Map and services
  const mapRef = useRef<HTMLDivElement | null>(null);
  const watchId = useRef<number | null>(null);
  const [mapsService] = useState(() => new GoogleMapsService());
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [routePolyline, setRoutePolyline] = useState<google.maps.Polyline | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [pathPolyline, setPathPolyline] = useState<google.maps.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const defaultCenter = selectedRoute?.waypoints[0]?.location || { lat: 48.6639, lng: 10.1524 };
      
      const newMap = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'simplified' }]
          }
        ]
      });

      setMap(newMap);

      // Add planned route if available with paw-print styling
      if (selectedRoute?.polyline) {
        const polyline = new google.maps.Polyline({
          path: google.maps.geometry.encoding.decodePath(selectedRoute.polyline),
          geodesic: true,
          strokeColor: '#FF6B9D',
          strokeOpacity: 0.8,
          strokeWeight: 6,
          icons: [
            {
              icon: {
                path: 'M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M8.5 9C9.33 9 10 9.67 10 10.5S9.33 12 8.5 12 7 11.33 7 10.5 7.67 9 8.5 9M15.5 9C16.33 9 17 9.67 17 10.5S16.33 12 15.5 12 14 11.33 14 10.5 14.67 9 15.5 9M12 13C12.83 13 13.5 13.67 13.5 14.5S12.83 16 12 16 10.5 15.33 10.5 14.5 11.17 13 12 13M12 17C13.1 17 14 17.9 14 19S13.1 21 12 21 10 20.1 10 19 10.9 17 12 17Z', // Paw print SVG path
                fillColor: '#FF6B9D',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 1,
                scale: 0.5
              },
              offset: '0%',
              repeat: '50px'
            }
          ]
        });
        polyline.setMap(newMap);
        setRoutePolyline(polyline);
      }

      // Add waypoint markers
      if (selectedRoute?.waypoints) {
        selectedRoute.waypoints.forEach((waypoint, index) => {
          new google.maps.Marker({
            position: waypoint.location,
            map: newMap,
            title: waypoint.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4F46E5',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }
          });
        });
      }
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry&callback=initMap`;
      script.async = true;
      (window as any).initMap = initMap;
      document.head.appendChild(script);
    }
  }, [selectedRoute]);

  // Start GPS tracking
  const startGPSTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    };

    const success = (position: GeolocationPosition) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading || undefined
      };

      setCurrentLocation(newLocation);

      // Only track path when walk is active
      if (walkStatus === 'active') {
        const timestamp = Date.now();
        setPathCoordinates(prev => [...prev, { 
          lat: newLocation.lat, 
          lng: newLocation.lng, 
          timestamp 
        }]);

        // Update stats
        updateWalkStats(newLocation, timestamp);
        
        // Check if off route
        if (selectedRoute?.polyline) {
          checkRouteAdherence(newLocation);
        }
        
        // Update next waypoint info
        updateWaypointInfo(newLocation);
      }

      // Update map
      if (map) {
        map.setCenter(newLocation);
        
        if (userMarker) {
          userMarker.setPosition(newLocation);
        } else {
          const marker = new google.maps.Marker({
            position: newLocation,
            map,
            title: 'Your location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#FF6B9D',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3
            }
          });
          setUserMarker(marker);
        }

        // Update path polyline
        if (walkStatus === 'active' && pathCoordinates.length > 1) {
          if (pathPolyline) {
            pathPolyline.setPath(pathCoordinates);
          } else {
            const polyline = new google.maps.Polyline({
              path: pathCoordinates,
              geodesic: true,
              strokeColor: '#10B981',
              strokeOpacity: 1,
              strokeWeight: 8,
              icons: [
                {
                  icon: {
                    path: 'M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M8.5 9C9.33 9 10 9.67 10 10.5S9.33 12 8.5 12 7 11.33 7 10.5 7.67 9 8.5 9M15.5 9C16.33 9 17 9.67 17 10.5S16.33 12 15.5 12 14 11.33 14 10.5 14.67 9 15.5 9M12 13C12.83 13 13.5 13.67 13.5 14.5S12.83 16 12 16 10.5 15.33 10.5 14.5 11.17 13 12 13M12 17C13.1 17 14 17.9 14 19S13.1 21 12 21 10 20.1 10 19 10.9 17 12 17Z', // Paw print SVG path
                    fillColor: '#10B981',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 1,
                    scale: 0.6
                  },
                  offset: '0%',
                  repeat: '40px'
                }
              ]
            });
            polyline.setMap(map);
            setPathPolyline(polyline);
          }
        }
      }
    };

    const error = (err: GeolocationPositionError) => {
      console.warn('GPS error:', err);
    };

    watchId.current = navigator.geolocation.watchPosition(success, error, options);
  }, [walkStatus, map, pathCoordinates, userMarker, pathPolyline, selectedRoute]);

  // Stop GPS tracking
  const stopGPSTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  // Start walk
  const startWalk = async () => {
    if (!currentLocation) {
      alert('Waiting for GPS location...');
      return;
    }

    setWalkStatus('starting');
    
    try {
      // Generate walk ID
      const newWalkId = `walk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setWalkId(newWalkId);
      
      // Start timing
      const now = Date.now();
      setStartTime(now);
      
      // Initialize path with current location
      setPathCoordinates([{ 
        lat: currentLocation.lat, 
        lng: currentLocation.lng, 
        timestamp: now 
      }]);
      
      // Generate share token for live sharing
      setShareToken(`share_${newWalkId}`);
      
      setWalkStatus('active');
      console.log('🚀 Walk started:', newWalkId);
      
    } catch (error) {
      console.error('Failed to start walk:', error);
      setWalkStatus('idle');
    }
  };

  // Pause/Resume walk
  const togglePause = () => {
    if (walkStatus === 'active') {
      setWalkStatus('paused');
      setPausedTime(prev => prev + (Date.now() - (startTime || 0)));
    } else if (walkStatus === 'paused') {
      setStartTime(Date.now());
      setWalkStatus('active');
    }
  };

  // End walk
  const endWalk = async () => {
    if (walkStatus !== 'active' && walkStatus !== 'paused') return;

    setWalkStatus('completed');
    stopGPSTracking();

    // Calculate final stats
    const endTime = Date.now();
    const totalDuration = walkStatus === 'paused' ? 
      pausedTime : 
      endTime - (startTime || 0);

    const finalStats = {
      ...walkStats,
      durationMs: totalDuration
    };

    // Generate walk summary
    const summary = {
      walkId,
      pets: pets.map(pet => pet.id),
      stats: finalStats,
      events: walkEvents,
      path: pathCoordinates,
      startTime,
      endTime,
      route: selectedRoute
    };

    console.log('🏁 Walk completed:', summary);
    onWalkComplete(summary);
  };

  // Update walk statistics
  const updateWalkStats = (location: any, timestamp: number) => {
    if (pathCoordinates.length === 0) return;

    const lastCoord = pathCoordinates[pathCoordinates.length - 1];
    const distance = calculateDistance(lastCoord, location);
    const timeDiff = timestamp - lastCoord.timestamp;
    
    if (distance > 0 && timeDiff > 0) {
      const speed = (distance / 1000) / (timeDiff / 3600000); // km/h
      const currentPace = speed > 0 ? 60 / speed : 0; // min/km
      
      setWalkStats(prev => {
        const newDistance = prev.distanceMeters + distance;
        const activeDuration = walkStatus === 'active' ? 
          (timestamp - (startTime || 0)) - pausedTime : 
          prev.durationMs;
        const avgSpeed = newDistance > 0 && activeDuration > 0 ? 
          (newDistance / 1000) / (activeDuration / 3600000) : 0;
        const avgPace = avgSpeed > 0 ? 60 / avgSpeed : 0;
        
        return {
          ...prev,
          durationMs: activeDuration,
          distanceMeters: newDistance,
          avgPaceMinPerKm: avgPace,
          currentPaceMinPerKm: currentPace,
          calories: Math.round(newDistance * 0.05 * (pets.reduce((sum, pet) => sum + (pet.weight || 25), 0) / pets.length)),
          steps: Math.round(newDistance * 1.4), // ~1.4 steps per meter
          maxSpeedKmh: Math.max(prev.maxSpeedKmh, speed)
        };
      });
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (coord1: any, coord2: any): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Check route adherence
  const checkRouteAdherence = (location: any) => {
    if (!selectedRoute?.polyline) return;

    // This would use Roads API to snap to route and check distance
    // For now, simple distance check to planned route
    const routePath = google.maps.geometry.encoding.decodePath(selectedRoute.polyline);
    let minDistance = Infinity;
    
    for (const point of routePath) {
      const distance = calculateDistance(location, point);
      minDistance = Math.min(minDistance, distance);
    }
    
    setIsOffRoute(minDistance > 40); // 40m threshold
  };

  // Update waypoint information
  const updateWaypointInfo = (location: any) => {
    if (!selectedRoute?.waypoints || selectedRoute.waypoints.length === 0) return;

    let closestWaypoint = null;
    let minDistance = Infinity;

    for (const waypoint of selectedRoute.waypoints) {
      const distance = calculateDistance(location, waypoint.location);
      if (distance < minDistance) {
        minDistance = distance;
        closestWaypoint = waypoint;
      }
    }

    if (closestWaypoint && minDistance < 1000) { // Within 1km
      setNextWaypoint(closestWaypoint);
      setDistanceToWaypoint(minDistance);
    } else {
      setNextWaypoint(null);
      setDistanceToWaypoint(0);
    }
  };

  // Record walk event
  const recordEvent = (type: WalkEvent['type'], notes?: string) => {
    if (!currentLocation) return;

    const event: WalkEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      location: currentLocation,
      notes,
      petId: pets.length === 1 ? pets[0].id : undefined
    };

    setWalkEvents(prev => [...prev, event]);
    console.log('📝 Event recorded:', event);
  };

  // Start GPS tracking when component mounts
  useEffect(() => {
    startGPSTracking();
    return () => stopGPSTracking();
  }, [startGPSTracking, stopGPSTracking]);

  // Format time
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  // Format pace
  const formatPace = (minPerKm: number): string => {
    if (!minPerKm || !isFinite(minPerKm)) return '--:--';
    const mins = Math.floor(minPerKm);
    const secs = Math.round((minPerKm - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">🐾 Live Walk Tracking</h1>
        <Badge 
          variant={
            walkStatus === 'active' ? 'default' :
            walkStatus === 'paused' ? 'secondary' :
            walkStatus === 'completed' ? 'outline' : 'destructive'
          }
          className="mt-2"
        >
          {walkStatus.toUpperCase()}
        </Badge>
      </div>

      {/* GPS Status */}
      {currentLocation && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            📍 GPS: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)} 
            (±{Math.round(currentLocation.accuracy)}m)
          </AlertDescription>
        </Alert>
      )}

      {/* Off Route Warning */}
      {isOffRoute && walkStatus === 'active' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You're off the planned route. Would you like to rejoin or find a new path?
          </AlertDescription>
        </Alert>
      )}

      {/* Next Waypoint */}
      {nextWaypoint && walkStatus === 'active' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Target className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Next: {nextWaypoint.name} in {formatDistance(distanceToWaypoint)}
          </AlertDescription>
        </Alert>
      )}

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="w-full h-80 rounded-lg"
            style={{ minHeight: '320px' }}
          />
        </CardContent>
      </Card>

      {/* Walk Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-green-500" />
            Walk Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto text-blue-500 mb-1" />
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-lg">{formatTime(walkStats.durationMs)}</p>
            </div>
            <div className="text-center">
              <Route className="h-6 w-6 mx-auto text-green-500 mb-1" />
              <p className="text-sm text-gray-500">Distance</p>
              <p className="font-medium text-lg">{formatDistance(walkStats.distanceMeters)}</p>
            </div>
            <div className="text-center">
              <Zap className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
              <p className="text-sm text-gray-500">Avg Pace</p>
              <p className="font-medium text-lg">{formatPace(walkStats.avgPaceMinPerKm)}/km</p>
            </div>
            <div className="text-center">
              <Heart className="h-6 w-6 mx-auto text-red-500 mb-1" />
              <p className="text-sm text-gray-500">Calories</p>
              <p className="font-medium text-lg">{walkStats.calories}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Steps</p>
              <p className="font-medium">{walkStats.steps.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Pace</p>
              <p className="font-medium">{formatPace(walkStats.currentPaceMinPerKm)}/km</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Speed</p>
              <p className="font-medium">{walkStats.maxSpeedKmh.toFixed(1)} km/h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center gap-4">
            {walkStatus === 'idle' && (
              <Button
                size="lg"
                onClick={startWalk}
                disabled={!currentLocation}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Walk
              </Button>
            )}
            
            {(walkStatus === 'active' || walkStatus === 'paused') && (
              <>
                <Button
                  size="lg"
                  variant={walkStatus === 'paused' ? 'default' : 'secondary'}
                  onClick={togglePause}
                >
                  {walkStatus === 'paused' ? (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={endWalk}
                >
                  <Square className="h-5 w-5 mr-2" />
                  End Walk
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {walkStatus === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => recordEvent('pee')}
                className="flex items-center gap-2"
              >
                <Droplets className="h-4 w-4 text-yellow-500" />
                Pee Break
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => recordEvent('poo')}
                className="flex items-center gap-2"
              >
                <Droplets className="h-4 w-4 text-brown-500" />
                Poo Break
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => recordEvent('water')}
                className="flex items-center gap-2"
              >
                <Droplets className="h-4 w-4 text-blue-500" />
                Water
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => recordEvent('treat')}
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4 text-pink-500" />
                Treat
              </Button>
            </div>
            
            <div className="flex gap-3 mt-3">
              <Button 
                variant="outline" 
                onClick={() => setIsRecordingEvent(true)}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowStreetView(!showStreetView)}
                className="flex-1"
              >
                <ScanLine className="h-4 w-4 mr-2" />
                Street View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Walk Events */}
      {walkEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-indigo-500" />
              Walk Events ({walkEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {walkEvents.slice(-5).reverse().map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  {event.notes && (
                    <span className="text-sm text-gray-700">{event.notes}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Share */}
      {shareToken && walkStatus === 'active' && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-500" />
              Live Share
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Share your live walk progress with family and friends!
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={`${window.location.origin}/share/${shareToken}`}
                readOnly
                className="flex-1 p-2 border rounded text-sm bg-white"
              />
              <Button 
                size="sm"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`)}
              >
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealtimeWalkTracking;
