import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/server/billing/stripe";
import { db } from "@/server/db";
import type Stripe from "stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: "unauthorized" });

  const prices = await stripe.prices.list({ active: true, expand: ["data.product"] });

  function isDeletedProduct(p: string | Stripe.Product | Stripe.DeletedProduct): p is Stripe.DeletedProduct {
    return typeof p !== "string" && "deleted" in (p as Stripe.DeletedProduct) && Boolean((p as Stripe.DeletedProduct).deleted);
  }

  for (const price of prices.data) {
    const product = price.product;

    let productCode: string;
    let productName: string;

    if (typeof product === "string") {
      productCode = product;
      productName = product;
    } else if (isDeletedProduct(product)) {
      productCode = String(product.id);
      productName = String(product.id);
    } else {
      const prod = product;
      productCode = String(prod.metadata?.code ?? prod.id);
      productName = String(prod.name ?? productCode);
    }

    await db.product.upsert({
      where: { code: productCode },
      update: { name: productName },
      create: { code: productCode, name: productName },
    });

    const prodRecord = await db.product.findUnique({ where: { code: productCode } });
    if (!prodRecord) continue;

    await db.price.upsert({
      where: { providerPriceId: price.id },
      update: {
        productId: prodRecord.id,
        interval: price.recurring?.interval ?? null,
        currency: price.currency.toUpperCase(),
        unitAmount: price.unit_amount ?? 0,
        metered: price.recurring?.usage_type === "metered",
        includedCredits: Number((price.metadata?.includedCredits as string | undefined) ?? "0") || null,
      },
      create: {
        productId: prodRecord.id,
        provider: "stripe",
        providerPriceId: price.id,
        interval: price.recurring?.interval ?? null,
        currency: price.currency.toUpperCase(),
        unitAmount: price.unit_amount ?? 0,
        metered: price.recurring?.usage_type === "metered",
        includedCredits: Number((price.metadata?.includedCredits as string | undefined) ?? "0") || null,
      },
    });
  }

  return res.status(200).json({ ok: true, count: prices.data.length });
}


