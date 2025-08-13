import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/server/db";
import { verifyAccessToken } from "@/server/auth/tokens";

function setCors(res: NextApiResponse, origin?: string | null) {
  res.setHeader("Access-Control-Allow-Origin", origin ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(res, req.headers.origin ?? "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).end();
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "missing token" });
  const token = auth.slice("Bearer ".length);
  const payload = await verifyAccessToken(token);
  if (!payload) return res.status(401).json({ error: "invalid token" });

  const [balanceAgg, subs] = await Promise.all([
    db.creditLedger.aggregate({ _sum: { delta: true }, where: { userId: payload.userId } }),
    db.subscription.findMany({ where: { userId: payload.userId, status: { in: ["active", "trialing"] } } }),
  ]);
  const creditBalance = balanceAgg._sum.delta ?? 0;
  return res.status(200).json({
    creditBalance,
    plans: subs.map((s) => ({ status: s.status, currentPeriodEnd: s.currentPeriodEnd, planCode: s.planCode, quantity: s.quantity })),
  });
}


