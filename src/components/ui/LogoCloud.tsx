"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

type Brand = {
  name: string;
  slug: string;
  industry: string;
};

type LogoCloudProps = {
  brands?: Brand[];
  className?: string;
};

const DEFAULT_BRANDS: Brand[] = [
  {
    name: "Acme",
    slug: "ops-automation",
    industry: "Operations"
  },
  {
    name: "Globex", 
    slug: "blastable",
    industry: "Technology"
  },
  {
    name: "Umbrella",
    slug: "umbrella", 
    industry: "Enterprise"
  },
  {
    name: "Initech",
    slug: "clutr",
    industry: "E-commerce"
  },
  {
    name: "Hooli",
    slug: "umbrella",
    industry: "Tech Platform"
  },
  {
    name: "Stark",
    slug: "zvault",
    industry: "Security"
  },
];

export function LogoCloud({
  brands = DEFAULT_BRANDS,
  className,
}: LogoCloudProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo(() => (isLoading ? brands : brands), [brands, isLoading]);

  return (
    <section className={className} aria-label="Customer success stories">
      <Container>
        <div className="text-center mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
            Trusted by innovative companies
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {items.map((brand, idx) => (
            isLoading ? (
              <div
                key={`shimmer-${brand.name}`}
                aria-hidden
                className="animate-shimmer h-16 rounded-lg bg-neutral-100"
              />
            ) : (
              <Reveal key={brand.name} delayMs={idx * 60}>
                <Link 
                  href={`/case-studies/${brand.slug}`}
                  className="group flex flex-col h-16 items-center justify-center rounded-lg glass text-xs font-medium text-neutral-800 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-500/20 hover:border-brand-300 dark:text-neutral-200"
                  title={`View ${brand.name} case study`}
                >
                  <div className="font-bold text-neutral-900 group-hover:text-brand-600 dark:text-neutral-100 dark:group-hover:text-brand-400 transition-colors">
                    {brand.name}
                  </div>
                  <div className="text-[10px] text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                    {brand.industry}
                  </div>
                </Link>
              </Reveal>
            )
          ))}
        </div>
      </Container>
    </section>
  );
}

export default LogoCloud;
