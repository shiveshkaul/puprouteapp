import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCrown, FaGem, FaStar, FaTimes, FaCheck, FaMapMarkerAlt, FaCamera, FaShieldAlt } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'walks_limit' | 'pets_limit' | 'feature_locked';
  feature?: string;
}

const UPGRADE_PLANS = [
  {
    id: 'plus',
    name: 'Pup Plus',
    price: 7.99,
    yearlyPrice: 79,
    color: 'border-blue-200',
    icon: <FaStar className="text-blue-500" />,
    popular: true,
    highlights: ['12 walks/month', '3 pets', 'GPS tracking', 'AI routes'],
  },
  {
    id: 'pro',
    name: 'Pup Pro',
    price: 14.99,
    yearlyPrice: 149,
    color: 'border-purple-200',
    icon: <FaCrown className="text-purple-500" />,
    highlights: ['30 walks/month', '6 pets', 'Premium walkers', 'Health insights'],
  },
  {
    id: 'elite',
    name: 'Pup Elite',
    price: 24.99,
    yearlyPrice: 249,
    color: 'border-yellow-200',
    icon: <FaGem className="text-yellow-500" />,
    highlights: ['Unlimited walks', 'Unlimited pets', 'All features', '24/7 support'],
  },
];

const REASON_MESSAGES = {
  walks_limit: {
    title: "You've reached your walk limit! 🚶‍♂️",
    description: "Upgrade to book more walks this month and give your pup unlimited adventures.",
    emoji: "🐕‍🦺"
  },
  pets_limit: {
    title: "Pet limit reached! 🐕",
    description: "Upgrade to add more furry friends to your PupRoute family.",
    emoji: "🐾"
  },
  feature_locked: {
    title: "Premium feature locked! ⭐",
    description: "Upgrade to unlock all the advanced features that make walks even better.",
    emoji: "✨"
  },
};

export const UpgradeModal = ({ isOpen, onClose, reason = 'walks_limit', feature }: UpgradeModalProps) => {
  const [isYearly, setIsYearly] = useState(false);
  const { upgradePlan, isUpgrading } = useSubscription();
  const navigate = useNavigate();

  const reasonMessage = REASON_MESSAGES[reason];

  const handleUpgrade = (planId: string) => {
    upgradePlan({ planId });
    onClose();
  };

  const handleViewAllPlans = () => {
    onClose();
    navigate('/subscription');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/20 transition-colors"
          >
            <FaTimes className="text-muted-foreground" />
          </button>
          
          <div className="text-6xl mb-4">{reasonMessage.emoji}</div>
          <h2 className="text-3xl font-bold text-primary mb-2">{reasonMessage.title}</h2>
          <p className="text-lg text-muted-foreground">{reasonMessage.description}</p>
        </div>

        {/* Billing Toggle */}
        <div className="p-6 text-center border-b">
          <div className="inline-flex items-center gap-4 bg-muted rounded-full p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full transition-all ${
                !isYearly ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-full transition-all ${
                isYearly ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2">Save 17%</Badge>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {UPGRADE_PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`p-6 h-full flex flex-col ${plan.color} ${
                  plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''
                }`}>
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center mb-2">
                      {plan.icon}
                      <h3 className="text-xl font-bold ml-2">{plan.name}</h3>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        ${isYearly ? (plan.yearlyPrice / 12).toFixed(2) : plan.price}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                      {isYearly && (
                        <div className="text-sm text-muted-foreground">
                          Billed yearly (${plan.yearlyPrice})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 mb-6">
                    {plan.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FaCheck className="text-green-500 text-sm" />
                        <span className="text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading}
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {isUpgrading ? 'Upgrading...' : 'Choose Plan'}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t text-center">
          <p className="text-muted-foreground mb-4">
            All plans include basic walker insurance and customer support
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-4">
            <span>• No setup fees</span>
            <span>• Cancel anytime</span>
            <span>• 7-day free trial</span>
          </div>
          <Button variant="outline" onClick={handleViewAllPlans}>
            View All Plans & Features
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
