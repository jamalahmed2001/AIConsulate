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
      <Container className="py-8">
        <div className="text-center mb-8">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
            Trusted by innovative companies
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
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
                  className="group flex flex-col h-16 items-center justify-center rounded-lg border border-neutral-200 bg-white/50 backdrop-blur-sm text-xs font-medium text-neutral-700 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-200 hover:bg-white/80 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300 dark:hover:border-blue-600 dark:hover:bg-neutral-800/80"
                  title={`View ${brand.name} case study`}
                >
                  <div className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {brand.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
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
