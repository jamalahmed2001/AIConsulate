import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().min(15), // minimum 15 minutes
  price: z.number().min(0).optional(),
  creditCost: z.number().min(0).optional(),
});

// const updateServiceSchema = createServiceSchema.partial();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await auth(req, res);

  if (req.method === "GET") {
    // Public endpoint - list active services
    try {
      const services = await db.service.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });
      return res.status(200).json({ services });
    } catch (error) {
      console.error("/api/services GET error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Admin-only endpoints
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // TODO: Add admin role check here when roles are implemented
  // For now, assume all authenticated users can manage services (you may want to restrict this)

  if (req.method === "POST") {
    // Create service
    try {
      const parsed = createServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const service = await db.service.create({
        data: parsed.data,
      });

      return res.status(201).json({ service });
    } catch (error) {
      console.error("/api/services POST error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
