import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaX, FaCreditCard, FaPaypal } from "react-icons/fa6";
import { toast } from "sonner";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export const AddPaymentMethodModal = ({ isOpen, onClose, onSave }: AddPaymentMethodModalProps) => {
  const [formData, setFormData] = useState({
    provider: 'stripe',
    nickname: '',
    card_brand: 'visa',
    card_last_four: '',
    card_exp_month: '',
    card_exp_year: '',
    paypal_email: '',
    billing_name: '',
    billing_address_line1: '',
    billing_city: '',
    billing_state: '',
    billing_zip: '',
    is_primary: false,
  });
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate payment method creation (in real app, you'd integrate with Stripe/PayPal)
      const paymentMethodData = {
        ...formData,
        provider_payment_method_id: `pm_mock_${Date.now()}`, // Mock ID
        card_exp_month: parseInt(formData.card_exp_month) || null,
        card_exp_year: parseInt(formData.card_exp_year) || null,
      };
      
      await onSave(paymentMethodData);
      toast.success("Payment method added successfully! 💳");
      onClose();
      
      // Reset form
      setFormData({
        provider: 'stripe',
        nickname: '',
        card_brand: 'visa',
        card_last_four: '',
        card_exp_month: '',
        card_exp_year: '',
        paypal_email: '',
        billing_name: '',
        billing_address_line1: '',
        billing_city: '',
        billing_state: '',
        billing_zip: '',
        is_primary: false,
      });
    } catch (error) {
      toast.error("Failed to add payment method. Please try again.");
      console.error('Payment method creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStripe = formData.provider === 'stripe';
  const isPayPal = formData.provider === 'paypal';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-heading text-primary">Add Payment Method</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full p-2"
                >
                  <FaX className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Provider Selection */}
                <div>
                  <Label htmlFor="provider">Payment Provider</Label>
                  <Select value={formData.provider} onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">
                        <div className="flex items-center gap-2">
                          <FaCreditCard />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="paypal">
                        <div className="flex items-center gap-2">
                          <FaPaypal />
                          PayPal
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nickname */}
                <div>
                  <Label htmlFor="nickname">Nickname (Optional)</Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="e.g., Personal Card, Business Card"
                  />
                </div>

                {/* Stripe/Card Details */}
                {isStripe && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="card_brand">Card Brand</Label>
                        <Select value={formData.card_brand} onValueChange={(value) => setFormData(prev => ({ ...prev, card_brand: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visa">Visa</SelectItem>
                            <SelectItem value="mastercard">Mastercard</SelectItem>
                            <SelectItem value="amex">American Express</SelectItem>
                            <SelectItem value="discover">Discover</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="card_last_four">Last 4 Digits</Label>
                        <Input
                          id="card_last_four"
                          value={formData.card_last_four}
                          onChange={(e) => setFormData(prev => ({ ...prev, card_last_four: e.target.value }))}
                          placeholder="1234"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="card_exp_month">Exp Month</Label>
                        <Select value={formData.card_exp_month} onValueChange={(value) => setFormData(prev => ({ ...prev, card_exp_month: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                              <SelectItem key={month} value={month.toString()}>
                                {month.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="card_exp_year">Exp Year</Label>
                        <Select value={formData.card_exp_year} onValueChange={(value) => setFormData(prev => ({ ...prev, card_exp_year: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {/* PayPal Details */}
                {isPayPal && (
                  <div>
                    <Label htmlFor="paypal_email">PayPal Email</Label>
                    <Input
                      id="paypal_email"
                      type="email"
                      value={formData.paypal_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, paypal_email: e.target.value }))}
                      placeholder="your-paypal@email.com"
                    />
                  </div>
                )}

                {/* Billing Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Billing Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="billing_name">Billing Name</Label>
                      <Input
                        id="billing_name"
                        value={formData.billing_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, billing_name: e.target.value }))}
                        placeholder="Full name on card"
                      />
                    </div>

                    <div>
                      <Label htmlFor="billing_address_line1">Billing Address</Label>
                      <Input
                        id="billing_address_line1"
                        value={formData.billing_address_line1}
                        onChange={(e) => setFormData(prev => ({ ...prev, billing_address_line1: e.target.value }))}
                        placeholder="Street address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="billing_city">City</Label>
                        <Input
                          id="billing_city"
                          value={formData.billing_city}
                          onChange={(e) => setFormData(prev => ({ ...prev, billing_city: e.target.value }))}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="billing_state">State</Label>
                        <Input
                          id="billing_state"
                          value={formData.billing_state}
                          onChange={(e) => setFormData(prev => ({ ...prev, billing_state: e.target.value }))}
                          placeholder="State"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="billing_zip">ZIP Code</Label>
                      <Input
                        id="billing_zip"
                        value={formData.billing_zip}
                        onChange={(e) => setFormData(prev => ({ ...prev, billing_zip: e.target.value }))}
                        placeholder="ZIP code"
                      />
                    </div>
                  </div>
                </div>

                {/* Make Primary */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={formData.is_primary}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_primary">Make this my primary payment method</Label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? "Adding..." : "Add Payment Method"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
