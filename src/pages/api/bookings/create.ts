import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { sendBookingConfirmation } from "@/server/email";

const createBookingSchema = z.object({
  serviceId: z.string().cuid(),
  startTime: z.coerce.date(),
  notes: z.string().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await auth(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { serviceId, startTime, notes, customerName, customerEmail, customerPhone } = parsed.data;

    // Get service details to calculate end time
    const service = await db.service.findUnique({
      where: { id: serviceId, isActive: true },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Calculate end time based on service duration
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // Check if the time slot is available
    const conflictingAppointment = await db.appointment.findFirst({
      where: {
        status: { in: ["scheduled", "confirmed"] },
        OR: [
          {
            // New appointment starts during existing appointment
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            // New appointment ends during existing appointment
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            // New appointment encompasses existing appointment
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return res.status(409).json({ error: "Time slot not available" });
    }

    // Create the appointment
    const appointment = await db.appointment.create({
      data: {
        userId: session.user.id,
        serviceId,
        startTime,
        endTime,
        notes: notes ?? null,
        customerName,
        customerEmail,
        customerPhone: customerPhone ?? null,
        status: "scheduled",
      },
      include: {
        service: true,
      },
    });

    // Send confirmation email
    try {
      await sendBookingConfirmation({
        customerName,
        customerEmail,
        serviceName: service.name,
        startTime,
        endTime,
        duration: service.duration,
        notes: notes ?? undefined,
        bookingId: appointment.id,
      });
    } catch (emailError) {
      console.error("Failed to send booking confirmation email:", emailError);
      // Don't fail the booking if email sending fails
    }

    // TODO: Deduct credits if creditCost is set

    return res.status(201).json({ appointment });
  } catch (error) {
    console.error("/api/bookings/create error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
