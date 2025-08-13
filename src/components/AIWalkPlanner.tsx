import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FaBrain, 
  FaRoute, 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaStar,
  FaWeightHanging,
  FaClock,
  FaExclamationTriangle,
  FaThumbsUp
} from 'react-icons/fa';
import { 
  useAIWalkSuggestions, 
  useAIWalkerMatching, 
  useAISafetyAnalysis 
} from '@/hooks/useAILocationIntelligence';
import { useLocationService } from '@/hooks/useLocationServices';
import LiveWalkMap from './LiveWalkMap';

interface AIWalkPlannerProps {
  pet: {
    id: string;
    name: string;
    breed: string;
    age: number;
    size: 'small' | 'medium' | 'large';
    energy_level: 'low' | 'medium' | 'high';
    special_needs?: string[];
    behavioral_notes?: string;
  };
  location: {
    lat: number;
    lng: number;
    neighborhood: string;
  };
  duration: number;
  onSelectRoute: (route: any) => void;
  onSelectWalker: (walkerId: string) => void;
}

const AIWalkPlanner: React.FC<AIWalkPlannerProps> = ({
  pet,
  location,
  duration,
  onSelectRoute,
  onSelectWalker
}) => {
  const [selectedTab, setSelectedTab] = useState('routes');
  const [weather, setWeather] = useState({
    temperature: 72,
    condition: 'partly cloudy',
    humidity: 60,
    windSpeed: 5
  });

  const walkContext = {
    weather,
    timeOfDay: new Date().getHours() < 12 ? 'morning' as const : 
               new Date().getHours() < 17 ? 'afternoon' as const : 'evening' as const,
    duration,
    walker_experience: 'experienced',
    location
  };

  const { data: aiSuggestions, isLoading: loadingSuggestions } = useAIWalkSuggestions(pet, walkContext);
  const { data: walkerMatches, isLoading: loadingMatches } = useAIWalkerMatching(pet, location);
  const { data: safetyAnalysis, isLoading: loadingSafety } = useAISafetyAnalysis(location, pet);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaBrain className="text-3xl text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-primary">
              AI Walk Planner for {pet.name}
            </h2>
            <p className="text-muted-foreground">
              Powered by AI • Optimized for {pet.breed} • {walkContext.timeOfDay} walk
            </p>
          </div>
        </div>

        {/* Weather & Context Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-lg font-semibold">{weather.temperature}°F</div>
            <div className="text-sm text-muted-foreground">{weather.condition}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-lg font-semibold">{duration} min</div>
            <div className="text-sm text-muted-foreground">Planned Duration</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-lg font-semibold capitalize">{pet.energy_level}</div>
            <div className="text-sm text-muted-foreground">Energy Level</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-lg font-semibold capitalize">{pet.size}</div>
            <div className="text-sm text-muted-foreground">Size Category</div>
          </Card>
        </div>
      </motion.div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <FaRoute />
            AI Route Suggestions
          </TabsTrigger>
          <TabsTrigger value="walkers" className="flex items-center gap-2">
            <FaStar />
            Walker Matching
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <FaShieldAlt />
            Safety Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaBrain className="text-purple-600" />
              AI-Recommended Routes
            </h3>
            
            {loadingSuggestions ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {aiSuggestions?.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:bg-accent/5 cursor-pointer"
                    onClick={() => onSelectRoute(suggestion)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">Route {index + 1}</h4>
                        <Badge className={getDifficultyColor(suggestion.difficulty)}>
                          {suggestion.difficulty}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <FaClock />
                          {suggestion.estimatedDuration} min
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{suggestion.reason}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <strong>Highlights:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {suggestion.highlights.map((highlight, i) => (
                            <li key={i}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Safety Notes:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {suggestion.safetyNotes.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Weather Tips:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {suggestion.weatherConsiderations.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Button className="mt-3 w-full" onClick={() => onSelectRoute(suggestion)}>
                      Select This Route
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="walkers" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaBrain className="text-purple-600" />
              AI Walker Matching
            </h3>
            
            {loadingMatches ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {walkerMatches?.map((match, index) => (
                  <motion.div
                    key={match.walkerId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:bg-accent/5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">Walker Match</h4>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-primary">
                            {match.matchScore}%
                          </div>
                          <div className="text-sm text-muted-foreground">compatibility</div>
                        </div>
                      </div>
                      <Badge variant={match.matchScore >= 80 ? 'default' : 'secondary'}>
                        {match.matchScore >= 80 ? 'Excellent Match' : 'Good Match'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <strong className="flex items-center gap-2 text-green-600">
                          <FaThumbsUp />
                          Why This Match Works:
                        </strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {match.reasons.map((reason, i) => (
                            <li key={i} className="text-sm">{reason}</li>
                          ))}
                        </ul>
                      </div>
                      {match.concerns.length > 0 && (
                        <div>
                          <strong className="flex items-center gap-2 text-yellow-600">
                            <FaExclamationTriangle />
                            Considerations:
                          </strong>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {match.concerns.map((concern, i) => (
                              <li key={i} className="text-sm">{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => onSelectWalker(match.walkerId)}
                      variant={match.matchScore >= 80 ? 'default' : 'outline'}
                    >
                      Book This Walker
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-green-600" />
              Real-time Safety Analysis
            </h3>
            
            {loadingSafety ? (
              <div className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            ) : safetyAnalysis ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <FaShieldAlt className={`text-2xl ${getRiskColor(safetyAnalysis.riskLevel)}`} />
                  <div>
                    <div className="font-semibold">
                      Current Risk Level: 
                      <span className={`ml-2 capitalize ${getRiskColor(safetyAnalysis.riskLevel)}`}>
                        {safetyAnalysis.riskLevel}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on location analysis for {pet.name}
                    </div>
                  </div>
                </div>

                {safetyAnalysis.alerts.length > 0 && (
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <FaExclamationTriangle />
                      Safety Alerts
                    </h4>
                    <ul className="space-y-1">
                      {safetyAnalysis.alerts.map((alert, i) => (
                        <li key={i} className="text-sm text-yellow-700">• {alert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {safetyAnalysis.recommendations.length > 0 && (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <FaThumbsUp />
                      AI Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {safetyAnalysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-blue-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIWalkPlanner;
