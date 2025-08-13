import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaStar, FaMapMarkerAlt, FaSearch, FaFilter, FaHeart } from "react-icons/fa";
import { toast } from "sonner";

const Walkers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const walkers = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "👩‍🦱",
      rating: 4.9,
      reviews: 127,
      distance: "0.8 miles",
      specialties: ["Puppies", "Large Dogs", "Training"],
      bio: "Experienced dog walker with 5 years of experience. Loves energetic dogs!",
      availability: "Available Today",
      price: "$25/hour",
      verified: true,
      favorite: false
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "👨",
      rating: 4.8,
      reviews: 89,
      distance: "1.2 miles",
      specialties: ["Senior Dogs", "Small Breeds", "Medication"],
      bio: "Gentle care for senior pups and special needs. Former vet assistant.",
      availability: "Available Tomorrow",
      price: "$30/hour",
      verified: true,
      favorite: true
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "👩",
      rating: 4.9,
      reviews: 156,
      distance: "0.5 miles",
      specialties: ["Active Dogs", "Agility", "Park Adventures"],
      bio: "Adventure specialist! Perfect for high-energy dogs who love to explore.",
      availability: "Available Now",
      price: "$28/hour",
      verified: true,
      favorite: false
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "👨‍🦳",
      rating: 4.7,
      reviews: 92,
      distance: "1.5 miles",
      specialties: ["Group Walks", "Socialization", "Behavior"],
      bio: "Group walk specialist. Great for dogs who love making friends!",
      availability: "Available Today",
      price: "$22/hour",
      verified: true,
      favorite: false
    }
  ];

  const filters = [
    { id: "all", label: "All Walkers", icon: "👥" },
    { id: "available", label: "Available Now", icon: "⚡" },
    { id: "nearby", label: "Nearby", icon: "📍" },
    { id: "favorites", label: "Favorites", icon: "❤️" },
  ];

  const toggleFavorite = (walkerId: number) => {
    toast.success("Added to favorites! ❤️");
  };

  const filteredWalkers = walkers.filter(walker => {
    if (selectedFilter === "available" && !walker.availability.includes("Now")) return false;
    if (selectedFilter === "favorites" && !walker.favorite) return false;
    if (searchQuery && !walker.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-info/10 pt-20 pb-24 md:pl-64">
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
            Based on Buddy's energy level and your location, we recommend <strong>Sarah Johnson</strong> and <strong>Emily Rodriguez</strong> for the best adventures!
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-success/20 text-success text-xs rounded-full">Perfect for Labradors</span>
            <span className="px-3 py-1 bg-info/20 text-info text-xs rounded-full">Highly Rated</span>
            <span className="px-3 py-1 bg-accent/20 text-accent text-xs rounded-full">Available Today</span>
          </div>
        </motion.div>

        {/* Walkers Grid */}
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
                className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${
                  walker.favorite
                    ? "bg-destructive text-white"
                    : "bg-white/80 text-muted-foreground hover:text-destructive"
                }`}
              >
                <FaHeart className="w-4 h-4" />
              </motion.button>

              {/* Avatar */}
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{walker.avatar}</div>
                {walker.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-primary mb-1">{walker.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-secondary">
                    <FaStar className="w-4 h-4" />
                    <span className="font-semibold">{walker.rating}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">({walker.reviews} reviews)</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                  <FaMapMarkerAlt />
                  <span>{walker.distance} away</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground mb-4 text-center">
                {walker.bio}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1 mb-4 justify-center">
                {walker.specialties.slice(0, 3).map((specialty) => (
                  <span
                    key={specialty}
                    className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              {/* Availability and Price */}
              <div className="text-center mb-4">
                <div className={`text-sm font-medium mb-1 ${
                  walker.availability.includes("Now") ? "text-success" : "text-info"
                }`}>
                  {walker.availability}
                </div>
                <div className="text-lg font-bold text-primary">{walker.price}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
                <Button variant="fun" size="sm" className="flex-1" asChild>
                  <Link to="/bookings/new">
                    Book Now
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredWalkers.length === 0 && (
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
        {filteredWalkers.length > 0 && (
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