import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExperienceStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ExperienceStep = ({ data, updateData, onNext, onPrev }: ExperienceStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.experience && data.headline && data.description && data.schedule && data.safetyDescription) {
      onNext();
    }
  };

  const isFormValid = data.experience && data.headline && data.description && 
                     data.schedule && data.safetyDescription;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Tell Us About Your Pet-Care Experience</h2>
        <p className="text-gray-600">
          Let pet owners know about your personal qualities and overall love of animals
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Quick tips:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• We recommend keeping personal identifiers—like your last name or workplace—out of your profile</li>
              <li>• Be authentic and highlight what makes you special</li>
              <li>• Include specific experience with different dog sizes and temperaments</li>
              <li>• Mention any special skills like training or senior dog care</li>
            </ul>
          </div>

          {/* Pet Care Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pet Care Details</h3>
            <p className="text-sm text-gray-600 mb-4">This profile content will be shown to dog owners.</p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                  Years of pet care experience *
                </Label>
                <Select 
                  value={data.experience} 
                  onValueChange={(value) => updateData({ experience: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1 years">0-1 years</SelectItem>
                    <SelectItem value="2-3 years">2-3 years</SelectItem>
                    <SelectItem value="4-5 years">4-5 years</SelectItem>
                    <SelectItem value="6-10 years">6-10 years</SelectItem>
                    <SelectItem value="10+ years">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="headline" className="text-sm font-medium text-gray-700">
                  Write an eye-catching headline *
                </Label>
                <Input
                  id="headline"
                  type="text"
                  value={data.headline}
                  onChange={(e) => updateData({ headline: e.target.value })}
                  placeholder="e.g., Experienced dog lover with a passion for active breeds"
                  className="mt-1"
                  maxLength={60}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Make your headline short, descriptive and genuine. ({data.headline?.length || 0}/60 characters)
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Pet care experience *
                </Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => updateData({ description: e.target.value })}
                  placeholder="What sets you apart from other walkers? Include any special skills like training puppies or senior care. Example: I've taken care of dogs of every kind since I was 10. Neighbors, friends and family have relied on me to walk, feed and bathe their pets..."
                  className="mt-1 min-h-[120px]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  25 word minimum ({data.description?.split(' ').length || 0} words)
                </p>
              </div>
            </div>
          </div>

          {/* About You */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">About You</h3>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="schedule" className="text-sm font-medium text-gray-700">
                  Schedule *
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  How does pet care fit into your daily or weekly routine?
                </p>
                <Textarea
                  id="schedule"
                  value={data.schedule}
                  onChange={(e) => updateData({ schedule: e.target.value })}
                  placeholder="Example: I'm currently working part-time, so I'll have plenty of time to play with your pups! I'm available for walks on weekends, and weekdays after 2pm..."
                  className="mt-1 min-h-[100px]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  25 word minimum ({data.schedule?.split(' ').length || 0} words)
                </p>
              </div>

              <div>
                <Label htmlFor="safetyDescription" className="text-sm font-medium text-gray-700">
                  Safety, trust & environment *
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  How do you ensure pet safety during walks and in your care?
                </p>
                <Textarea
                  id="safetyDescription"
                  value={data.safetyDescription}
                  onChange={(e) => updateData({ safetyDescription: e.target.value })}
                  placeholder="Example: I always keep dogs on secure leashes and avoid busy roads. I carry water and waste bags on every walk. I'm trained in pet first aid and know how to handle emergencies..."
                  className="mt-1 min-h-[100px]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  25 word minimum ({data.safetyDescription?.split(' ').length || 0} words)
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
              disabled={!isFormValid}
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
