import { db } from "@/server/db";
import { stripe } from "@/server/billing/stripe";

export async function getOrCreateStripeCustomer(params: {
  userId: string;
  email?: string | null;
}): Promise<string> {
  const { userId, email } = params;

  const existing = await db.customer.findFirst({
    where: { userId, provider: "stripe" },
  });
  if (existing) return existing.providerCustomerId;

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { userId },
  });

  await db.customer.create({
    data: {
      userId,
      provider: "stripe",
      providerCustomerId: customer.id,
    },
  });

  return customer.id;
}


