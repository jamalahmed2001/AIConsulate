"use client";
import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

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
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  return (
    <div className={`grid gap-6 md:grid-cols-3 ${className}`}>
      {plans.map((plan, idx) => (
        <Reveal key={plan.name} delayMs={idx * 100}>
          <div 
            className="relative"
            onMouseEnter={() => setHoveredPlan(idx)}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                Most Popular
              </div>
            )}
            
            <Card className={`relative h-full transition-all duration-300 ${
              plan.highlight 
                ? "ring-2 ring-brand-300 dark:ring-brand-400/40 scale-105 shadow-xl" 
                : hoveredPlan === idx 
                ? "shadow-xl scale-[1.02]" 
                : "hover:shadow-lg"
            }`}>
              {/* Background gradient */}
              {plan.highlight && (
                <>
                  {/* Light mode highlight */}
                  <div className="absolute inset-0 rounded-[var(--radius-lg)] bg-gradient-to-br from-brand-50 to-white opacity-60 dark:hidden" />
                  {/* Dark mode highlight (subtle, not washing out text) */}
                  <div className="absolute inset-0 hidden rounded-[var(--radius-lg)] opacity-100 dark:block dark:bg-gradient-to-br dark:from-brand-500/10 dark:via-brand-400/5 dark:to-transparent" />
                </>
              )}
              
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{plan.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">{plan.price}</span>
                    <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">{plan.period}</span>
                  </div>
                </div>
                
                {/* Features */}
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start">
                      <svg 
                        className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <div className="mt-8">
                  <Link
                    href={plan.ctaHref}
                    className={`block w-full rounded-[var(--radius-md)] px-6 py-3 text-center text-sm font-semibold transition-all duration-200 ${
                      plan.highlight
                        ? "bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-xl"
                        : "border border-brand-300 text-brand-700 hover:bg-brand-50"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-400">No lock‑in. Cancel anytime before the next milestone.</p>
                </div>
              </div>
            </Card>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
