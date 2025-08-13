import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/server/auth";
import { stripe } from "@/server/billing/stripe";
import { env } from "@/env";
import { getOrCreateStripeCustomer } from "@/server/billing/customer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await auth(req, res);
  if (!session?.user?.id) return res.status(401).json({ error: "unauthorized" });
  const { priceId, mode } = (req.body ?? {}) as { priceId: string; mode?: "subscription" | "payment" };
  if (!priceId) return res.status(400).json({ error: "missing priceId" });

  const customerId = await getOrCreateStripeCustomer({ userId: session.user.id, email: session.user.email });

  const checkout = await stripe.checkout.sessions.create({
    mode: mode ?? "payment",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.SITE_URL}/credits?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.SITE_URL}/credits?canceled=1`,
    allow_promotion_codes: true,
  });
  return res.status(200).json({ url: checkout.url });
}


