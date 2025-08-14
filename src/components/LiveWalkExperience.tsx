import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FaMapMarkerAlt, 
  FaCamera, 
  FaPlayCircle, 
  FaPauseCircle,
  FaStopCircle,
  FaRoute,
  FaHeart,
  FaThermometerHalf,
  FaClock,
  FaPaw,
  FaExclamationTriangle,
  FaStar,
  FaBrain,
  FaShieldAlt
} from 'react-icons/fa';
import LiveWalkMap from './LiveWalkMap';
import AIWalkPlanner from './AIWalkPlanner';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useAILocationIntelligence } from '@/hooks/useAILocationIntelligence';

interface WalkExperienceProps {
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

export const LiveWalkExperience: React.FC<WalkExperienceProps> = ({ booking }) => {
  const [walkStatus, setWalkStatus] = useState<'waiting' | 'started' | 'paused' | 'completed'>('waiting');
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [walkStats, setWalkStats] = useState({
    distance: 0,
    duration: 0,
    calories: 0,
    photos: 0,
    pois_visited: 0
  });

  // Real-time location tracking
  const { 
    currentLocation, 
    routePath, 
    walkingMetrics,
    startTracking,
    pauseTracking,
    stopTracking 
  } = useLocationTracking(booking.id);

  // AI intelligence features
  const { 
    data: aiInsights,
    realTimeAnalysis,
    emergencyAlerts
  } = useAILocationIntelligence({
    petId: booking.pet.id,
    walkerId: booking.walker.id,
    currentLocation,
    walkStatus
  });

  const startWalk = () => {
    setWalkStatus('started');
    startTracking();
  };

  const pauseWalk = () => {
    setWalkStatus('paused');
    pauseTracking();
  };

  const endWalk = () => {
    setWalkStatus('completed');
    stopTracking();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={booking.pet.photo_url} alt={booking.pet.name} />
              <AvatarFallback>{booking.pet.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{booking.pet.name}'s Adventure</h1>
              <p className="text-muted-foreground">
                With {booking.walker.first_name} • {booking.duration_minutes} minutes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={walkStatus === 'started' ? 'default' : 'secondary'}>
              {walkStatus === 'waiting' && 'Waiting to Start'}
              {walkStatus === 'started' && 'Walking Now'}
              {walkStatus === 'paused' && 'Paused'}
              {walkStatus === 'completed' && 'Complete'}
            </Badge>
            <Button
              variant="outline"
              onClick={() => setShowAIPlanner(!showAIPlanner)}
              className="flex items-center gap-2"
            >
              <FaBrain />
              AI Features
            </Button>
          </div>
        </div>
      </Card>

      {/* AI Walk Planner */}
      <AnimatePresence>
        {showAIPlanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AIWalkPlanner
              pet={booking.pet}
              location={{ 
                lat: currentLocation?.lat || 0, 
                lng: currentLocation?.lng || 0,
                neighborhood: 'Current Area'
              }}
              duration={booking.duration_minutes}
              onSelectRoute={(route) => console.log('Selected route:', route)}
              onSelectWalker={(walkerId) => console.log('Selected walker:', walkerId)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Map */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" />
            Live Walk Tracking
          </h3>
          <div className="flex gap-2">
            {walkStatus === 'waiting' && (
              <Button onClick={startWalk} className="flex items-center gap-2">
                <FaPlayCircle />
                Start Walk
              </Button>
            )}
            {walkStatus === 'started' && (
              <>
                <Button onClick={pauseWalk} variant="outline" className="flex items-center gap-2">
                  <FaPauseCircle />
                  Pause
                </Button>
                <Button onClick={endWalk} variant="destructive" className="flex items-center gap-2">
                  <FaStopCircle />
                  End Walk
                </Button>
              </>
            )}
            {walkStatus === 'paused' && (
              <Button onClick={startWalk} className="flex items-center gap-2">
                <FaPlayCircle />
                Resume
              </Button>
            )}
          </div>
        </div>

        <LiveWalkMap
          apiKey="AIzaSyAlY5Q1LZkbXGsz-BO0amHcceQpa_HeaCo"
          route={routePath || []}
          walkerLocation={currentLocation}
          petLocation={currentLocation}
          height="400px"
        />
      </Card>

      {/* Walk Stats & AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaPaw className="text-green-500" />
            Walk Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(walkingMetrics?.distance || 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Miles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor((walkingMetrics?.duration || 0) / 60)}
              </div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {walkingMetrics?.calories || 0}
              </div>
              <div className="text-sm text-muted-foreground">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {walkingMetrics?.photos || 0}
              </div>
              <div className="text-sm text-muted-foreground">Photos</div>
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBrain className="text-purple-500" />
            AI Insights
          </h3>
          {aiInsights && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaHeart className="text-red-500" />
                <span className="text-sm">Energy Level: {aiInsights.energyLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaThermometerHalf className="text-blue-500" />
                <span className="text-sm">Temperature: Perfect for walking</span>
              </div>
              <div className="flex items-center gap-2">
                <FaRoute className="text-green-500" />
                <span className="text-sm">Route: {aiInsights.routeOptimality}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                <span className="text-sm">Experience Score: {aiInsights.experienceScore}/10</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Emergency Alerts */}
      <AnimatePresence>
        {emergencyAlerts && emergencyAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <FaExclamationTriangle />
                <span className="font-semibold">Safety Alert</span>
              </div>
              {emergencyAlerts.map((alert, index) => (
                <p key={index} className="text-red-600 mt-2">{alert.message}</p>
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Stream */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaCamera className="text-pink-500" />
          Walk Photos & Updates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {walkingMetrics?.photoUrls?.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img 
                src={url} 
                alt={`Walk photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
          {(!walkingMetrics?.photoUrls || walkingMetrics.photoUrls.length === 0) && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Photos will appear here during the walk
            </div>
          )}
        </div>
      </Card>

      {/* Walker Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Walker Actions</h3>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <FaCamera />
            Take Photo
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FaMapMarkerAlt />
            Mark POI
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FaShieldAlt />
            Emergency
          </Button>
        </div>
      </Card>
    </div>
  );
};
