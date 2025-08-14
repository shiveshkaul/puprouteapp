import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BasicInfoStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const BasicInfoStep = ({ data, updateData, onNext, onPrev }: BasicInfoStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.firstName && data.lastName && data.dateOfBirth && data.email) {
      onNext();
    }
  };

  const isFormValid = data.firstName && data.lastName && data.dateOfBirth && data.email;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Basic Information</h2>
        <p className="text-gray-600">
          Confirm that this information matches what's on your ID. We'll verify this during the identity check.
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Legal first name *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={data.firstName}
                onChange={(e) => updateData({ firstName: e.target.value })}
                placeholder="Enter your first name"
                className="mt-1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your name as it appears on your ID
              </p>
            </div>

            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Legal last name *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={data.lastName}
                onChange={(e) => updateData({ lastName: e.target.value })}
                placeholder="Enter your last name"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
              What is your date of birth? *
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => updateData({ dateOfBirth: e.target.value })}
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              We use this to conduct identity verifications. We won't share or display this on your profile.
            </p>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Your email address *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              placeholder="your.email@example.com"
              className="mt-1"
              required
            />
            <div className="flex items-center mt-2">
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                ✓ Verified
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 text-lg">ℹ️</div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Important</h4>
                <p className="text-sm text-blue-700">
                  Make sure this information exactly matches your government-issued ID. 
                  Any discrepancies will delay your approval process.
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
