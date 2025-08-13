import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaUser, FaBell, FaCreditCard, FaPalette, FaLock, FaQuestionCircle, FaSignOutAlt, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { toast } from "sonner";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    walkReminders: true,
    walkerUpdates: true,
    photoSharing: true,
    promotions: false,
    weeklyReports: true
  });

  const [profile, setProfile] = useState({
    name: "Emma Johnson",
    email: "emma@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY"
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success("Notification settings updated! 🔔");
  };

  const settingSections = [
    {
      icon: FaUser,
      title: "Profile",
      description: "Manage your personal information",
      items: [
        { label: "Name", value: profile.name, action: "edit" },
        { label: "Email", value: profile.email, action: "edit" },
        { label: "Phone", value: profile.phone, action: "edit" },
        { label: "Location", value: profile.location, action: "edit" }
      ]
    },
    {
      icon: FaBell,
      title: "Notifications",
      description: "Control what notifications you receive",
      items: [
        { 
          label: "Walk Reminders", 
          value: notifications.walkReminders, 
          action: "toggle",
          key: "walkReminders" as keyof typeof notifications
        },
        { 
          label: "Walker Updates", 
          value: notifications.walkerUpdates, 
          action: "toggle",
          key: "walkerUpdates" as keyof typeof notifications
        },
        { 
          label: "Photo Sharing", 
          value: notifications.photoSharing, 
          action: "toggle",
          key: "photoSharing" as keyof typeof notifications
        },
        { 
          label: "Promotions", 
          value: notifications.promotions, 
          action: "toggle",
          key: "promotions" as keyof typeof notifications
        },
        { 
          label: "Weekly Reports", 
          value: notifications.weeklyReports, 
          action: "toggle",
          key: "weeklyReports" as keyof typeof notifications
        }
      ]
    },
    {
      icon: FaCreditCard,
      title: "Payment Methods",
      description: "Manage your payment options",
      items: [
        { label: "Primary Card", value: "**** **** **** 1234", action: "edit" },
        { label: "Add New Card", value: "", action: "add" },
        { label: "Billing History", value: "", action: "view" }
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
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-4 py-6">
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
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h3 className="text-xl font-heading">{profile.name}</h3>
              <p className="opacity-90">{profile.email}</p>
              <p className="text-sm opacity-75">Member since January 2024 • 🌟 Premium</p>
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
                      {item.action === "edit" && (
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      )}
                      {item.action === "add" && (
                        <Button variant="success" size="sm">
                          Add
                        </Button>
                      )}
                      {item.action === "view" && (
                        <Button variant="info" size="sm">
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
            onClick={() => toast.error("Signed out successfully 👋")}
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
    </div>
  );
};

export default Settings;