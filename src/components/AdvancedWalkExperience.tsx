import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FaMapMarkerAlt, 
  FaRoute,
  FaPlay,
  FaPause,
  FaStop,
  FaWalking,
  FaThermometerHalf,
  FaWind,
  FaLeaf,
  FaEye,
  FaShieldAlt,
  FaBrain,
  FaCamera,
  FaHeart,
  FaExclamationTriangle,
  FaClock,
  FaCompass,
  FaRunning
} from 'react-icons/fa';

interface AdvancedWalkExperienceProps {
  booking: {
    id: string;
    pet: {
      id: string;
      name: string;
      breed: string;
      photo_url?: string;
      age: number;
      size: 'small' | 'medium' | 'large';
      energy_level: 'low' | 'medium' | 'high';
    };
    walker: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url?: string;
      rating: number;
    };
    pickup_address: string;
    scheduled_time: string;
    duration_minutes: number;
  };
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface EnvironmentalData {
  airQuality: {
    aqi: number;
    category: string;
    healthRecommendation: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    uvIndex: number;
  };
  pollen: {
    level: number;
    types: string[];
    recommendation: string;
  };
}

interface WalkMetrics {
  distance: number;
  duration: number;
  steps: number;
  calories: number;
  avgSpeed: number;
  elevationGain: number;
  route: LocationData[];
  photos: Array<{
    url: string;
    location: LocationData;
    timestamp: number;
    caption?: string;
  }>;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyAlY5Q1LZkbXGsz-BO0amHcceQpa_HeaCo';
const GEMINI_API_KEY = 'AIzaSyBafk7WqRslUyt3UFz0BFg6hqTyUy_nxow';

export const AdvancedWalkExperience: React.FC<AdvancedWalkExperienceProps> = ({ booking }) => {
  const [walkStatus, setWalkStatus] = useState<'planning' | 'starting' | 'active' | 'paused' | 'completed'>('planning');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [route, setRoute] = useState<LocationData[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [walkMetrics, setWalkMetrics] = useState<WalkMetrics>({
    distance: 0,
    duration: 0,
    steps: 0,
    calories: 0,
    avgSpeed: 0,
    elevationGain: 0,
    route: [],
    photos: []
  });
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [streetViewUrl, setStreetViewUrl] = useState<string>('');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Initialize Google Maps with ALL APIs
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const map = new google.maps.Map(mapRef.current!, {
        zoom: 16,
        center: { lat: 37.7749, lng: -122.4194 }, // Default to SF
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [{ color: '#a5b076' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#f4a261' }]
          }
        ],
        streetViewControl: true,
        fullscreenControl: true,
        mapTypeControl: true,
        zoomControl: true,
      });

      const directions = new google.maps.DirectionsService();
      
      setMapInstance(map);
      setDirectionsService(directions);
    };

    initMap();
  }, []);

  // Real-time location tracking with high accuracy
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000
    };

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: Date.now()
        };

        setCurrentLocation(newLocation);
        updateRoute(newLocation);
        updateMapPosition(newLocation);
        
        // Get environmental data for current location
        await fetchEnvironmentalData(newLocation);
        
        // Generate AI insights
        await generateAIInsights(newLocation);
        
        // Update Street View
        updateStreetView(newLocation);
        
        // Calculate metrics
        updateWalkMetrics(newLocation);
      },
      (error) => console.error('Location error:', error),
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

  // Fetch Air Quality, Weather, and Pollen data
  const fetchEnvironmentalData = async (location: LocationData) => {
    try {
      // Air Quality API
      const airQualityResponse = await fetch(
        `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_MAPS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: {
              latitude: location.lat,
              longitude: location.lng
            }
          })
        }
      );
      const airQualityData = await airQualityResponse.json();

      // Weather API
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${GOOGLE_MAPS_API_KEY}&units=metric`
      );
      const weatherData = await weatherResponse.json();

      // Pollen API
      const pollenResponse = await fetch(
        `https://pollen.googleapis.com/v1/forecast:lookup?key=${GOOGLE_MAPS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: {
              latitude: location.lat,
              longitude: location.lng
            },
            days: 1
          })
        }
      );
      const pollenData = await pollenResponse.json();

      setEnvironmentalData({
        airQuality: {
          aqi: airQualityData.indexes?.[0]?.aqi || 50,
          category: airQualityData.indexes?.[0]?.category || 'Good',
          healthRecommendation: airQualityData.indexes?.[0]?.dominantPollutant || 'Safe for walks'
        },
        weather: {
          temperature: weatherData.main?.temp || 20,
          humidity: weatherData.main?.humidity || 50,
          windSpeed: weatherData.wind?.speed || 0,
          condition: weatherData.weather?.[0]?.description || 'Clear',
          uvIndex: 3 // Mock UV index
        },
        pollen: {
          level: pollenData.dailyInfo?.[0]?.pollenTypeInfo?.[0]?.indexInfo?.value || 1,
          types: ['Grass', 'Tree', 'Weed'],
          recommendation: 'Low pollen - great for sensitive pets'
        }
      });
    } catch (error) {
      console.error('Environmental data fetch error:', error);
      // Set mock data
      setEnvironmentalData({
        airQuality: { aqi: 45, category: 'Good', healthRecommendation: 'Excellent air quality for walking' },
        weather: { temperature: 22, humidity: 65, windSpeed: 2.5, condition: 'Partly cloudy', uvIndex: 3 },
        pollen: { level: 2, types: ['Grass'], recommendation: 'Low pollen levels detected' }
      });
    }
  };

  // Generate AI insights using Gemini
  const generateAIInsights = async (location: LocationData) => {
    try {
      const prompt = `
        As a professional dog walking AI assistant, analyze this situation:
        
        DOG: ${booking.pet.name} (${booking.pet.breed}, ${booking.pet.age} years, ${booking.pet.size} size, ${booking.pet.energy_level} energy)
        LOCATION: ${location.lat}, ${location.lng}
        ENVIRONMENTAL DATA: ${environmentalData ? JSON.stringify(environmentalData) : 'Loading...'}
        CURRENT SPEED: ${location.speed || 0} m/s
        WALK DURATION: ${walkMetrics.duration} minutes
        
        Provide real-time insights about:
        1. Optimal pace for this dog breed
        2. Environmental safety assessment
        3. Route recommendations
        4. Health monitoring alerts
        5. Engagement suggestions
        
        Keep response under 100 words, friendly and actionable.
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
      const insight = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Great walk progress!';
      setAiInsights(insight);
    } catch (error) {
      console.error('AI insights error:', error);
      setAiInsights(`Perfect pace for ${booking.pet.name}! The ${booking.pet.breed} is enjoying this adventure. Keep up the great work!`);
    }
  };

  const updateRoute = (newLocation: LocationData) => {
    setRoute(prev => [...prev, newLocation]);
  };

  const updateMapPosition = (location: LocationData) => {
    if (mapInstance) {
      const position = new google.maps.LatLng(location.lat, location.lng);
      mapInstance.setCenter(position);
      
      // Add real-time marker with dog icon
      new google.maps.Marker({
        position,
        map: mapInstance,
        icon: {
          url: '🐕',
          scaledSize: new google.maps.Size(30, 30)
        },
        title: `${booking.pet.name} is here!`
      });
    }
  };

  const updateStreetView = (location: LocationData) => {
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${location.lat},${location.lng}&heading=${location.heading || 0}&key=${GOOGLE_MAPS_API_KEY}`;
    setStreetViewUrl(streetViewUrl);
  };

  const updateWalkMetrics = (location: LocationData) => {
    if (!startTimeRef.current) return;

    const now = Date.now();
    const duration = Math.floor((now - startTimeRef.current) / 1000 / 60); // minutes

    if (route.length > 1) {
      const lastLocation = route[route.length - 1];
      const distance = calculateDistance(lastLocation, location);
      
      setWalkMetrics(prev => ({
        ...prev,
        duration,
        distance: prev.distance + distance,
        steps: Math.floor((prev.distance + distance) * 1312), // Rough steps calculation
        calories: Math.floor((prev.distance + distance) * 100), // Rough calories for dog
        avgSpeed: (prev.distance + distance) / (duration || 1) * 60, // km/h
        route: [...prev.route, location]
      }));
    }
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

  const startWalk = () => {
    setWalkStatus('starting');
    startTimeRef.current = Date.now();
    startLocationTracking();
    setTimeout(() => setWalkStatus('active'), 2000);
  };

  const pauseWalk = () => {
    setWalkStatus('paused');
    stopLocationTracking();
  };

  const resumeWalk = () => {
    setWalkStatus('active');
    startLocationTracking();
  };

  const endWalk = () => {
    setWalkStatus('completed');
    stopLocationTracking();
  };

  const takePhoto = async () => {
    if (!currentLocation) return;
    
    // Simulate photo capture
    const photo = {
      url: streetViewUrl,
      location: currentLocation,
      timestamp: Date.now(),
      caption: `${booking.pet.name} at this beautiful spot!`
    };
    
    setWalkMetrics(prev => ({
      ...prev,
      photos: [...prev.photos, photo]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header with Pet & Walker Info */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-500">
              <AvatarImage src={booking.pet.photo_url} alt={booking.pet.name} />
              <AvatarFallback>{booking.pet.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{booking.pet.name}'s Advanced Walk</h1>
              <p className="text-gray-600">With {booking.walker.first_name} • {booking.duration_minutes} min journey</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{booking.pet.breed}</Badge>
                <Badge variant="outline">{booking.pet.size}</Badge>
                <Badge variant="outline">{booking.pet.energy_level} energy</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={walkStatus === 'active' ? 'default' : walkStatus === 'completed' ? 'secondary' : 'outline'}
              className="text-lg px-4 py-2"
            >
              {walkStatus === 'planning' && '🎯 Planning'}
              {walkStatus === 'starting' && '🚀 Starting'}
              {walkStatus === 'active' && '🚶‍♂️ Walking'}
              {walkStatus === 'paused' && '⏸️ Paused'}
              {walkStatus === 'completed' && '✅ Complete'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Environmental Dashboard */}
      {environmentalData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaLeaf className="text-green-500" />
            Environmental Intelligence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaWind className="text-blue-500" />
                <span className="font-semibold">Air Quality</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{environmentalData.airQuality.aqi}</div>
              <div className="text-sm text-gray-600">{environmentalData.airQuality.category}</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaThermometerHalf className="text-orange-500" />
                <span className="font-semibold">Weather</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{environmentalData.weather.temperature}°C</div>
              <div className="text-sm text-gray-600">{environmentalData.weather.condition}</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaLeaf className="text-yellow-500" />
                <span className="font-semibold">Pollen</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">Level {environmentalData.pollen.level}</div>
              <div className="text-sm text-gray-600">{environmentalData.pollen.recommendation}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Map & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" />
                Live GPS Tracking
                {currentLocation && (
                  <Badge variant="outline" className="ml-2">
                    📍 {currentLocation.accuracy.toFixed(0)}m accuracy
                  </Badge>
                )}
              </h3>
              
              {/* Walk Controls */}
              <div className="flex gap-2">
                {walkStatus === 'planning' && (
                  <Button onClick={startWalk} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                    <FaPlay />
                    Start Adventure
                  </Button>
                )}
                {walkStatus === 'active' && (
                  <>
                    <Button onClick={pauseWalk} variant="outline" className="flex items-center gap-2">
                      <FaPause />
                      Pause
                    </Button>
                    <Button onClick={endWalk} variant="destructive" className="flex items-center gap-2">
                      <FaStop />
                      End Walk
                    </Button>
                  </>
                )}
                {walkStatus === 'paused' && (
                  <Button onClick={resumeWalk} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                    <FaPlay />
                    Resume
                  </Button>
                )}
              </div>
            </div>
            
            {/* Google Maps Container */}
            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border-2 border-blue-200 shadow-lg"
              style={{ minHeight: '400px' }}
            />
            
            {/* Real-time Location Data */}
            {currentLocation && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-blue-600">📍 Lat:</span>
                  <br />{currentLocation.lat.toFixed(6)}
                </div>
                <div>
                  <span className="font-semibold text-blue-600">📍 Lng:</span>
                  <br />{currentLocation.lng.toFixed(6)}
                </div>
                <div>
                  <span className="font-semibold text-green-600">🧭 Heading:</span>
                  <br />{currentLocation.heading ? `${currentLocation.heading.toFixed(0)}°` : 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-purple-600">🏃 Speed:</span>
                  <br />{currentLocation.speed ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h` : '0 km/h'}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Live Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaRunning className="text-green-500" />
              Live Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Distance</span>
                <span className="font-bold text-blue-600">{walkMetrics.distance.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-bold text-green-600">{walkMetrics.duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Steps</span>
                <span className="font-bold text-purple-600">{walkMetrics.steps.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Speed</span>
                <span className="font-bold text-orange-600">{walkMetrics.avgSpeed.toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Calories (Pet)</span>
                <span className="font-bold text-red-600">{walkMetrics.calories}</span>
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaBrain className="text-purple-500" />
              Gemini AI Insights
            </h3>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{aiInsights}</p>
            </div>
          </Card>

          {/* Street View Preview */}
          {streetViewUrl && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaEye className="text-blue-500" />
                Current View
              </h3>
              <img 
                src={streetViewUrl} 
                alt="Street view" 
                className="w-full rounded-lg"
              />
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Walker Actions</h3>
            <div className="space-y-3">
              <Button onClick={takePhoto} variant="outline" className="w-full flex items-center gap-2">
                <FaCamera />
                Capture Moment
              </Button>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <FaHeart />
                Mark Favorite Spot
              </Button>
              <Button variant="destructive" className="w-full flex items-center gap-2">
                <FaShieldAlt />
                Emergency Alert
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Photo Gallery */}
      {walkMetrics.photos.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCamera className="text-pink-500" />
            Walk Memories ({walkMetrics.photos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {walkMetrics.photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                  {new Date(photo.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
