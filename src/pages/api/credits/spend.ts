import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";
import { verifyAccessToken } from "@/server/auth/tokens";

const schema = z.object({
  amount: z.number().int().min(1),
  feature: z.string().min(1),
  idempotencyKey: z.string().min(8),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "missing token" });
  const token = auth.slice("Bearer ".length);
  const payload = await verifyAccessToken(token);
  if (!payload) return res.status(401).json({ error: "invalid token" });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { amount, feature, idempotencyKey } = parsed.data;

  // Idempotency: check if we already recorded this spend
  const existingEvent = await db.usageEvent.findFirst({ where: { idempotencyKey } });
  if (existingEvent) {
    const bal = await db.creditLedger.aggregate({ _sum: { delta: true }, where: { userId: payload.userId } });
    return res.status(200).json({ ok: true, balance: bal._sum.delta ?? 0, idempotent: true });
  }

  // Atomic spend using transaction
  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const balAgg = await tx.creditLedger.aggregate({ _sum: { delta: true }, where: { userId: payload.userId } });
    const currentBalance = balAgg._sum.delta ?? 0;
    if (currentBalance < amount) {
      return { ok: false as const, error: "insufficient_balance", balance: currentBalance };
    }
    await tx.creditLedger.create({
      data: {
        userId: payload.userId,
        delta: -amount,
        currency: "credits",
        reason: `spend:${feature}`,
        source: "usage",
        sourceRef: idempotencyKey,
        balanceAfter: currentBalance - amount,
      },
    });
    await tx.usageEvent.create({
      data: {
        userId: payload.userId,
        meterCode: feature,
        quantity: amount,
        idempotencyKey,
      },
    });
    const newAgg = await tx.creditLedger.aggregate({ _sum: { delta: true }, where: { userId: payload.userId } });
    return { ok: true as const, balance: newAgg._sum.delta ?? 0 };
  });

  if (!result.ok) return res.status(402).json(result);
  return res.status(200).json(result);
}


