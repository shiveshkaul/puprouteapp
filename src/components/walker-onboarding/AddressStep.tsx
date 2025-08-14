import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddressStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AddressStep = ({ data, updateData, onNext, onPrev }: AddressStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.street && data.city && data.postcode && data.country) {
      onNext();
    }
  };

  const isFormValid = data.street && data.city && data.postcode && data.country;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Add Your Address</h2>
        <p className="text-gray-600">
          Your address is only shown to pet owners when you provide services. We need this for safety and insurance purposes.
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="street" className="text-sm font-medium text-gray-700">
              Street Name and Number *
            </Label>
            <Input
              id="street"
              type="text"
              value={data.street}
              onChange={(e) => updateData({ street: e.target.value })}
              placeholder="e.g., Karlstraße 23"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="additionalAddress" className="text-sm font-medium text-gray-700">
              Additional Address Details (optional)
            </Label>
            <Input
              id="additionalAddress"
              type="text"
              value={data.additionalAddress || ''}
              onChange={(e) => updateData({ additionalAddress: e.target.value })}
              placeholder="Apartment, floor, building details..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                City *
              </Label>
              <Input
                id="city"
                type="text"
                value={data.city}
                onChange={(e) => updateData({ city: e.target.value })}
                placeholder="e.g., Berlin"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                Postcode *
              </Label>
              <Input
                id="postcode"
                type="text"
                value={data.postcode}
                onChange={(e) => updateData({ postcode: e.target.value })}
                placeholder="e.g., 10115"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">
              Country *
            </Label>
            <Select 
              value={data.country} 
              onValueChange={(value) => updateData({ country: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="Austria">Austria</SelectItem>
                <SelectItem value="Switzerland">Switzerland</SelectItem>
                <SelectItem value="Netherlands">Netherlands</SelectItem>
                <SelectItem value="Belgium">Belgium</SelectItem>
                <SelectItem value="France">France</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-lg">🔒</div>
              <div>
                <h4 className="font-medium text-green-800 mb-1">Privacy & Safety</h4>
                <p className="text-sm text-green-700">
                  Your exact address is never shared publicly. Only confirmed clients can see your neighborhood 
                  for scheduling purposes. We use this information for safety verification and insurance coverage.
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
