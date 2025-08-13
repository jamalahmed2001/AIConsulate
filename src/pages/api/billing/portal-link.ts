import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/server/auth";
import { stripe } from "@/server/billing/stripe";
import { env } from "@/env";
import { getOrCreateStripeCustomer } from "@/server/billing/customer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") return res.status(405).end();
  const session = await auth(req, res);
  if (!session?.user?.id) return res.status(401).json({ error: "unauthorized" });
  const customerId = await getOrCreateStripeCustomer({ userId: session.user.id, email: session.user.email });
  const link = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: env.BILLING_PORTAL_RETURN_URL ?? `${env.SITE_URL}/dashboard`,
  });
  
  // For GET requests, redirect directly
  if (req.method === "GET") {
    return res.redirect(303, link.url);
  }
  
  // For POST requests, return JSON
  return res.status(200).json({ url: link.url });
}


