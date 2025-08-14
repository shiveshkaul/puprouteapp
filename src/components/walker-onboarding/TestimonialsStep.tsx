import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaEnvelope, FaCheck, FaPlus, FaTrash } from 'react-icons/fa';

interface TestimonialsStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const TestimonialsStep = ({ data, updateData, onNext, onPrev }: TestimonialsStepProps) => {
  const [newEmail, setNewEmail] = useState('');
  const [sentRequests, setSentRequests] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const addEmail = () => {
    if (newEmail && isValidEmail(newEmail)) {
      const currentEmails = data.testimonialEmails || [];
      if (!currentEmails.includes(newEmail)) {
        updateData({
          testimonialEmails: [...currentEmails, newEmail]
        });
        setNewEmail('');
      }
    }
  };

  const removeEmail = (email: string) => {
    updateData({
      testimonialEmails: (data.testimonialEmails || []).filter((e: string) => e !== email)
    });
  };

  const sendRequests = () => {
    // Mock sending testimonial requests
    setSentRequests(data.testimonialEmails?.length || 0);
    // In real app, this would send actual emails
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Testimonials</h2>
        <p className="text-gray-600">
          Ask family members, friends, or pet owners who used your services to write about your 
          pet care experience and highlight why you'd be a great pet walker.
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Information Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">Why are testimonials important?</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Testimonials increase your booking rate by up to 70%</li>
              <li>• They help build trust with potential clients</li>
              <li>• Personal recommendations carry more weight than reviews</li>
              <li>• You can request up to 15 testimonials total</li>
            </ul>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 text-center bg-gray-50">
              <div className="text-2xl font-bold text-gray-800">{sentRequests}</div>
              <div className="text-sm text-gray-600">requests sent</div>
            </Card>
            <Card className="p-4 text-center bg-green-50">
              <div className="text-2xl font-bold text-green-800">0</div>
              <div className="text-sm text-green-600">testimonials received</div>
            </Card>
          </div>

          {/* Add Email Addresses */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Email Addresses</h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll send them a friendly email on your behalf explaining what they need to do.
            </p>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addEmail();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addEmail}
                  disabled={!newEmail || !isValidEmail(newEmail)}
                  variant="outline"
                >
                  <FaPlus className="h-4 w-4" />
                </Button>
              </div>

              {/* Email List */}
              {data.testimonialEmails && data.testimonialEmails.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Email addresses to contact:
                  </Label>
                  {data.testimonialEmails.map((email: string, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaEnvelope className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pre-filled Email Suggestions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Quick add suggestions:
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {['friend1@example.com', 'family@example.com', 'neighbor@example.com'].map((email) => (
                    <button
                      key={email}
                      type="button"
                      onClick={() => setNewEmail(email)}
                      className="text-left p-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      {email}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Send Requests Button */}
          {data.testimonialEmails && data.testimonialEmails.length > 0 && sentRequests === 0 && (
            <div className="text-center">
              <Button
                type="button"
                onClick={sendRequests}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                <FaEnvelope className="mr-2 h-4 w-4" />
                Send Requests to All ({data.testimonialEmails.length})
              </Button>
            </div>
          )}

          {/* Success Message */}
          {sentRequests > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500 h-5 w-5" />
                <div>
                  <h4 className="font-medium text-green-800">Requests Sent Successfully!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    We've sent testimonial requests to {sentRequests} people. They have 6 weeks to respond, 
                    and you'll be notified when testimonials are received.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sample Email Preview */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-3">📧 Sample Email Preview</h4>
            <div className="text-sm text-gray-600 bg-white p-4 rounded border italic">
              <p><strong>Subject:</strong> Can you help [Your Name] become a PupRoute walker?</p>
              <br />
              <p>Hi there!</p>
              <p>[Your Name] is applying to become a professional pet walker with PupRoute and has listed you as someone who can speak to their pet care experience.</p>
              <p>Would you mind taking 2 minutes to write a brief testimonial about their reliability, care, and love for animals?</p>
              <p>Thanks so much!</p>
              <p>- The PupRoute Team</p>
            </div>
          </Card>

          {/* Important Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-500 text-lg">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800">Important Note</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You can request testimonials up to six weeks after your walker profile has been approved, 
                  or until you've received 15 testimonials maximum. Quality is more important than quantity!
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
