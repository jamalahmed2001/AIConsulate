"use client";
import React, { useState, useEffect } from "react";
import Calendar, { type CalendarProps as ReactCalendarProps } from "react-calendar";
import { format, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import "react-calendar/dist/Calendar.css";
import { Card } from "./Card";



interface AvailabilityData {
  date: string;
  availableSlots: number;
  bookedSlots: number;
}

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  selectedService: { id: string; name: string; duration: number } | null;
  availabilityData?: AvailabilityData[];
  className?: string;
}

type CalendarValue = Date | [Date, Date] | null;

export function BookingCalendar({
  selectedDate,
  onDateSelect,
  selectedService,
  availabilityData = [],
  className = "",
}: CalendarProps) {
  const [value, setValue] = useState<CalendarValue>(selectedDate);

  useEffect(() => {
    setValue(selectedDate);
  }, [selectedDate]);

  const handleDateChange: ReactCalendarProps['onChange'] = (value, _event) => {
    if (value && value instanceof Date) {
      setValue(value);
      onDateSelect(value);
    }
  };

  // Get availability for a specific date
  const getAvailabilityForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return availabilityData.find((availability) => availability.date === dateString);
  };

  // Determine tile content (availability indicator)
  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const availability = getAvailabilityForDate(date);
    if (!availability) return null;

    const { availableSlots, bookedSlots } = availability;
    const totalSlots = availableSlots + bookedSlots;
    
    if (totalSlots === 0) return null;

    const availabilityPercentage = (availableSlots / totalSlots) * 100;
    
    let indicator = "";
    let indicatorClass = "";

    if (availableSlots === 0) {
      indicator = "●";
      indicatorClass = "text-red-500";
    } else if (availabilityPercentage > 70) {
      indicator = "●";
      indicatorClass = "text-green-500";
    } else if (availabilityPercentage > 30) {
      indicator = "●";
      indicatorClass = "text-yellow-500";
    } else {
      indicator = "●";
      indicatorClass = "text-orange-500";
    }

    return (
      <div className={`text-xs ${indicatorClass} -mt-1`}>
        {indicator}
      </div>
    );
  };

  // Determine tile class names for styling
  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";

    const classes = [];
    
    // Disable past dates
    if (isBefore(date, startOfDay(new Date()))) {
      classes.push("past-date");
    }

    // Highlight today
    if (isToday(date)) {
      classes.push("today");
    }

    // Highlight selected date
    if (selectedDate && isSameDay(date, selectedDate)) {
      classes.push("selected");
    }

    // Add availability-based styling
    const availability = getAvailabilityForDate(date);
    if (availability) {
      const { availableSlots } = availability;
      if (availableSlots === 0) {
        classes.push("unavailable");
      } else {
        classes.push("available");
      }
    }

    return classes.join(" ");
  };

  // Disable dates that shouldn't be selectable
  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return false;
    
    // Disable past dates
    if (isBefore(date, startOfDay(new Date()))) return true;
    
    // Disable weekends (if business hours only work weekdays)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    
    // Disable dates with no availability
    const availability = getAvailabilityForDate(date);
    if (availability && availability.availableSlots === 0) return true;
    
    return false;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Select a Date</h3>
          {selectedService ? (
            <p className="text-sm text-neutral-600">
              Available times for <span className="font-medium">{selectedService.name}</span> 
              <span className="text-neutral-400"> ({selectedService.duration} min)</span>
            </p>
          ) : (
            <p className="text-sm text-neutral-600">Select a service first</p>
          )}
        </div>

        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={value}
            tileContent={getTileContent}
            tileClassName={getTileClassName}
            tileDisabled={tileDisabled}
            showNeighboringMonth={false}
            minDate={startOfDay(new Date())}
            maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days from now
          />
        </div>

        {/* Availability Legend */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Availability</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-green-500">●</span>
              <span>High availability</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">●</span>
              <span>Some availability</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-orange-500">●</span>
              <span>Limited availability</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-500">●</span>
              <span>Fully booked</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calendar-container :global(.react-calendar) {
          width: 100%;
          border: none;
          background: transparent;
          font-family: inherit;
        }

        .calendar-container :global(.react-calendar__navigation) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .calendar-container :global(.react-calendar__navigation button) {
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 500;
          color: #374151;
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calendar-container :global(.react-calendar__navigation button:hover) {
          background: #f3f4f6;
          color: #111827;
        }

        .calendar-container :global(.react-calendar__month-view__weekdays) {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .calendar-container :global(.react-calendar__month-view__weekdays__weekday) {
          padding: 0.5rem;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .calendar-container :global(.react-calendar__month-view__days) {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
        }

        .calendar-container :global(.react-calendar__tile) {
          background: none;
          border: none;
          padding: 0.75rem;
          text-align: center;
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          position: relative;
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #374151;
        }

        .calendar-container :global(.react-calendar__tile:hover) {
          background: #f3f4f6;
        }

        .calendar-container :global(.react-calendar__tile.today) {
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }

        .calendar-container :global(.react-calendar__tile.selected) {
          background: #2563eb !important;
          color: white !important;
        }

        .calendar-container :global(.react-calendar__tile.available) {
          border: 1px solid #d1fae5;
        }

        .calendar-container :global(.react-calendar__tile.unavailable) {
          border: 1px solid #fecaca;
          color: #9ca3af;
        }

        .calendar-container :global(.react-calendar__tile.past-date) {
          color: #d1d5db;
          cursor: not-allowed;
        }

        .calendar-container :global(.react-calendar__tile:disabled) {
          color: #d1d5db;
          cursor: not-allowed;
          background: #f9fafb;
        }

        .calendar-container :global(.react-calendar__tile:disabled:hover) {
          background: #f9fafb;
        }

        .calendar-container :global(.react-calendar__tile--neighboringMonth) {
          color: #d1d5db;
        }
      `}</style>
    </Card>
  );
}
