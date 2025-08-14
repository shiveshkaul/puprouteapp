import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaStar, FaMapMarkerAlt, FaSearch, FaFilter, FaHeart } from "react-icons/fa";
import { toast } from "sonner";
import { useWalkers, useFeaturedWalkers } from "@/hooks/useWalkers";

const Walkers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  const { data: allWalkers = [], isLoading } = useWalkers();
  const { data: featuredWalkers = [] } = useFeaturedWalkers();

  const filters = [
    { id: "all", label: "All Walkers", icon: "👥" },
    { id: "available", label: "Available Now", icon: "⚡" },
    { id: "featured", label: "Featured", icon: "⭐" },
    { id: "top_rated", label: "Top Rated", icon: "🏆" },
  ];

  const toggleFavorite = (walkerId: string) => {
    toast.success("Added to favorites! ❤️");
  };

  const filteredWalkers = allWalkers.filter(walker => {
    if (selectedFilter === "available" && !walker.is_available_now) return false;
    if (selectedFilter === "featured" && !walker.is_featured) return false;
    if (selectedFilter === "top_rated" && walker.average_rating < 4.5) return false;
    if (searchQuery && 
        !walker.users.first_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !walker.users.last_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !walker.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    ) return false;
    return true;
  });

  const getAvailabilityText = (walker: any) => {
    if (walker.is_available_now) return "Available Now";
    return "Available Soon";
  };

  const getAvailabilityColor = (walker: any) => {
    return walker.is_available_now ? "text-success" : "text-info";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-info/10">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            Find Your Perfect Walker! 🚶‍♂️
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover amazing dog walkers in your neighborhood
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search walkers by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-fun w-full pl-10 pr-4"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "fun" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter.id)}
                className="flex items-center gap-2"
              >
                <span>{filter.icon}</span>
                {filter.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        {featuredWalkers.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="fun-card bg-gradient-to-r from-success/10 to-info/10 border border-success/20 mb-6"
          >
            <h3 className="text-lg font-heading text-primary mb-2 flex items-center gap-2">
              🤖 AI Recommendations
            </h3>
            <p className="text-sm text-card-foreground mb-3">
              Based on your pets' profiles and location, we recommend these highly rated walkers for the best adventures!
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-success/20 text-success text-xs rounded-full">Highly Rated</span>
              <span className="px-3 py-1 bg-info/20 text-info text-xs rounded-full">Experienced</span>
              <span className="px-3 py-1 bg-accent/20 text-accent text-xs rounded-full">Verified</span>
            </div>
          </motion.div>
        )}

        {/* Walkers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="fun-card animate-pulse">
                <div className="h-64 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredWalkers.map((walker, index) => (
              <motion.div
                key={walker.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="fun-card relative overflow-hidden"
              >
                {/* Favorite Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleFavorite(walker.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <FaHeart className="w-4 h-4" />
                </motion.button>

                {/* Avatar */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-fun flex items-center justify-center text-2xl text-white">
                    {walker.users.avatar_url ? (
                      <img 
                        src={walker.users.avatar_url} 
                        alt={walker.users.first_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      walker.users.first_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {walker.profile_status === 'approved' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-primary mb-1">
                    {walker.users.first_name} {walker.users.last_name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-secondary">
                      <FaStar className="w-4 h-4" />
                      <span className="font-semibold">{walker.average_rating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">({walker.total_reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                    <FaMapMarkerAlt />
                    <span>{walker.users.city || 'Location'}, {walker.users.state || 'State'}</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  {walker.bio || "Experienced dog walker ready for adventures!"}
                </p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mb-4 justify-center">
                  {walker.specialties.slice(0, 3).map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {walker.accepts_puppies && (
                    <span className="px-2 py-1 bg-info/20 text-info text-xs rounded-full">
                      Puppies
                    </span>
                  )}
                  {walker.accepts_large_dogs && (
                    <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full">
                      Large Dogs
                    </span>
                  )}
                </div>

                {/* Availability and Price */}
                <div className="text-center mb-4">
                  <div className={`text-sm font-medium mb-1 ${getAvailabilityColor(walker)}`}>
                    {getAvailabilityText(walker)}
                  </div>
                  <div className="text-lg font-bold text-primary">
                    ${walker.hourly_rate}/hour
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Profile
                  </Button>
                  <Button variant="fun" size="sm" className="flex-1" asChild>
                    <Link to={`/bookings/new?walker=${walker.id}`}>
                      Book Now
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredWalkers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-heading text-primary mb-2">No walkers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find more walkers
            </p>
          </motion.div>
        )}

        {/* Load More Button */}
        {!isLoading && filteredWalkers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <Button variant="outline" size="lg">
              Load More Walkers 🐕
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Walkers;