"use client";
import React, { useState, useEffect } from "react";
import Calendar, { type CalendarProps as ReactCalendarProps } from "react-calendar";
import { format, isSameDay } from "date-fns";
import "react-calendar/dist/Calendar.css";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/ui/CTA";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  service: {
    id: string;
    name: string;
    duration: number;
  };
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentUpdate?: (id: string, status: string) => Promise<void>;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  className?: string;
}

type CalendarValue = Date | [Date, Date] | null;

export function AppointmentCalendar({
  appointments,
  onAppointmentUpdate,
  selectedDate,
  onDateChange,
  className = "",
}: AppointmentCalendarProps) {
  const [value, setValue] = useState<CalendarValue>(selectedDate ?? new Date());
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const currentDate = (value instanceof Date ? value : new Date());
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return isSameDay(aptDate, currentDate);
    });
    setSelectedDayAppointments(dayAppointments);
  }, [value, appointments]);

  const handleDateChange: ReactCalendarProps['onChange'] = (newValue, _event) => {
    if (newValue instanceof Date) {
      setValue(newValue);
      onDateChange?.(newValue);
    }
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return isSameDay(aptDate, date);
    });
  };

  // Determine tile content (appointment indicators)
  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dayAppointments = getAppointmentsForDate(date);
    if (dayAppointments.length === 0) return null;

    const statusCounts = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };

    dayAppointments.forEach(apt => {
      if (statusCounts.hasOwnProperty(apt.status)) {
        statusCounts[apt.status as keyof typeof statusCounts]++;
      }
    });

    return (
      <div className="flex items-center justify-center mt-1">
        <div className="flex space-x-1">
          {statusCounts.scheduled > 0 && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" title={`${statusCounts.scheduled} scheduled`}></div>
          )}
          {statusCounts.confirmed > 0 && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title={`${statusCounts.confirmed} confirmed`}></div>
          )}
          {statusCounts.completed > 0 && (
            <div className="w-2 h-2 bg-gray-500 rounded-full" title={`${statusCounts.completed} completed`}></div>
          )}
          {statusCounts.cancelled > 0 && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title={`${statusCounts.cancelled} cancelled`}></div>
          )}
          {statusCounts.no_show > 0 && (
            <div className="w-2 h-2 bg-orange-500 rounded-full" title={`${statusCounts.no_show} no show`}></div>
          )}
        </div>
        {dayAppointments.length > 3 && (
          <div className="text-xs text-gray-500 ml-1">+{dayAppointments.length - 3}</div>
        )}
      </div>
    );
  };

  // Determine tile class names for styling
  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";

    const classes = [];
    const dayAppointments = getAppointmentsForDate(date);

    if (dayAppointments.length > 0) {
      classes.push("has-appointments");
    }

    if (value instanceof Date && isSameDay(date, value)) {
      classes.push("selected-date");
    }

    return classes.join(" ");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "text-blue-600 bg-blue-50 border-blue-200";
      case "confirmed": return "text-green-600 bg-green-50 border-green-200";
      case "cancelled": return "text-red-600 bg-red-50 border-red-200";
      case "completed": return "text-gray-600 bg-gray-50 border-gray-200";
      case "no_show": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return "📅";
      case "confirmed": return "✅";
      case "cancelled": return "❌";
      case "completed": return "✔️";
      case "no_show": return "👻";
      default: return "❓";
    }
  };

  return (
    <div className={`grid lg:grid-cols-2 gap-6 ${className}`}>
      {/* Calendar */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Calendar View</h3>
        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={value}
            tileContent={getTileContent}
            tileClassName={getTileClassName}
            showNeighboringMonth={true}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Status Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Cancelled</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Appointments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {value instanceof Date ? format(value, "EEEE, MMMM d") : "Select a Date"}
          </h3>
          <div className="text-sm text-gray-500">
            {selectedDayAppointments.length} appointment{selectedDayAppointments.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {selectedDayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No appointments scheduled for this day</p>
              <CTA href="/book" size="sm" className="mt-4">
                Book Appointment
              </CTA>
            </div>
          ) : (
            selectedDayAppointments
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className={`border rounded-lg p-4 ${getStatusColor(appointment.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(appointment.status)}</span>
                      <div>
                        <h4 className="font-medium text-sm">{appointment.service.name}</h4>
                        <p className="text-xs opacity-75">
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/50 border">
                      {appointment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {appointment.customerName && (
                    <div className="text-xs mb-2">
                      <span className="font-medium">Customer:</span> {appointment.customerName}
                      {appointment.customerEmail && (
                        <span className="text-gray-600 ml-2">({appointment.customerEmail})</span>
                      )}
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="text-xs mb-2">
                      <span className="font-medium">Notes:</span> {appointment.notes}
                    </div>
                  )}

                  {/* Quick Actions */}
                  {onAppointmentUpdate && (appointment.status === "scheduled" || appointment.status === "confirmed") && (
                    <div className="flex gap-2 mt-3">
                      {appointment.status === "scheduled" && (
                        <button
                          onClick={() => onAppointmentUpdate(appointment.id, "confirmed")}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          ✅ Confirm
                        </button>
                      )}
                      <button
                        onClick={() => onAppointmentUpdate(appointment.id, "completed")}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        ✔️ Complete
                      </button>
                      <button
                        onClick={() => onAppointmentUpdate(appointment.id, "cancelled")}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </Card>

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
          padding: 0.5rem;
          text-align: center;
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          position: relative;
          min-height: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          color: #374151;
        }

        .calendar-container :global(.react-calendar__tile:hover) {
          background: #f3f4f6;
        }

        .calendar-container :global(.react-calendar__tile.has-appointments) {
          background: #eff6ff;
          border: 1px solid #dbeafe;
        }

        .calendar-container :global(.react-calendar__tile.selected-date) {
          background: #2563eb !important;
          color: white !important;
          border: 1px solid #1d4ed8 !important;
        }

        .calendar-container :global(.react-calendar__tile--active) {
          background: #10b981 !important;
          color: white !important;
        }

        .calendar-container :global(.react-calendar__tile--now) {
          background: #fef3c7;
          border: 1px solid #fbbf24;
        }

        .calendar-container :global(.react-calendar__tile--neighboringMonth) {
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
}
