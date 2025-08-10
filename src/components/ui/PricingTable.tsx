import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/ui/CTA";

type Plan = {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
};

export function PricingTable({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((p) => (
        <Card
          key={p.name}
          className={p.highlight ? "ring-brand-400 ring-2" : ""}
        >
          <div className="mb-1 text-xl font-semibold">{p.name}</div>
          <div className="mb-4 text-2xl font-bold">{p.price}</div>
          <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            {p.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <CTA href="/contact" size="md" fullWidth>Get started</CTA>
        </Card>
      ))}
    </div>
  );
}
