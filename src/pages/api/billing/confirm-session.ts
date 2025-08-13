/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/server/auth";
import { stripe } from "@/server/billing/stripe";
import { db } from "@/server/db";
import type Stripe from "stripe";
import type { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await auth(req, res);
  if (!session?.user?.id) return res.status(401).json({ error: "unauthorized" });
  const { sessionId } = (req.body ?? {}) as { sessionId?: string };
  if (!sessionId) return res.status(400).json({ error: "missing sessionId" });

  try {
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkout.payment_status !== "paid") {
      return res.status(200).json({ ok: false, reason: checkout.payment_status });
    }
    const sourceRef = `checkout:${checkout.id}`;
    const existing = await db.creditLedger.findFirst({ where: { sourceRef } });
    if (existing) return res.status(200).json({ ok: true, alreadyGranted: true });

    // Determine credits to grant
    let totalCredits = 0;
    if (checkout.metadata?.type === "dynamic_credits" && checkout.metadata?.credits) {
      const n = Number(checkout.metadata.credits);
      totalCredits = Number.isFinite(n) ? n : 0;
    } else {
      const lineItems = await stripe.checkout.sessions.listLineItems(checkout.id, { limit: 100 });
      const cache: Record<string, number> = {};
      for (const li of lineItems.data) {
        const priceObj = li.price as Stripe.Price | null;
        const priceId = priceObj?.id;
        const qty = (li.quantity ?? 1) as number;
        if (!priceId) continue;
        if (!(priceId in cache)) {
          const price = (await stripe.prices.retrieve(priceId)) as Stripe.Price;
          const meta = price.metadata as Record<string, string> | null;
          const raw = (meta?.includedCredits ?? meta?.credits) as string | undefined;
          const n = raw ? Number(raw) : 0;
          cache[priceId] = Number.isFinite(n) ? n : 0;
        }
        const creditsPer = cache[priceId] ?? 0;
        if (creditsPer > 0) totalCredits += creditsPer * qty;
      }
    }

    if (totalCredits <= 0) return res.status(200).json({ ok: false, reason: "no_credits" });

    // Ensure session belongs to the signed-in user
    const customerId = checkout.customer as string | undefined;
    if (!customerId) return res.status(400).json({ error: "no customer on session" });
    const customer = await db.customer.findFirst({ where: { provider: "stripe", providerCustomerId: customerId } });
    if (!customer || customer.userId !== session.user.id) return res.status(403).json({ error: "forbidden" });

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const balAgg = await tx.creditLedger.aggregate({ _sum: { delta: true }, where: { userId: session.user.id } });
      const currentBalance = balAgg._sum.delta ?? 0;
      await tx.creditLedger.create({
        data: {
          userId: session.user.id,
          delta: totalCredits,
          currency: "credits",
          reason: "checkout_topup",
          source: "stripe",
          sourceRef,
          balanceAfter: currentBalance + totalCredits,
          metadata: {
            stripeSessionId: checkout.id,
            paymentStatus: checkout.payment_status,
            amountTotal: checkout.amount_total ?? null,
            currency: checkout.currency ?? null,
          },
        },
      });
    });

    return res.status(200).json({ ok: true, granted: totalCredits });
  } catch (e) {
    console.error("confirm-session error", e);
    return res.status(500).json({ error: "internal_error" });
  }
}


