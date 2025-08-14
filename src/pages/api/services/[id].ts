import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.number().min(15).optional(),
  price: z.number().min(0).optional(),
  creditCost: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid service ID" });
  }

  const session = await auth(req, res);

  if (req.method === "GET") {
    // Public endpoint - get service details
    try {
      const service = await db.service.findUnique({
        where: { id },
      });
      
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      return res.status(200).json({ service });
    } catch (error) {
      console.error("/api/services/[id] GET error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Admin-only endpoints
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "PATCH") {
    // Update service
    try {
      const parsed = updateServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const service = await db.service.update({
        where: { id },
        data: parsed.data,
      });

      return res.status(200).json({ service });
    } catch (error) {
      console.error("/api/services/[id] PATCH error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    // Soft delete service (set isActive to false)
    try {
      const service = await db.service.update({
        where: { id },
        data: { isActive: false },
      });

      return res.status(200).json({ service });
    } catch (error) {
      console.error("/api/services/[id] DELETE error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
