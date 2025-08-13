import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaMapMarkerAlt, FaClock, FaStar, FaHeart, FaBone, FaCalendarAlt } from "react-icons/fa";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUpcomingBookings } from "@/hooks/useBookings";
import { usePets } from "@/hooks/usePets";
import { useLoyaltyAccount } from "@/hooks/useData";
import { format } from "date-fns";

const Dashboard = () => {
  const [greeting, setGreeting] = useState("");
  const { user } = useAuth();
  const { data: upcomingBookings = [], isLoading: loadingBookings } = useUpcomingBookings();
  const { data: pets = [], isLoading: loadingPets } = usePets();
  const { data: loyaltyAccount } = useLoyaltyAccount();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "Friend";

  const stats = [
    { 
      icon: FaCalendarAlt, 
      label: "Completed Walks", 
      value: upcomingBookings.filter(b => b.status === 'completed').length.toString(), 
      color: "text-success" 
    },
    { 
      icon: FaHeart, 
      label: "Registered Pets", 
      value: pets.length.toString(), 
      color: "text-destructive" 
    },
    { 
      icon: FaStar, 
      label: "Loyalty Points", 
      value: loyaltyAccount?.current_points?.toString() || "0", 
      color: "text-secondary" 
    },
    { 
      icon: FaBone, 
      label: "Active Bookings", 
      value: upcomingBookings.filter(b => ['pending', 'confirmed', 'walker_assigned'].includes(b.status || '')).length.toString(), 
      color: "text-accent" 
    },
  ];

  const aiTips = [
    "🌟 Perfect weather for a park adventure today!",
    `🎾 ${pets[0]?.name || 'Your pup'} seems extra energetic - maybe try the longer trail?`,
    "📸 Don't forget to ask for photos during the walk!",
    "💝 You're getting closer to earning loyalty rewards!"
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
            {greeting}, {firstName}! 👋
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
            {loadingBookings ? (
              <div className="fun-card animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking, index) => (
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
                      <div className="text-4xl">
                        {booking.walker_first_name ? "👤" : "🔍"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">
                          {booking.walker_first_name 
                            ? `${booking.walker_first_name} ${booking.walker_last_name}`
                            : "Walker Pending"
                          }
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <span>🐕</span>
                          {booking.pet_name} • {booking.pickup_address}
                        </p>
                        <p className="text-sm font-medium text-info">
                          {booking.scheduled_date && booking.scheduled_time 
                            ? `${format(new Date(booking.scheduled_date), 'MMM d')} at ${booking.scheduled_time}`
                            : "Date pending"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={booking.status === "confirmed" ? "success" : "secondary"}
                        size="sm"
                      >
                        {booking.status === "confirmed" ? "Track Live" : 
                         booking.status === "walker_assigned" ? "Ready" : "Pending"}
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
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fun-card text-center"
              >
                <div className="text-6xl mb-4">🐕</div>
                <h3 className="text-xl font-heading text-primary mb-2">
                  No Walks Scheduled
                </h3>
                <p className="text-muted-foreground mb-4">
                  Ready to book your first adventure?
                </p>
                <Button variant="fun" asChild>
                  <Link to="/bookings/new">
                    Book Your First Walk! 🚀
                  </Link>
                </Button>
              </motion.div>
            )}
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