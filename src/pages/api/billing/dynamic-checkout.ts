import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/server/auth";
import { z } from "zod";
import { getOrCreateStripeCustomer } from "@/server/billing/customer";
import { createDynamicCreditsCheckout, calculateDynamicCreditPriceInCents } from "@/server/billing/credits";

const requestSchema = z.object({
  credits: z.number().min(10).max(100000),
  mode: z.enum(["payment", "subscription"]).optional().default("payment"),
});

// keep API-local validation only; pricing logic lives in shared module

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await auth(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Validate request
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { credits, mode } = parsed.data;
  const amountInCents = calculateDynamicCreditPriceInCents(credits);

  try {
    const customerId = await getOrCreateStripeCustomer({ userId: session.user.id, email: session.user.email });
    const checkout = await createDynamicCreditsCheckout({ customerId, userId: session.user.id, credits, mode });
    return res.status(200).json({ url: checkout.url, sessionId: checkout.id, amount: amountInCents / 100 });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ 
      error: "Failed to create checkout session" 
    });
  }
}
