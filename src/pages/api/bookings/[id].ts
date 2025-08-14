import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

const updateBookingSchema = z.object({
  startTime: z.coerce.date().optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "cancelled", "completed", "no_show"]).optional(),
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});

type UpdateBookingData = z.infer<typeof updateBookingSchema> & {
  endTime?: Date;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid appointment ID" });
  }

  const session = await auth(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id },
        include: {
          service: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Check if user owns this appointment
      if (appointment.userId !== session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      return res.status(200).json({ appointment });
    } catch (error) {
      console.error("/api/bookings/[id] GET error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const parsed = updateBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      // First, get the current appointment to check ownership
      const currentAppointment = await db.appointment.findUnique({
        where: { id },
        include: { service: true },
      });

      if (!currentAppointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      if (currentAppointment.userId !== session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateData: UpdateBookingData = { ...parsed.data };

      // If startTime is being updated, recalculate endTime
      if (parsed.data.startTime) {
        const newEndTime = new Date(parsed.data.startTime.getTime() + currentAppointment.service.duration * 60000);
        updateData.endTime = newEndTime;

        // Check for conflicts if rescheduling
        if (parsed.data.status !== "cancelled") {
          const conflictingAppointment = await db.appointment.findFirst({
            where: {
              id: { not: id },
              status: { in: ["scheduled", "confirmed"] },
              OR: [
                {
                  startTime: { lte: parsed.data.startTime },
                  endTime: { gt: parsed.data.startTime },
                },
                {
                  startTime: { lt: newEndTime },
                  endTime: { gte: newEndTime },
                },
                {
                  startTime: { gte: parsed.data.startTime },
                  endTime: { lte: newEndTime },
                },
              ],
            },
          });

          if (conflictingAppointment) {
            return res.status(409).json({ error: "Time slot not available" });
          }
        }
      }

      const appointment = await db.appointment.update({
        where: { id },
        data: updateData,
        include: {
          service: true,
        },
      });

      return res.status(200).json({ appointment });
    } catch (error) {
      console.error("/api/bookings/[id] PATCH error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Check ownership
      const appointment = await db.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      if (appointment.userId !== session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Soft delete by setting status to cancelled
      const cancelledAppointment = await db.appointment.update({
        where: { id },
        data: { status: "cancelled" },
        include: { service: true },
      });

      return res.status(200).json({ appointment: cancelledAppointment });
    } catch (error) {
      console.error("/api/bookings/[id] DELETE error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
