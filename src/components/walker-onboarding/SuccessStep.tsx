import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FaCheck, FaDog, FaStar, FaHeart, FaRocket, FaCalendar, FaMoneyBillWave } from 'react-icons/fa';

interface SuccessStepProps {
  data: any;
}

export const SuccessStep = ({ data }: SuccessStepProps) => {
  const handleGoToDashboard = () => {
    // Navigate to walker dashboard
    window.location.href = '/walker-dashboard';
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto text-center"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="mb-8"
      >
        <div className="bg-green-100 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
          <FaCheck className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Welcome to the PupRoute Walker Family! 
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Congratulations {data.firstName}! Your application has been submitted successfully.
        </p>
      </motion.div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-green-50 border-green-200">
            <FaCheck className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-2">Application Submitted</h3>
            <p className="text-sm text-green-700">Your profile is being reviewed</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 bg-blue-50 border-blue-200">
            <FaCheck className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-2">Identity Verified</h3>
            <p className="text-sm text-blue-700">Background check approved</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-6 bg-purple-50 border-purple-200">
            <FaCheck className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-800 mb-2">Safety Certified</h3>
            <p className="text-sm text-purple-700">Quiz passed with flying colors</p>
          </Card>
        </motion.div>
      </div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happens Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Final Review (24-48 hours)</h4>
                  <p className="text-sm text-gray-600">Our team will review your application and complete final checks</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Welcome Email</h4>
                  <p className="text-sm text-gray-600">You'll receive login details and onboarding materials</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Profile Goes Live</h4>
                  <p className="text-sm text-gray-600">Your profile becomes visible to pet owners in your area</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Start Earning!</h4>
                  <p className="text-sm text-gray-600">Begin receiving booking requests and start your walker journey</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Your Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <Card className="p-8 mb-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Walker Profile Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {data.firstName} {data.lastName}</p>
                <p><span className="font-medium">Location:</span> {data.city}, {data.country}</p>
                <p><span className="font-medium">Experience:</span> {data.experience}</p>
                <p><span className="font-medium">Advance Notice:</span> {data.advanceNotice}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Your Rates</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">30-min Walk:</span> €{data.walkRate} <span className="text-green-600">(You earn: €{(data.walkRate * 0.8).toFixed(2)})</span></p>
                <p><span className="font-medium">Day Care:</span> €{data.dayRate} <span className="text-green-600">(You earn: €{(data.dayRate * 0.8).toFixed(2)})</span></p>
                <p><span className="font-medium">Weekly Potential:</span> <span className="text-green-600 font-semibold">€{(data.walkRate * 0.8 * 15).toFixed(0)}-{(data.dayRate * 0.8 * 7).toFixed(0)}</span></p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Benefits Reminder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <Card className="p-8 mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your PupRoute Walker Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <FaMoneyBillWave className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">80% Commission</h3>
              <p className="text-sm text-gray-600">Keep more of what you earn vs other platforms</p>
            </div>
            
            <div className="text-center">
              <FaCalendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Flexible Schedule</h3>
              <p className="text-sm text-gray-600">Work when you want, how you want</p>
            </div>
            
            <div className="text-center">
              <FaHeart className="h-8 w-8 text-pink-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Amazing Community</h3>
              <p className="text-sm text-gray-600">Join 5,000+ happy walkers</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleGoToDashboard}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
          >
            <FaRocket className="mr-2 h-5 w-5" />
            Go to Walker Dashboard
          </Button>
          
          <Button 
            onClick={handleBackToHome}
            variant="outline"
            size="lg"
            className="px-8 py-3 text-lg"
          >
            Back to Home
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Questions? Contact us at <a href="mailto:walkers@puproute.com" className="text-green-600 hover:underline">walkers@puproute.com</a>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Follow us on social media for walker tips and community updates!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
