"use client";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";

type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
  popular?: boolean;
  cta: string;
  ctaHref: string;
};

type EnhancedPricingTableProps = {
  plans: PricingPlan[];
  className?: string;
};

export function EnhancedPricingTable({ plans, className = "" }: EnhancedPricingTableProps) {
  const [, setHoveredPlan] = useState<number | null>(null);

  return (
    <div className={`grid gap-8 md:grid-cols-3 ${className}`}>
      {plans.map((plan, idx) => (
        <Reveal key={plan.name} delayMs={idx * 100}>
          <div 
            className="relative group"
            onMouseEnter={() => setHoveredPlan(idx)}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            {/* Popular badge */}
              {plan.popular && (
              <div className="absolute -top-4 left-1/2 z-30 -translate-x-1/2 rounded-full gradient-cta px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                Most Popular
              </div>
            )}
            
            {/* Main card */}
              <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
              plan.highlight 
                ? "border-brand-200 dark:border-brand-400/30 glass-strong shadow-2xl scale-105" 
                : "glass border-neutral-200 dark:border-neutral-700 shadow-lg hover:shadow-xl group-hover:scale-[1.02]"
            }`}>
              
              {/* Header with soft gradient surface */}
              <div className={`px-8 py-8 text-center ${
                plan.highlight 
                  ? "gradient-contrast-surface" 
                  : "bg-neutral-50 dark:bg-neutral-800/40"
              }`}>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-200">{plan.description}</p>
                
                {/* Price */}
                <div className="mt-6">
                  <span className="text-4xl font-bold text-neutral-900 dark:text-white">{plan.price}</span>
                  <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">{plan.period}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-8 py-8">
                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start">
                      <div className={`mr-3 mt-0.5 h-5 w-5 flex-shrink-0 rounded-full flex items-center justify-center ${
                        plan.highlight 
                          ? "bg-brand-100 dark:bg-brand-900/30" 
                          : "bg-brand-100/60 dark:bg-brand-900/20"
                      }`}>
                        <svg 
                          className={`h-3 w-3 ${
                            plan.highlight 
                              ? "text-brand-600 dark:text-brand-400" 
                              : "text-brand-600/80 dark:text-brand-400/80"
                          }`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <div className="mt-8">
                  <CTA
                    href={plan.ctaHref}
                    size="md"
                    tone="primary"
                    label={plan.cta}
                    fullWidth
                  />
                  <p className="mt-3 text-center text-xs text-neutral-700 dark:text-neutral-400">No lock‑in. Cancel anytime before the next milestone.</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
