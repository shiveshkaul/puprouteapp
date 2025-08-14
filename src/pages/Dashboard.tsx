import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaStar, 
  FaHeart, 
  FaBone, 
  FaCalendarAlt, 
  FaBell, 
  FaCheck,
  FaEye
} from "react-icons/fa";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUpcomingBookings } from "@/hooks/useBookings";
import { usePets } from "@/hooks/usePets";
import { useLoyaltyAccount } from "@/hooks/useData";
import { useUnreadNotifications, useMarkNotificationAsRead, useRealtimeNotifications } from "@/hooks/useNotifications";
import { useBookingStats } from "@/hooks/useSchedule";
import { format, parseISO } from "date-fns";

const Dashboard = () => {
  const [greeting, setGreeting] = useState("");
  const { user } = useAuth();
  const { data: upcomingBookings = [], isLoading: loadingBookings } = useUpcomingBookings();
  const { data: pets = [], isLoading: loadingPets } = usePets();
  const { data: loyaltyAccount } = useLoyaltyAccount();
  const { data: notifications = [] } = useUnreadNotifications();
  const { data: bookingStats } = useBookingStats();
  const markAsRead = useMarkNotificationAsRead();
  
  // Enable realtime notifications
  useRealtimeNotifications();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Get user's display name (same logic as Settings page)
  const getUserDisplayName = () => {
    if (!user) return "Friend";
    
    const userMetadata = user.user_metadata || {};
    
    // Try to get full name from metadata
    const fullName = userMetadata.full_name || 
                     `${userMetadata.first_name || ''} ${userMetadata.last_name || ''}`.trim();
    
    // If we have a full name, use it
    if (fullName && fullName !== ' ') {
      return fullName;
    }
    
    // Otherwise, use the part before @ in email as a fallback
    return user.email?.split('@')[0] || "Friend";
  };

  const displayName = getUserDisplayName();

  const dashboardStats = [
    { 
      icon: FaCalendarAlt, 
      label: "Completed Walks", 
      value: (bookingStats?.totalWalks || 0).toString(), 
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 pt-20 pb-24 md:pl-64">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your dashboard</h2>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10">
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            {greeting}, {displayName}! 👋
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
          {dashboardStats.map((stat, index) => (
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

        {/* Notifications */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-heading text-primary mb-4 flex items-center gap-2">
              <FaBell />
              Recent Notifications
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </h2>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <Card 
                  key={notification.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => markAsRead.mutate(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(notification.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Badge 
                      variant={notification.type === 'booking_confirmed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </Card>
              ))}
              {notifications.length > 3 && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/notifications">
                    View All Notifications
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}

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
              upcomingBookings.slice(0, 3).map((booking, index) => (
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
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={booking.pets?.avatar_url} 
                          alt={booking.pets?.name} 
                        />
                        <AvatarFallback>
                          {booking.pets?.name?.charAt(0) || '🐕'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-primary">
                          {booking.pets?.name || 'Unknown Pet'}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <span>👤</span>
                          {booking.walker_profiles?.user 
                            ? `${booking.walker_profiles.user.first_name} ${booking.walker_profiles.user.last_name}`
                            : "Walker Pending"
                          }
                        </p>
                        <p className="text-sm font-medium text-info">
                          {format(parseISO(booking.scheduled_date), 'MMM d')} at {booking.scheduled_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge 
                        variant={booking.status === "confirmed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {booking.status === "confirmed" ? "Ready" : 
                         booking.status === "pending" ? "Pending" : 
                         booking.status.replace('_', ' ')}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/schedule">
                          <FaEye className="mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="fun-card text-center py-8">
                <div className="text-4xl mb-4">🐕</div>
                <h3 className="text-xl font-semibold mb-2">No upcoming walks</h3>
                <p className="text-muted-foreground mb-4">
                  Ready to schedule your next adventure?
                </p>
                <Button variant="magical" asChild>
                  <Link to="/bookings/new">
                    Book a Walk ✨
                  </Link>
                </Button>
              </div>
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
