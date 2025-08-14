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
  FaGem
} from "react-icons/fa";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  color: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: {
    walks_per_month: number | 'unlimited';
    real_time_tracking: boolean;
    ai_walk_planning: boolean;
    premium_walkers: boolean;
    emergency_support: boolean;
    photo_updates: boolean;
    custom_routes: boolean;
    priority_booking: boolean;
    walker_selection: boolean;
    behavioral_insights: boolean;
    health_monitoring: boolean;
    multiple_pets: boolean;
    cancellation_flexibility: string;
  };
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Pup',
    price: 0,
    yearlyPrice: 0,
    color: 'border-gray-200',
    icon: <FaStar className="text-gray-500" />,
    features: {
      walks_per_month: 2,
      real_time_tracking: false,
      ai_walk_planning: false,
      premium_walkers: false,
      emergency_support: false,
      photo_updates: false,
      custom_routes: false,
      priority_booking: false,
      walker_selection: false,
      behavioral_insights: false,
      health_monitoring: false,
      multiple_pets: false,
      cancellation_flexibility: '24hr notice'
    }
  },
  {
    id: 'basic',
    name: 'Happy Pup',
    price: 29,
    yearlyPrice: 290,
    color: 'border-blue-200',
    icon: <FaStar className="text-blue-500" />,
    popular: true,
    features: {
      walks_per_month: 12,
      real_time_tracking: true,
      ai_walk_planning: true,
      premium_walkers: false,
      emergency_support: true,
      photo_updates: true,
      custom_routes: false,
      priority_booking: false,
      walker_selection: true,
      behavioral_insights: false,
      health_monitoring: false,
      multiple_pets: false,
      cancellation_flexibility: '12hr notice'
    }
  },
  {
    id: 'premium',
    name: 'Adventure Pup',
    price: 59,
    yearlyPrice: 590,
    color: 'border-purple-200',
    icon: <FaCrown className="text-purple-500" />,
    features: {
      walks_per_month: 25,
      real_time_tracking: true,
      ai_walk_planning: true,
      premium_walkers: true,
      emergency_support: true,
      photo_updates: true,
      custom_routes: true,
      priority_booking: true,
      walker_selection: true,
      behavioral_insights: true,
      health_monitoring: true,
      multiple_pets: true,
      cancellation_flexibility: '6hr notice'
    }
  },
  {
    id: 'unlimited',
    name: 'VIP Pup',
    price: 99,
    yearlyPrice: 990,
    color: 'border-gradient-to-r from-yellow-400 to-orange-500',
    icon: <FaGem className="text-yellow-500" />,
    features: {
      walks_per_month: 'unlimited',
      real_time_tracking: true,
      ai_walk_planning: true,
      premium_walkers: true,
      emergency_support: true,
      photo_updates: true,
      custom_routes: true,
      priority_booking: true,
      walker_selection: true,
      behavioral_insights: true,
      health_monitoring: true,
      multiple_pets: true,
      cancellation_flexibility: 'Anytime'
    }
  }
];

export const SubscriptionPlans = () => {
  const [isYearly, setIsYearly] = useState(false);

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'real_time_tracking': return <FaMapMarkerAlt className="text-green-500" />;
      case 'ai_walk_planning': return <FaStar className="text-blue-500" />;
      case 'emergency_support': return <FaShieldAlt className="text-red-500" />;
      case 'photo_updates': return <FaCamera className="text-purple-500" />;
      case 'priority_booking': return <FaCrown className="text-yellow-500" />;
      default: return <FaCheck className="text-green-500" />;
    }
  };

  const getFeatureLabel = (key: string, value: any) => {
    const labels: Record<string, string> = {
      walks_per_month: value === 'unlimited' ? 'Unlimited walks' : `${value} walks per month`,
      real_time_tracking: 'Real-time GPS tracking',
      ai_walk_planning: 'AI-powered route planning',
      premium_walkers: 'Access to premium walkers',
      emergency_support: '24/7 emergency support',
      photo_updates: 'Photo & video updates',
      custom_routes: 'Custom walk routes',
      priority_booking: 'Priority booking',
      walker_selection: 'Choose your walker',
      behavioral_insights: 'AI behavioral insights',
      health_monitoring: 'Health monitoring reports',
      multiple_pets: 'Multiple pets support',
      cancellation_flexibility: `Cancellation: ${value}`
    };
    return labels[key] || key;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose Your Pup's Adventure Plan 🐕</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Subscription-based dog walking with premium experiences
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
            Yearly 
            <Badge variant="secondary" className="ml-2">Save 17%</Badge>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <Card className={`p-6 h-full flex flex-col relative ${plan.color} ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  {plan.icon}
                  <h3 className="text-xl font-bold ml-2">{plan.name}</h3>
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.yearlyPrice / 12 : plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                  {isYearly && plan.yearlyPrice > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Billed yearly (${plan.yearlyPrice})
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {Object.entries(plan.features).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {value ? getFeatureIcon(key) : <div className="w-4 h-4 rounded-full bg-gray-200" />}
                    </div>
                    <span className={`text-sm ${!value ? 'text-muted-foreground line-through' : ''}`}>
                      {getFeatureLabel(key, value)}
                    </span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                size="lg"
              >
                {plan.price === 0 ? 'Start Free' : 'Choose Plan'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">
          All plans include basic walker insurance and customer support
        </p>
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <span>• No setup fees</span>
          <span>• Cancel anytime</span>
          <span>• 7-day free trial</span>
        </div>
      </div>
    </div>
  );
};
