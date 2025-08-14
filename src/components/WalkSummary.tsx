import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Clock, 
  Route, 
  Heart,
  Footprints,
  Camera,
  Share2,
  Download,
  Star,
  Zap,
  Trophy,
  Target,
  Bookmark,
  Calendar,
  Edit3,
  Copy,
  CheckCircle
} from 'lucide-react';
import { GoogleMapsService } from '@/services/GoogleMapsService';

interface WalkSummaryData {
  walkId: string;
  pets: string[];
  stats: {
    durationMs: number;
    distanceMeters: number;
    avgPaceMinPerKm: number;
    calories: number;
    steps: number;
    elevationGainM: number;
    maxSpeedKmh: number;
  };
  events: Array<{
    id: string;
    type: string;
    timestamp: number;
    location: { lat: number; lng: number };
    notes?: string;
  }>;
  path: Array<{ lat: number; lng: number; timestamp: number }>;
  startTime: number;
  endTime: number;
  route?: {
    id: string;
    waypoints: Array<{ name: string; location: { lat: number; lng: number } }>;
  };
}

interface WalkSummaryProps {
  walkData: WalkSummaryData;
  pets: any[];
  onSaveTemplate: (template: any) => void;
  onScheduleAgain: (schedule: any) => void;
  onClose: () => void;
}

export const WalkSummary: React.FC<WalkSummaryProps> = ({
  walkData,
  pets,
  onSaveTemplate,
  onScheduleAgain,
  onClose
}) => {
  const [aiCaption, setAiCaption] = useState<string>('');
  const [captionVariations, setCaptionVariations] = useState<string[]>([]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState<string>('');
  const [mapImageUrl, setMapImageUrl] = useState<string>('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const [mapsService] = useState(() => new GoogleMapsService());

  useEffect(() => {
    generateAICaption();
    generateMapImage();
    calculateAchievements();
    
    // Debug walk data
    console.log('WalkSummary received data:', {
      walkId: walkData.walkId,
      pathLength: walkData.path?.length || 0,
      path: walkData.path?.slice(0, 5), // Show first 5 points
      stats: walkData.stats,
      events: walkData.events?.length || 0
    });
  }, []);

  const generateAICaption = async () => {
    setIsGeneratingCaption(true);
    
    try {
      // Gather context for AI caption
      const walkPets = pets.filter(pet => walkData.pets.includes(pet.id));
      const duration = Math.round(walkData.stats.durationMs / 60000); // minutes
      const distance = (walkData.stats.distanceMeters / 1000).toFixed(1); // km
      const locations = walkData.route?.waypoints?.map(w => w.name) || [];
      const events = walkData.events.map(e => e.type);
      
      // Create context for AI
      const context = {
        pets: walkPets.map(pet => ({ name: pet.name, breed: pet.breed })),
        duration: `${duration} minutes`,
        distance: `${distance} km`,
        locations: locations.slice(0, 3), // Top 3 locations
        highlights: events.filter((event, index, arr) => arr.indexOf(event) === index), // Unique events
        pace: formatPace(walkData.stats.avgPaceMinPerKm),
        time: new Date(walkData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Generate multiple caption variations
      const captions = await generateCaptionVariations(context);
      
      setAiCaption(captions[0]);
      setCaptionVariations(captions);
      setSelectedCaption(captions[0]);
      
    } catch (error) {
      console.error('Failed to generate AI caption:', error);
      setAiCaption(generateFallbackCaption());
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const generateCaptionVariations = async (context: any): Promise<string[]> => {
    // In a real app, this would call OpenAI/Gemini API
    // For now, generate smart captions based on context
    
    const petNames = context.pets.map((p: any) => p.name).join(' and ');
    const mainLocation = context.locations[0] || 'the neighborhood';
    
    const variations = [
      `🐾 Amazing ${context.duration} walk with ${petNames}! Explored ${mainLocation} covering ${context.distance}. ${getRandomWalkEmoji()} #DogWalk #PupAdventure`,
      
      `${petNames} crushed a ${context.distance} adventure today! 💪 ${context.duration} of pure exploration around ${mainLocation}. Who's ready for tomorrow? 🚀`,
      
      `Perfect ${context.time} walk vibes! 🌟 ${petNames} and I conquered ${context.distance} through ${mainLocation}. ${formatHighlights(context.highlights)} #WalkingBuddy`,
      
      `Daily dose of joy: ✅ ${context.distance} with my favorite walking partner${context.pets.length > 1 ? 's' : ''} ${petNames}! ${mainLocation} was pawsome today 🐕`,
      
      `Another epic adventure in the books! 📚 ${petNames} showed me all the best spots in ${mainLocation}. ${context.distance} of pure happiness! 😊`
    ];

    return variations;
  };

  const generateFallbackCaption = (): string => {
    const walkPets = pets.filter(pet => walkData.pets.includes(pet.id));
    const petNames = walkPets.map(pet => pet.name).join(' and ');
    const distance = (walkData.stats.distanceMeters / 1000).toFixed(1);
    const duration = Math.round(walkData.stats.durationMs / 60000);
    
    return `🐾 Great ${duration} minute walk with ${petNames}! Covered ${distance}km and made some wonderful memories. #DogWalk #PupLife`;
  };

  const generateMapImage = () => {
    console.log('Generating map with path data:', walkData.path?.length || 0, 'points');
    
    if (!walkData.path || walkData.path.length < 2) {
      console.log('Not enough path points to generate map, creating fallback');
      
      // Create a simple center point map if we don't have enough path data
      if (walkData.path && walkData.path.length === 1) {
        const center = walkData.path[0];
        const fallbackUrl = `https://maps.googleapis.com/maps/api/staticmap?` +
          `center=${center.lat},${center.lng}&` +
          `zoom=15&` +
          `size=640x400&` +
          `markers=color:blue|label:W|${center.lat},${center.lng}&` +
          `key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
        
        console.log('Generated fallback map URL:', fallbackUrl);
        setMapImageUrl(fallbackUrl);
      }
      return;
    }

    try {
      // Create static map with path
      const pathString = walkData.path
        .filter((_, index) => index % Math.max(1, Math.floor(walkData.path.length / 50)) === 0) // Sample points
        .map(p => `${p.lat},${p.lng}`)
        .join('|');

      const center = walkData.path[Math.floor(walkData.path.length / 2)];
      const zoom = calculateZoomLevel(walkData.path);

      // Use simple path encoding
      const url = `https://maps.googleapis.com/maps/api/staticmap?` +
        `center=${center.lat},${center.lng}&` +
        `zoom=${zoom}&` +
        `size=640x400&` +
        `path=color:0x0099ff|weight:5|${pathString}&` +
        `markers=color:green|label:S|${walkData.path[0].lat},${walkData.path[0].lng}&` +
        `markers=color:red|label:E|${walkData.path[walkData.path.length - 1].lat},${walkData.path[walkData.path.length - 1].lng}&` +
        `key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

      console.log('Generated map URL:', url);
      setMapImageUrl(url);
    } catch (error) {
      console.error('Error generating map:', error);
    }
  };

  // Simple polyline encoding for better path representation
  const encodePolyline = (points: Array<{ lat: number; lng: number }>) => {
    if (points.length === 0) return '';
    
    // Simple encoding - for production, use proper polyline encoding library
    return points
      .filter((_, index) => index % Math.max(1, Math.floor(points.length / 100)) === 0)
      .map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`)
      .join('|');
  };

  const calculateZoomLevel = (path: any[]): number => {
    if (path.length < 2) return 15;

    const lats = path.map(p => p.lat);
    const lngs = path.map(p => p.lng);
    
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);

    if (maxRange > 0.1) return 11;
    if (maxRange > 0.05) return 12;
    if (maxRange > 0.02) return 13;
    if (maxRange > 0.01) return 14;
    return 15;
  };

  const calculateAchievements = () => {
    const achievements: string[] = [];
    const { stats } = walkData;

    // Distance achievements
    if (stats.distanceMeters >= 5000) achievements.push('🏃‍♀️ 5K Explorer');
    else if (stats.distanceMeters >= 3000) achievements.push('🚶‍♀️ 3K Wanderer');
    else if (stats.distanceMeters >= 1000) achievements.push('👟 1K Walker');

    // Duration achievements
    const minutes = stats.durationMs / 60000;
    if (minutes >= 60) achievements.push('⏰ Hour Hero');
    else if (minutes >= 30) achievements.push('🕐 Half Hour Hustle');

    // Speed achievements
    if (stats.avgPaceMinPerKm < 12) achievements.push('⚡ Speed Walker');
    if (stats.maxSpeedKmh > 8) achievements.push('🏃‍♀️ Sprint Star');

    // Activity achievements
    if (walkData.events.length >= 5) achievements.push('📸 Memory Maker');
    if (walkData.events.filter(e => e.type === 'pee').length >= 3) achievements.push('💧 Hydration Station');

    // Special achievements
    const hour = new Date(walkData.startTime).getHours();
    if (hour < 7) achievements.push('🌅 Early Bird');
    if (hour > 19) achievements.push('🌙 Night Owl');

    setAchievements(achievements);
  };

  const saveAsTemplate = () => {
    const template = {
      name: `${new Date(walkData.startTime).toLocaleDateString()} Walk`,
      route: walkData.route,
      duration: walkData.stats.durationMs,
      distance: walkData.stats.distanceMeters,
      pets: walkData.pets,
      waypoints: walkData.route?.waypoints || [],
      path: walkData.path
    };

    onSaveTemplate(template);
    setIsBookmarked(true);
  };

  const scheduleAgain = () => {
    const schedule = {
      templateId: walkData.walkId,
      suggestedTimes: [
        'Tomorrow at this time',
        'Same time Tuesday',
        'Same time Thursday',
        'Weekly repeat'
      ],
      route: walkData.route,
      pets: walkData.pets
    };

    onScheduleAgain(schedule);
  };

  const shareCaption = async (caption: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Dog Walk Adventure',
          text: caption,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(caption);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatPace = (minPerKm: number): string => {
    if (!minPerKm || !isFinite(minPerKm)) return '--:--';
    const mins = Math.floor(minPerKm);
    const secs = Math.round((minPerKm - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const getRandomWalkEmoji = (): string => {
    const emojis = ['🎾', '🦴', '🐕‍🦺', '🌳', '🏃‍♀️', '💪', '🌟', '🎯'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const formatHighlights = (highlights: string[]): string => {
    if (highlights.length === 0) return '';
    if (highlights.includes('water')) return 'Perfect hydration breaks! 💧';
    if (highlights.includes('pee')) return 'Great sniffing spots discovered! 👃';
    if (highlights.includes('treat')) return 'Treat time was a hit! 🦴';
    return 'Wonderful adventure highlights! ✨';
  };

  const walkPets = pets.filter(pet => walkData.pets.includes(pet.id));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">🏆 Walk Complete!</h1>
        <p className="text-gray-600">Here's your adventure summary</p>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Achievements Unlocked!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {achievement}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Your Route
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mapImageUrl ? (
            <img 
              src={mapImageUrl} 
              alt="Walk route map"
              className="w-full h-64 object-cover rounded-lg border"
              onError={(e) => {
                console.error('Map image failed to load:', mapImageUrl);
                setMapImageUrl('');
              }}
            />
          ) : walkData.path.length >= 2 ? (
            <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Generating route map...</p>
                <p className="text-xs">Path points: {walkData.path.length}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Route map unavailable</p>
                <p className="text-xs">Not enough location data recorded</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-green-500" />
            Walk Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-bold text-xl">{formatTime(walkData.stats.durationMs)}</p>
            </div>
            <div className="text-center">
              <Route className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-gray-500">Distance</p>
              <p className="font-bold text-xl">{formatDistance(walkData.stats.distanceMeters)}</p>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-sm text-gray-500">Avg Pace</p>
              <p className="font-bold text-xl">{formatPace(walkData.stats.avgPaceMinPerKm)}</p>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-sm text-gray-500">Calories</p>
              <p className="font-bold text-xl">{walkData.stats.calories}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-500">Steps</p>
              <p className="font-medium text-lg">{walkData.stats.steps.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Max Speed</p>
              <p className="font-medium text-lg">{walkData.stats.maxSpeedKmh.toFixed(1)} km/h</p>
            </div>
            <div>
              <p className="text-gray-500">Events</p>
              <p className="font-medium text-lg">{walkData.events.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Walking Buddies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Walking Buddies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {walkPets.map(pet => (
              <div key={pet.id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {pet.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium">{pet.name}</h3>
                  <p className="text-sm text-gray-500">{pet.breed}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Caption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-purple-500" />
            AI-Generated Caption
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGeneratingCaption ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Zap className="h-4 w-4 animate-spin" />
              Generating perfect caption...
            </div>
          ) : (
            <>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800">{selectedCaption}</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => shareCaption(selectedCaption)}
                  className="flex items-center gap-2"
                >
                  {copiedToClipboard ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => shareCaption(selectedCaption)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Caption Variations */}
              {captionVariations.length > 1 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Other suggestions:</p>
                  {captionVariations.slice(1).map((variation, index) => (
                    <div 
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedCaption === variation 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCaption(variation)}
                    >
                      <p className="text-sm text-gray-700">{variation}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={saveAsTemplate}
          disabled={isBookmarked}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          {isBookmarked ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Bookmarked!
            </>
          ) : (
            <>
              <Bookmark className="h-5 w-5 mr-2" />
              Save as Template
            </>
          )}
        </Button>
        
        <Button
          onClick={scheduleAgain}
          variant="outline"
          className="flex-1"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Schedule Again
        </Button>
        
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1"
        >
          Done
        </Button>
      </div>

      {/* Walk Events Timeline */}
      {walkData.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-orange-500" />
              Walk Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {walkData.events.map(event => (
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
    </div>
  );
};

export default WalkSummary;
