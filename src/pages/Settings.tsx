import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaUser, FaBell, FaCreditCard, FaPalette, FaLock, FaQuestionCircle, FaSignOutAlt, FaToggleOn, FaToggleOff, FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  useUserSettings, 
  useUpdateUserSettings, 
  useSettingsProfile, 
  useUpdateUserProfile,
  usePaymentMethods, 
  useBillingHistory,
  useAddPaymentMethod,
  useToggleNotification,
  formatPaymentMethodsForDisplay,
  formatBillingTransactionsForDisplay
} from "@/hooks/useSettings";
import { BillingHistoryModal } from "@/components/BillingHistoryModal";
import { EditProfileModal } from "@/components/EditProfileModal";
import { AddPaymentMethodModal } from "@/components/AddPaymentMethodModal";

const Settings = () => {
  const { user, signOut } = useAuth();
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  
  // Data hooks
  const { data: settings, isLoading: settingsLoading } = useUserSettings();
  const { data: profile, isLoading: profileLoading } = useSettingsProfile();
  const { data: paymentMethods, isLoading: paymentsLoading } = usePaymentMethods();
  const { data: billingHistory, isLoading: billingLoading } = useBillingHistory(10);
  
  // Action hooks
  const toggleNotification = useToggleNotification();
  const updateProfile = useUpdateUserProfile();
  const addPaymentMethod = useAddPaymentMethod();
  
  // Handle profile save
  const handleProfileSave = async (profileData: any) => {
    await updateProfile.mutateAsync(profileData);
  };
  
  // Handle payment method save
  const handlePaymentMethodSave = async (paymentData: any) => {
    await addPaymentMethod.mutateAsync(paymentData);
  };
  
  // Loading state
  const isLoading = settingsLoading || profileLoading;
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully! 👋");
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 pt-20 pb-24">
        <div className="container mx-auto px-4 py-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!user || !settings || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 pt-20 pb-24">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings Unavailable</h1>
            <p className="text-gray-600">Please sign in to access your settings.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Format payment methods for display
  const formattedPaymentMethods = paymentMethods ? formatPaymentMethodsForDisplay(paymentMethods) : [];
  const formattedBilling = billingHistory ? formatBillingTransactionsForDisplay(billingHistory) : [];
  
  const settingSections = [
    {
      icon: FaUser,
      title: "Profile",
      description: "Manage your personal information",
      items: [
        { label: "Name", value: profile.name, action: "edit", field: "name" },
        { label: "Email", value: profile.email, action: "edit", field: "email" },
        { label: "Phone", value: profile.phone || "Not provided", action: "edit", field: "phone" },
        { label: "Location", value: profile.location || "Not provided", action: "edit", field: "location" }
      ]
    },
    {
      icon: FaBell,
      title: "Notifications",
      description: "Control what notifications you receive",
      items: [
        { 
          label: "Walk Reminders", 
          value: settings.walk_reminders, 
          action: "toggle",
          key: "walk_reminders" as keyof typeof settings
        },
        { 
          label: "Walker Updates", 
          value: settings.walker_updates, 
          action: "toggle",
          key: "walker_updates" as keyof typeof settings
        },
        { 
          label: "Photo Sharing", 
          value: settings.photo_sharing, 
          action: "toggle",
          key: "photo_sharing" as keyof typeof settings
        },
        { 
          label: "Promotions", 
          value: settings.promotions, 
          action: "toggle",
          key: "promotions" as keyof typeof settings
        },
        { 
          label: "Weekly Reports", 
          value: settings.weekly_reports, 
          action: "toggle",
          key: "weekly_reports" as keyof typeof settings
        }
      ]
    },
    {
      icon: FaCreditCard,
      title: "Payment Methods",
      description: "Manage your payment options",
      items: [
        ...formattedPaymentMethods.map(method => ({
          label: method.nickname || method.display_name,
          value: method.is_primary ? "Primary" : method.expires ? `Expires ${method.expires}` : "",
          action: "edit" as const,
          id: method.id
        })),
        { label: "Add New Card", value: "", action: "add" as const },
        { label: "Billing History", value: "", action: "view" as const }
      ]
    }
  ];

  const quickActions = [
    {
      icon: FaPalette,
      title: "Theme Customization",
      description: "Personalize your PupRoute experience",
      action: () => toast.info("Theme customization coming soon! 🎨")
    },
    {
      icon: FaLock,
      title: "Privacy & Security",
      description: "Manage your privacy settings",
      action: () => toast.info("Privacy settings opened 🔒")
    },
    {
      icon: FaQuestionCircle,
      title: "Help & Support",
      description: "Get help when you need it",
      action: () => toast.info("Help center opened 💬")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 pt-20 pb-24 md:pl-1">
      <div className="container mx-auto px-4 md:px-6 py-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            Settings ⚙️
          </h1>
          <p className="text-lg text-muted-foreground">
            Customize your PupRoute experience
          </p>
        </motion.div>

        {/* Profile Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="fun-card mb-6 bg-gradient-fun text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                "👤"
              )}
            </div>
            <div>
              <h3 className="text-xl font-heading">{profile.name}</h3>
              <p className="opacity-90">{profile.email}</p>
              <p className="text-sm opacity-75">
                Member since {profile.member_since} • 
                {profile.subscription_tier === 'premium' ? ' 🌟 Premium' : 
                 profile.subscription_tier === 'pro' ? ' 💎 Pro' : ' Free'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + sectionIndex * 0.1 }}
              className="fun-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="text-2xl text-primary" />
                <div>
                  <h3 className="text-xl font-heading text-primary">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                    className="flex items-center justify-between p-3 bg-muted/10 rounded-[var(--radius-fun)]"
                  >
                    <div>
                      <h4 className="font-medium text-primary">{item.label}</h4>
                      {item.value && item.action !== "toggle" && (
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      )}
                    </div>

                    <div>
                      {item.action === "toggle" && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => item.key && toggleNotification(item.key)}
                          className="text-2xl"
                        >
                          {item.value ? (
                            <FaToggleOn className="text-success" />
                          ) : (
                            <FaToggleOff className="text-muted-foreground" />
                          )}
                        </motion.button>
                      )}
                      {item.action === "edit" && section.title === "Profile" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowEditProfile(true)}
                        >
                          <FaEdit className="mr-1" />
                          Edit
                        </Button>
                      )}
                      {item.action === "edit" && section.title !== "Profile" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info(`Edit ${item.label} feature coming soon! ✏️`)}
                        >
                          <FaEdit className="mr-1" />
                          Edit
                        </Button>
                      )}
                      {item.action === "add" && (
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => setShowAddPayment(true)}
                        >
                          <FaPlus className="mr-1" />
                          Add
                        </Button>
                      )}
                      {item.action === "view" && section.title === "Payment Methods" && (
                        <Button 
                          variant="info" 
                          size="sm"
                          onClick={() => setShowBillingHistory(true)}
                        >
                          <FaEye className="mr-1" />
                          View
                        </Button>
                      )}
                      {item.action === "view" && section.title !== "Payment Methods" && (
                        <Button variant="info" size="sm">
                          <FaEye className="mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-heading text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="fun-card text-left hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300"
              >
                <action.icon className="text-3xl text-primary mb-3" />
                <h4 className="font-semibold text-primary mb-2">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
            onClick={() => toast.info("Export data feature coming soon! 📤")}
          >
            Export My Data
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex items-center gap-2 sm:ml-auto"
            onClick={handleSignOut}
          >
            <FaSignOutAlt />
            Sign Out
          </Button>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>PupRoute v2.1.0 • Made with ❤️ for dog lovers</p>
          <p className="mt-1">
            <button className="hover:text-primary transition-colors">Privacy Policy</button>
            {" • "}
            <button className="hover:text-primary transition-colors">Terms of Service</button>
            {" • "}
            <button className="hover:text-primary transition-colors">Contact Us</button>
          </p>
        </motion.div>
      </div>
      
      {/* Billing History Modal */}
      <BillingHistoryModal
        isOpen={showBillingHistory}
        onClose={() => setShowBillingHistory(false)}
        transactions={formattedBilling}
      />
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={profile}
        onSave={handleProfileSave}
      />
      
      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddPayment}
        onClose={() => setShowAddPayment(false)}
        onSave={handlePaymentMethodSave}
      />
    </div>
  );
};

export default Settings;