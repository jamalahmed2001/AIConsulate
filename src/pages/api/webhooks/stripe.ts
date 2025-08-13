/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { stripe, parseIncludedCredits } from "@/server/billing/stripe";
import { env } from "@/env";
import { db } from "@/server/db";
const pdb = db as unknown as Record<string, unknown>;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) return res.status(400).end();
  const buf = await buffer(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId: string | undefined =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
      if (!customerId) break;
      
      const sourceRef = `checkout:${session.id}`;
      // Idempotency check (also guaranteed by unique index)
      const existing = await (pdb.creditLedger as any).findFirst({ where: { sourceRef } });
      if (existing) break;

      // Check if this is a dynamic credit purchase
      if (session.metadata?.type === "dynamic_credits" && session.metadata?.credits) {
        const dynamicCredits = parseInt(session.metadata.credits, 10);
        if (dynamicCredits > 0) {
          const customer = await (pdb.customer as any).findFirst({
            where: { provider: "stripe", providerCustomerId: customerId },
          });
          if (customer) {
            await (pdb.$transaction as any)(async (tx: any) => {
              const balAgg = await tx.creditLedger.aggregate({ _sum: { delta: true }, where: { userId: customer.userId } });
              const currentBalance = balAgg._sum.delta ?? 0;
              await tx.creditLedger.create({
                data: {
                  userId: customer.userId,
                  delta: dynamicCredits,
                  currency: "credits",
                  reason: "dynamic_checkout_topup",
                  source: "stripe",
                  sourceRef,
                  balanceAfter: currentBalance + dynamicCredits,
                  metadata: {
                    stripeSessionId: session.id,
                    paymentStatus: session.payment_status,
                    amountTotal: session.amount_total ?? null,
                    currency: session.currency ?? null,
                    type: "dynamic_purchase",
                  },
                },
              });
            });
          }
        }
      } else {
        // Handle regular product-based purchases (static price IDs)
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
        let totalCredits = 0;
        const creditsByPrice: Record<string, number> = {};
        for (const li of lineItems.data) {
          const quantity = (li.quantity ?? 1) as number;
          const priceObj = li.price as Stripe.Price | null;
          const priceId = priceObj?.id;
          if (!priceId) continue;
          if (!(priceId in creditsByPrice)) {
            const price = await stripe.prices.retrieve(priceId);
            creditsByPrice[priceId] = parseIncludedCredits((price as Stripe.Price).metadata as Record<string, string>) ?? 0;
          }
          const creditsPerUnit = creditsByPrice[priceId] ?? 0;
          if (creditsPerUnit > 0) totalCredits += creditsPerUnit * quantity;
        }

        if (totalCredits > 0) {
          // Resolve user by customer
          const customer = await (pdb.customer as any).findFirst({ where: { provider: "stripe", providerCustomerId: customerId } });
          if (customer) {
            await (pdb.$transaction as any)(async (tx: any) => {
              const balAgg = await tx.creditLedger.aggregate({ _sum: { delta: true }, where: { userId: customer.userId } });
              const currentBalance = balAgg._sum.delta ?? 0;
              await tx.creditLedger.create({
                data: {
                  userId: customer.userId,
                  delta: totalCredits,
                  currency: "credits",
                  reason: "checkout_topup",
                  source: "stripe",
                  sourceRef,
                  balanceAfter: currentBalance + totalCredits,
                  metadata: {
                    stripeSessionId: session.id,
                    paymentStatus: session.payment_status,
                    amountTotal: session.amount_total ?? null,
                    currency: session.currency ?? null,
                    lineItemCount: lineItems.data.length,
                  },
                },
              });
            });
          }
        }
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = (typeof sub.customer === "string" ? sub.customer : sub.customer?.id) as string | undefined;
      if (!customerId) break;
      const customer = await (pdb.customer as any).findFirst({ where: { provider: "stripe", providerCustomerId: customerId } });
      if (customer) {
        const status: string = sub.status;
        type SubscriptionWithPeriod = Stripe.Subscription & { current_period_end?: number };
        const currentPeriodEndUnix = (sub as SubscriptionWithPeriod).current_period_end ?? 0;
        const currentPeriodEnd = new Date(currentPeriodEndUnix * 1000);
        const providerSubscriptionId: string = sub.id;
        const firstItem = sub.items?.data?.[0];
        const planCode: string | null = (firstItem?.price?.nickname ?? null) as string | null;
        const quantity: number = firstItem?.quantity ?? 1;

        await (pdb.subscription as any).upsert({
          where: { providerSubscriptionId },
          update: { status, currentPeriodEnd, planCode: planCode ?? undefined, quantity },
          create: {
            userId: customer.userId,
            provider: "stripe",
            providerSubscriptionId,
            status,
            currentPeriodEnd,
            planCode: planCode ?? undefined,
            quantity,
          },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = (typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id) as string | undefined;
      if (!customerId) break;
      const customer = await (pdb.customer as any).findFirst({ where: { provider: "stripe", providerCustomerId: customerId } });
      if (!customer) break;

      // Idempotency per invoice
      const sourceRef = `invoice:${invoice.id}`;
      const exists = await (pdb.creditLedger as any).findFirst({ where: { sourceRef } });
      if (exists) break;

      let totalCredits = 0;
      const lines = invoice.lines?.data ?? [];
      for (const li of lines as Array<Stripe.InvoiceLineItem>) {
        const quantity: number = (li.quantity ?? 1) as number;
        const price: Stripe.Price | null = (li as Stripe.InvoiceLineItem & { price?: Stripe.Price | null }).price ?? null;
        if (!price) continue;
        if (!price.recurring) continue;

        // First try price metadata
        let credits = parseIncludedCredits(price.metadata as unknown as Record<string, string>) ?? 0;
        if (!credits) {
          // Fallback to product metadata (covers dynamic subscriptions created via Checkout)
          const productId = price.product as string | undefined;
          if (productId) {
            const product = (await stripe.products.retrieve(productId)) as Stripe.Product;
            const meta = product?.metadata ?? null;
            const raw = (meta?.credits ?? meta?.includedCredits) as string | undefined;
            const n = raw ? Number(raw) : 0;
            credits = Number.isFinite(n) ? n : 0;
          }
        }
        if (credits > 0) totalCredits += credits * quantity;
      }

      if (totalCredits > 0) {
        await (pdb.$transaction as any)(async (tx: any) => {
          const balAgg = await tx.creditLedger.aggregate({ _sum: { delta: true }, where: { userId: customer.userId } });
          const currentBalance = balAgg._sum.delta ?? 0;
          await tx.creditLedger.create({
            data: {
              userId: customer.userId,
              delta: totalCredits,
              currency: "credits",
              reason: "subscription_period_topup",
              source: "stripe",
              sourceRef,
              balanceAfter: currentBalance + totalCredits,
              metadata: {
                invoiceId: invoice.id,
                amountPaid: invoice.amount_paid ?? null,
                currency: invoice.currency ?? null,
                periodStart: invoice.period_start ?? null,
                periodEnd: invoice.period_end ?? null,
              },
            },
          });
        });
      }
      break;
    }
    default:
      break;
  }

  return res.json({ received: true });
}


