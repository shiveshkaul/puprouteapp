import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface RatesStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const RatesStep = ({ data, updateData, onNext, onPrev }: RatesStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const calculateEarnings = (rate: number) => {
    const commission = 0.2; // 20% commission
    return (rate * (1 - commission)).toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Set Your Rates</h2>
        <p className="text-gray-600">
          We've suggested competitive rates based on your area. You keep 80% of what you earn!
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rate Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 text-lg">💰</div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Need help with fees?</h4>
                <p className="text-sm text-blue-700">
                  Our suggested rates are based on your location and experience level. You can always 
                  adjust these later. Remember, higher rates often attract more committed pet owners!
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Controls */}
          <div className="space-y-8">
            {/* Walking Rate */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="walkRate" className="text-lg font-semibold text-gray-800">
                    Dog Walking Rate (per 30 min)
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    This is your base rate for 30-minute walks
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    €{data.walkRate || 15}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    You earn: €{calculateEarnings(data.walkRate || 15)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">€10</span>
                <Input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={data.walkRate || 15}
                  onChange={(e) => updateData({ walkRate: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">€30</span>
              </div>
              
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">
                  Average in your area: €15-18
                </span>
              </div>
            </div>

            {/* Day Care Rate */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="dayRate" className="text-lg font-semibold text-gray-800">
                    Day Care Rate (per day)
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    For full-day pet sitting (8+ hours)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    €{data.dayRate || 45}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    You earn: €{calculateEarnings(data.dayRate || 45)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">€30</span>
                <Input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  value={data.dayRate || 45}
                  onChange={(e) => updateData({ dayRate: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">€80</span>
              </div>
              
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">
                  Average in your area: €40-55
                </span>
              </div>
            </div>

            {/* Overnight Rate */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="overnightRate" className="text-lg font-semibold text-gray-800">
                    Overnight Rate (per night)
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    For overnight pet sitting at owner's home
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    €{data.overnightRate || 25}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    You earn: €{calculateEarnings(data.overnightRate || 25)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">€20</span>
                <Input
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={data.overnightRate || 25}
                  onChange={(e) => updateData({ overnightRate: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">€60</span>
              </div>
              
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">
                  Average in your area: €20-35
                </span>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Automatic rate adjustments
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Let us suggest rate changes based on demand and your ratings
                </p>
              </div>
              <Switch
                checked={data.autoRateAdjustments || true}
                onCheckedChange={(checked) => updateData({ autoRateAdjustments: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Holiday premium (+20%)
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Automatically add 20% to rates during holidays and peak times
                </p>
              </div>
              <Switch
                checked={data.holidayPremium || true}
                onCheckedChange={(checked) => updateData({ holidayPremium: checked })}
              />
            </div>
          </div>

          {/* Earnings Comparison */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-4">💚 Your Weekly Earning Potential</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-700">€{((data.walkRate || 15) * 0.8 * 10).toFixed(0)}</div>
                <div className="text-sm text-green-600">10 walks/week</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-700">€{((data.walkRate || 15) * 0.8 * 20).toFixed(0)}</div>
                <div className="text-sm text-green-600">20 walks/week</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-700">€{((data.dayRate || 45) * 0.8 * 5).toFixed(0)}</div>
                <div className="text-sm text-green-600">5 day sits/week</div>
              </div>
            </div>
            <p className="text-xs text-green-600 text-center mt-3">
              Plus tips! Average walker earns €300-600/week part-time
            </p>
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrev}>
              ← Back
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
            >
              Continue →
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};
