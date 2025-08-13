import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Clock, 
  Camera, 
  MessageCircle, 
  Heart, 
  Play, 
  Pause, 
  Phone,
  Share2,
  Timer,
  Navigation,
  Zap,
  Star,
  Activity
} from "lucide-react";

// Mock data for demonstration
const mockWalkData = {
  walker: {
    name: "Sarah Johnson",
    rating: 4.9,
    avatar: "👩‍🦰",
    phone: "+1 (555) 123-4567"
  },
  pet: {
    name: "Buddy",
    breed: "Golden Retriever",
    avatar: "🐕"
  },
  status: "active",
  startTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
  duration: 25,
  distance: 1.2,
  route: [
    { lat: 40.7128, lng: -74.0060, time: "2:30 PM" },
    { lat: 40.7138, lng: -74.0050, time: "2:35 PM" },
    { lat: 40.7148, lng: -74.0040, time: "2:40 PM" },
    { lat: 40.7158, lng: -74.0030, time: "2:45 PM" }
  ],
  photos: [
    { id: 1, url: "🌳", caption: "Buddy loves this park!", time: "2:35 PM" },
    { id: 2, url: "💧", caption: "Hydration break!", time: "2:42 PM" },
    { id: 3, url: "🎾", caption: "Found a tennis ball!", time: "2:48 PM" }
  ],
  messages: [
    { id: 1, sender: "walker", text: "Starting our adventure!", time: "2:30 PM" },
    { id: 2, sender: "walker", text: "Buddy is so excited! 🐕", time: "2:35 PM" },
    { id: 3, sender: "owner", text: "That's wonderful! Have fun!", time: "2:36 PM" },
    { id: 4, sender: "walker", text: "He's making friends with other dogs!", time: "2:45 PM" }
  ]
};

const WalkTracking = () => {
  const [activeTab, setActiveTab] = useState("map");
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPhotos, setShowPhotos] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const LiveMap = () => (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl overflow-hidden">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-green-200 opacity-50" />
      
      {/* Mock Route Path */}
      <svg className="absolute inset-0 w-full h-full">
        <path
          d="M 50 300 Q 150 250 250 200 Q 350 150 450 100"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          fill="none"
          strokeDasharray="8,4"
          className="animate-pulse"
        />
      </svg>

      {/* Mock Location Pins */}
      <motion.div 
        className="absolute top-20 left-12 text-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        🏠
      </motion.div>
      
      <motion.div 
        className="absolute top-32 left-32 text-2xl"
        animate={{ y: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        🌳
      </motion.div>

      <motion.div 
        className="absolute top-16 right-24 text-2xl"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        ⛲
      </motion.div>

      {/* Walker Current Position */}
      <motion.div 
        className="absolute top-24 right-16 text-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, 360]
        }}
        transition={{ 
          scale: { repeat: Infinity, duration: 1.5 },
          rotate: { repeat: Infinity, duration: 4 }
        }}
      >
        🚶‍♀️🐕
      </motion.div>

      {/* Live Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-red-600">LIVE</span>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="outline" className="rounded-full">
          <Navigation className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="rounded-full">
          <Zap className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-success/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-heading text-primary mb-2">
                Live Walk Tracking 🗺️
              </h1>
              <p className="text-lg text-muted-foreground">
                Follow {mockWalkData.pet.name}'s adventure in real-time!
              </p>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              <Activity className="h-4 w-4 mr-1" />
              Active Walk
            </Badge>
          </div>
        </motion.div>

        {/* Walker & Pet Info */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fun-card mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{mockWalkData.walker.avatar}</div>
              <div>
                <h3 className="text-xl font-heading text-primary">
                  {mockWalkData.walker.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {mockWalkData.walker.rating} • Walking {mockWalkData.pet.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Card className="fun-card">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-heading text-primary">
                  {formatDuration(mockWalkData.duration)}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="fun-card">
            <div className="flex items-center gap-3">
              <Navigation className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-2xl font-heading text-success">
                  {mockWalkData.distance} km
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="fun-card">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Buddy's Mood</p>
                <p className="text-2xl font-heading text-red-500">
                  Excited! 😊
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map & Photos */}
          <div className="lg:col-span-2">
            <Card className="fun-card p-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={activeTab === "map" ? "fun" : "outline"}
                  onClick={() => setActiveTab("map")}
                  className="rounded-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Live Map
                </Button>
                <Button
                  variant={activeTab === "photos" ? "fun" : "outline"}
                  onClick={() => setActiveTab("photos")}
                  className="rounded-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Photos ({mockWalkData.photos.length})
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "map" && (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <LiveMap />
                  </motion.div>
                )}

                {activeTab === "photos" && (
                  <motion.div
                    key="photos"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {mockWalkData.photos.map((photo, index) => (
                      <motion.div
                        key={photo.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl p-4 text-center"
                      >
                        <div className="text-6xl mb-3">{photo.url}</div>
                        <p className="font-medium text-primary mb-1">{photo.caption}</p>
                        <p className="text-sm text-muted-foreground">{photo.time}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Chat & Updates */}
          <div className="space-y-4">
            {/* Live Updates */}
            <Card className="fun-card p-4">
              <h3 className="font-heading text-lg text-primary mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Live Updates
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {mockWalkData.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ x: message.sender === "walker" ? -20 : 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-2xl ${
                      message.sender === "walker"
                        ? "bg-primary/10 mr-4"
                        : "bg-success/10 ml-4"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="rounded-full flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="fun-card p-4">
              <h3 className="font-heading text-lg text-primary mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full rounded-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Request Photo
                </Button>
                <Button variant="outline" className="w-full rounded-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Send Love to Buddy
                </Button>
                <Button variant="outline" className="w-full rounded-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkTracking;