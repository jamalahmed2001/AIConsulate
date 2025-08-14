"use client";
import React from "react";
import { format } from "date-fns";
import { Card } from "./Card";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
  selectedDate: Date | null;
  loading?: boolean;
  className?: string;
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSlotSelect,
  selectedDate,
  loading = false,
  className = "",
}: TimeSlotPickerProps) {
  const formatTimeSlot = (slot: TimeSlot) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  };

  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Available Times</h3>
            {selectedDate && (
              <p className="text-sm text-neutral-600">{formatDate(selectedDate)}</p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-neutral-100 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!selectedDate) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a Date</h3>
          <p className="text-sm text-neutral-600">Choose a date from the calendar to see available time slots</p>
        </div>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Available Times</h3>
            <p className="text-sm text-neutral-600">{formatDate(selectedDate)}</p>
          </div>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-neutral-900 mb-2">No Available Times</h4>
            <p className="text-sm text-neutral-600">
              All time slots are booked for this date. Please choose a different date.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Available Times</h3>
          <p className="text-sm text-neutral-600">{formatDate(selectedDate)}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot.startTime;
            return (
              <button
                key={slot.startTime}
                onClick={() => onSlotSelect(slot.startTime)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium
                  ${isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-blue-300 hover:bg-blue-50/50"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                {formatTimeSlot(slot)}
              </button>
            );
          })}
        </div>

        {slots.length > 6 && (
          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500">
              {slots.length} time slots available
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
