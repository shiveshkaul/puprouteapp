import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RealAdvancedWalkExperience } from '@/components/RealAdvancedWalkExperience';
import { usePets } from '@/hooks/usePets';
import { useWalkers } from '@/hooks/useWalkers';
import { useAuth } from '@/hooks/useAuth';
import { FaPaw, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

// Convert database pet to component Pet interface
const convertDatabasePetToComponent = (dbPet: any) => {
  // Determine size based on weight
  let size: 'small' | 'medium' | 'large' = 'medium';
  if (dbPet.weight) {
    if (dbPet.weight < 25) size = 'small';
    else if (dbPet.weight > 60) size = 'large';
  }
  
  return {
    id: dbPet.id,
    name: dbPet.name,
    breed: dbPet.custom_breed || 'Mixed Breed',
    photo_url: dbPet.photo_url,
    age: Math.floor(dbPet.estimated_age_months / 12) || 1,
    size,
    energy_level: dbPet.energy_level || 'medium'
  };
};

const PremiumWalkExperience = () => {
  const { user } = useAuth();
  const { data: pets = [] } = usePets();
  const { data: walkers = [] } = useWalkers();
  
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [selectedWalker, setSelectedWalker] = useState<string>('');
  const [duration, setDuration] = useState(30);
  const [walkStarted, setWalkStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get real user location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Don't set a fallback location - let the user enable location services
          console.log('Please enable location services for GPS tracking');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const handlePetSelection = (petId: string, checked: boolean) => {
    if (checked) {
      setSelectedPets(prev => [...prev, petId]);
    } else {
      setSelectedPets(prev => prev.filter(id => id !== petId));
    }
  };

  const startWalk = () => {
    if (selectedPets.length === 0) {
      alert('Please select at least one pet for the walk');
      return;
    }
    if (!currentLocation) {
      alert('Please enable location services to start GPS tracking');
      return;
    }
    setWalkStarted(true);
  };

  if (walkStarted && selectedPets.length > 0 && currentLocation) {
    const selectedPetObjects = pets
      .filter(pet => selectedPets.includes(pet.id))
      .map(convertDatabasePetToComponent);
    
    // Use selected walker or create a self-walk walker object
    let walkerObject;
    if (selectedWalker === 'self' || !selectedWalker) {
      walkerObject = {
        id: 'self-walk',
        first_name: user?.user_metadata?.first_name || 'You',
        last_name: user?.user_metadata?.last_name || '',
        avatar_url: user?.user_metadata?.avatar_url,
        rating: 5.0
      };
    } else {
      walkerObject = walkers.find(w => w.id === selectedWalker) || {
        id: 'self-walk',
        first_name: 'You',
        last_name: '',
        avatar_url: null,
        rating: 5.0
      };
    }
    
    return (
      <RealAdvancedWalkExperience
        pets={selectedPetObjects}
        walker={walkerObject}
        duration={duration}
        startLocation={currentLocation}
        onEndWalk={() => setWalkStarted(false)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            🐾 Start Your Advanced Walk
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Select your pets, choose a walker, and experience real-time GPS tracking with AI intelligence
          </motion.p>
          <div className="flex justify-center gap-3">
            <Badge variant="default" className="bg-blue-600">🧠 Google Gemini AI</Badge>
            <Badge variant="default" className="bg-green-600">🗺️ All Google Maps APIs</Badge>
            <Badge variant="default" className="bg-purple-600">📍 Real GPS Tracking</Badge>
          </div>
        </div>

        {/* Current Location Display */}
        {currentLocation ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <FaMapMarkerAlt />
                <span className="font-semibold">GPS Location Ready:</span>
                <span>{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
                <span className="text-sm text-green-600">• Live tracking enabled</span>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-700">
                <FaMapMarkerAlt />
                <span className="font-semibold">Getting GPS location...</span>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              </div>
              <p className="text-sm text-yellow-600 mt-2">
                Please allow location access for GPS tracking to work properly
              </p>
            </Card>
          </motion.div>
        )}

        {/* Pet Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaPaw className="text-pink-500" />
              Select Your Pets for the Walk
            </h3>
            {pets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pets found. Please add pets to your account first.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/pets'}>
                  Add Your First Pet
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pets.map((pet) => (
                  <div key={pet.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={pet.id}
                      checked={selectedPets.includes(pet.id)}
                      onCheckedChange={(checked) => handlePetSelection(pet.id, !!checked)}
                    />
                    <div className="flex-1">
                      <label htmlFor={pet.id} className="cursor-pointer">
                        <div className="font-semibold">{pet.name}</div>
                        <div className="text-sm text-gray-600">
                          {pet.custom_breed || 'Mixed Breed'} • {pet.weight ? `${pet.weight}lbs` : 'Unknown weight'} • {pet.energy_level || 'Medium'} energy
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Walker Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Choose Your Walker (Optional)</h3>
            <Select value={selectedWalker} onValueChange={setSelectedWalker}>
              <SelectTrigger>
                <SelectValue placeholder="Select a walker or walk yourself" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">🚶‍♂️ Self Walk - Walk your own pets</SelectItem>
                {walkers.length > 0 && (
                  walkers.map((walker) => (
                    <SelectItem key={walker.id} value={walker.id}>
                      {walker.first_name} {walker.last_name} - ⭐ {walker.rating || 5.0}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {walkers.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                💡 No professional walkers found. You can still enjoy the advanced walk experience yourself!
              </p>
            )}
          </Card>
        </motion.div>

        {/* Duration Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaClock className="text-blue-500" />
              Walk Duration
            </h3>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </motion.div>

        {/* Start Walk Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Button
            onClick={startWalk}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold"
            disabled={selectedPets.length === 0 || !currentLocation}
          >
            🚀 Start Advanced Walk Experience
          </Button>
          {(!currentLocation) && (
            <p className="text-sm text-gray-500 mt-2">Waiting for GPS location...</p>
          )}
          {(selectedPets.length === 0) && (
            <p className="text-sm text-red-500 mt-2">Please select at least one pet</p>
          )}
        </motion.div>

        {/* Feature Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12"
        >
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-4 text-center">🎯 What You'll Experience:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">📍</div>
                <h4 className="font-semibold">Real-time GPS</h4>
                <p className="text-sm text-gray-600">Live location tracking with street view</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🧠</div>
                <h4 className="font-semibold">AI Route Planning</h4>
                <p className="text-sm text-gray-600">Gemini AI optimizes routes for your pets</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌤️</div>
                <h4 className="font-semibold">Environmental Data</h4>
                <p className="text-sm text-gray-600">Air quality, weather, pollen alerts</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PremiumWalkExperience;
