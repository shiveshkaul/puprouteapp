import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaDog, FaCalendar, FaMoneyBillWave, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const WalkerDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Walker Dashboard! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            You're now part of the PupRoute family! Start accepting bookings and earning.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center bg-green-50 border-green-200">
            <FaDog className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-green-800">0</h3>
            <p className="text-sm text-green-600">Active Bookings</p>
          </Card>
          
          <Card className="p-6 text-center bg-blue-50 border-blue-200">
            <FaCalendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-blue-800">0</h3>
            <p className="text-sm text-blue-600">Upcoming Walks</p>
          </Card>
          
          <Card className="p-6 text-center bg-purple-50 border-purple-200">
            <FaMoneyBillWave className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-purple-800">€0</h3>
            <p className="text-sm text-purple-600">This Week's Earnings</p>
          </Card>
          
          <Card className="p-6 text-center bg-yellow-50 border-yellow-200">
            <FaStar className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-yellow-800">5.0</h3>
            <p className="text-sm text-yellow-600">Rating</p>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Download the Walker App</h3>
              <p className="text-sm text-gray-600 mb-4">Get the mobile app to manage bookings on the go</p>
              <Button variant="outline" size="sm">Download App</Button>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Complete Your Profile</h3>
              <p className="text-sm text-gray-600 mb-4">Add more photos and details to attract clients</p>
              <Button variant="outline" size="sm">Edit Profile</Button>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗓️</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Set Your Availability</h3>
              <p className="text-sm text-gray-600 mb-4">Update your calendar to start receiving bookings</p>
              <Button variant="outline" size="sm">Update Calendar</Button>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="text-center text-gray-500 py-8">
            <FaMapMarkerAlt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No activity yet</p>
            <p className="text-sm">Your walk history and earnings will appear here once you start accepting bookings.</p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Need help? Contact us at <a href="mailto:walkers@puproute.com" className="text-green-600 hover:underline">walkers@puproute.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default WalkerDashboard;
