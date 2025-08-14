import { useState } from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  FaCheck, 
  FaCrown, 
  FaStar, 
  FaMapMarkerAlt, 
  FaCamera,
  FaBell,
  FaShieldAlt,
  FaInfinity,
  FaGem,
  FaRocket,
  FaHeart
} from "react-icons/fa";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  limits: {
    monthlyBookings: number; // -1 for unlimited
    maxPets: number; // -1 for unlimited
    photoLimit: number; // -1 for unlimited
    aiFeatures: boolean;
    premiumSupport: boolean;
  };
  popular?: boolean;
  buttonText: string;
  badge?: string;
  icon: React.ReactNode;
  color: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    yearlyPrice: 0,
    description: 'Everything you need - completely free forever',
    features: [
      'Unlimited bookings & searches',
      'Unlimited pet profiles', 
      'Basic GPS tracking & maps',
      'Standard reports & photos',
      'Community support',
      'Better than Rover - free forever!'
    ],
    limits: {
      monthlyBookings: -1, // unlimited
      maxPets: -1, // unlimited
      photoLimit: -1, // unlimited
      aiFeatures: false,
      premiumSupport: false
    },
    popular: false,
    buttonText: 'Free Forever',
    badge: 'Always Free',
    icon: <FaHeart className="text-2xl text-green-500" />,
    color: 'border-green-200 bg-green-50'
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 4.99,
    yearlyPrice: 49,
    description: 'AI-powered peace of mind',
    features: [
      'Everything in Free +',
      'AI route suggestions (Gemini-powered)',
      'Detailed reports (pee/poop/events)',
      'Email support',
      'Loyalty points (earn free walks)',
      'Unlock peace of mind for pennies'
    ],
    limits: {
      monthlyBookings: -1,
      maxPets: -1,
      photoLimit: -1,
      aiFeatures: true,
      premiumSupport: true
    },
    popular: true,
    buttonText: 'Upgrade to Plus',
    badge: 'Most Popular',
    icon: <FaStar className="text-2xl text-blue-500" />,
    color: 'border-blue-200 bg-blue-50'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    yearlyPrice: 99,
    description: 'Advanced safety & tracking',
    features: [
      'Everything in Plus +',
      'Full tracking (street view + heatmap)',
      'Weather alerts & predictions',
      'Calendar integrations',
      'Priority chat support',
      'Higher loyalty multiplier',
      'Rover lost dogs - our AI prevents it'
    ],
    limits: {
      monthlyBookings: -1,
      maxPets: -1,
      photoLimit: -1,
      aiFeatures: true,
      premiumSupport: true
    },
    popular: false,
    buttonText: 'Upgrade to Pro',
    icon: <FaShieldAlt className="text-2xl text-purple-500" />,
    color: 'border-purple-200 bg-purple-50'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 19.99,
    yearlyPrice: 199,
    description: 'Ultimate family experience',
    features: [
      'Everything in Pro +',
      'Custom AI plans & health insights',
      '$1M safety guarantee',
      '24/7 priority support',
      'Family sharing (multi-user)',
      'Early access to new features',
      'Switch from Wag - get $50 credit'
    ],
    limits: {
      monthlyBookings: -1,
      maxPets: -1,
      photoLimit: -1,
      aiFeatures: true,
      premiumSupport: true
    },
    popular: false,
    buttonText: 'Upgrade to Elite',
    badge: 'Premium',
    icon: <FaCrown className="text-2xl text-yellow-500" />,
    color: 'border-yellow-200 bg-yellow-50'
  }
];export const SubscriptionPlans = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Predatory Messaging */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Adventure 🎯
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Core features are <span className="font-bold text-green-600 text-2xl">FREE FOREVER</span> - because pet care shouldn't be expensive
          </p>
          
          {/* Competitive Positioning */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-400 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
            <p className="text-yellow-800 font-medium text-lg">
              🏆 <strong>Better than Rover & Wag:</strong> Unlimited bookings & pets - completely free! 
              We only charge walkers 20% commission (vs their 40%) and pass the savings to you.
            </p>
            <p className="text-yellow-700 mt-2">
              💰 <strong>Switch bonus:</strong> Coming from another app? Get $50 credit + free guarantee!
            </p>
          </div>
          
          {/* Revenue Model Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
            <p className="text-blue-800 font-medium">
              🔥 <strong>How we keep it free:</strong> We make money from small walker commissions (20%), not from pet owners. 
              Premium features are optional AI-powered add-ons for peace of mind.
            </p>
          </div>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly 
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Save 17%</Badge>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className={`px-4 py-1 font-semibold ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                      : plan.id === 'free' 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-white'
                  }`}>
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <Card className={`p-6 h-full flex flex-col relative ${plan.color} ${plan.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : plan.id === 'free' ? 'border-2 border-green-500 shadow-lg' : ''}`}>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    {plan.icon}
                    <h3 className="text-2xl font-bold ml-3">{plan.name}</h3>
                  </div>
                  
                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <div>
                        <span className="text-5xl font-bold text-green-600">FREE</span>
                        <div className="text-sm text-gray-600 mt-1">Forever & Always</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold">
                          ${isYearly ? (plan.yearlyPrice / 12).toFixed(2) : plan.price}
                        </span>
                        <span className="text-gray-600">/month</span>
                        {isYearly && plan.yearlyPrice > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            Billed yearly (${plan.yearlyPrice})
                            <span className="text-green-600 font-semibold ml-2">Save 17%!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full font-semibold ${
                    plan.id === 'free' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : plan.popular 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                        : ''
                  }`}
                  variant={plan.popular ? "default" : plan.id === 'free' ? "default" : "outline"}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Become a Walker CTA */}
        <div className="mt-16 mb-12">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-xl p-8 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">🐕 Become a Walker and Earn!</h3>
            <p className="text-xl mb-6 opacity-90">Join our pack of professional dog walkers and start earning up to $25/hour</p>
            <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">💰 Higher earnings (80% vs 60% on other apps)</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">📱 Easy scheduling</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">🛡️ Full insurance coverage</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">⭐ 5-star support</span>
            </div>
            <Button 
              className="bg-white text-green-600 hover:bg-gray-100 font-bold text-lg px-8 py-3"
              size="lg"
              onClick={() => window.location.href = '/walker-onboarding'}
            >
              Start Earning Today →
            </Button>
          </div>
        </div>

        {/* Additional Info & Competitive Advantages */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-center mb-6">Why PupRoute Beats the Competition</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <FaInfinity className="text-4xl text-green-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Unlimited Everything</h4>
                <p className="text-sm text-gray-600">Unlike Rover/Wag, no limits on bookings or pets - ever!</p>
              </div>
              <div className="text-center">
                <FaRocket className="text-4xl text-blue-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">AI-Powered Safety</h4>
                <p className="text-sm text-gray-600">Smart route planning prevents lost pets - something others lack</p>
              </div>
              <div className="text-center">
                <FaHeart className="text-4xl text-pink-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Owner-First</h4>
                <p className="text-sm text-gray-600">We charge walkers, not owners. You save 40% vs competitors</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4 text-lg">
              All plans include walker insurance, GPS tracking, and 24/7 safety monitoring
            </p>
            <div className="flex justify-center gap-8 text-sm text-gray-500">
              <span>• No setup fees</span>
              <span>• Cancel anytime</span>
              <span>• 30-day money-back guarantee</span>
              <span>• Switch bonus for new users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
