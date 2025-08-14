import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaStar, FaDog, FaMoneyBillWave, FaCalendar, FaMapMarkerAlt, FaCrown, FaHeart } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

const TopWalkerDashboard = () => {
  const [walkerData, setWalkerData] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalkerData = async () => {
      // Fetch walker data from Supabase
      const userEmail = 'shivesh@puproute.com'; // In real app, get from auth
      
      const { data: walker, error } = await supabase
        .from('walkers')
        .select(`
          *,
          walker_dashboard_stats(*),
          walker_availability(*)
        `)
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Failed to fetch walker data:', error);
        return;
      }

      setWalkerData(walker);
      setStats(walker.walker_dashboard_stats?.[0]);
      
      // Set some default recent activity if no real data
      setRecentActivity([
        `Walked ${walker.first_name}'s client in ${walker.city} - 5-star review`,
        `Completed verification process - Certified`,
        `Updated profile with new photos`,
        `Joined PupRoute platform`
      ]);
      
      setLoading(false);
    };

    fetchWalkerData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="text-xl text-gray-600">Loading dashboard...</div>
    </div>;
  }

  if (!walkerData) {
    return <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="text-xl text-gray-600">No walker profile found. Please complete onboarding first.</div>
    </div>;
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 p-6">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <FaCrown className="text-5xl text-yellow-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Top Walker Dashboard</h1>
        <p className="text-lg text-gray-600">Your achievements, stats, and marketplace highlights</p>
      </div>

      {/* Profile Summary */}
      <Card className="p-8 mb-8 flex flex-col md:flex-row items-center gap-8 bg-white shadow-lg">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-yellow-300">
          {walkerData.first_name?.[0]}{walkerData.last_name?.[0]}
        </div>
                <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {walkerData.first_name} {walkerData.last_name} <FaHeart className="inline text-pink-500 ml-2" />
          </h2>
          <div className="flex items-center gap-4 mb-2">
            <FaMapMarkerAlt className="text-green-500" />
            <span className="text-gray-700">{walkerData.city}, {walkerData.country}</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <FaStar className="text-yellow-400" />
            <span className="font-semibold text-lg text-gray-800">{walkerData.rating}</span>
            <span className="text-gray-500">({walkerData.reviews} reviews)</span>
          </div>
          <div className="flex gap-2 mb-4">
            {walkerData.is_verified && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">✓ Verified</span>}
            {walkerData.is_safety_certified && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">🛡️ Safety Certified</span>}
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">👑 Top Walker</span>
          </div>
          <p className="text-gray-600 mb-4">{walkerData.bio}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Walk Rate</span>
              <div className="font-bold text-green-600">€{walkerData.walk_rate}/walk</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Day Care</span>
              <div className="font-bold text-blue-600">€{walkerData.day_rate}/day</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button className="bg-green-600 text-white font-bold">Edit Profile</Button>
          <Button variant="outline">View Marketplace</Button>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 text-center bg-green-50 border-green-200">
          <FaDog className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-lg text-green-800">{stats?.active_bookings || 0}</h3>
          <p className="text-sm text-green-600">Active Bookings</p>
        </Card>
        <Card className="p-6 text-center bg-blue-50 border-blue-200">
          <FaCalendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-lg text-blue-800">{stats?.upcoming_walks || 0}</h3>
          <p className="text-sm text-blue-600">Upcoming Walks</p>
        </Card>
        <Card className="p-6 text-center bg-purple-50 border-purple-200">
          <FaMoneyBillWave className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-lg text-purple-800">€{stats?.month_earnings || 0}</h3>
          <p className="text-sm text-purple-600">This Month's Earnings</p>
        </Card>
        <Card className="p-6 text-center bg-yellow-50 border-yellow-200">
          <FaStar className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
          <h3 className="font-semibold text-lg text-yellow-800">{walkerData.rating || '5.0'}</h3>
          <p className="text-sm text-yellow-600">Rating</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="text-gray-700 space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{activity}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Marketplace Highlights */}
      <Card className="p-8 mb-8 bg-gradient-to-r from-green-50 to-blue-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Marketplace Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
              {walkerData.first_name?.[0]}{walkerData.last_name?.[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{walkerData.first_name} {walkerData.last_name}</h3>
              <p className="text-sm text-gray-600">€{walkerData.walk_rate}/walk • {walkerData.rating} ⭐ • {walkerData.is_verified ? 'Verified' : 'Pending'}</p>
              <Button size="sm" className="mt-2 bg-green-600 text-white">View My Profile</Button>
            </div>
          </div>
          <div className="text-gray-600">
            <p className="mb-2"><strong>Services:</strong> Dog Walking, Day Care</p>
            <p className="mb-2"><strong>Location:</strong> {walkerData.city}, {walkerData.country}</p>
            <p><strong>Experience:</strong> {walkerData.experience_years || 'New'} years</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
  );
};

export default TopWalkerDashboard;
