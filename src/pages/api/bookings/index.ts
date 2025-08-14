import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

const listBookingsSchema = z.object({
  status: z.enum(["scheduled", "confirmed", "cancelled", "completed", "no_show"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

type AppointmentWhereClause = {
  userId: string;
  status?: string;
  startTime?: {
    gte?: Date;
    lte?: Date;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await auth(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const parsed = listBookingsSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { status, from, to, limit, offset } = parsed.data;

    // Build where clause
    const where: AppointmentWhereClause = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = from;
      if (to) where.startTime.lte = to;
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            creditCost: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await db.appointment.count({ where });

    return res.status(200).json({
      appointments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
      },
    });
  } catch (error) {
    console.error("/api/bookings GET error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
