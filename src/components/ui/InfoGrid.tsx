"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Reveal } from "@/components/ui/Reveal";

export type InfoItem = {
  title: string;
  description: string;
  overview: string;
  technical: string;
};

export function InfoGrid({ items }: { items: InfoItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const active = typeof openIndex === "number" ? items[openIndex] : null;
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s, i) => (
          <Reveal key={s.title} delayMs={i * 80}>
            <button onClick={() => setOpenIndex(i)} className="text-left">
              <Card className="transition hover:-translate-y-0.5">
                <h3 className="mb-2 text-xl font-semibold">{s.title}</h3>
                <p className="text-sm text-neutral-700">{s.description}</p>
              </Card>
            </button>
          </Reveal>
        ))}
      </div>
      <Modal
        open={active != null}
        onClose={() => setOpenIndex(null)}
        title={active?.title ?? ""}
        overview={active?.overview}
        technical={active?.technical}
        primaryAction={{ label: "Talk to us", href: "/contact" }}
      />
    </>
  );
}
