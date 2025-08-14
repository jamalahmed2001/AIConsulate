import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAccessToken } from "@/server/auth/tokens";
import { db } from "@/server/db";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "missing token" });
  
  const token = auth.slice("Bearer ".length);
  const payload = await verifyAccessToken(token);
  if (!payload) return res.status(401).json({ error: "invalid token" });

  try {
    // Simulate a subscription auto top-up (like what would happen from Stripe webhook)
    const testCredits = 100; // Test with 100 credits
    const sourceRef = `test-subscription:${uuidv4()}`;
    
    // Get current balance
    const balAgg = await db.creditLedger.aggregate({ 
      _sum: { delta: true }, 
      where: { userId: payload.userId } 
    });
    const currentBalance = balAgg._sum.delta ?? 0;

    // Add credits (simulating subscription renewal)
    await db.creditLedger.create({
      data: {
        userId: payload.userId,
        delta: testCredits,
        currency: "credits",
        reason: "test_subscription_renewal",
        source: "test",
        sourceRef,
        balanceAfter: currentBalance + testCredits,
        metadata: {
          type: "test_webhook",
          simulatedEvent: "invoice.payment_succeeded",
          testCredits,
          timestamp: new Date().toISOString(),
        },
      },
    });

    const newAgg = await db.creditLedger.aggregate({ 
      _sum: { delta: true }, 
      where: { userId: payload.userId } 
    });
    const newBalance = newAgg._sum.delta ?? 0;

    return res.status(200).json({
      ok: true,
      message: "Test subscription auto top-up successful",
      creditsBefore: currentBalance,
      creditsAdded: testCredits,
      balanceAfter: newBalance,
      sourceRef,
    });
  } catch (error) {
    console.error("Test webhook error:", error);
    return res.status(500).json({ error: "Test webhook failed" });
  }
}
