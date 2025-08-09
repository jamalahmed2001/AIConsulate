"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

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
      <Container className="py-28 text-center" >
        <div ref={containerRef}>
          <Reveal>
            <div className="border-brand-200 text-brand-700 mx-auto mb-4 w-fit rounded-full border bg-white/70 px-3 py-1 text-xs shadow-sm backdrop-blur">
              Trusted AI delivery for teams that ship
            </div>
          </Reveal>
          <Reveal delayMs={80}>
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight">
              Build with AI, ship outcomes.
            </h1>
          </Reveal>
          <Reveal delayMs={140}>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-700">
              Strategy, automation, and agentic systems—implemented securely and
              measured against business metrics.
            </p>
          </Reveal>
          <Reveal delayMs={220}>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/contact"
                className="bg-brand-700 hover:bg-brand-800 rounded-[var(--radius-md)] px-5 py-3 text-white shadow-[var(--shadow-soft)]"
              >
                Talk to us
              </Link>
              <Link
                href="/services"
                className="rounded-[var(--radius-md)] border border-neutral-300 bg-white px-5 py-3 text-neutral-900 shadow-[var(--shadow-soft)] hover:bg-neutral-50"
              >
                Explore services
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
