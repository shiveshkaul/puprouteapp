import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaStar, 
  FaPhone, 
  FaEnvelope,
  FaRoute,
  FaCamera,
  FaHeart,
  FaEdit,
  FaTimes,
  FaCheck
} from "react-icons/fa";
import { format, parseISO } from "date-fns";
import { useBookingDetails } from "@/hooks/useWalkHistory";
import { useUpdateBookingStatus, useCancelBooking } from "@/hooks/useSchedule";
import { toast } from "sonner";

interface BookingDetailsModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal = ({ bookingId, isOpen, onClose }: BookingDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const { data: booking, isLoading } = useBookingDetails(bookingId);
  const updateStatus = useUpdateBookingStatus();
  const cancelBooking = useCancelBooking();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ bookingId, status: newStatus });
      toast.success(`Booking ${newStatus}!`);
    } catch (error) {
      toast.error(`Failed to ${newStatus} booking`);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  if (!booking && !isLoading) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {booking?.pets?.avatar_url ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={booking.pets.avatar_url} alt={booking.pets.name} />
                <AvatarFallback>{booking.pets.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <span className="text-2xl">🐕</span>
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {booking?.pets?.name}'s Walk Details
              </h2>
              <Badge className={getStatusColor(booking?.status || '')}>
                {booking?.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin text-4xl mb-4">🐕</div>
            <p>Loading booking details...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="walker">Walker</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Booking Overview */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {booking?.scheduled_date && format(parseISO(booking.scheduled_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaClock className="text-secondary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {booking?.scheduled_time} ({booking?.service_types?.duration_minutes} min)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">
                        {booking?.pickup_location || 'Location TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💰</span>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="font-medium text-lg">
                        ${(booking?.total_amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pet Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Pet Information</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={booking?.pets?.avatar_url} alt={booking?.pets?.name} />
                    <AvatarFallback className="text-2xl">🐕</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">{booking?.pets?.name}</h4>
                    <p className="text-muted-foreground mb-2">
                      {booking?.pets?.pet_breeds?.name} • {booking?.pets?.age} years old
                    </p>
                    {booking?.pets?.weight && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Weight: {booking.pets.weight} lbs
                      </p>
                    )}
                    {booking?.pets?.special_instructions && (
                      <div className="mt-3 p-3 bg-secondary/20 rounded-lg">
                        <p className="text-sm font-medium text-secondary mb-1">Special Instructions:</p>
                        <p className="text-sm">{booking.pets.special_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Service Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Service Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Service Type:</span>
                    <span className="font-medium">{booking?.service_types?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{booking?.service_types?.duration_minutes} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Base Price:</span>
                    <span className="font-medium">${booking?.service_types?.base_price}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="walker" className="space-y-6">
              {booking?.walkers ? (
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={booking.walkers.users?.avatar_url} />
                      <AvatarFallback className="text-xl">
                        {booking.walkers.users?.first_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {booking.walkers.users?.first_name} {booking.walkers.users?.last_name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-500" />
                          <span className="font-medium">{booking.walkers.average_rating?.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">${booking.walkers.hourly_rate}/hr</span>
                        {booking.walkers.experience_years && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{booking.walkers.experience_years}+ years exp</span>
                          </>
                        )}
                      </div>
                      {booking.walkers.bio && (
                        <p className="text-muted-foreground text-sm">{booking.walkers.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <FaPhone className="mr-2" />
                      Call Walker
                    </Button>
                    <Button variant="outline" size="sm">
                      <FaEnvelope className="mr-2" />
                      Message
                    </Button>
                  </div>

                  {booking.walkers.certifications && (
                    <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
                      <p className="text-sm font-medium mb-2">Certifications:</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.walkers.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-6 text-center">
                  <div className="text-4xl mb-4">👤</div>
                  <h3 className="text-lg font-semibold mb-2">Walker Not Assigned</h3>
                  <p className="text-muted-foreground">We'll assign a walker soon!</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {booking?.walk_reports && booking.walk_reports.length > 0 ? (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Walk Report</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Distance Walked</p>
                        <p className="font-medium">{booking.walk_reports[0].distance_walked} miles</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Weather</p>
                        <p className="font-medium">{booking.walk_reports[0].weather_conditions}</p>
                      </div>
                    </div>
                    {booking.walk_reports[0].notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Walker's Notes</p>
                        <div className="p-3 bg-secondary/20 rounded-lg">
                          <p className="text-sm">{booking.walk_reports[0].notes}</p>
                        </div>
                      </div>
                    )}
                    {booking.walk_reports[0].photos && booking.walk_reports[0].photos.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Photos</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {booking.walk_reports[0].photos.map((photo, index) => (
                            <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                              <FaCamera className="text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">No Walk Report Yet</h3>
                  <p className="text-muted-foreground">The report will be available after the walk is completed.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Booking Actions</h3>
                <div className="space-y-4">
                  {booking?.status === 'pending' && (
                    <>
                      <Button 
                        variant="default" 
                        className="w-full" 
                        onClick={() => handleStatusChange('confirmed')}
                        disabled={updateStatus.isPending}
                      >
                        <FaCheck className="mr-2" />
                        Confirm Booking
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {/* Open edit modal */}}
                      >
                        <FaEdit className="mr-2" />
                        Modify Booking
                      </Button>
                    </>
                  )}
                  
                  {(booking?.status === 'pending' || booking?.status === 'confirmed') && (
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleCancel}
                      disabled={cancelBooking.isPending}
                    >
                      <FaTimes className="mr-2" />
                      Cancel Booking
                    </Button>
                  )}

                  {booking?.status === 'completed' && !booking?.reviews?.length && (
                    <Button variant="outline" className="w-full">
                      <FaStar className="mr-2" />
                      Leave Review
                    </Button>
                  )}

                  <Button variant="outline" className="w-full">
                    <FaHeart className="mr-2" />
                    Book Again
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
