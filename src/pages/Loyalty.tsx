import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaStar, FaGift, FaBone } from "react-icons/fa";

const Loyalty = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-success/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            Loyalty Rewards 🏆
          </h1>
          <p className="text-lg text-muted-foreground">
            Earn bones and unlock amazing rewards for your pup!
          </p>
        </motion.div>

        <div className="fun-card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-heading text-primary mb-2">Rewards Program Coming Soon!</h3>
            <p className="text-muted-foreground mb-6">
              Collect bones, earn free walks, and unlock special perks
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="fun">
                <FaBone className="mr-2" />
                View Rewards
              </Button>
              <Button variant="success">
                <FaGift className="mr-2" />
                Redeem Points
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loyalty;