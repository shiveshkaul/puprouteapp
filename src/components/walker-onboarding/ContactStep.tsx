import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ContactStep = ({ data, updateData, onNext, onPrev }: ContactStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.phone && data.emergencyFirstName && data.emergencyLastName && data.emergencyPhone) {
      onNext();
    }
  };

  const isFormValid = data.phone && data.emergencyFirstName && data.emergencyLastName && data.emergencyPhone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Phone Number & Emergency Contact</h2>
        <p className="text-gray-600">
          We need your verified phone number for safety updates and an emergency contact for peace of mind.
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Primary Phone */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Phone Number</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 text-lg">📱</div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">How is my phone number used?</h4>
                  <p className="text-sm text-blue-700">
                    PupRoute requires a verified phone number to keep your account safe and for important 
                    booking updates. We'll send a verification code via text message.
                  </p>
                </div>
              </div>
            </div>

            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Primary phone number *
            </Label>
            <div className="flex mt-1">
              <Select defaultValue="+49">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+49">🇩🇪 +49</SelectItem>
                  <SelectItem value="+43">🇦🇹 +43</SelectItem>
                  <SelectItem value="+41">🇨🇭 +41</SelectItem>
                  <SelectItem value="+31">🇳🇱 +31</SelectItem>
                  <SelectItem value="+32">🇧🇪 +32</SelectItem>
                  <SelectItem value="+33">🇫🇷 +33</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => updateData({ phone: e.target.value })}
                placeholder="176 31769536"
                className="ml-2 flex-1"
                required
              />
            </div>
            <div className="flex items-center mt-2">
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                ✓ Verified
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
            <p className="text-sm text-gray-600 mb-4">
              Who can we contact, other than you, in case of an emergency?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <Label htmlFor="emergencyFirstName" className="text-sm font-medium text-gray-700">
                  First name *
                </Label>
                <Input
                  id="emergencyFirstName"
                  type="text"
                  value={data.emergencyFirstName}
                  onChange={(e) => updateData({ emergencyFirstName: e.target.value })}
                  placeholder="Enter first name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="emergencyLastName" className="text-sm font-medium text-gray-700">
                  Last name *
                </Label>
                <Input
                  id="emergencyLastName"
                  type="text"
                  value={data.emergencyLastName}
                  onChange={(e) => updateData({ emergencyLastName: e.target.value })}
                  placeholder="Enter last name"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="emergencyPhone" className="text-sm font-medium text-gray-700">
                Emergency contact number *
              </Label>
              <div className="flex mt-1">
                <Select defaultValue="+49">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+49">🇩🇪 +49</SelectItem>
                    <SelectItem value="+43">🇦🇹 +43</SelectItem>
                    <SelectItem value="+41">🇨🇭 +41</SelectItem>
                    <SelectItem value="+31">🇳🇱 +31</SelectItem>
                    <SelectItem value="+32">🇧🇪 +32</SelectItem>
                    <SelectItem value="+33">🇫🇷 +33</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={data.emergencyPhone}
                  onChange={(e) => updateData({ emergencyPhone: e.target.value })}
                  placeholder="176 32187202"
                  className="ml-2 flex-1"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <p className="text-xs text-gray-600">
                Please list all members of your household who are authorized to speak to PupRoute 
                in case of an emergency. By adding your phone number, you consent to receive 
                service-related text messages. You can adjust these settings anytime in your 
                notification preferences.
              </p>
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
