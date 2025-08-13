import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaFilter,
  FaDollarSign,
  FaCertificate,
  FaHeart,
  FaUserFriends,
  FaCalendarAlt
} from "react-icons/fa";
import { useWalkers, useWalkerMatchingScore, type WalkerFilters } from "@/hooks/useWalkers";
import { usePets } from "@/hooks/usePets";
import { Link } from "react-router-dom";

interface SmartMatchingProps {
  onWalkerSelect?: (walkerId: string) => void;
  selectedPetId?: string;
  className?: string;
}

const SmartMatching = ({ onWalkerSelect, selectedPetId, className }: SmartMatchingProps) => {
  const { data: pets = [] } = usePets();
  const [filters, setFilters] = useState<WalkerFilters>({
    minRating: 4.0,
    maxPrice: 50,
    experience: 'experienced',
    specialties: [] as string[],
    certifications: [] as string[]
  });

  const { data: walkers = [], isLoading } = useWalkers(filters);
  const [matchingScores, setMatchingScores] = useState<Record<string, number>>({});

  // Calculate matching scores for all walkers
  useEffect(() => {
    if (selectedPetId && walkers.length > 0) {
      walkers.forEach(async (walker) => {
        // This would ideally use the useWalkerMatchingScore hook in a loop
        // For demo purposes, we'll simulate matching scores
        const baseScore = walker.average_rating * 20; // 0-100 scale
        const experienceBonus = Math.min(walker.experience_years * 5, 20);
        const reviewBonus = Math.min(walker.total_reviews * 2, 15);
        const simulatedScore = Math.min(baseScore + experienceBonus + reviewBonus + Math.random() * 10, 100);
        
        setMatchingScores(prev => ({
          ...prev,
          [walker.id]: Math.round(simulatedScore)
        }));
      });
    }
  }, [selectedPetId, walkers]);

  const specialtyOptions = [
    'Puppies', 'Senior Dogs', 'Large Breeds', 'Small Breeds', 
    'Energetic Dogs', 'Anxious Dogs', 'Training', 'Behavioral Issues'
  ];

  const certificationOptions = [
    'Pet First Aid', 'Dog Training Certification', 'Animal Behavior', 
    'Veterinary Assistant', 'Professional Dog Walker', 'Pet Insurance'
  ];

  const sortedWalkers = [...walkers].sort((a, b) => {
    const scoreA = matchingScores[a.id] || 0;
    const scoreB = matchingScores[b.id] || 0;
    return scoreB - scoreA;
  });

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 90) return 'Perfect Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    return 'Okay Match';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Smart Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaFilter className="text-primary" />
          Smart Matching Filters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Rating Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
            <Slider
              value={[filters.minRating]}
              onValueChange={(value) => setFilters({...filters, minRating: value[0]})}
              max={5}
              min={1}
              step={0.1}
              className="mb-2"
            />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FaStar className="text-yellow-500" />
              {filters.minRating.toFixed(1)}+
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Max Price per Hour</label>
            <Slider
              value={[filters.maxPrice]}
              onValueChange={(value) => setFilters({...filters, maxPrice: value[0]})}
              max={100}
              min={10}
              step={5}
              className="mb-2"
            />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FaDollarSign />
              ${filters.maxPrice}
            </div>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Experience Level</label>
            <Select value={filters.experience} onValueChange={(value) => setFilters({...filters, experience: value as 'novice' | 'experienced' | 'expert'})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novice">Novice (0-1 years)</SelectItem>
                <SelectItem value="experienced">Experienced (2-4 years)</SelectItem>
                <SelectItem value="expert">Expert (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specialties */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Specialties</label>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty}
                    checked={filters.specialties.includes(specialty)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters({
                          ...filters,
                          specialties: [...filters.specialties, specialty]
                        });
                      } else {
                        setFilters({
                          ...filters,
                          specialties: filters.specialties.filter(s => s !== specialty)
                        });
                      }
                    }}
                  />
                  <label htmlFor={specialty} className="text-sm cursor-pointer">
                    {specialty}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="text-sm font-medium mb-2 block">Availability</label>
            <Select 
              value={filters.availability || 'any'} 
              onValueChange={(value) => setFilters({
                ...filters, 
                availability: value === 'any' ? undefined : value as 'today' | 'tomorrow' | 'this_week'
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Time</SelectItem>
                <SelectItem value="today">Available Today</SelectItem>
                <SelectItem value="tomorrow">Available Tomorrow</SelectItem>
                <SelectItem value="this_week">Available This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Matching Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Smart Matches {selectedPetId && pets.find(p => p.id === selectedPetId) && 
            `for ${pets.find(p => p.id === selectedPetId)?.name}`}
          </h3>
          <Badge variant="secondary">
            {sortedWalkers.length} walker{sortedWalkers.length !== 1 ? 's' : ''} found
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : sortedWalkers.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters to find more walkers.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setFilters({
                minRating: 4.0,
                maxPrice: 50,
                experience: 'experienced',
                specialties: [],
                certifications: []
              })}
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedWalkers.map((walker, index) => {
              const matchScore = matchingScores[walker.id] || 0;
              return (
                <motion.div
                  key={walker.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer relative">
                    {/* Match Score Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(matchScore)}`}>
                      {matchScore}% {getMatchLabel(matchScore)}
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={walker.users?.avatar_url} alt={walker.users?.first_name} />
                        <AvatarFallback>
                          {walker.users?.first_name?.charAt(0)}{walker.users?.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">
                          {walker.users?.first_name} {walker.users?.last_name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-500" />
                            <span>{walker.average_rating?.toFixed(1)}</span>
                          </div>
                          <span>•</span>
                          <span>${walker.hourly_rate}/hr</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FaUserFriends />
                        <span>{walker.experience_years}+ years experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FaMapMarkerAlt />
                        <span>{walker.service_radius_km || 5}km radius</span>
                      </div>
                      {walker.total_reviews > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FaStar />
                          <span>{walker.total_reviews} reviews</span>
                        </div>
                      )}
                    </div>

                    {/* Specialties */}
                    {walker.walker_specialties && walker.walker_specialties.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {walker.walker_specialties.slice(0, 3).map((specialty, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {specialty.specialty_types?.name}
                            </Badge>
                          ))}
                          {walker.walker_specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{walker.walker_specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        asChild
                      >
                        <Link to={`/walker/${walker.id}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onWalkerSelect?.(walker.id)}
                      >
                        Select
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMatching;
