import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AvailabilityStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AvailabilityStep = ({ data, updateData, onNext, onPrev }: AvailabilityStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const updateAvailability = (day: string, available: boolean) => {
    updateData({
      availability: {
        ...data.availability,
        [day]: available
      }
    });
  };

  const days = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Availability Settings</h2>
        <p className="text-gray-600">
          We've suggested some default settings based on what works well for new walkers. 
          You can edit these anytime in the future.
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Availability */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">General Availability</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 text-lg">💡</div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Why is availability important?</h4>
                  <p className="text-sm text-blue-700">
                    Clear availability helps pet owners book with confidence and improves your 
                    booking rate. You can always adjust specific dates in your calendar.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">
                  Which days of the week will you typically be available for walking?
                </Label>
                <p className="text-xs text-gray-500 mb-4">
                  This will update your generic availability. You can edit any date individually by going to your calendar.
                </p>
                
                <div className="grid grid-cols-7 gap-3">
                  {days.map((day) => (
                    <div key={day.key} className="text-center">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        {day.label}
                      </Label>
                      <Switch
                        checked={data.availability?.[day.key] || false}
                        onCheckedChange={(checked) => updateAvailability(day.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="toiletBreaks" className="text-sm font-medium text-gray-700">
                  How frequently can you provide toilet breaks for dogs?
                </Label>
                <Select 
                  value={data.toiletBreaks} 
                  onValueChange={(value) => updateData({ toiletBreaks: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Every 2 hours">Every 2 hours</SelectItem>
                    <SelectItem value="Every 3 hours">Every 3 hours</SelectItem>
                    <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                    <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="advanceNotice" className="text-sm font-medium text-gray-700">
                  How far in advance do pet owners need to contact you before a booking?
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Shorter notice periods can increase your booking opportunities.
                </p>
                <Select 
                  value={data.advanceNotice} 
                  onValueChange={(value) => updateData({ advanceNotice: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select advance notice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 minutes">30 minutes</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="1 day">1 day</SelectItem>
                    <SelectItem value="2 days">2 days</SelectItem>
                    <SelectItem value="1 week">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Working Style */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Working Style</h3>
            
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Are you home full-time during the week?
                </Label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      data.homeFullTime === true 
                        ? 'bg-green-100 border-green-300 text-green-800' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => updateData({ homeFullTime: true })}
                  >
                    Yes, I'm usually home
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      data.homeFullTime === false 
                        ? 'bg-green-100 border-green-300 text-green-800' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => updateData({ homeFullTime: false })}
                  >
                    No, I have other commitments
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Preferred walk duration
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {['15-30 min', '30-45 min', '45-60 min', '60+ min'].map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        data.preferredDuration === duration 
                          ? 'bg-green-100 border-green-300 text-green-800' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => updateData({ preferredDuration: duration })}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-lg">⭐</div>
              <div>
                <h4 className="font-medium text-green-800 mb-1">Pro Tip</h4>
                <p className="text-sm text-green-700">
                  Walkers with flexible availability and shorter notice periods typically receive 
                  40% more booking requests. You can always update these settings later!
                </p>
              </div>
            </div>
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
