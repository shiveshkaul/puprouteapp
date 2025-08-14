import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdvancedWalkSession } from '@/hooks/useAdvancedWalkSession';
import { 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaRoute, 
  FaClock, 
  FaFire,
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaStreetView,
  FaCamera,
  FaArrowLeft,
  FaRunning,
  FaPaw,
  FaMountain,
  FaThermometerHalf,
  FaWind,
  FaEye,
  FaLocationArrow,
  FaChartLine
} from 'react-icons/fa';

interface Pet {
  id: string;
  name: string;
  breed: string;
  photo_url?: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  energy_level: 'low' | 'medium' | 'high';
}

interface Walker {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  rating: number;
}

interface LiveWalkTrackingProps {
  pets: Pet[];
  walker?: Walker;
  duration: number;
  startLocation?: { lat: number; lng: number };
  onEndWalk: () => void;
}

const LiveWalkTracking: React.FC<LiveWalkTrackingProps> = ({
  pets,
  walker,
  duration,
  startLocation: propStartLocation,
  onEndWalk
}) => {
  const {
    state,
    startLocation,
    endLocation,
    currentLocation,
    routePoints,
    distance,
    walkDuration,
    averageSpeed,
    currentSpeed,
    calories,
    steps,
    elevationGain,
    pace,
    isAutoPaused,
    photos,
    environmentalData,
    error,
    startWalk,
    pauseWalk,
    resumeWalk,
    endWalk,
    takePhoto
  } = useAdvancedWalkSession();

  // Map and UI state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [streetViewPanorama, setStreetViewPanorama] = useState<google.maps.StreetViewPanorama | null>(null);
  const [streetViewMode, setStreetViewMode] = useState(false);
  const [showEnvironmentalData, setShowEnvironmentalData] = useState(true);
  const [followMode, setFollowMode] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  // Google Maps objects
  const [currentMarker, setCurrentMarker] = useState<google.maps.Marker | null>(null);
  const [startMarker, setStartMarker] = useState<google.maps.Marker | null>(null);
  const [endMarker, setEndMarker] = useState<google.maps.Marker | null>(null);
  const [routePolyline, setRoutePolyline] = useState<google.maps.Polyline | null>(null);
  const [accuracyCircle, setAccuracyCircle] = useState<google.maps.Circle | null>(null);
  const [photoMarkers, setPhotoMarkers] = useState<google.maps.Marker[]>([]);

  // Center for map view - prioritize current location, then prop start location, then hook start location
  const center = useMemo(() => 
    currentLocation ?? propStartLocation ?? startLocation ?? { lat: 48.6639, lng: 10.1524 }, 
    [currentLocation, propStartLocation, startLocation]
  );

  // Load Google Maps
  useEffect(() => {
    if (mapLoaded) return;

    const initializeMap = () => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 18,
        mapId: 'ADVANCED_WALK_TRACKING',
        gestureHandling: 'greedy',
        zoomControl: true,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      const streetView = new google.maps.StreetViewPanorama(mapRef.current, {
        position: center,
        pov: { heading: 34, pitch: 10 },
        visible: false
      });

      map.setStreetView(streetView);
      setMapInstance(map);
      setStreetViewPanorama(streetView);
      setMapLoaded(true);
    };

    const loadGoogleMapsAPI = () => {
      // Use the configured Google Maps API key
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAlY5Q1LZkbXGsz-BO0amHcceQpa_HeaCo';
      
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        // Load mock Google Maps for demo
        import('@/lib/mockGoogleMaps').then(() => {
          console.log('🗺️ Using Demo Maps (Real Google Maps API key not configured)');
          initializeMap();
        });
      } else {
        // Load real Google Maps API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.onload = () => {
          console.log('🗺️ Google Maps API loaded successfully');
          initializeMap();
        };
        script.onerror = () => {
          console.log('🗺️ Google Maps API failed, falling back to demo maps');
          // Fallback to mock maps if real API fails
          import('@/lib/mockGoogleMaps').then(() => {
            initializeMap();
          });
        };
        document.head.appendChild(script);
      }
    };

    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      loadGoogleMapsAPI();
    }
  }, [center]);

  // Update map markers and polyline
  useEffect(() => {
    if (!mapInstance || !mapLoaded) return;

    // Clear existing markers
    currentMarker?.setMap(null);
    startMarker?.setMap(null);
    endMarker?.setMap(null);
    routePolyline?.setMap(null);
    accuracyCircle?.setMap(null);
    photoMarkers.forEach(marker => marker.setMap(null));

    // Current position blue dot with accuracy circle
    if (currentLocation) {
      const newCurrentMarker = new google.maps.Marker({
        position: currentLocation,
        map: mapInstance,
        title: 'Current Position',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="3"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
              <circle cx="12" cy="12" r="2" fill="#3B82F6"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        },
        zIndex: 1000
      });

      const newAccuracyCircle = new google.maps.Circle({
        strokeColor: '#3B82F6',
        strokeOpacity: 0.3,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        map: mapInstance,
        center: currentLocation,
        radius: 10
      });

      setCurrentMarker(newCurrentMarker);
      setAccuracyCircle(newAccuracyCircle);

      if (followMode && state === 'running') {
        mapInstance.panTo(currentLocation);
      }
    }

    // Start marker
    if (startLocation) {
      const newStartMarker = new google.maps.Marker({
        position: startLocation,
        map: mapInstance,
        title: 'Walk Start',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#10B981" stroke="white" stroke-width="3"/>
              <path d="M10 16L14 20L22 12" stroke="white" stroke-width="3" fill="none"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });
      setStartMarker(newStartMarker);
    }

    // End marker
    if (endLocation) {
      const newEndMarker = new google.maps.Marker({
        position: endLocation,
        map: mapInstance,
        title: 'Walk End',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#EF4444" stroke="white" stroke-width="3"/>
              <rect x="10" y="10" width="12" height="12" fill="white" rx="2"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });
      setEndMarker(newEndMarker);
    }

    // Route polyline with paw prints
    if (routePoints.length > 1) {
      const newPolyline = new google.maps.Polyline({
        path: routePoints,
        geodesic: true,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 6,
        icons: [
          {
            icon: {
              path: 'M 0,-1 0.5,0 0,1 -0.5,0 z',
              fillColor: '#10B981',
              fillOpacity: 0.8,
              scale: 4,
              strokeColor: 'white',
              strokeWeight: 1
            },
            offset: '0',
            repeat: '25px'
          }
        ]
      });
      newPolyline.setMap(mapInstance);
      setRoutePolyline(newPolyline);
    }

    // Photo markers
    const newPhotoMarkers = photos.map((photo, index) => {
      return new google.maps.Marker({
        position: { lat: photo.latitude, lng: photo.longitude },
        map: mapInstance,
        title: `Photo ${index + 1}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" fill="#F59E0B" stroke="white" stroke-width="3"/>
              <path d="M8 10h12v8H8z" fill="white"/>
              <circle cx="14" cy="14" r="2" fill="#F59E0B"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(28, 28),
          anchor: new google.maps.Point(14, 14)
        }
      });
    });
    setPhotoMarkers(newPhotoMarkers);

  }, [mapInstance, mapLoaded, currentLocation, startLocation, endLocation, routePoints, photos, followMode, state]);

  // Street view mode toggle
  useEffect(() => {
    if (!mapInstance || !streetViewPanorama) return;

    if (streetViewMode && currentLocation) {
      streetViewPanorama.setPosition(currentLocation);
      streetViewPanorama.setVisible(true);
    } else {
      streetViewPanorama.setVisible(false);
    }
  }, [streetViewMode, mapInstance, streetViewPanorama, currentLocation]);

  // Formatting functions
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.floor((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  const handleEndWalk = () => {
    endWalk();
    setTimeout(() => {
      onEndWalk();
    }, 3000);
  };

  const handleTakePhoto = async () => {
    if (!currentLocation) return;
    await takePhoto();
  };

  const getWalkerName = () => {
    if (walker) {
      return `${walker.first_name} ${walker.last_name}`;
    }
    return "Self Walk";
  };

  const getEnergyColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-blue-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50"
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEndWalk}
                className="p-2"
              >
                <FaArrowLeft />
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  🐾 Live Walk Tracking
                  {isAutoPaused && <Badge variant="secondary">Auto-Paused</Badge>}
                </h1>
                <p className="text-sm text-gray-600">
                  {pets.map(p => p.name).join(', ')} with {getWalkerName()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={state === 'running' ? 'default' : state === 'paused' ? 'secondary' : 'outline'}>
                {state === 'running' && '🔴 LIVE'}
                {state === 'paused' && '⏸️ PAUSED'}
                {state === 'idle' && '⚪ READY'}
                {state === 'ended' && '✅ COMPLETED'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 bg-red-50 border-red-200">
              <p className="text-red-700 flex items-center gap-2">
                <FaMapMarkerAlt />
                {error}
              </p>
            </Card>
          </motion.div>
        )}

        {/* Live Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaClock className="text-blue-500 text-sm" />
              <span className="text-xs font-medium">Duration</span>
            </div>
            <div className="text-xl font-bold">{formatTime(walkDuration)}</div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaRoute className="text-green-500 text-sm" />
              <span className="text-xs font-medium">Distance</span>
            </div>
            <div className="text-xl font-bold">{formatDistance(distance)}</div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaTachometerAlt className="text-purple-500 text-sm" />
              <span className="text-xs font-medium">Speed</span>
            </div>
            <div className="text-xl font-bold">{currentSpeed.toFixed(1)}<span className="text-sm"> km/h</span></div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaRunning className="text-orange-500 text-sm" />
              <span className="text-xs font-medium">Pace</span>
            </div>
            <div className="text-lg font-bold">{formatPace(pace)}</div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaFire className="text-red-500 text-sm" />
              <span className="text-xs font-medium">Calories</span>
            </div>
            <div className="text-xl font-bold">{calories}</div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaPaw className="text-pink-500 text-sm" />
              <span className="text-xs font-medium">Steps</span>
            </div>
            <div className="text-xl font-bold">{steps.toLocaleString()}</div>
          </Card>
        </motion.div>

        {/* Map */}
        <Card className="overflow-hidden">
          <div className="h-96 bg-gray-200 relative">
            <div ref={mapRef} className="w-full h-full" />
            
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 mb-2">Loading Google Maps...</p>
                  <p className="text-sm text-gray-500">Initializing GPS tracking & navigation</p>
                </div>
              </div>
            )}
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button
                size="sm"
                variant={streetViewMode ? "default" : "secondary"}
                onClick={() => setStreetViewMode(!streetViewMode)}
                className="bg-white/90 backdrop-blur shadow-md"
              >
                <FaStreetView className="mr-2" />
                Street View
              </Button>
              
              <Button
                size="sm"
                variant={followMode ? "default" : "secondary"}
                onClick={() => setFollowMode(!followMode)}
                className="bg-white/90 backdrop-blur shadow-md"
              >
                <FaLocationArrow className="mr-2" />
                Follow
              </Button>
            </div>

            {/* Photo Button */}
            {state === 'running' && (
              <div className="absolute bottom-4 right-4">
                <Button
                  onClick={handleTakePhoto}
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-4"
                >
                  <FaCamera className="text-xl" />
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Environmental Data */}
        <AnimatePresence>
          {showEnvironmentalData && environmentalData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FaWind className="text-green-500" />
                    Environmental Data
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEnvironmentalData(false)}
                  >
                    <FaEye />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <FaThermometerHalf className="text-red-500 mx-auto mb-1" />
                    <div className="font-bold">{environmentalData.temperature}°C</div>
                    <div className="text-xs text-gray-600">Temperature</div>
                  </div>
                  <div className="text-center">
                    <FaWind className="text-blue-500 mx-auto mb-1" />
                    <div className="font-bold">{environmentalData.windSpeed} km/h</div>
                    <div className="text-xs text-gray-600">Wind Speed</div>
                  </div>
                  <div className="text-center">
                    <FaMountain className="text-gray-500 mx-auto mb-1" />
                    <div className="font-bold">{elevationGain}m</div>
                    <div className="text-xs text-gray-600">Elevation Gain</div>
                  </div>
                  <div className="text-center">
                    <FaChartLine className="text-purple-500 mx-auto mb-1" />
                    <div className="font-bold">{environmentalData.airQuality || 'Good'}</div>
                    <div className="text-xs text-gray-600">Air Quality</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Walk Controls */}
        <Card className="p-6">
          <div className="flex items-center justify-center gap-4">
            {state === 'idle' && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={startWalk}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg"
                >
                  <FaPlay className="mr-2" />
                  Start Walk
                </Button>
              </motion.div>
            )}
            
            {state === 'running' && (
              <>
                <Button
                  onClick={pauseWalk}
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg"
                >
                  <FaPause className="mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={handleEndWalk}
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg"
                >
                  <FaStop className="mr-2" />
                  End Walk
                </Button>
              </>
            )}
            
            {state === 'paused' && (
              <>
                <Button
                  onClick={resumeWalk}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg"
                >
                  <FaPlay className="mr-2" />
                  Resume
                </Button>
                <Button
                  onClick={handleEndWalk}
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg"
                >
                  <FaStop className="mr-2" />
                  End Walk
                </Button>
              </>
            )}

            {state === 'ended' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h3 className="text-xl font-bold text-green-600 mb-2">🎉 Walk Completed!</h3>
                <p className="text-gray-600 mb-4">
                  Awesome walk! {formatDistance(distance)} in {formatTime(walkDuration)}
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-bold">{calories}</div>
                    <div className="text-gray-600">Calories</div>
                  </div>
                  <div>
                    <div className="font-bold">{steps.toLocaleString()}</div>
                    <div className="text-gray-600">Steps</div>
                  </div>
                  <div>
                    <div className="font-bold">{photos.length}</div>
                    <div className="text-gray-600">Photos</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>

        {/* Walker & Pets Info */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Walker Card */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">
              {walker ? "Walker" : "Self Walk"}
            </h3>
            {walker ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={walker.avatar_url} />
                  <AvatarFallback>{walker.first_name[0]}{walker.last_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{walker.first_name} {walker.last_name}</p>
                  <p className="text-sm text-gray-600">⭐ {walker.rating}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaPaw className="text-blue-500 text-xl" />
                </div>
                <div>
                  <p className="font-medium">You're walking your pets!</p>
                  <p className="text-sm text-gray-600">Enjoy your time together</p>
                </div>
              </div>
            )}
          </Card>

          {/* Pets Card */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Pets ({pets.length})</h3>
            <div className="space-y-3">
              {pets.map(pet => (
                <div key={pet.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                    🐾
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pet.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEnergyColor(pet.energy_level)} bg-current bg-opacity-10`}>
                        {pet.energy_level}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{pet.breed} • {pet.age} years • {pet.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Photos Taken */}
        {photos.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FaCamera className="text-yellow-500" />
              Photos Taken ({photos.length})
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {photos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                >
                  <img
                    src={photo.dataUrl}
                    alt={`Walk photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default LiveWalkTracking;
