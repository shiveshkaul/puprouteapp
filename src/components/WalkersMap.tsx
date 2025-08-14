import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaMapMarkerAlt, FaStar, FaUser } from 'react-icons/fa';

interface Walker {
  id: number;
  first_name: string;
  last_name: string;
  city: string;
  rating: number;
  walk_rate: number;
  day_rate: number;
  latitude: number;
  longitude: number;
  is_verified: boolean;
}

interface WalkersMapProps {
  walkers: Walker[];
  userLocation: { lat: number; lng: number } | null;
  onWalkerSelect: (walker: Walker) => void;
}

const WalkersMap: React.FC<WalkersMapProps> = ({ walkers, userLocation, onWalkerSelect }) => {
  const [selectedWalker, setSelectedWalker] = useState<Walker | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 47.3769, lng: 8.5417 }); // Default to Zurich

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  // Simple map visualization (in a real app, you'd use Google Maps or Mapbox)
  const renderSimpleMap = () => {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
        {/* Map background with grid */}
        <div className="absolute inset-0">
          <svg className="w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* User location marker */}
        {userLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ 
              left: '50%', 
              top: '50%'
            }}
          >
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-800 bg-white px-2 py-1 rounded shadow">
              You
            </div>
          </div>
        )}

        {/* Walker markers */}
        {walkers.map((walker, index) => {
          // Calculate position relative to user location (simplified)
          const offsetX = userLocation ? (walker.longitude - userLocation.lng) * 2000 : (Math.random() - 0.5) * 300;
          const offsetY = userLocation ? (userLocation.lat - walker.latitude) * 2000 : (Math.random() - 0.5) * 300;
          
          const left = Math.max(10, Math.min(90, 50 + offsetX / 10));
          const top = Math.max(10, Math.min(90, 50 + offsetY / 10));

          return (
            <div
              key={walker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{ 
                left: `${left}%`, 
                top: `${top}%`
              }}
              onClick={() => {
                setSelectedWalker(walker);
                onWalkerSelect(walker);
              }}
            >
              {/* Walker marker */}
              <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm transition-transform hover:scale-110 ${
                walker.is_verified ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                {walker.first_name[0]}
              </div>
              
              {/* Price tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-2 py-1 text-xs font-medium opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                €{walker.walk_rate}/walk
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-white"></div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Map Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Verified Walker</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Unverified Walker</span>
            </div>
          </div>
        </div>

        {/* Walker count */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2">
          <div className="text-sm font-medium text-gray-900">
            {walkers.length} walkers nearby
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Map */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Walkers Near You</h3>
          <Button variant="outline" size="sm">
            <FaMapMarkerAlt className="mr-2" />
            Update Location
          </Button>
        </div>
        {renderSimpleMap()}
      </Card>

      {/* Selected walker info */}
      {selectedWalker && (
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
              {selectedWalker.first_name[0]}{selectedWalker.last_name[0]}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">
                {selectedWalker.first_name} {selectedWalker.last_name}
              </h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaMapMarkerAlt />
                <span>{selectedWalker.city}</span>
                <FaStar className="text-yellow-400" />
                <span>{selectedWalker.rating}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">€{selectedWalker.walk_rate}/walk</div>
              <Button size="sm" className="mt-2">View Profile</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Nearby walkers list */}
      <Card className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Closest Walkers</h3>
        <div className="space-y-3">
          {walkers.slice(0, 5).map((walker, index) => (
            <div 
              key={walker.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => {
                setSelectedWalker(walker);
                onWalkerSelect(walker);
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {walker.first_name[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{walker.first_name} {walker.last_name}</div>
                  <div className="text-sm text-gray-600">{walker.city}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm">
                  <FaStar className="text-yellow-400" />
                  <span>{walker.rating}</span>
                </div>
                <div className="text-sm font-medium text-green-600">€{walker.walk_rate}/walk</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WalkersMap;
