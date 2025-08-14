import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WalkersMap from '@/components/WalkersMap';
import { useAuth } from '@/hooks/useAuth';
import { usePets } from '@/hooks/usePets';
import { useBookings } from '@/hooks/useBookings';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaStar, 
  FaHeart, 
  FaFilter,
  FaDog,
  FaCalendarAlt,
  FaShieldAlt,
  FaCheck,
  FaMap,
  FaList,
  FaClock,
  FaRoute,
  FaBrain,
  FaLocationArrow,
  FaBookmark,
  FaPlay,
  FaPhone,
  FaEnvelope,
  FaEye
} from 'react-icons/fa';

interface Walker {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  city: string;
  country: string;
  bio: string;
  rating: number;
  reviews: number;
  walk_rate: number;
  day_rate: number;
  is_verified: boolean;
  is_safety_certified: boolean;
  pet_types: string[];
  services: string[];
  experience_years: number;
  latitude?: number;
  longitude?: number;
  walker_availability?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  }[];
  matchScore?: number;
}

interface SearchFilters {
  location: string;
  serviceType: 'walking' | 'sitting' | 'boarding' | 'daycare' | 'all';
  petSize: string;
  dateFrom: string;
  dateTo: string;
  priceMin: number;
  priceMax: number;
  hasHouse: boolean;
  hasFencedGarden: boolean;
  acceptsPuppies: boolean;
  noOtherPets: boolean;
  verified: boolean;
  experience: string;
  rating: number;
  distance: number;
}

const WalkerMarketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: pets = [] } = usePets();
  const { data: bookings = [] } = useBookings();
  
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [filteredWalkers, setFilteredWalkers] = useState<Walker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [quickActions, setQuickActions] = useState({
    emergencyWalk: false,
    scheduledWalk: false,
    aiRecommendations: false
  });
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    serviceType: 'all',
    petSize: '',
    dateFrom: '',
    dateTo: '',
    priceMin: 1,
    priceMax: 150,
    hasHouse: false,
    hasFencedGarden: false,
    acceptsPuppies: false,
    noOtherPets: false,
    verified: false,
    experience: '',
    rating: 0,
    distance: 25
  });

  // Get user's location for nearby walker discovery
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  // Fetch walkers from Supabase
  useEffect(() => {
    const fetchWalkers = async () => {
      try {
        const { data, error } = await supabase
          .from('walkers')
          .select(`
            *,
            walker_availability(*)
          `)
          .eq('is_verified', true)
          .order('rating', { ascending: false });

        if (error) throw error;
        
        setWalkers(data || []);
        setFilteredWalkers(data || []);
      } catch (error) {
        console.error('Failed to fetch walkers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalkers();
  }, []);

  // Filter walkers based on search and filters
  useEffect(() => {
    let filtered = walkers.filter(walker => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${walker.first_name} ${walker.last_name}`.toLowerCase().includes(query);
        const matchesCity = walker.city?.toLowerCase().includes(query);
        const matchesBio = walker.bio?.toLowerCase().includes(query);
        const matchesServices = walker.services?.some(service => service.toLowerCase().includes(query));
        
        if (!matchesName && !matchesCity && !matchesBio && !matchesServices) {
          return false;
        }
      }

      // Service type filter
      if (filters.serviceType !== 'all') {
        const serviceMap = {
          walking: 'Dog Walking',
          sitting: 'Pet Sitting',
          boarding: 'Boarding',
          daycare: 'Daycare'
        };
        const requiredService = serviceMap[filters.serviceType];
        if (!walker.services?.includes(requiredService)) {
          return false;
        }
      }

      // Price filter
      const rate = filters.serviceType === 'boarding' ? walker.day_rate : walker.walk_rate;
      if (rate < filters.priceMin || rate > filters.priceMax) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && walker.rating < filters.rating) {
        return false;
      }

      // Experience filter
      if (filters.experience) {
        const experienceYears = walker.experience_years || 0;
        if (filters.experience === 'new' && experienceYears > 1) return false;
        if (filters.experience === 'experienced' && (experienceYears < 2 || experienceYears > 5)) return false;
        if (filters.experience === 'expert' && experienceYears < 5) return false;
      }

      // Verification filter
      if (filters.verified && !walker.is_verified) {
        return false;
      }

      return true;
    });

    setFilteredWalkers(filtered);
  }, [walkers, searchQuery, filters]);

  const handleWalkerSelect = (walker: any) => {
    setSelectedWalker(walker);
  };

  const toggleFavorite = (walkerId: number) => {
    setFavorites(prev => 
      prev.includes(walkerId) 
        ? prev.filter(id => id !== walkerId)
        : [...prev, walkerId]
    );
  };

  const getAvailabilityDays = (walker: Walker) => {
    if (!walker.walker_availability || walker.walker_availability.length === 0) {
      return 'Contact for availability';
    }
    
    const availability = walker.walker_availability[0];
    const days = Object.entries(availability)
      .filter(([key, value]) => !key.includes('id') && !key.includes('walker_id') && value === true)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1, 3))
      .join(', ');
    
    return days || 'Contact for availability';
  };

  const handleBookWalk = (walkerId: number, petId?: string) => {
    const params = new URLSearchParams();
    params.set('walker', walkerId.toString());
    if (petId) params.set('pet', petId);
    navigate(`/bookings/new?${params.toString()}`);
  };

  const handleEmergencyWalk = () => {
    if (pets.length === 0) {
      navigate('/pets');
      return;
    }
    
    const nearbyWalkers = filteredWalkers
      .filter(w => w.rating >= 4.5 && w.is_verified)
      .slice(0, 3);
    
    setQuickActions(prev => ({ ...prev, emergencyWalk: true }));
    setFilteredWalkers(nearbyWalkers);
  };

  const handleAIRecommendations = () => {
    if (pets.length === 0) {
      navigate('/pets');
      return;
    }

    // AI-powered walker matching based on pet characteristics
    const recommendedWalkers = filteredWalkers
      .map(walker => {
        let score = 0;
        
        // Base score from rating
        score += walker.rating * 20;
        
        // Experience bonus
        score += Math.min(walker.experience_years * 5, 25);
        
        // Service matching for pet types
        if (pets.length > 0) {
          const petSizes = pets.map(pet => {
            if (pet.weight < 25) return 'small';
            if (pet.weight > 60) return 'large';
            return 'medium';
          });
          
          const hasMatchingServices = walker.pet_types?.some(type => 
            petSizes.some(size => type.toLowerCase().includes(size))
          );
          
          if (hasMatchingServices) score += 30;
        }
        
        // Verification bonus
        if (walker.is_verified) score += 15;
        if (walker.is_safety_certified) score += 10;
        
        return { ...walker, matchScore: Math.min(score, 100) };
      })
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 5);

    setQuickActions(prev => ({ ...prev, aiRecommendations: true }));
    setFilteredWalkers(recommendedWalkers);
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section with Quick Actions */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              🐾 Find Your Perfect Walker
            </motion.h1>
            <motion.p 
              className="text-xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Trusted, verified dog walkers in your neighborhood with real-time tracking
            </motion.p>
            
            {/* Quick Actions */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                size="lg" 
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
                onClick={handleEmergencyWalk}
              >
                <FaLocationArrow className="mr-2" />
                Emergency Walk Now
              </Button>
              <Button 
                size="lg" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
                onClick={() => navigate('/bookings/new')}
              >
                <FaCalendarAlt className="mr-2" />
                Schedule Walk
              </Button>
              <Button 
                size="lg" 
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold"
                onClick={handleAIRecommendations}
              >
                <FaBrain className="mr-2" />
                AI Recommendations
              </Button>
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
                onClick={() => navigate('/premium-walk')}
              >
                <FaPlay className="mr-2" />
                Start Live Walk
              </Button>
            </motion.div>
          </div>

          {/* User Context Cards */}
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3">
                  <FaDog className="text-2xl text-yellow-300" />
                  <div>
                    <div className="font-bold text-lg">{pets.length}</div>
                    <div className="text-sm opacity-90">Your Pets</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-2xl text-blue-300" />
                  <div>
                    <div className="font-bold text-lg">{bookings.length}</div>
                    <div className="text-sm opacity-90">Total Bookings</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3">
                  <FaHeart className="text-2xl text-pink-300" />
                  <div>
                    <div className="font-bold text-lg">{favorites.length}</div>
                    <div className="text-sm opacity-90">Favorite Walkers</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by walker name, location, or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Service Type Filter */}
            <Select value={filters.serviceType} onValueChange={(value: any) => setFilters(prev => ({ ...prev, serviceType: value }))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="walking">Dog Walking</SelectItem>
                <SelectItem value="sitting">Pet Sitting</SelectItem>
                <SelectItem value="boarding">Boarding</SelectItem>
                <SelectItem value="daycare">Daycare</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <FaList className="mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                onClick={() => setViewMode('map')}
                className="rounded-none"
              >
                <FaMap className="mr-2" />
                Map
              </Button>
            </div>

            {/* Advanced Filters */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FaFilter />
              Filters
              {Object.values(filters).some(v => v && v !== '' && v !== 0 && v !== 1 && v !== 150) && (
                <Badge variant="secondary" className="ml-1">
                  {Object.values(filters).filter(v => v && v !== '' && v !== 0 && v !== 1 && v !== 150).length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div 
              className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <Select value={filters.experience} onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any experience</SelectItem>
                    <SelectItem value="new">New Walker (0-1 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (2-5 years)</SelectItem>
                    <SelectItem value="expert">Expert (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                <Select value={filters.rating.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseFloat(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                    <SelectItem value="5">5 stars only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price Range (€/hour)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: parseInt(e.target.value) || 1 }))}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMax: parseInt(e.target.value) || 150 }))}
                    className="w-20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Requirements</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Verified only</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Active Filters Display */}
        {quickActions.emergencyWalk && (
          <div className="mb-6">
            <Badge variant="destructive" className="text-lg p-3">
              <FaLocationArrow className="mr-2" />
              Emergency Walk Mode - Top Available Walkers
            </Badge>
          </div>
        )}

        {quickActions.aiRecommendations && (
          <div className="mb-6">
            <Badge className="bg-purple-600 text-lg p-3">
              <FaBrain className="mr-2" />
              AI Recommended Walkers Based on Your Pets
            </Badge>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredWalkers.length} Walker{filteredWalkers.length !== 1 ? 's' : ''} Available
            </h2>
            {userLocation && (
              <p className="text-gray-600">Near your location</p>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Walker Results */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="flex space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : viewMode === 'map' ? (
              <div className="h-96">
                <WalkersMap 
                  walkers={filteredWalkers.map(w => ({
                    ...w,
                    latitude: w.latitude || 47.3769 + (Math.random() - 0.5) * 0.1,
                    longitude: w.longitude || 8.5417 + (Math.random() - 0.5) * 0.1
                  }))}
                  userLocation={userLocation}
                  onWalkerSelect={handleWalkerSelect}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWalkers.map((walker, index) => (
                  <motion.div
                    key={walker.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex gap-6">
                        {/* Walker Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {walker.first_name[0]}{walker.last_name[0]}
                        </div>

                        {/* Walker Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {walker.first_name} {walker.last_name}
                                {walker.matchScore && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    {walker.matchScore}% Match
                                  </Badge>
                                )}
                              </h3>
                              <div className="flex items-center gap-2 text-gray-600">
                                <FaMapMarkerAlt className="text-green-500" />
                                <span>{walker.city}, {walker.country}</span>
                                <FaStar className="text-yellow-400 ml-2" />
                                <span className="font-semibold">{walker.rating}</span>
                                <span>({walker.reviews} reviews)</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(walker.id)}
                              className={favorites.includes(walker.id) ? 'text-red-500' : 'text-gray-400'}
                            >
                              <FaHeart />
                            </Button>
                          </div>

                          {/* Badges */}
                          <div className="flex gap-2 mb-3">
                            {walker.is_verified && (
                              <Badge className="bg-green-100 text-green-800">
                                <FaCheck className="mr-1" />
                                Verified
                              </Badge>
                            )}
                            {walker.is_safety_certified && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <FaShieldAlt className="mr-1" />
                                Safety Certified
                              </Badge>
                            )}
                            <Badge className="bg-purple-100 text-purple-800">
                              {walker.experience_years} years exp
                            </Badge>
                          </div>

                          {/* Bio */}
                          <p className="text-gray-600 mb-3 line-clamp-2">{walker.bio}</p>

                          {/* Services & Pet Types */}
                          <div className="flex gap-4 mb-3">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Services:</span>
                              <div className="flex gap-1 mt-1">
                                {walker.services?.slice(0, 3).map((service, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Pricing & Availability */}
                          <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                              <div>
                                <span className="text-sm text-gray-500">Walking</span>
                                <div className="font-bold text-green-600">€{walker.walk_rate}/hour</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">Boarding</span>
                                <div className="font-bold text-blue-600">€{walker.day_rate}/day</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">Available</span>
                                <div className="text-sm text-gray-600">{getAvailabilityDays(walker)}</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/walker/${walker.id}`}>
                                  <FaEye className="mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleBookWalk(walker.id)}
                              >
                                <FaCalendarAlt className="mr-1" />
                                Book
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && filteredWalkers.length === 0 && (
              <Card className="p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No walkers found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or expanding your location range.
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    location: '',
                    serviceType: 'all',
                    petSize: '',
                    dateFrom: '',
                    dateTo: '',
                    priceMin: 1,
                    priceMax: 150,
                    hasHouse: false,
                    hasFencedGarden: false,
                    acceptsPuppies: false,
                    noOtherPets: false,
                    verified: false,
                    experience: '',
                    rating: 0,
                    distance: 25
                  });
                }}>
                  Clear All Filters
                </Button>
              </Card>
            )}
          </div>

          {/* Map Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="p-4 mb-6">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/become-walker')}
                  >
                    <FaDog className="mr-2" />
                    Become a Walker
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/pets')}
                  >
                    <FaHeart className="mr-2" />
                    Manage Pets
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/bookings')}
                  >
                    <FaCalendarAlt className="mr-2" />
                    My Bookings
                  </Button>
                </div>
              </Card>

              <WalkersMap 
                walkers={filteredWalkers.map(w => ({
                  ...w,
                  latitude: w.latitude || 47.3769 + (Math.random() - 0.5) * 0.1,
                  longitude: w.longitude || 8.5417 + (Math.random() - 0.5) * 0.1
                }))}
                userLocation={userLocation}
                onWalkerSelect={handleWalkerSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkerMarketplace;
