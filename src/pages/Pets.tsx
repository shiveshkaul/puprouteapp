import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBirthdayCake, FaWeight } from "react-icons/fa";
import { toast } from "sonner";

const Pets = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const pets = [
    {
      id: 1,
      name: "Buddy",
      breed: "Golden Retriever",
      age: "3 years",
      weight: "65 lbs",
      avatar: "🐕",
      color: "Golden",
      personality: ["Energetic", "Friendly", "Playful"],
      allergies: ["Chicken"],
      lastWalk: "2 hours ago",
      nextWalk: "Tomorrow 2:00 PM",
      status: "Happy"
    },
    {
      id: 2,
      name: "Luna",
      breed: "French Bulldog",
      age: "2 years",
      weight: "25 lbs",
      avatar: "🐩",
      color: "Fawn",
      personality: ["Calm", "Loving", "Gentle"],
      allergies: ["None"],
      lastWalk: "5 hours ago",
      nextWalk: "Today 6:00 PM",
      status: "Sleepy"
    },
    {
      id: 3,
      name: "Max",
      breed: "Border Collie",
      age: "5 years", 
      weight: "45 lbs",
      avatar: "🐺",
      color: "Black & White",
      personality: ["Smart", "Active", "Loyal"],
      allergies: ["Beef", "Dairy"],
      lastWalk: "1 day ago",
      nextWalk: "Not scheduled",
      status: "Excited"
    }
  ];

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deletePet = (petId: number, petName: string) => {
    toast.error(`${petName} removed from your pack 😢`, {
      description: "You can always add them back later!"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Happy": return "text-success";
      case "Sleepy": return "text-info";
      case "Excited": return "text-secondary";
      default: return "text-muted-foreground";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "Happy": return "😊";
      case "Sleepy": return "😴";
      case "Excited": return "🤩";
      default: return "😐";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-success/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            Your Furry Family! 🐾
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your beloved pets and their adventures
          </p>
        </motion.div>

        {/* Search and Add */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search Bar */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your pets by name or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-fun w-full pl-10 pr-4"
            />
          </div>

          {/* Add Pet Button */}
          <Button variant="magical" size="lg" asChild>
            <Link to="/pets/new" className="flex items-center gap-2">
              <FaPlus />
              Add New Pet 🐕
            </Link>
          </Button>
        </motion.div>

        {/* Pets Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="fun-card relative overflow-hidden"
            >
              {/* Pet Avatar and Status */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <div className="text-6xl mb-2">{pet.avatar}</div>
                  <div className="absolute -top-2 -right-2 text-2xl">
                    {getStatusEmoji(pet.status)}
                  </div>
                </div>
                <div className={`text-sm font-medium ${getStatusColor(pet.status)}`}>
                  {pet.status}
                </div>
              </div>

              {/* Pet Info */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-heading text-primary mb-1">{pet.name}</h3>
                <p className="text-muted-foreground text-sm mb-2">{pet.breed}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FaBirthdayCake />
                    <span>{pet.age}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaWeight />
                    <span>{pet.weight}</span>
                  </div>
                </div>
              </div>

              {/* Personality Tags */}
              <div className="flex flex-wrap gap-1 mb-4 justify-center">
                {pet.personality.map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-1 bg-success/20 text-success text-xs rounded-full"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {/* Walk Info */}
              <div className="bg-muted/20 rounded-[var(--radius-fun)] p-3 mb-4">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last walk:</span>
                    <span className="font-medium">{pet.lastWalk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next walk:</span>
                    <span className={`font-medium ${
                      pet.nextWalk === "Not scheduled" ? "text-destructive" : "text-success"
                    }`}>
                      {pet.nextWalk}
                    </span>
                  </div>
                </div>
              </div>

              {/* Allergies */}
              {pet.allergies.length > 0 && pet.allergies[0] !== "None" && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-destructive mb-1">⚠️ Allergies:</h4>
                  <div className="flex flex-wrap gap-1">
                    {pet.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-full"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => toast.info(`Editing ${pet.name}'s profile`)}
                >
                  <FaEdit className="w-4 h-4" />
                </Button>
                <Button variant="fun" size="sm" className="flex-2" asChild>
                  <Link to="/bookings/new" className="flex items-center gap-1">
                    Book Walk
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletePet(pet.id, pet.name)}
                >
                  <FaTrash className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredPets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🐕</div>
            <h3 className="text-xl font-heading text-primary mb-2">
              {searchQuery ? "No pets found" : "No pets added yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Try adjusting your search to find your furry friends"
                : "Add your first pet to start your PupRoute adventure!"
              }
            </p>
            {!searchQuery && (
              <Button variant="magical" size="lg" asChild>
                <Link to="/pets/new" className="flex items-center gap-2">
                  <FaPlus />
                  Add Your First Pet 🎉
                </Link>
              </Button>
            )}
          </motion.div>
        )}

        {/* AI Tip */}
        {filteredPets.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="fun-card bg-gradient-to-r from-info/10 to-success/10 border border-info/20">
              <h3 className="text-lg font-heading text-primary mb-2 flex items-center gap-2">
                🤖 AI Pet Tip
              </h3>
              <p className="text-sm text-card-foreground">
                Based on your pets' activity levels, we recommend scheduling walks every 6-8 hours for optimal health and happiness! 
                {filteredPets.some(pet => pet.nextWalk === "Not scheduled") && (
                  <span className="text-destructive font-medium"> Some of your pets need walks scheduled. </span>
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          className="fixed bottom-24 right-6 md:bottom-6 z-40"
        >
          <Button
            variant="magical"
            size="xl"
            className="rounded-full shadow-[var(--shadow-glow)] animate-pulse"
            asChild
          >
            <Link to="/pets/new">
              🐕
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Pets;