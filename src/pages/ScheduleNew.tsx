import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaClock, 
  FaMapMarkerAlt, 
  FaCheck, 
  FaTimes, 
  FaEllipsisV,
  FaPhone,
  FaStar
} from "react-icons/fa";
import { toast } from "sonner";
import { useSchedule, useUpdateBookingStatus, useCancelBooking, useBookingStats } from "@/hooks/useSchedule";
import { useAuth } from "@/hooks/useAuth";

const Schedule = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: bookings = [], isLoading, error } = useSchedule();
  const { data: stats } = useBookingStats();
  const updateBookingStatus = useUpdateBookingStatus();
  const cancelBooking = useCancelBooking();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your schedule</h2>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">Loading your schedule...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center text-red-600">
            Error loading schedule: {error.message}
          </div>
        </div>
      </div>
    );
  }

  const filteredBookings = statusFilter === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/20 text-success border-success/30";
      case "pending": return "bg-secondary/20 text-secondary border-secondary/30";
      case "completed": return "bg-info/20 text-info border-info/30";
      case "cancelled": return "bg-destructive/20 text-destructive border-destructive/30";
      case "in_progress": return "bg-primary/20 text-primary border-primary/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <FaCheck />;
      case "pending": return <FaClock />;
      case "completed": return <FaCheck />;
      case "cancelled": return <FaTimes />;
      case "in_progress": return <FaClock />;
      default: return <FaClock />;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled", {
        description: "The walker has been notified and you'll receive a refund."
      });
    } catch (error) {
      toast.error("Failed to cancel booking", {
        description: "Please try again or contact support."
      });
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus.mutateAsync({ 
        bookingId, 
        status: "confirmed" 
      });
      toast.success("Booking confirmed! 🎉", {
        description: "Your walker is excited to meet your pup!"
      });
    } catch (error) {
      toast.error("Failed to confirm booking", {
        description: "Please try again or contact support."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Your Schedule 📅
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your upcoming walks and adventures
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="p-4 text-center">
              <div className="text-2xl font-heading text-success">{stats.totalWalks}</div>
              <div className="text-sm text-muted-foreground">Walks This Week</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-heading text-info">{stats.totalHours.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Hours Active</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-heading text-secondary">${stats.totalSpent.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-heading text-accent">{stats.uniquePets}</div>
              <div className="text-sm text-muted-foreground">Happy Pups</div>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex flex-wrap gap-4 items-center justify-between"
        >
          <div className="flex gap-2">
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => setViewMode("week")}
              size="sm"
            >
              Week
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              size="sm"
            >
              List
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-20"
        >
          {filteredBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🐕</div>
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">
                Ready to schedule your first walk?
              </p>
              <Button asChild>
                <Link to="/bookings/new">
                  <FaPlus className="mr-2" />
                  Book a Walk
                </Link>
              </Button>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg border border-border/50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
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
                        <h3 className="font-semibold text-lg">
                          {booking.pets?.name || 'Unknown Pet'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.pets?.pet_breeds?.name || 'Mixed Breed'}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-primary" />
                      <span className="text-sm">
                        {format(parseISO(booking.scheduled_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-secondary" />
                      <span className="text-sm">
                        {booking.scheduled_time} ({booking.service_types?.duration_minutes || 60} min)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-accent" />
                      <span className="text-sm">
                        {booking.pickup_location || 'Location TBD'}
                      </span>
                    </div>
                  </div>

                  {booking.walkers && (
                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {booking.walkers.users?.first_name?.charAt(0) || 'W'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {booking.walkers.users?.first_name} {booking.walkers.users?.last_name}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <FaStar className="text-yellow-500" />
                            <span>{booking.walkers.average_rating?.toFixed(1) || 'New'}</span>
                            <span>•</span>
                            <span>${booking.walkers.hourly_rate}/hr</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FaPhone />
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleConfirmBooking(booking.id)}
                              disabled={updateBookingStatus.isPending}
                            >
                              <FaCheck />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancelBooking.isPending}
                            >
                              <FaTimes />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      ${(booking.total_amount || 0).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.service_types?.name || 'Walk Service'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
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
