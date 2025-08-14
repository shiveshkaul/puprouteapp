import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import WalkersMap from '@/components/WalkersMap';
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
  FaList
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
  latitude: number;
  longitude: number;
  walker_availability?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  }[];
}

interface SearchFilters {
  location: string;
  serviceType: string;
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
}

const MarketplaceDashboard = () => {
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [filteredWalkers, setFilteredWalkers] = useState<Walker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: '79787',
    serviceType: 'boarding',
    petSize: '',
    dateFrom: '',
    dateTo: '',
    priceMin: 1,
    priceMax: 150,
    hasHouse: false,
    hasFencedGarden: false,
    acceptsPuppies: false,
    noOtherPets: false,
    verified: false
  });

  // Get user's location
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
          console.error('Error getting location:', error);
          // Default to Zurich, Switzerland
          setUserLocation({ lat: 47.3769, lng: 8.5417 });
        }
      );
    }
  }, []);

  // Fetch walkers from Supabase
  useEffect(() => {
    const fetchWalkers = async () => {
      const { data, error } = await supabase
        .from('walkers')
        .select(`
          *,
          walker_availability(*)
        `)
        .limit(50);

      if (error) {
        console.error('Error fetching walkers:', error);
        return;
      }

      if (data) {
        // Add mock coordinates for map display (in real app, these would be stored in DB)
        const walkersWithCoords = data.map((walker, index) => ({
          ...walker,
          latitude: userLocation ? userLocation.lat + (Math.random() - 0.5) * 0.1 : 47.3769 + (Math.random() - 0.5) * 0.1,
          longitude: userLocation ? userLocation.lng + (Math.random() - 0.5) * 0.1 : 8.5417 + (Math.random() - 0.5) * 0.1,
        }));
        
        setWalkers(walkersWithCoords);
        setFilteredWalkers(walkersWithCoords);
      }
      setLoading(false);
    };

    fetchWalkers();
  }, [userLocation]);

  // Apply filters
  useEffect(() => {
    let filtered = walkers.filter(walker => {
      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (!walker.first_name.toLowerCase().includes(searchLower) &&
            !walker.last_name.toLowerCase().includes(searchLower) &&
            !walker.city.toLowerCase().includes(searchLower) &&
            !walker.bio.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Price filter
      const rate = filters.serviceType === 'boarding' ? walker.day_rate : walker.walk_rate;
      if (rate < filters.priceMin || rate > filters.priceMax) {
        return false;
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
    if (!availability) {
      return 'Contact for availability';
    }
    
    const days = [];
    
    if (availability.monday) days.push('Mon');
    if (availability.tuesday) days.push('Tue');
    if (availability.wednesday) days.push('Wed');
    if (availability.thursday) days.push('Thu');
    if (availability.friday) days.push('Fri');
    if (availability.saturday) days.push('Sat');
    if (availability.sunday) days.push('Sun');
    
    return days.length > 0 ? days.join(', ') : 'Contact for availability';
  };

  const serviceTypes = [
    { id: 'boarding', label: 'Boarding', desc: 'in the sitter\'s home' },
    { id: 'house-sitting', label: 'House Sitting', desc: 'in your home' },
    { id: 'drop-in', label: 'Drop-In Visits', desc: 'visits in your home' },
    { id: 'daycare', label: 'Doggy Day Care', desc: 'in the sitter\'s home' },
    { id: 'walking', label: 'Dog Walking', desc: 'in your neighbourhood' }
  ];

  const petSizes = [
    { id: '0-7', label: '0-7' },
    { id: '7-18', label: '7-18' },
    { id: '18-45', label: '18-45' },
    { id: '45+', label: '45+' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/src/assets/logo-pup.png" alt="PupRoute" className="h-8 w-8" />
              <h1 className="text-xl font-bold text-gray-900">PupRoute</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Become a Sitter</Button>
              <Button variant="outline">Invite a Friend</Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Shivesh</span>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Search Filters</h2>
              
              {/* Service Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Service type</label>
                <div className="space-y-2">
                  {serviceTypes.map(service => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={service.id}
                        name="serviceType"
                        checked={filters.serviceType === service.id}
                        onChange={(e) => setFilters(prev => ({ ...prev, serviceType: service.id }))}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <label htmlFor={service.id} className="text-sm">
                        <div className="font-medium">{service.label}</div>
                        <div className="text-gray-500 text-xs">{service.desc}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Boarding near</label>
                <Input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>

              {/* Dates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dates</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Drop off</label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Pick up</label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Number of pets */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">How many pets?</label>
                <div className="flex space-x-2">
                  {[1, 2, '3+'].map(num => (
                    <Button key={num} variant="outline" size="sm" className="flex-1">
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Pet size */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dog size (kg)</label>
                <div className="grid grid-cols-2 gap-2">
                  {petSizes.map(size => (
                    <Button key={size.id} variant="outline" size="sm">
                      {size.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate per night</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">€{filters.priceMin}</span>
                  <input
                    type="range"
                    min="1"
                    max="150"
                    value={filters.priceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm">€{filters.priceMax}</span>
                </div>
              </div>

              {/* Additional filters */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Housing conditions</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Has house (excludes flats)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Has fenced garden</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Verification</h3>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={filters.verified}
                      onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                    />
                    <span className="text-sm">Identity Verified Only</span>
                  </label>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  setFilters({
                    location: '79787',
                    serviceType: 'boarding',
                    petSize: '',
                    dateFrom: '',
                    dateTo: '',
                    priceMin: 1,
                    priceMax: 150,
                    hasHouse: false,
                    hasFencedGarden: false,
                    acceptsPuppies: false,
                    noOtherPets: false,
                    verified: false
                  });
                  setSearchQuery('');
                }}
              >
                Reset all
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, location, or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <FaFilter className="mr-2" />
                  Filters
                </Button>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <FaList className="mr-2" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                  >
                    <FaMap className="mr-2" />
                    Map
                  </Button>
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">Find a match</h2>
              <p className="text-gray-600">
                Add dates to see boarding sitters who'll be available for your need. 
                These are sitters in your area, but they might not be available.
              </p>
            </div>

            {/* Results */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
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
                  walkers={filteredWalkers}
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
                      <div className="flex items-start space-x-6">
                        {/* Profile Image */}
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                            {walker.first_name[0]}{walker.last_name[0]}
                          </div>
                          {walker.is_verified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <FaCheck className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {index + 1}. {walker.first_name} {walker.last_name}
                              </h3>
                              <p className="text-gray-600 text-sm mb-1">{walker.bio}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <FaMapMarkerAlt />
                                <span>{walker.city}, {walker.country}</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-gray-500 mb-1">from</div>
                              <div className="text-2xl font-bold text-green-600">
                                €{filters.serviceType === 'boarding' ? walker.day_rate : walker.walk_rate}
                              </div>
                              <div className="text-sm text-gray-500">per {filters.serviceType === 'boarding' ? 'night' : 'walk'}</div>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={i < walker.rating ? 'text-yellow-400' : 'text-gray-300'} 
                                />
                              ))}
                            </div>
                            <span className="font-bold">{walker.rating}</span>
                            <span className="text-gray-500">• {walker.reviews} reviews</span>
                            {walker.reviews > 0 && (
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">{walker.reviews}</span>
                              </div>
                            )}
                          </div>

                          {/* Bio Quote */}
                          <blockquote className="text-gray-700 italic text-sm mb-3 pl-4 border-l-2 border-gray-200">
                            "{walker.bio || 'Passionate about providing the best care for your furry friends!'}"
                          </blockquote>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {walker.is_verified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                ✓ Identity Verified
                              </Badge>
                            )}
                            {walker.is_safety_certified && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                🛡️ Safety Certified
                              </Badge>
                            )}
                            {walker.experience_years > 0 && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                {walker.experience_years} years experience
                              </Badge>
                            )}
                          </div>

                          {/* Services & Pet Types */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {walker.services.map((service, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {walker.pet_types.map((type, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-pink-50 text-pink-700">
                                {type}
                              </Badge>
                            ))}
                          </div>

                          {/* Availability */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <FaCalendarAlt className="inline mr-1" />
                              Available: {getAvailabilityDays(walker)}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleFavorite(walker.id)}
                                className={favorites.includes(walker.id) ? 'text-red-500' : 'text-gray-500'}
                              >
                                <FaHeart className={favorites.includes(walker.id) ? 'fill-current' : ''} />
                              </Button>
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                Book Now
                              </Button>
                            </div>
                          </div>

                          {/* Last updated */}
                          <div className="text-xs text-gray-400 mt-2">
                            Availability updated {Math.floor(Math.random() * 7) + 1} days ago
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">No sitters found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or expanding your location range.
                </p>
              </Card>
            )}
          </div>

          {/* Map Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <WalkersMap 
                walkers={filteredWalkers}
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

export default MarketplaceDashboard;
