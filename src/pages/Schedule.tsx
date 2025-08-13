import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaCalendarAlt, FaPlus, FaClock, FaMapMarkerAlt, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // week, month

  const bookings = [
    {
      id: 1,
      date: "2024-01-15",
      time: "2:00 PM",
      duration: "1 hour",
      walker: "Sarah Johnson",
      walkerAvatar: "👩‍🦱",
      pet: "Buddy",
      petEmoji: "🐕",
      location: "Central Park",
      status: "confirmed",
      price: "$25"
    },
    {
      id: 2,
      date: "2024-01-16",
      time: "10:00 AM",
      duration: "45 mins",
      walker: "Mike Chen",
      walkerAvatar: "👨",
      pet: "Luna",
      petEmoji: "🐩",
      location: "Riverside Trail",
      status: "pending",
      price: "$30"
    },
    {
      id: 3,
      date: "2024-01-17",
      time: "4:00 PM",
      duration: "1.5 hours",
      walker: "Emily Rodriguez",
      walkerAvatar: "👩",
      pet: "Max",
      petEmoji: "🐺",
      location: "Dog Park Plaza",
      status: "confirmed",
      price: "$42"
    },
    {
      id: 4,
      date: "2024-01-18",
      time: "9:00 AM",
      duration: "1 hour",
      walker: "David Kim",
      walkerAvatar: "👨‍🦳",
      pet: "Buddy",
      petEmoji: "🐕",
      location: "Beach Walk",
      status: "completed",
      price: "$22"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/20 text-success border-success/30";
      case "pending": return "bg-secondary/20 text-secondary border-secondary/30";
      case "completed": return "bg-info/20 text-info border-info/30";
      case "cancelled": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <FaCheck />;
      case "pending": return <FaClock />;
      case "completed": return <FaCheck />;
      case "cancelled": return <FaTimes />;
      default: return <FaClock />;
    }
  };

  const cancelBooking = (bookingId: number) => {
    toast.error("Booking cancelled", {
      description: "The walker has been notified and you'll receive a refund."
    });
  };

  const confirmBooking = (bookingId: number) => {
    toast.success("Booking confirmed! 🎉", {
      description: "Your walker is excited to meet your pup!"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            Your Walk Schedule! 📅
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage all your upcoming and past adventures
          </p>
        </motion.div>

        {/* View Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex gap-2">
            <Button
              variant={viewMode === "week" ? "fun" : "outline"}
              onClick={() => setViewMode("week")}
            >
              Week View
            </Button>
            <Button
              variant={viewMode === "month" ? "fun" : "outline"}
              onClick={() => setViewMode("month")}
            >
              Month View
            </Button>
          </div>
          
          <Button variant="magical" size="lg" asChild className="sm:ml-auto">
            <Link to="/bookings/new" className="flex items-center gap-2">
              <FaPlus />
              Schedule New Walk 🚶‍♂️
            </Link>
          </Button>
        </motion.div>

        {/* AI Optimization Tip */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="fun-card bg-gradient-to-r from-info/10 to-success/10 border border-info/20 mb-6"
        >
          <h3 className="text-lg font-heading text-primary mb-2 flex items-center gap-2">
            🤖 AI Schedule Optimizer
          </h3>
          <p className="text-sm text-card-foreground mb-3">
            Based on weather and walker availability, we suggest moving Thursday's walk to 3:00 PM for better conditions!
          </p>
          <div className="flex gap-2">
            <Button variant="info" size="sm">
              Apply Suggestion
            </Button>
            <Button variant="outline" size="sm">
              Maybe Later
            </Button>
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-heading text-primary mb-4 flex items-center gap-2">
            <FaCalendarAlt />
            Upcoming & Recent Walks
          </h2>
          
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="fun-card"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Date & Time */}
                <div className="text-center lg:text-left lg:w-32">
                  <div className="text-lg font-heading text-primary">
                    {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-lg font-semibold text-secondary mt-1">
                    {booking.time}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.duration}
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {/* Walker Avatar */}
                    <div className="text-3xl">{booking.walkerAvatar}</div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary mb-1">{booking.walker}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{booking.petEmoji}</span>
                        <span>{booking.pet}</span>
                        <span>•</span>
                        <FaMapMarkerAlt />
                        <span>{booking.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className="text-lg font-bold text-primary">{booking.price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-40">
                  {booking.status === "confirmed" && (
                    <>
                      <Button variant="success" size="sm" asChild>
                        <Link to={`/walk/${booking.id}/track`}>
                          Track Walk
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === "pending" && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => confirmBooking(booking.id)}
                      >
                        Confirm
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  {booking.status === "completed" && (
                    <>
                      <Button variant="outline" size="sm">
                        View Photos
                      </Button>
                      <Button variant="outline" size="sm">
                        Book Again
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="fun-card bg-gradient-to-r from-success/10 to-accent/10">
            <h3 className="text-lg font-heading text-primary mb-4">This Week's Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-heading text-success">4</div>
                <div className="text-sm text-muted-foreground">Total Walks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading text-info">5.5</div>
                <div className="text-sm text-muted-foreground">Hours Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading text-secondary">$119</div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading text-accent">3</div>
                <div className="text-sm text-muted-foreground">Happy Pups</div>
              </div>
            </div>
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

export default Schedule;