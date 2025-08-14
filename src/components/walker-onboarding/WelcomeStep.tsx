import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FaDog, FaHeart, FaStar, FaMoneyBillWave, FaShieldAlt, FaUsers } from 'react-icons/fa';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-6">
          <FaDog className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to PupRoute Walker Family! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of happy walkers earning up to <span className="font-bold text-green-600">$25/hour</span> while doing what you love
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center border-green-200 bg-green-50">
            <FaMoneyBillWave className="text-3xl text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Higher Earnings</h3>
            <p className="text-sm text-gray-600">Keep 80% of what you earn (vs 60% on other apps)</p>
          </Card>
          
          <Card className="p-6 text-center border-blue-200 bg-blue-50">
            <FaShieldAlt className="text-3xl text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Full Protection</h3>
            <p className="text-sm text-gray-600">$1M insurance coverage + 24/7 safety support</p>
          </Card>
          
          <Card className="p-6 text-center border-purple-200 bg-purple-50">
            <FaUsers className="text-3xl text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Amazing Community</h3>
            <p className="text-sm text-gray-600">Join 5,000+ verified walkers in your area</p>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">What Our Walkers Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-left">
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
                <span className="ml-2 font-semibold">Sarah M.</span>
              </div>
              <p className="text-gray-600 italic">
                "I earn $400+ per week walking adorable pups! The app makes scheduling so easy and owners are amazing."
              </p>
            </div>
            
            <div className="text-left">
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
                <span className="ml-2 font-semibold">Mike R.</span>
              </div>
              <p className="text-gray-600 italic">
                "Best side hustle ever! Great exercise, cute dogs, and way better pay than other apps. Highly recommend!"
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started Info */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Getting Started is Easy!</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">1</div>
              <p>Complete your profile</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">2</div>
              <p>Verify your identity</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">3</div>
              <p>Pass safety quiz</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">4</div>
              <p>Start earning!</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onNext}
          size="lg" 
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
        >
          Let's Get Started! 🚀
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          Takes about 10 minutes • Free to join • Start earning immediately after approval
        </p>
      </motion.div>
    </div>
  );
};
