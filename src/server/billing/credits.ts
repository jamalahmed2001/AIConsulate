import { stripe } from "@/server/billing/stripe";
import { env } from "@/env";

export function calculateDynamicCreditPriceInCents(credits: number): number {
  let pricePerCredit = 0.01;
  if (credits >= 5000) pricePerCredit = 0.008;
  else if (credits >= 2000) pricePerCredit = 0.009;
  else if (credits >= 500) pricePerCredit = 0.0095;
  return Math.round(credits * pricePerCredit * 100);
}

export async function createDynamicCreditsCheckout(params: {
  customerId: string;
  userId: string;
  credits: number;
  mode: "payment" | "subscription";
}): Promise<{ url: string | null; id: string }> {
  const { customerId, userId, credits, mode } = params;
  const amountInCents = calculateDynamicCreditPriceInCents(credits);

  const checkout = await stripe.checkout.sessions.create({
    mode,
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${credits.toLocaleString()} AI Credits`,
            description:
              mode === "subscription"
                ? `Monthly subscription for ${credits.toLocaleString()} credits`
                : `One-time purchase of ${credits.toLocaleString()} credits`,
            metadata: { type: "credits", credits: String(credits) },
          },
          unit_amount: amountInCents,
          ...(mode === "subscription" && { recurring: { interval: "month" as const } }),
        },
        quantity: 1,
      },
    ],
    metadata: { credits: String(credits), userId, type: "dynamic_credits" },
    success_url: `${env.SITE_URL}/credits?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.SITE_URL}/credits?canceled=1`,
    allow_promotion_codes: true,
  });

  return { url: checkout.url, id: checkout.id };
}


