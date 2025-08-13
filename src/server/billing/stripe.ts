import Stripe from "stripe";
import { env } from "@/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export type StripePriceMetadata = {
  code?: string;
  includedCredits?: string; // number as string in metadata
};

export function parseIncludedCredits(metadata: Record<string, string> | null): number | null {
  if (!metadata) return null;
  const raw = metadata.includedCredits ?? metadata.included_credits ?? metadata.credits;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}


