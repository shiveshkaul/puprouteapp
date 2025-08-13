import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FaBell, 
  FaCheck, 
  FaCheckCircle, 
  FaTimes, 
  FaCalendar,
  FaUser,
  FaWalking,
  FaCreditCard,
  FaInfoCircle,
  FaArrowLeft
} from "react-icons/fa";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  useNotifications, 
  useUnreadNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  useRealtimeNotifications 
} from "@/hooks/useNotifications";
import { format, parseISO } from "date-fns";

const Notifications = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const { data: allNotifications = [], isLoading } = useNotifications();
  const { data: unreadNotifications = [] } = useUnreadNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  
  // Enable realtime notifications
  useRealtimeNotifications();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view notifications</h2>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return <FaCheckCircle className="text-success" />;
      case 'booking_cancelled': return <FaTimes className="text-destructive" />;
      case 'walker_assigned': return <FaUser className="text-primary" />;
      case 'walk_started': return <FaWalking className="text-info" />;
      case 'walk_completed': return <FaCheck className="text-success" />;
      case 'payment_processed': return <FaCreditCard className="text-secondary" />;
      default: return <FaInfoCircle className="text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return 'border-l-success';
      case 'booking_cancelled': return 'border-l-destructive';
      case 'walker_assigned': return 'border-l-primary';
      case 'walk_started': return 'border-l-info';
      case 'walk_completed': return 'border-l-success';
      case 'payment_processed': return 'border-l-secondary';
      default: return 'border-l-muted';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const filteredNotifications = activeTab === "unread" 
    ? unreadNotifications 
    : allNotifications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                Notifications 📬
              </h1>
              <p className="text-muted-foreground text-lg">
                Stay updated with your pup's adventures
              </p>
            </div>
            {unreadNotifications.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                <FaCheckCircle className="mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FaBell />
                All Notifications
                <Badge variant="secondary" className="ml-1">
                  {allNotifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <FaInfoCircle />
                Unread
                {unreadNotifications.length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">
                {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === "unread" 
                  ? "You're all caught up! Check back later for updates."
                  : "Start booking walks to receive notifications about your pup's adventures."
                }
              </p>
              {activeTab !== "unread" && (
                <Button variant="magical" asChild>
                  <Link to="/bookings/new">
                    Book Your First Walk ✨
                  </Link>
                </Button>
              )}
            </Card>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card 
                  className={`p-6 cursor-pointer transition-all duration-200 border-l-4 ${
                    getNotificationColor(notification.type)
                  } ${!notification.is_read ? 'bg-secondary/5 shadow-md' : 'hover:shadow-md'}`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(notification.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={notification.type === 'booking_confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {notification.type.replace('_', ' ')}
                      </Badge>
                      {notification.booking_id && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/schedule">
                            <FaCalendar className="mr-1" />
                            View Booking
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Empty State for All Notifications */}
        {!isLoading && allNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-6">🐕</div>
            <h3 className="text-2xl font-semibold mb-4">Welcome to PupRoute!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This is where you'll see updates about your bookings, walker assignments, 
              and completed walks. Start by booking your first walk!
            </p>
            <Button variant="magical" size="lg" asChild>
              <Link to="/bookings/new">
                Book Your First Walk ✨
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
