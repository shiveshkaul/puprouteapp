import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaX } from "react-icons/fa6";
import { toast } from "sonner";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  onSave: (data: any) => Promise<void>;
}

export const EditProfileModal = ({ isOpen, onClose, profile, onSave }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    first_name: profile.name.split(' ')[0] || '',
    last_name: profile.name.split(' ').slice(1).join(' ') || '',
    email: profile.email,
    phone: profile.phone || '',
    address: profile.location || '',
  });
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      toast.success("Profile updated successfully! 👤");
      onClose();
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-heading text-primary">Edit Profile</h2>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Location</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your location"
                  />
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
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
