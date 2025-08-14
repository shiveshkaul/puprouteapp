import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaCamera, FaHeart, FaShare } from "react-icons/fa";

const Photos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 pt-20 pb-24">
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            Photo Memories 📸
          </h1>
          <p className="text-lg text-muted-foreground">
            All the amazing moments from your pup's adventures
          </p>
        </motion.div>

        <div className="fun-card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-heading text-primary mb-2">Photo Gallery Coming Soon!</h3>
            <p className="text-muted-foreground mb-6">
              View, share, and love all your pet's adventure photos with AI-generated captions
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="fun">
                <FaCamera className="mr-2" />
                View Gallery
              </Button>
              <Button variant="success">
                <FaShare className="mr-2" />
                Share Memories
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Photos;