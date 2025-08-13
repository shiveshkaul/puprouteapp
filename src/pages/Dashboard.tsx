import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaMapMarkerAlt, FaClock, FaStar, FaHeart, FaBone, FaCalendarAlt } from "react-icons/fa";
import { toast } from "sonner";

const Dashboard = () => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const upcomingBookings = [
    {
      id: 1,
      walkerName: "Sarah Johnson",
      walkerAvatar: "👩‍🦱",
      petName: "Buddy",
      petEmoji: "🐕",
      time: "2:00 PM Today",
      location: "Central Park",
      status: "confirmed"
    },
    {
      id: 2,
      walkerName: "Mike Chen",
      walkerAvatar: "👨",
      petName: "Luna",
      petEmoji: "🐩",
      time: "10:00 AM Tomorrow",
      location: "Riverside Trail",
      status: "pending"
    }
  ];

  const stats = [
    { icon: FaCalendarAlt, label: "Walks This Month", value: "12", color: "text-success" },
    { icon: FaHeart, label: "Favorite Walkers", value: "3", color: "text-destructive" },
    { icon: FaStar, label: "Happy Memories", value: "48", color: "text-secondary" },
    { icon: FaBone, label: "Treats Earned", value: "24", color: "text-accent" },
  ];

  const aiTips = [
    "🌟 Perfect weather for a park adventure today!",
    "🎾 Buddy seems extra energetic - maybe try the longer trail?",
    "📸 Don't forget to ask for photos during the walk!",
    "💝 You're just 2 walks away from a free treat reward!"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            {greeting}, Emma! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready for some pawsome adventures today?
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="fun-card text-center"
            >
              <stat.icon className={`text-3xl ${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-heading text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="fun-card">
            <h3 className="text-xl font-heading text-primary mb-4 flex items-center gap-2">
              <FaMapMarkerAlt />
              Find Walkers Nearby
            </h3>
            <p className="text-muted-foreground mb-4">
              Discover amazing dog walkers in your neighborhood
            </p>
            <Button variant="fun" size="lg" asChild>
              <Link to="/walkers">
                Explore Walkers 🗺️
              </Link>
            </Button>
          </div>

          <div className="fun-card">
            <h3 className="text-xl font-heading text-primary mb-4 flex items-center gap-2">
              <FaCalendarAlt />
              Quick Booking
            </h3>
            <p className="text-muted-foreground mb-4">
              Schedule a walk for your furry friend right now
            </p>
            <Button variant="magical" size="lg" asChild>
              <Link to="/bookings/new">
                Book a Walk ✨
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-heading text-primary mb-4 flex items-center gap-2">
            <FaClock />
            Upcoming Adventures
          </h2>
          <div className="space-y-4">
            {upcomingBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="fun-card cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{booking.walkerAvatar}</div>
                    <div>
                      <h4 className="font-semibold text-primary">{booking.walkerName}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <span>{booking.petEmoji}</span>
                        {booking.petName} • {booking.location}
                      </p>
                      <p className="text-sm font-medium text-info">{booking.time}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={booking.status === "confirmed" ? "success" : "secondary"}
                      size="sm"
                    >
                      {booking.status === "confirmed" ? "Track Live" : "Confirm"}
                    </Button>
                    {booking.status === "confirmed" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/walk/${booking.id}/track`}>
                          View Details
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Tips */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-heading text-primary mb-4 flex items-center gap-2">
            🤖 AI Pup Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="fun-card bg-gradient-to-r from-info/10 to-success/10 border border-info/20"
              >
                <p className="text-sm text-card-foreground">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          className="fixed bottom-24 right-6 md:bottom-6 z-40"
        >
          <Button
            variant="magical"
            size="xl"
            className="rounded-full shadow-[var(--shadow-glow)] animate-pulse"
            asChild
          >
            <Link to="/bookings/new">
              📅
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;