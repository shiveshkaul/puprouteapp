import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Route, 
  Star, 
  Thermometer, 
  CloudRain, 
  Wind,
  TreePine,
  Shield,
  Heart,
  Zap,
  Camera,
  Navigation,
  Target,
  Play
} from 'lucide-react';
import { GoogleMapsService } from '@/services/GoogleMapsService';
import { RouteAPI } from '@/services/RouteAPI';
import { usePets } from '@/hooks/usePets';
import { useAuth } from '@/hooks/useAuth';

interface RouteCandidate {
  id: string;
  title?: string;
  polyline: string;
  distanceMeters: number;
  durationSec: number;
  waypoints: Array<{
    name: string;
    types: string[];
    location: { lat: number; lng: number };
  }>;
  score: number;
  reasons: string[];
  advisories: Array<{
    type: 'warning' | 'info' | 'tip';
    message: string;
  }>;
  thumbnails: string[];
  weatherSuitability: number;
}

interface WeatherData {
  tempC: number;
  precipProb: number;
  heatIndex: number;
  daylightMinsLeft: number;
  uvIndex?: number;
  windSpeedKmh?: number;
}

interface EnhancedWalkPlannerProps {
  pets: any[];
  onStartWalk: (route: any) => void;
  targetDuration: number;
  startLocation: { lat: number; lng: number };
  onRouteSelected?: (route: any) => void;
}

export const EnhancedWalkPlanner: React.FC<EnhancedWalkPlannerProps> = ({ 
  pets: propsPets, 
  onStartWalk, 
  targetDuration: propsTargetDuration, 
  startLocation: propsStartLocation, 
  onRouteSelected 
}) => {
  const { user } = useAuth();
  const petsQuery = usePets();
  const pets = propsPets || petsQuery.data || [];
  
  // Planning state
  const [isPlanning, setIsPlanning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(propsStartLocation);
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [startLocationStr, setStartLocationStr] = useState<string>('Current Location');
  const [endPolicy, setEndPolicy] = useState<'loop' | 'point'>('loop');
  const [targetDuration, setTargetDuration] = useState([propsTargetDuration || 30]);
  const [targetDistance, setTargetDistance] = useState<number | null>(null);
  
  // Preferences
  const [preferences, setPreferences] = useState({
    preferParks: true,
    avoidBusyRoads: true,
    lowSlope: false,
    shade: false,
    avoidDogParks: false,
    waterFountains: false,
    benches: false
  });

  // Results
  const [routeCandidates, setRouteCandidates] = useState<RouteCandidate[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteCandidate | null>(null);
  const [planningContext, setPlanningContext] = useState<any>(null);

  // Services
  const [mapsService] = useState(() => new GoogleMapsService());
  const [routeAPI] = useState(() => RouteAPI.getInstance());

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      console.log('🔍 Requesting GPS location...');
      const location = await mapsService.getCurrentLocation();
      setCurrentLocation(location);
      console.log('📍 Current location acquired:', location);
    } catch (error) {
      console.error('Failed to get current location:', error);
      // Fallback to provided start location if available
      if (propsStartLocation) {
        setCurrentLocation(propsStartLocation);
        console.log('📍 Using provided start location:', propsStartLocation);
      }
    }
  };

  const planIntelligentRoutes = async () => {
    if (!currentLocation || selectedPets.length === 0) {
      alert('Please select pets and ensure location is available');
      return;
    }

    setIsPlanning(true);
    
    try {
      // Prepare pet data
      const selectedPetData = pets.filter(pet => selectedPets.includes(pet.id));
      
      const request = {
        start: currentLocation,
        endPolicy,
        target: {
          durationMin: targetDuration[0],
          distanceM: targetDistance
        },
        pets: selectedPetData.map(pet => ({
          id: pet.id,
          weightKg: pet.weight || 25,
          energy: pet.energy_level as 'low' | 'medium' | 'high' || 'medium',
          ageYears: pet.estimated_age_months ? Math.floor(pet.estimated_age_months / 12) : 5,
          heatSensitive: pet.medical_conditions?.includes('heat_sensitive') || false,
          reactive: {
            dogs: pet.fear_triggers?.includes('dogs') || false,
            bikes: pet.fear_triggers?.includes('bicycles') || false,
            kids: pet.fear_triggers?.includes('children') || false
          },
          mobility: pet.medical_conditions?.includes('mobility_issues') ? 'limited' : 'excellent' as 'excellent' | 'good' | 'limited'
        })),
        preferences: {
          preferParks: preferences.preferParks,
          avoidBusy: preferences.avoidBusyRoads,
          lowSlope: preferences.lowSlope,
          shade: preferences.shade,
          avoidDogParks: preferences.avoidDogParks,
          waterFountains: preferences.waterFountains,
          restSpots: preferences.benches
        },
        time: {
          startISO: new Date().toISOString()
        }
      };

      console.log('🧠 Planning intelligent routes...', request);
      
      const result = await routeAPI.planRoutes(request);
      
      if (result.success) {
        setRouteCandidates(result.data.routes);
        setWeatherData(result.data.weather);
        console.log('✅ Routes planned successfully:', result.data);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('❌ Route planning failed:', error);
      alert('Failed to plan routes. Please try again.');
    } finally {
      setIsPlanning(false);
    }
  };

  const selectRoute = (route: RouteCandidate) => {
    setSelectedRoute(route);
    if (onRouteSelected) {
      onRouteSelected(route);
    }
  };

  const startWalk = () => {
    if (!selectedRoute) return;
    
    // Navigate to live walk experience with selected route
    console.log('🚀 Starting walk with route:', selectedRoute);
    
    // Call the parent handler
    onStartWalk(selectedRoute);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStars = (score: number): number => {
    return Math.round(score * 5);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">🧠 Intelligent Walk Planner</h1>
        <p className="text-gray-600">AI-powered route planning for the perfect walk experience</p>
      </div>

      {/* Current Location */}
      {currentLocation && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            📍 Location acquired: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </AlertDescription>
        </Alert>
      )}

      {/* Pet Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Select Pets for Walk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map(pet => (
              <div 
                key={pet.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPets.includes(pet.id) 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedPets(prev => 
                    prev.includes(pet.id) 
                      ? prev.filter(id => id !== pet.id)
                      : [...prev, pet.id]
                  );
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {pet.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{pet.name}</h3>
                    <p className="text-sm text-gray-500">{pet.custom_breed || 'Mixed'}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {pet.energy_level || 'Medium'} Energy
                      </Badge>
                      {pet.estimated_age_months && (
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(pet.estimated_age_months / 12)}y
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedPets.length === 0 && (
            <p className="text-gray-500 text-center mt-4">Please select at least one pet</p>
          )}
        </CardContent>
      </Card>

      {/* Walk Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Walk Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Duration: {targetDuration[0]} minutes
            </label>
            <Slider
              value={targetDuration}
              onValueChange={setTargetDuration}
              min={10}
              max={120}
              step={5}
              className="w-full"
            />
          </div>

          {/* Route Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Route Type</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Button
                variant={endPolicy === 'loop' ? 'default' : 'outline'}
                onClick={() => setEndPolicy('loop')}
                className="flex-1 w-full sm:w-auto"
              >
                <Route className="h-4 w-4 mr-2" />
                Loop Walk
              </Button>
              <Button
                variant={endPolicy === 'point' ? 'default' : 'outline'}
                onClick={() => setEndPolicy('point')}
                className="flex-1 w-full sm:w-auto"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Point to Point
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Walk Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({
              preferParks: { label: 'Prefer Parks & Green Spaces', icon: TreePine },
              avoidBusyRoads: { label: 'Avoid Busy Roads', icon: Shield },
              lowSlope: { label: 'Low Slope (Easy Walking)', icon: Target },
              shade: { label: 'Prioritize Shade', icon: TreePine },
              avoidDogParks: { label: 'Avoid Dog Parks', icon: Shield },
              waterFountains: { label: 'Include Water Fountains', icon: Target },
              benches: { label: 'Include Rest Spots', icon: Target }
            }).map(([key, { label, icon: Icon }]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <label className="text-sm font-medium">{label}</label>
                </div>
                <Switch
                  checked={preferences[key as keyof typeof preferences]}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Routes Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={planIntelligentRoutes}
          disabled={isPlanning || selectedPets.length === 0 || !currentLocation}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3"
        >
          {isPlanning ? (
            <>
              <Zap className="h-5 w-5 mr-2 animate-spin" />
              Planning Intelligent Routes...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Find Best Routes
            </>
          )}
        </Button>
      </div>

      {/* Weather Context */}
      {weatherData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Thermometer className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                <p className="text-sm text-gray-500">Temperature</p>
                <p className="font-medium">{weatherData.tempC}°C</p>
              </div>
              <div className="text-center">
                <CloudRain className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                <p className="text-sm text-gray-500">Rain Chance</p>
                <p className="font-medium">{weatherData.precipProb}%</p>
              </div>
              <div className="text-center">
                <Wind className="h-6 w-6 mx-auto text-gray-500 mb-1" />
                <p className="text-sm text-gray-500">Wind</p>
                <p className="font-medium">{weatherData.windSpeedKmh || 0} km/h</p>
              </div>
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
                <p className="text-sm text-gray-500">Daylight</p>
                <p className="font-medium">{Math.round(weatherData.daylightMinsLeft / 60)}h left</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Candidates */}
      {routeCandidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-blue-500" />
              Top Route Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {routeCandidates.map((route, index) => (
              <div 
                key={route.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRoute?.id === route.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectRoute(route)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div className="flex">
                      {Array.from({ length: getScoreStars(route.score) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(route.score)}`}>
                      {Math.round(route.score * 100)}% match
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDistance(route.distanceMeters)}</p>
                    <p className="text-sm text-gray-500">{formatDuration(route.durationSec)}</p>
                  </div>
                </div>

                {/* Route Title */}
                {route.title && (
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{route.title}</h3>
                  </div>
                )}

                {/* Waypoints */}
                {route.waypoints.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Route includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {route.waypoints.map((waypoint, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {waypoint.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasons */}
                {route.reasons.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Why this route:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {route.reasons.map((reason, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Advisories */}
                {route.advisories && route.advisories.length > 0 && (
                  <div className="space-y-2">
                    {route.advisories.map((advisory, i) => (
                      <Alert key={i} className={`${
                        advisory.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                        advisory.type === 'info' ? 'border-blue-200 bg-blue-50' :
                        'border-green-200 bg-green-50'
                      }`}>
                        <AlertDescription className="text-sm">
                          {advisory.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {/* Street View Thumbnails */}
                {route.thumbnails && route.thumbnails.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Route preview:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {route.thumbnails.map((thumb, i) => (
                        <img 
                          key={i}
                          src={thumb}
                          alt={`Route preview ${i + 1}`}
                          className="w-24 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Start Walk */}
      {selectedRoute && (
        <div className="text-center">
          <Button
            size="lg"
            onClick={startWalk}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3"
          >
            <Play className="h-5 w-5 mr-2" />
            Start This Walk
          </Button>
        </div>
      )}

      {/* Planning Context */}
      {planningContext && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Planning Context</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600">
            <p><strong>Search radius:</strong> {planningContext.searchRadius}m</p>
            <p><strong>Factors considered:</strong> {planningContext.considerationFactors?.join(', ')}</p>
            <p><strong>Pet constraints:</strong> {planningContext.petConstraints?.join(', ')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedWalkPlanner;
