import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaArrowRight, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPaw, FaCreditCard } from "react-icons/fa";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BookingNew = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    pet: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    walker: "",
    notes: ""
  });
  
  const navigate = useNavigate();

  const steps = [
    { number: 1, title: "Select Pet", icon: FaPaw, emoji: "🐕" },
    { number: 2, title: "Date & Time", icon: FaCalendarAlt, emoji: "📅" },
    { number: 3, title: "Location", icon: FaMapMarkerAlt, emoji: "📍" },
    { number: 4, title: "Choose Walker", icon: FaPaw, emoji: "👨‍🦱" },
    { number: 5, title: "Payment", icon: FaCreditCard, emoji: "💳" }
  ];

  const pets = [
    { id: 1, name: "Buddy", breed: "Golden Retriever", emoji: "🐕", energy: "High" },
    { id: 2, name: "Luna", breed: "French Bulldog", emoji: "🐩", energy: "Medium" },
    { id: 3, name: "Max", breed: "Border Collie", emoji: "🐺", energy: "Very High" }
  ];

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
  ];

  const durations = [
    { value: "30", label: "30 minutes", price: 15 },
    { value: "60", label: "1 hour", price: 25 },
    { value: "90", label: "1.5 hours", price: 35 },
    { value: "120", label: "2 hours", price: 45 }
  ];

  const suggestedWalkers = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "👩‍🦱",
      rating: 4.9,
      price: 25,
      specialties: ["Energetic Dogs", "Training"],
      available: true,
      aiRecommended: true
    },
    {
      id: 2,
      name: "Emily Rodriguez",
      avatar: "👩",
      rating: 4.8,
      price: 28,
      specialties: ["Active Dogs", "Adventure"],
      available: true,
      aiRecommended: true
    },
    {
      id: 3,
      name: "Mike Chen",
      avatar: "👨",
      rating: 4.7,
      price: 30,
      specialties: ["Gentle Care", "Senior Dogs"],
      available: false,
      aiRecommended: false
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeBooking = () => {
    toast.success("Booking confirmed! 🎉", {
      description: "Your walker will be in touch soon!"
    });
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-heading text-primary mb-4 text-center">
              Which furry friend needs a walk? 🐾
            </h3>
            <div className="grid gap-4">
              {pets.map((pet) => (
                <motion.button
                  key={pet.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBookingData({...bookingData, pet: pet.name})}
                  className={`p-4 rounded-[var(--radius-fun)] border-2 transition-all duration-300 text-left ${
                    bookingData.pet === pet.name
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{pet.emoji}</div>
                    <div>
                      <h4 className="font-semibold text-primary">{pet.name}</h4>
                      <p className="text-sm text-muted-foreground">{pet.breed}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                        pet.energy === "High" ? "bg-secondary/20 text-secondary" :
                        pet.energy === "Very High" ? "bg-destructive/20 text-destructive" :
                        "bg-info/20 text-info"
                      }`}>
                        {pet.energy} Energy
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-heading text-primary mb-4 text-center">
              When would you like the walk? ⏰
            </h3>
            
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                className="input-fun w-full"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Select Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setBookingData({...bookingData, time})}
                    className={`p-2 rounded-lg border transition-all duration-300 text-sm ${
                      bookingData.time === time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Walk Duration
              </label>
              <div className="grid grid-cols-2 gap-3">
                {durations.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => setBookingData({...bookingData, duration: duration.value})}
                    className={`p-3 rounded-[var(--radius-fun)] border-2 transition-all duration-300 text-left ${
                      bookingData.duration === duration.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-primary">{duration.label}</div>
                    <div className="text-sm text-muted-foreground">${duration.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-heading text-primary mb-4 text-center">
              Where should we meet? 📍
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                placeholder="Enter your address or meeting spot..."
                value={bookingData.location}
                onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
                className="input-fun w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll use Google Maps to find the best walking routes nearby!
              </p>
            </div>

            {/* Suggested Locations */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Popular Nearby Spots
              </label>
              <div className="space-y-2">
                {["Central Park - Main Entrance", "Riverside Dog Run", "Local Neighborhood Streets"].map((location) => (
                  <button
                    key={location}
                    onClick={() => setBookingData({...bookingData, location})}
                    className={`w-full p-3 rounded-[var(--radius-fun)] border transition-all duration-300 text-left ${
                      bookingData.location === location
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <FaMapMarkerAlt className="inline mr-2 text-primary" />
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-heading text-primary mb-4 text-center">
              Choose your perfect walker! 👨‍🦱
            </h3>

            {/* AI Recommendation Banner */}
            <div className="fun-card bg-gradient-to-r from-success/10 to-info/10 border border-success/20">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                🤖 AI Recommendations
              </h4>
              <p className="text-sm text-card-foreground">
                Based on {bookingData.pet}'s energy level and your preferences, these walkers are perfect matches!
              </p>
            </div>

            <div className="space-y-3">
              {suggestedWalkers.map((walker) => (
                <motion.button
                  key={walker.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBookingData({...bookingData, walker: walker.name})}
                  disabled={!walker.available}
                  className={`w-full p-4 rounded-[var(--radius-fun)] border-2 transition-all duration-300 text-left ${
                    bookingData.walker === walker.name
                      ? "border-primary bg-primary/10"
                      : walker.available
                      ? "border-border hover:border-primary/50"
                      : "border-border opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{walker.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-primary">{walker.name}</h4>
                        {walker.aiRecommended && (
                          <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                            ⭐ AI Pick
                          </span>
                        )}
                        {!walker.available && (
                          <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-full">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>⭐ {walker.rating}</span>
                        <span>•</span>
                        <span>${walker.price}/hour</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {walker.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-heading text-primary mb-4 text-center">
              Booking Summary 💳
            </h3>

            {/* Booking Summary */}
            <div className="fun-card bg-gradient-to-r from-primary/5 to-accent/5">
              <h4 className="font-semibold text-primary mb-4">Your Adventure Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pet:</span>
                  <span className="font-medium">{bookingData.pet} 🐕</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{bookingData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{bookingData.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{bookingData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Walker:</span>
                  <span className="font-medium">{bookingData.walker}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total:</span>
                  <span>$25.00</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h4 className="font-semibold text-primary mb-3">Payment Method</h4>
              <div className="fun-card bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💳</div>
                  <div>
                    <div className="font-medium">**** **** **** 1234</div>
                    <div className="text-sm text-muted-foreground">Expires 12/26</div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Change
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                placeholder="Any special instructions for your walker..."
                value={bookingData.notes}
                onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                className="input-fun w-full h-20 resize-none"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 text-center"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            Book Your Adventure! ✨
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's get your pup ready for an amazing walk
          </p>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step.emoji}
                </div>
                <div className="text-xs mt-2 text-center hidden sm:block">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="fun-card mb-6"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          {currentStep > 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={prevStep}
              className="flex items-center gap-2"
            >
              <FaArrowLeft />
              Back
            </Button>
          )}
          
          {currentStep < steps.length ? (
            <Button
              variant="fun"
              size="lg"
              onClick={nextStep}
              className="flex items-center gap-2 ml-auto"
              disabled={
                (currentStep === 1 && !bookingData.pet) ||
                (currentStep === 2 && (!bookingData.date || !bookingData.time || !bookingData.duration)) ||
                (currentStep === 3 && !bookingData.location) ||
                (currentStep === 4 && !bookingData.walker)
              }
            >
              Next
              <FaArrowRight />
            </Button>
          ) : (
            <Button
              variant="magical"
              size="lg"
              onClick={completeBooking}
              className="flex items-center gap-2 ml-auto"
            >
              Confirm Booking 🎉
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BookingNew;