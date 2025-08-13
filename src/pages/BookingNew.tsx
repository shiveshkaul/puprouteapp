import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPaw, FaCheck, FaMagic } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { usePets } from "@/hooks/usePets";
import { useWalkers } from "@/hooks/useWalkers";
import { useServiceTypes, useCreateBooking } from "@/hooks/useBookings";
import SmartMatching from "@/components/SmartMatching";
import WalkerAvailability from "@/components/WalkerAvailability";

const BookingNew = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedWalker, setSelectedWalker] = useState<string>("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Array<{ date: string; timeSlot: any }>>([]);
  const [walkerSelectionMode, setWalkerSelectionMode] = useState<'browse' | 'smart'>('smart');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  
  const { data: pets = [] } = usePets();
  const { data: walkers = [] } = useWalkers();
  const { data: serviceTypes = [] } = useServiceTypes();
  const createBookingMutation = useCreateBooking();

  // Pre-select pet and walker from URL params
  useEffect(() => {
    const petId = searchParams.get('pet');
    const walkerId = searchParams.get('walker');
    
    if (petId && pets.some(p => p.id === petId)) {
      setSelectedPet(petId);
      setValue('pet_id', petId);
    }
    
    if (walkerId && walkers.some(w => w.id === walkerId)) {
      setSelectedWalker(walkerId);
      setValue('walker_id', walkerId);
    }
  }, [pets, walkers, searchParams, setValue]);

  const steps = [
    { number: 1, title: "Select Pet", icon: FaPaw, emoji: "🐕" },
    { number: 2, title: "Service & Time", icon: FaCalendarAlt, emoji: "📅" },
    { number: 3, title: "Choose Walker", icon: FaMagic, emoji: "✨" },
    { number: 4, title: "Location & Details", icon: FaMapMarkerAlt, emoji: "�" },
    { number: 5, title: "Review & Confirm", icon: FaCheck, emoji: "✅" }
  ];

  const timeSlots = [
    "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM"
  ];

  const onSubmit = async (data: any) => {
    try {
      // Validation checks
      if (!selectedPet) {
        toast({
          title: "Error",
          description: "Please select a pet",
          variant: "destructive"
        });
        return;
      }

      if (!selectedService) {
        toast({
          title: "Error",
          description: "Please select a service type",
          variant: "destructive"
        });
        return;
      }

        // Validate date and time
        if (selectedTimeSlots.length === 0 && (!data.scheduled_date || !data.scheduled_time)) {
          toast({
            title: "Error",
            description: "Please select date and time or use smart scheduling",
            variant: "destructive"
          });
          return;
        }      if (!data.pickup_address) {
        toast({
          title: "Error",
          description: "Please enter pickup address",
          variant: "destructive"
        });
        return;
      }

      const selectedServiceType = serviceTypes.find(s => s.id === selectedService);
      if (!selectedServiceType) {
        toast({
          title: "Error",
          description: "Invalid service type selected",
          variant: "destructive"
        });
        return;
      }

        // Use selected time slot if available, otherwise use form data
        const scheduleData = selectedTimeSlots.length > 0 
          ? {
              scheduled_date: selectedTimeSlots[0].date,
              scheduled_time: selectedTimeSlots[0].timeSlot.start_time,
            }
          : {
              scheduled_date: data.scheduled_date,
              scheduled_time: data.scheduled_time,
            };

        // Validate date is not in the past
        const selectedDate = new Date(scheduleData.scheduled_date + 'T' + scheduleData.scheduled_time);
        const now = new Date();
        if (selectedDate <= now) {
          toast({
            title: "Error",
            description: "Cannot schedule a walk in the past",
            variant: "destructive"
          });
          return;
        }      await createBookingMutation.mutateAsync({
          pet_id: selectedPet,
          walker_id: selectedWalker || null,
          service_type_id: selectedService,
          scheduled_date: scheduleData.scheduled_date,
          scheduled_time: scheduleData.scheduled_time,
          duration_minutes: selectedServiceType.duration_minutes,
          pickup_address: data.pickup_address,
          base_price: selectedServiceType.base_price,
          total_amount: selectedServiceType.base_price,
          special_instructions: data.special_instructions || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
        });

      toast({
        title: "Booking created successfully! 🎉",
        description: "Your furry friend's adventure is scheduled!"
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: "Failed to create booking: " + (error.message || 'Unknown error'),
        variant: "destructive"
      });
    }
  };

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

  const canProceed = () => {
    switch (currentStep) {
      case 1: 
        return selectedPet !== "";
      case 2: 
        return selectedService !== "" && 
               ((selectedTimeSlots.length > 0) || 
                (watch('scheduled_date') && watch('scheduled_time'))) &&
               serviceTypes.length > 0;
      case 3: 
        // Walker selection step - always can proceed
        return true;
      case 4: 
        const address = watch('pickup_address');
        return address && address.trim().length > 0;
      case 5: 
        return true;
      default: 
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-heading text-primary mb-4">Which furry friend needs a walk? 🐕</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pets.map((pet) => (
                <motion.div
                  key={pet.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPet(pet.id);
                    setValue('pet_id', pet.id);
                  }}
                  className={`fun-card cursor-pointer transition-all ${
                    selectedPet === pet.id
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-accent/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      {pet.avatar_url ? (
                        <img src={pet.avatar_url} alt={pet.name} className="w-12 h-12 rounded-full" />
                      ) : (
                        "🐕"
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">{pet.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pet.pet_breeds?.name || pet.custom_breed || 'Mixed Breed'}
                      </p>
                      {pet.energy_level && (
                        <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full capitalize">
                          {pet.energy_level.replace('_', ' ')} Energy
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {pets.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No pets found. Add a pet first!</p>
                <Button variant="fun" onClick={() => navigate("/pets")}>
                  Add Pet 🐕
                </Button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading text-primary mb-4">When would you like the walk? 📅</h3>
            
            {/* Service Type Selection */}
            <div>
              <Label className="text-base font-semibold">Service Type</Label>
              {serviceTypes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading service types...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {serviceTypes.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedService(service.id);
                        setValue('service_type_id', service.id);
                      }}
                      className={`fun-card cursor-pointer transition-all ${
                        selectedService === service.id
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-accent/5"
                      }`}
                    >
                      <div className="text-center">
                        <h4 className="font-semibold text-primary">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="mt-2">
                          <span className="text-lg font-bold text-success">${service.base_price}</span>
                          <span className="text-sm text-muted-foreground"> ({service.duration_minutes} min)</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_date">Date</Label>
                <Input
                  {...register('scheduled_date', { required: true })}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="scheduled_time">Time</Label>
                <Select onValueChange={(value) => setValue('scheduled_time', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading text-primary mb-4">Choose your walker ✨</h3>
            
            <Tabs value={walkerSelectionMode} onValueChange={(value) => setWalkerSelectionMode(value as 'browse' | 'smart')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="smart" className="flex items-center gap-2">
                  <FaMagic />
                  Smart Matching
                </TabsTrigger>
                <TabsTrigger value="browse" className="flex items-center gap-2">
                  <FaPaw />
                  Browse All
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="smart" className="mt-6">
                <SmartMatching
                  selectedPetId={selectedPet}
                  onWalkerSelect={(walkerId) => {
                    setSelectedWalker(walkerId);
                    setValue('walker_id', walkerId);
                  }}
                />
              </TabsContent>
              
              <TabsContent value="browse" className="mt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {walkers.slice(0, 6).map((walker) => (
                      <motion.div
                        key={walker.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedWalker(walker.id);
                          setValue('walker_id', walker.id);
                        }}
                        className={`fun-card cursor-pointer transition-all ${
                          selectedWalker === walker.id
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-accent/5"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-fun flex items-center justify-center text-white font-semibold">
                            {walker.users?.first_name?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary">
                              {walker.users?.first_name} {walker.users?.last_name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm">{walker.average_rating?.toFixed(1) || 'N/A'}</span>
                              <span className="text-sm text-muted-foreground">
                                ({walker.total_reviews || 0} reviews)
                              </span>
                            </div>
                            <p className="text-sm text-success font-semibold">${walker.hourly_rate}/hour</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <Button variant="outline" onClick={() => {
                      setSelectedWalker("");
                      setValue('walker_id', null);
                    }}>
                      Let PupRoute Choose for Me! 🎲
                    </Button>
                  </div>

                  {walkers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No walkers available at the moment. We'll assign one for you!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Walker Availability Calendar */}
            {selectedWalker && (
              <div className="mt-6">
                <WalkerAvailability
                  walkerId={selectedWalker}
                  selectedSlots={selectedTimeSlots}
                  onSlotSelect={(date, timeSlot) => {
                    setSelectedTimeSlots([{ date, timeSlot }]);
                  }}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-heading text-primary mb-4">Where should we pick up your pup? 📍</h3>
            
            <div>
              <Label htmlFor="pickup_address">Pickup Address *</Label>
              <Input
                {...register('pickup_address', { required: true })}
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                {...register('emergency_contact_phone')}
                type="tel"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                {...register('special_instructions')}
                placeholder="Any special notes for the walker? (e.g., where to find keys, pet behavior notes, etc.)"
                rows={4}
              />
            </div>
          </div>
        );

      case 5:
        const selectedPetData = pets.find(p => p.id === selectedPet);
        const selectedServiceData = serviceTypes.find(s => s.id === selectedService);
        const selectedWalkerData = walkers.find(w => w.id === selectedWalker);
        
        // Get schedule data from either time slots or form
        const scheduleDisplay = selectedTimeSlots.length > 0 
          ? {
              date: selectedTimeSlots[0].date,
              time: selectedTimeSlots[0].timeSlot.start_time + ' - ' + selectedTimeSlots[0].timeSlot.end_time
            }
          : {
              date: watch('scheduled_date'),
              time: watch('scheduled_time')
            };
        
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading text-primary mb-4">Review Your Booking 📋</h3>
            
            <div className="fun-card">
              <h4 className="font-semibold text-primary mb-3">Booking Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Pet:</span>
                  <span className="font-semibold">{selectedPetData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-semibold">{selectedServiceData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-semibold">{scheduleDisplay.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-semibold">{scheduleDisplay.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Walker:</span>
                  <span className="font-semibold">
                    {selectedWalkerData 
                      ? `${selectedWalkerData.users?.first_name} ${selectedWalkerData.users?.last_name}`
                      : "Auto-assigned by PupRoute"
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Address:</span>
                  <span className="font-semibold">{watch('pickup_address')}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-success">
                    ${selectedTimeSlots.length > 0 
                      ? selectedTimeSlots[0].timeSlot.price || selectedServiceData?.base_price
                      : selectedServiceData?.base_price}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="magical"
                size="lg"
                onClick={handleSubmit(onSubmit)}
                disabled={createBookingMutation.isPending}
                className="w-full"
              >
                {createBookingMutation.isPending ? "Booking..." : "Confirm Booking 🎉"}
              </Button>
            </div>
          </div>
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
          
          {currentStep < steps.length && (
            <Button
              variant="fun"
              size="lg"
              onClick={nextStep}
              className="flex items-center gap-2 ml-auto"
              disabled={!canProceed()}
            >
              Next
              <FaArrowRight />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BookingNew;