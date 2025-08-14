import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";

const availableTimeSlotsSchema = z.object({
  serviceId: z.string().cuid(),
  date: z.coerce.date(), // The date to check availability for
});

// Business hours configuration (you can move this to environment variables)
const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17,  // 5 PM
  timezone: "America/New_York", // Adjust to your timezone
  workDays: [1, 2, 3, 4, 5], // Monday-Friday (0=Sunday, 6=Saturday)
};

interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

function generateTimeSlots(date: Date, serviceDuration: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(BUSINESS_HOURS.start, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(BUSINESS_HOURS.end, 0, 0, 0);

  // Don't generate slots for weekends or outside business hours
  if (!BUSINESS_HOURS.workDays.includes(date.getDay())) {
    return slots;
  }

  // Don't generate slots for past dates
  const now = new Date();
  if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return slots;
  }

  let currentSlot = new Date(startOfDay);
  
  while (currentSlot.getTime() + serviceDuration * 60000 <= endOfDay.getTime()) {
    // If it's today, only show future time slots
    if (date.toDateString() === now.toDateString()) {
      if (currentSlot.getTime() <= now.getTime() + 60 * 60000) { // 1 hour buffer
        currentSlot = new Date(currentSlot.getTime() + 30 * 60000); // 30-minute increments
        continue;
      }
    }

    const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000);
    
    slots.push({
      startTime: new Date(currentSlot),
      endTime: slotEnd,
    });
    
    // Move to next 30-minute slot
    currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
  }

  return slots;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsed = availableTimeSlotsSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { serviceId, date } = parsed.data;

    // Get service details
    const service = await db.service.findUnique({
      where: { id: serviceId, isActive: true },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Generate all possible time slots for the day
    const allSlots = generateTimeSlots(date, service.duration);

    if (allSlots.length === 0) {
      return res.status(200).json({ availableSlots: [] });
    }

    // Get existing appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await db.appointment.findMany({
      where: {
        status: { in: ["scheduled", "confirmed"] },
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Filter out slots that conflict with existing appointments
    const availableSlots = allSlots.filter(slot => {
      return !existingAppointments.some(appointment => {
        // Check if slot conflicts with existing appointment
        return (
          (slot.startTime >= appointment.startTime && slot.startTime < appointment.endTime) ||
          (slot.endTime > appointment.startTime && slot.endTime <= appointment.endTime) ||
          (slot.startTime <= appointment.startTime && slot.endTime >= appointment.endTime)
        );
      });
    });

    return res.status(200).json({ 
      availableSlots: availableSlots.map(slot => ({
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
      }))
    });
  } catch (error) {
    console.error("/api/timeslots/available error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
