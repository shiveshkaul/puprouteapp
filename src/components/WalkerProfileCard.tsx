import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaStar, FaMapMarkerAlt, FaDog, FaShieldAlt, FaCheck } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface WalkerData {
  id: number;
  first_name: string;
  last_name: string;
  city: string;
  country: string;
  rating: number;
  reviews: number;
  bio: string;
  walk_rate: number;
  day_rate: number;
  is_verified: boolean;
  is_safety_certified: boolean;
  experience_years: number;
  pet_types: string[];
  services: string[];
}

const WalkerProfileCard = ({ walkerId }: { walkerId?: number }) => {
  const [walker, setWalker] = useState<WalkerData | null>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalkerData = async () => {
      // If no walkerId provided, get the first walker from database
      let query = supabase.from('walkers').select(`
        *,
        walker_availability(*)
      `);
      
      if (walkerId) {
        query = query.eq('id', walkerId);
      }
      
      const { data: walkers, error } = await query.limit(1);

      if (error) {
        console.error('Failed to fetch walker data:', error);
        setLoading(false);
        return;
      }

      if (walkers && walkers.length > 0) {
        setWalker(walkers[0]);
        setAvailability(walkers[0].walker_availability?.[0]);
      }
      setLoading(false);
    };

    fetchWalkerData();
  }, [walkerId]);

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center bg-white shadow-lg">
        <div className="text-gray-600">Loading walker profile...</div>
      </Card>
    );
  }

  if (!walker) {
    return (
      <Card className="p-6 flex items-center justify-center bg-white shadow-lg">
        <div className="text-gray-600">No walker profile found.</div>
      </Card>
    );
  }

  const availableDays = availability ? 
    Object.entries(availability)
      .filter(([key, value]) => key.includes('available') && value)
      .map(([key]) => key.replace('_available', '').charAt(0).toUpperCase() + key.replace('_available', '').slice(1))
      .join(', ') : 'Contact for availability';

  return (
    <Card className="p-6 flex flex-col md:flex-row items-center gap-6 bg-white shadow-lg">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl border-4 border-green-300">
        {walker.first_name?.[0]}{walker.last_name?.[0]}
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{walker.first_name} {walker.last_name}</h2>
        <div className="flex items-center gap-2 mb-2">
          <FaMapMarkerAlt className="text-green-500" />
          <span className="text-gray-700">{walker.city}, {walker.country}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <FaStar className="text-yellow-400" />
          <span className="font-semibold text-lg text-gray-800">{walker.rating || '5.0'}</span>
          <span className="text-gray-500">({walker.reviews || '0'} reviews)</span>
        </div>
        <div className="flex gap-2 mb-2">
          {walker.is_verified && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">✓ Verified</span>
          )}
          {walker.is_safety_certified && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">🛡️ Safety Certified</span>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-2">{walker.bio || 'Passionate dog walker ready to care for your furry friend!'}</div>
        {walker.services && walker.services.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {walker.services.map((service, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{service}</span>
            ))}
          </div>
        )}
        {walker.pet_types && walker.pet_types.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {walker.pet_types.map((type, index) => (
              <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">{type}</span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mb-2">
          <span className="font-bold text-green-700">€{walker.walk_rate || 15}/walk</span>
          <span className="font-bold text-blue-700">€{walker.day_rate || 50}/day</span>
        </div>
        <div className="flex gap-2 mb-2">
          <FaShieldAlt className="text-blue-500" />
          <span className="text-xs text-blue-700">Insurance Included</span>
        </div>
        <div className="flex gap-2 mb-2">
          <FaCheck className="text-green-500" />
          <span className="text-xs text-green-700">Available: {availableDays}</span>
        </div>
        <div className="flex gap-2 mb-2">
          <FaDog className="text-purple-500" />
          <span className="text-xs text-purple-700">Experience: {walker.experience_years || 0} years</span>
        </div>
        <Button className="bg-green-600 text-white font-bold mt-2">Book Now</Button>
      </div>
    </Card>
  );
};

export default WalkerProfileCard;
