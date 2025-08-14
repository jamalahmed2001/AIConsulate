"use client";
import { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/ui/CTA";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { BookingCalendar } from "@/components/ui/Calendar";
import { TimeSlotPicker } from "@/components/ui/TimeSlotPicker";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  creditCost?: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface AvailabilityData {
  date: string;
  availableSlots: number;
  bookedSlots: number;
}

interface BookingData {
  serviceId: string;
  startTime: Date;
  notes?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

interface BookingFormProps {
  onSubmit: (booking: BookingData) => Promise<void>;
  isSubmitting?: boolean;
}

export function BookingForm({ onSubmit, isSubmitting = false }: BookingFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);


  // Define callback functions first
  const loadAvailabilityData = useCallback(async () => {
    if (!selectedService) return;
    try {
      const availabilityPromises = [];
      const today = startOfDay(new Date());

      // Load availability for next 30 days
      for (let i = 0; i < 30; i++) {
        const date = addDays(today, i);
        const dateString = format(date, "yyyy-MM-dd");
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        availabilityPromises.push(
          fetch(`/api/timeslots/available?serviceId=${selectedService.id}&date=${dateString}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => ({
              date: dateString,
              availableSlots: (data as { availableSlots?: TimeSlot[] })?.availableSlots?.length ?? 0,
              bookedSlots: 0, // We'll estimate this based on typical slot count
            }))
            .catch(() => ({ date: dateString, availableSlots: 0, bookedSlots: 0 }))
        );
      }

      const results = await Promise.all(availabilityPromises);
      setAvailabilityData(results.filter(Boolean));
    } catch (error: unknown) {
      console.error("Failed to load availability data:", error);
    }
  }, [selectedService]);

  const loadAvailableSlots = useCallback(async () => {
    if (!selectedService || !selectedDate) return;
    
    setIsLoadingSlots(true);
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(
        `/api/timeslots/available?serviceId=${selectedService.id}&date=${dateString}`
      );
      if (response.ok) {
        const data = await response.json() as { availableSlots: TimeSlot[] };
        setAvailableSlots(data.availableSlots);
      }
    } catch (error) {
      console.error("Failed to load time slots:", error);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedService, selectedDate]);

  // Load services on mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const data = await response.json() as { services: Service[] };
          setServices(data.services);
        }
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setIsLoadingServices(false);
      }
    };
    void loadServices();
  }, []);

  // Load availability data when service is selected
  useEffect(() => {
    if (selectedService) {
      void loadAvailabilityData();
    } else {
      setAvailabilityData([]);
    }
  }, [selectedService, loadAvailabilityData]);

  // Load available time slots when date is selected
  useEffect(() => {
    if (selectedService && selectedDate) {
      void loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedTimeSlot(null);
    }
  }, [selectedService, selectedDate, loadAvailableSlots]);

  const handleServiceSelect = (serviceId: string) => {
          const service = services.find(s => s.id === serviceId);
    setSelectedService(service ?? null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    if (service) {
      setCurrentStep(2);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slotStartTime: string) => {
    setSelectedTimeSlot(slotStartTime);
    setCurrentStep(3);
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!selectedService) {
      newErrors.service = "Please select a service";
    }
    
    if (!selectedTimeSlot) {
      newErrors.timeSlot = "Please select a time slot";
    }
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Name is required";
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        serviceId: selectedService!.id,
        startTime: new Date(selectedTimeSlot!),
        notes: formData.notes || undefined,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || undefined,
      });
      
      // Reset form on success
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setCurrentStep(1);
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        notes: "",
      });
    } catch (error) {
      console.error("Booking failed:", error);
      setErrors({ submit: "Failed to create booking. Please try again." });
    }
  };

  const formatPrice = (service: Service) => {
    if (service.price && service.creditCost) {
      return `$${(service.price / 100).toFixed(2)} or ${service.creditCost} credits`;
    } else if (service.price) {
      return `$${(service.price / 100).toFixed(2)}`;
    } else if (service.creditCost) {
      return `${service.creditCost} credits`;
    }
    return "Free consultation";
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step === currentStep
                  ? "bg-blue-600 text-white"
                  : step < currentStep
                  ? "bg-green-600 text-white"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {step < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-0.5 transition-all ${
                  step < currentStep ? "bg-green-600" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {renderStepIndicator()}
      
      {/* Step 1: Service Selection */}
      {currentStep === 1 && (
        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Choose Your Service</h2>
            <p className="text-neutral-600">Select the type of consultation that best fits your needs</p>
          </div>
          
          {isLoadingServices ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="p-6 border-2 border-neutral-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold group-hover:text-blue-700 transition-colors">
                      {service.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(service)}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {service.duration} minutes
                      </div>
                    </div>
                  </div>
                  {service.description && (
                    <p className="text-neutral-600 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Date & Time Selection */}
      {currentStep === 2 && selectedService && (
        <div className="space-y-6">
          {/* Header with back button */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
                <p className="text-neutral-600">
                  {selectedService.name} • {selectedService.duration} minutes • {formatPrice(selectedService)}
                </p>
              </div>
              <CTA onClick={handleStepBack} tone="secondary" size="sm">
                ← Change Service
              </CTA>
            </div>
          </Card>

          {/* Calendar and Time Slots */}
          <div className="grid lg:grid-cols-2 gap-6">
            <BookingCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              selectedService={selectedService}
              availabilityData={availabilityData}
            />
            
            <TimeSlotPicker
              slots={availableSlots}
              selectedSlot={selectedTimeSlot}
              onSlotSelect={handleTimeSlotSelect}
              selectedDate={selectedDate}
              loading={isLoadingSlots}
            />
          </div>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {currentStep === 3 && selectedService && selectedDate && selectedTimeSlot && (
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Information</h2>
              <p className="text-neutral-600">Almost done! We just need a few details.</p>
            </div>
            <CTA onClick={handleStepBack} tone="secondary" size="sm">
              ← Change Time
            </CTA>
          </div>

          {/* Booking Summary */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Service:</strong> {selectedService.name}</div>
              <div><strong>Date:</strong> {format(selectedDate, "EEEE, MMMM d, yyyy")}</div>
              <div><strong>Time:</strong> {format(new Date(selectedTimeSlot), "h:mm a")}</div>
              <div><strong>Duration:</strong> {selectedService.duration} minutes</div>
              <div><strong>Price:</strong> {formatPrice(selectedService)}</div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Your full name"
                  error={errors.customerName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="your.email@example.com"
                  error={errors.customerEmail}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes (Optional)
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any specific topics or questions you'd like to discuss..."
                rows={3}
              />
            </div>

            {errors.submit && (
              <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div className="pt-4">
              <CTA 
                type="submit" 
                size="lg" 
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </CTA>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
