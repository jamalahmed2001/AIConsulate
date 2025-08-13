import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";

// Simple admin-protected endpoint (you may replace with proper auth middleware)
const schema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().min(1),
  reason: z.string().optional(),
  idempotencyKey: z.string().min(8),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: "unauthorized" });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { userId, amount, reason, idempotencyKey } = parsed.data;
  // idempotent grant
  const exists = await db.creditLedger.findFirst({ where: { sourceRef: idempotencyKey } });
  if (exists) return res.status(200).json({ ok: true, idempotent: true });
  await db.creditLedger.create({
    data: {
      userId,
      delta: amount,
      currency: "credits",
      reason: reason ?? "grant",
      sourceRef: idempotencyKey,
    },
  });
  return res.status(200).json({ ok: true });
}


