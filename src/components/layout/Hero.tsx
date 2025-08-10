"use client";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";

export function Hero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const progress = Math.min(Math.max(0, -rect.top / Math.max(1, rect.height)), 1);
      setOffset(progress);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const translate = `translate3d(0, ${Math.round(offset * 30)}px, 0)`;
  const blur = `blur(${Math.round(offset * 6)}px)`;

  return (
    <section className="bg-hero relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(800px 300px at 50% -50%, rgba(var(--brand-200-rgb), 0.25), transparent 60%)",
          transform: translate,
          filter: blur,
          transition: "transform 100ms linear, filter 100ms linear",
        }}
      />
      <Container className="py-32 text-center" >
        <div ref={containerRef}>
          <Reveal>
            <div className="mx-auto mb-4 w-fit rounded-full glass px-3 py-1 text-xs shadow-sm text-neutral-700 dark:text-neutral-200">
              Trusted AI delivery for teams that ship
            </div>
          </Reveal>
          <Reveal delayMs={80}>
            <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Build with AI, ship outcomes.
            </h1>
          </Reveal>
          <Reveal delayMs={140}>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
              Strategy, automation, and agentic systems—implemented securely and
              measured against business metrics.
            </p>
          </Reveal>
          <Reveal delayMs={220}>
            <div className="flex items-center justify-center gap-4">
              <CTA href="/contact" size="lg" tone="primary" label="Talk to us" />
              <CTA href="/services" size="lg" tone="secondary" label="Explore services" />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
