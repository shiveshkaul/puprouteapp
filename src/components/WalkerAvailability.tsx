import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isBefore } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaChevronLeft, 
  FaChevronRight,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCheckCircle
} from "react-icons/fa";
import { cn } from "@/lib/utils";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  price?: number;
}

interface DayAvailability {
  date: string;
  is_available: boolean;
  time_slots: TimeSlot[];
}

interface WalkerAvailabilityProps {
  walkerId: string;
  onSlotSelect?: (date: string, timeSlot: TimeSlot) => void;
  selectedSlots?: Array<{ date: string; timeSlot: TimeSlot }>;
  className?: string;
}

const WalkerAvailability = ({ 
  walkerId, 
  onSlotSelect, 
  selectedSlots = [],
  className 
}: WalkerAvailabilityProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedServices, setSelectedServices] = useState<string[]>(['walk']);
  const [duration, setDuration] = useState('30');
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate mock availability data (in real app, this would fetch from API)
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const weekStart = startOfWeek(currentWeek);
      const weekEnd = endOfWeek(currentWeek);
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const mockAvailability: DayAvailability[] = days.map((day) => {
        const timeSlots: TimeSlot[] = [];
        
        // Generate time slots from 7 AM to 7 PM
        for (let hour = 7; hour <= 19; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
          
          // Randomly determine availability (70% chance of being available)
          const isAvailable = Math.random() > 0.3 && !isBefore(day, new Date());
          const isBooked = isAvailable && Math.random() > 0.8; // 20% of available slots are booked
          
          timeSlots.push({
            id: `${format(day, 'yyyy-MM-dd')}-${startTime}`,
            start_time: startTime,
            end_time: endTime,
            is_available: isAvailable && !isBooked,
            is_booked: isBooked,
            price: 25 + Math.floor(Math.random() * 20) // $25-45 range
          });
        }
        
        return {
          date: format(day, 'yyyy-MM-dd'),
          is_available: timeSlots.some(slot => slot.is_available),
          time_slots: timeSlots
        };
      });
      
      setAvailability(mockAvailability);
      setIsLoading(false);
    }, 1000);
  }, [currentWeek, walkerId]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7);
    setCurrentWeek(newWeek);
  };

  const isSlotSelected = (date: string, timeSlot: TimeSlot) => {
    return selectedSlots.some(selected => 
      selected.date === date && selected.timeSlot.id === timeSlot.id
    );
  };

  const handleSlotClick = (date: string, timeSlot: TimeSlot) => {
    if (timeSlot.is_available && onSlotSelect) {
      onSlotSelect(date, timeSlot);
    }
  };

  const serviceOptions = [
    { id: 'walk', label: 'Dog Walking', icon: '🚶‍♂️' },
    { id: 'sitting', label: 'Pet Sitting', icon: '🏠' },
    { id: 'daycare', label: 'Doggy Daycare', icon: '🐕‍🦺' },
    { id: 'grooming', label: 'Basic Grooming', icon: '✂️' },
    { id: 'training', label: 'Training Session', icon: '🎓' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Service Selection */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-primary" />
          Select Services & Duration
        </h3>
        
        <div className="space-y-4">
          {/* Services */}
          <div>
            <label className="text-sm font-medium mb-2 block">Services Needed</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {serviceOptions.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedServices([...selectedServices, service.id]);
                      } else {
                        setSelectedServices(selectedServices.filter(s => s !== service.id));
                      }
                    }}
                  />
                  <label htmlFor={service.id} className="text-sm cursor-pointer flex items-center gap-1">
                    <span>{service.icon}</span>
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Available Times</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              disabled={isBefore(addDays(currentWeek, -7), new Date())}
            >
              <FaChevronLeft />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {format(startOfWeek(currentWeek), 'MMM d')} - {format(endOfWeek(currentWeek), 'MMM d, yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              <FaChevronRight />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-8 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {availability.map((dayData) => {
              const date = new Date(dayData.date);
              const isDateToday = isToday(date);
              const isPast = isBefore(date, new Date()) && !isDateToday;
              
              return (
                <div key={dayData.date} className="space-y-2">
                  {/* Day Header */}
                  <div className={cn(
                    "text-center p-2 rounded-lg text-sm font-medium",
                    isDateToday && "bg-primary text-primary-foreground",
                    isPast && "text-muted-foreground",
                    !isDateToday && !isPast && "bg-muted"
                  )}>
                    <div>{format(date, 'EEE')}</div>
                    <div className="text-xs">{format(date, 'd')}</div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-1">
                    {dayData.time_slots
                      .filter((_, index) => index % 2 === 0) // Show every other hour for space
                      .map((timeSlot) => {
                        const isSelected = isSlotSelected(dayData.date, timeSlot);
                        const isClickable = timeSlot.is_available && !isPast;
                        
                        return (
                          <button
                            key={timeSlot.id}
                            onClick={() => handleSlotClick(dayData.date, timeSlot)}
                            disabled={!isClickable}
                            className={cn(
                              "w-full p-1 rounded text-xs transition-all",
                              "border border-transparent hover:border-primary/20",
                              isClickable && "cursor-pointer hover:shadow-sm",
                              !isClickable && "cursor-not-allowed opacity-50",
                              isSelected && "bg-primary text-primary-foreground shadow-sm",
                              !isSelected && timeSlot.is_available && "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
                              !isSelected && timeSlot.is_booked && "bg-red-50 border-red-200 text-red-700",
                              !isSelected && !timeSlot.is_available && !timeSlot.is_booked && "bg-gray-50 text-gray-400"
                            )}
                          >
                            <div className="font-medium">{timeSlot.start_time}</div>
                            {timeSlot.is_available && (
                              <div className="text-xs opacity-80">
                                ${timeSlot.price}
                              </div>
                            )}
                            {timeSlot.is_booked && (
                              <div className="text-xs">Booked</div>
                            )}
                            {isSelected && (
                              <FaCheckCircle className="w-3 h-3 mx-auto mt-1" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </Card>

      {/* Selected Slots Summary */}
      {selectedSlots.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            Selected Appointments ({selectedSlots.length})
          </h4>
          <div className="space-y-2">
            {selectedSlots.map((selected, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-primary" />
                  <div>
                    <div className="font-medium">
                      {format(new Date(selected.date), 'EEE, MMM d')}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <FaClock />
                      {selected.timeSlot.start_time} - {selected.timeSlot.end_time}
                      <span>•</span>
                      <FaDollarSign />
                      ${selected.timeSlot.price}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {duration} min
                </Badge>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Cost:</span>
                <span className="text-lg text-primary">
                  ${selectedSlots.reduce((sum, slot) => sum + (slot.timeSlot.price || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WalkerAvailability;
