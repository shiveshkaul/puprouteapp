import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaMapMarkerAlt, FaClock, FaCamera, FaComment } from "react-icons/fa";

const WalkTracking = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-info/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            Live Walk Tracking 🗺️
          </h1>
          <p className="text-lg text-muted-foreground">
            Follow Buddy's adventure in real-time!
          </p>
        </motion.div>

        <div className="fun-card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-heading text-primary mb-2">Interactive Map Coming Soon!</h3>
            <p className="text-muted-foreground mb-6">
              Real-time GPS tracking with Google Maps integration
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="fun">
                <FaCamera className="mr-2" />
                View Photos
              </Button>
              <Button variant="success">
                <FaComment className="mr-2" />
                Chat with Walker
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkTracking;