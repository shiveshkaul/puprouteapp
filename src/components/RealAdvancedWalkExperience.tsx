import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Route, 
  Play, 
  Brain,
  Target,
  Heart,
  Zap,
  Timer,
  Activity,
  Camera,
  Star
} from 'lucide-react';
import { EnhancedWalkPlanner } from './EnhancedWalkPlanner';
import { RealtimeWalkTracking } from './RealtimeWalkTracking';
import { WalkSummary } from './WalkSummary';
import { useAdvancedWalkSession } from '@/hooks/useAdvancedWalkSession';
import { useEmergencyFeatures } from '@/hooks/useAdvancedLocationFeatures';
import { useAuth } from '@/hooks/useAuth';
import { usePets } from '@/hooks/usePets';

type WalkExperiencePhase = 'planning' | 'tracking' | 'summary';

interface SelectedRoute {
  id: string;
  polyline: string;
  waypoints: Array<{
    name: string;
    location: { lat: number; lng: number };
  }>;
  distanceMeters: number;
  durationSec: number;
  score: number;
  reasons: string[];
}

interface Pet {
  id: any;
  name: any;
  breed: any;
  photo_url: any;
  age: number;
  size: "small" | "medium" | "large";
  energy_level: any;
}

interface Walker {
  id: any;
  name: any;
  photo_url: any;
  rating: number;
}

interface RealAdvancedWalkExperienceProps {
  pets: Pet[];
  walker: Walker;
  duration: number;
  startLocation: { lat: number; lng: number };
  onEndWalk: () => void;
}

export const RealAdvancedWalkExperience: React.FC<RealAdvancedWalkExperienceProps> = ({
  pets,
  walker,
  duration,
  startLocation,
  onEndWalk
}) => {
  const { user } = useAuth();
  const petsQuery = usePets();
  // Using pets from props instead of query
  
  // Phase management
  const [currentPhase, setCurrentPhase] = useState<WalkExperiencePhase>('planning');
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute | null>(null);
  const [walkSummaryData, setWalkSummaryData] = useState<any>(null);

  // Advanced walk session management
  const walkSession = useAdvancedWalkSession();
  const {
    state: sessionStatus,
    current: sessionCurrentLocation,
    startWalk: startWalkSession,
    pauseWalk: pauseWalkSession,
    resumeWalk: resumeWalkSession,
    endWalk: endWalkSession,
    stats: sessionStats
  } = walkSession;

  // Enhanced location features (using walkSession data)
  const currentLocation = sessionCurrentLocation;
  const locationAccuracy = sessionCurrentLocation?.accuracy || 0;
  const heading = 0; // TODO: get from geolocation
  const speed = sessionCurrentLocation?.speed || 0;
  const isGPSActive = !!sessionCurrentLocation;
  const locationHistory = walkSession.points || [];
  
  // Emergency features
  const emergencyFeatures = useEmergencyFeatures();
  const startLocationTracking = () => {}; // Handled by walkSession
  const stopLocationTracking = () => {}; // Handled by walkSession

  // Handle route selection from planner
  const handleStartWalk = (route: SelectedRoute) => {
    setSelectedRoute(route);
    setCurrentPhase('tracking');
  };

  // Handle walk completion
  const handleWalkComplete = (summary: any) => {
    setWalkSummaryData(summary);
    setCurrentPhase('summary');
  };

  // Handle starting over
  const handleStartOver = () => {
    setSelectedRoute(null);
    setWalkSummaryData(null);
    setCurrentPhase('planning');
  };

  // Handle template saving
  const handleSaveTemplate = (template: any) => {
    console.log('Saving walk template:', template);
    // In a real app, this would save to the database
  };

  // Handle scheduling
  const handleScheduleAgain = (schedule: any) => {
    console.log('Scheduling walk:', schedule);
    // In a real app, this would create a calendar entry
  };

  // Initialize location tracking
  useEffect(() => {
    startLocationTracking();
    return () => stopLocationTracking();
  }, [startLocationTracking, stopLocationTracking]);

  // Phase-based rendering
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'planning':
        return (
          <EnhancedWalkPlanner
            pets={pets}
            onStartWalk={handleStartWalk}
            targetDuration={duration}
            startLocation={startLocation}
          />
        );
      
      case 'tracking':
        return (
          <RealtimeWalkTracking
            selectedRoute={selectedRoute}
            pets={pets}
            onWalkComplete={handleWalkComplete}
          />
        );
      
      case 'summary':
        return (
          <WalkSummary
            walkData={walkSummaryData}
            pets={pets}
            onSaveTemplate={handleSaveTemplate}
            onScheduleAgain={handleScheduleAgain}
            onClose={handleStartOver}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Phase Indicator */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          🚀 Advanced Walk Experience
        </h1>
        <p className="text-gray-600">AI-powered route planning with real-time tracking and insights</p>
        
        {/* Phase Navigation */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg">
            <div className={`flex items-center gap-2 ${currentPhase === 'planning' ? 'text-blue-600' : 'text-gray-400'}`}>
              <Brain className={`h-5 w-5 ${currentPhase === 'planning' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">Planning</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentPhase === 'tracking' ? 'text-green-600' : 'text-gray-400'}`}>
              <Navigation className={`h-5 w-5 ${currentPhase === 'tracking' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-medium">Tracking</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentPhase === 'summary' ? 'text-purple-600' : 'text-gray-400'}`}>
              <Target className={`h-5 w-5 ${currentPhase === 'summary' ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className="font-medium">Summary</span>
            </div>
          </div>
        </div>
      </div>

      {/* GPS Status */}
      <Alert className={(isGPSActive || startLocation) ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <MapPin className={`h-4 w-4 ${(isGPSActive || startLocation) ? 'text-green-600' : 'text-yellow-600'}`} />
        <AlertDescription className={(isGPSActive || startLocation) ? 'text-green-800' : 'text-yellow-800'}>
          {(isGPSActive || startLocation) ? (
            <>
              📍 GPS Active: {currentLocation ? 
                `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)} (±${Math.round(locationAccuracy)}m)` : 
                `${startLocation.lat.toFixed(4)}, ${startLocation.lng.toFixed(4)} (using provided location)`}
            </>
          ) : (
            '📍 GPS Inactive - Please enable location services for optimal experience'
          )}
        </AlertDescription>
      </Alert>

      {/* Phase Content */}
      {renderPhaseContent()}

      {/* Quick Navigation (when not in summary phase) */}
      {currentPhase !== 'summary' && (
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {currentPhase === 'planning' && 'Plan your perfect route with AI assistance'}
                {currentPhase === 'tracking' && 'Real-time tracking with live updates'}
              </div>
              <div className="flex gap-2">
                {currentPhase === 'tracking' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStartOver}
                  >
                    Plan New Route
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Features Showcase (when in planning phase) */}
      {currentPhase === 'planning' && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              🧠 Intelligent Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3">
                <Brain className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <h3 className="font-medium">AI Route Planning</h3>
                <p className="text-sm text-gray-600">Multi-objective optimization considering pet needs, weather, and preferences</p>
              </div>
              <div className="text-center p-3">
                <Navigation className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <h3 className="font-medium">Real-time Tracking</h3>
                <p className="text-sm text-gray-600">GPS tracking with route adherence monitoring and smart re-routing</p>
              </div>
              <div className="text-center p-3">
                <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <h3 className="font-medium">Pet-Centric Design</h3>
                <p className="text-sm text-gray-600">Tailored recommendations based on energy levels, age, and special needs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">🔧 Development Debug</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 space-y-1">
            <p><strong>Current Phase:</strong> {currentPhase}</p>
            <p><strong>Session Status:</strong> {sessionStatus}</p>
            <p><strong>GPS Active:</strong> {isGPSActive ? 'Yes' : 'No'}</p>
            <p><strong>Location Accuracy:</strong> {locationAccuracy ? `±${Math.round(locationAccuracy)}m` : 'N/A'}</p>
            <p><strong>Selected Route:</strong> {selectedRoute ? selectedRoute.id : 'None'}</p>
            <p><strong>Location History:</strong> {locationHistory.length} points</p>
            <p><strong>Speed:</strong> {speed ? `${speed.toFixed(2)} km/h` : 'N/A'}</p>
            <p><strong>Heading:</strong> {heading ? `${Math.round(heading)}°` : 'N/A'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealAdvancedWalkExperience;
