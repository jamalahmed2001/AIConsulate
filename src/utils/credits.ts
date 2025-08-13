export function pricePerCredit(credits: number): number {
  if (credits >= 5000) return 0.008;
  if (credits >= 2000) return 0.009;
  if (credits >= 500) return 0.0095;
  return 0.01;
}

export function priceInCents(credits: number): number {
  return Math.round(credits * pricePerCredit(credits) * 100);
}


