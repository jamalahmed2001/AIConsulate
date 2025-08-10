import { NextSeo } from "next-seo";
import { Section } from "@/components/ui/Section";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTA } from "@/components/ui/CTA";

export default function ServicesPage() {
  const [activeService, setActiveService] = useState<number | null>(null);

  const services = [
    {
      title: "AI Strategy",
      description: "Clear roadmaps tied to business results, not hype.",
      features: [
        "Discovery workshops & stakeholder alignment",
        "Risk register & KPI definition",
        "Phased implementation roadmap",
        "ROI modeling & budget planning"
      ],
      icon: "🎯",
      color: "#3B82F6",
      overview: "We design pragmatic, staged plans that earn trust internally and deliver measurable value early.",
      technical: "Workshops, domain mapping, risk+governance, architecture options, KPI framework, adoption plan."
    },
    {
      title: "Intelligent Automation",
      description: "Reliable workflows that remove toil securely.",
      features: [
        "Event-driven orchestration",
        "Human-in-the-loop approvals",
        "SLOs & observability",
        "Failure recovery patterns"
      ],
      icon: "⚡",
      color: "#10B981",
      overview: "We eliminate toil in the critical path and make the system observable so ops stays boring.",
      technical: "Queues, retries, idempotency, compensations, HIL approvals, SLOs, structured logs and metrics."
    },
    {
      title: "AI Agents",
      description: "Focused assistants with guardrails and proof.",
      features: [
        "Toolformer-style actions",
        "Evaluator suites & red-teaming",
        "RBAC & policy enforcement",
        "Structured logging & monitoring"
      ],
      icon: "🤖",
      color: "#8B5CF6",
      overview: "Task-focused agents that are constrained, supervised, and measured—useful from day one.",
      technical: "Action toolsets, evaluator batteries, policy checks, prompt routing, memory strategies, RBAC, rate limiting."
    },
    {
      title: "System Integration",
      description: "Tight contracts. Clean data. Less risk.",
      features: [
        "Typed DTOs & schema versioning",
        "Circuit breakers & retries",
        "Dead letter queues",
        "End-to-end traceability"
      ],
      icon: "🔗",
      color: "#F59E0B",
      overview: "We connect systems with typed contracts and backpressure so the rest of your stack stays healthy.",
      technical: "Typed DTOs, schema versioning, signature verification, DLQs, circuit breakers, backoff, tracing hooks."
    },
    {
      title: "RAG & LLM Ops",
      description: "Context that scales with continuous evaluation.",
      features: [
        "Hybrid retrieval strategies",
        "Offline & online evaluations",
        "Cost & latency optimization",
        "Privacy & compliance controls"
      ],
      icon: "🧠",
      color: "#EF4444",
      overview: "We bring the right context to the model and prove accuracy with offline and online evals before rollout.",
      technical: "Chunking/indexing strategies, hybrid retrieval, rerankers, evaluator suites, caches, cost+latency budgets."
    },
    {
      title: "Team Enablement",
      description: "Playbooks that make adoption stick.",
      features: [
        "Usage policies & guidelines",
        "Internal workshops & training",
        "Incident response runbooks",
        "Change management support"
      ],
      icon: "👥",
      color: "#06B6D4",
      overview: "We equip teams with policy, training, and playbooks so usage scales safely without hand-holding.",
      technical: "Policies, playbooks, governance, rollout plans, workshops, office hours, change management."
    }
  ];

  return (
    <>
      <NextSeo
        title="Services — AI Consulate Advisory"
        description="Strategy, automation, and agentic systems delivered end-to-end, with evidence before scale."
        openGraph={{
          title: "Services — AI Consulate Advisory",
          description: "Strategy, automation, and agentic systems delivered end-to-end, with evidence before scale.",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <PageHeader
          title="Services"
          subtitle="Strategy, automation, and agentic systems delivered end-to-end, with evidence before scale."
          crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        />
        <Section className="bg-white">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, idx) => (
              <Reveal key={service.title} delayMs={idx * 100}>
                <ServiceCard 
                  service={service} 
                  onClick={() => setActiveService(idx)}
                />
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Additional section with process overview */}
        <Section 
          title="How we deliver"
          subtitle="Evidence before scale. Demos every week. No heroics required."
          className="bg-neutral-50"
        >
          <Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
                <h3 className="mb-2 text-lg font-semibold">Discovery first</h3>
                <p className="text-sm text-neutral-700">
                  We start with workshops to align on goals, risks, and success criteria. Clear brief with measurable outcomes before any code is written.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
                <h3 className="mb-2 text-lg font-semibold">Prove then scale</h3>
                <p className="text-sm text-neutral-700">
                  Build evaluator suites, run pilots against real tasks, measure accuracy/cost/latency. Evidence-based go/no-go decisions.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
                <h3 className="mb-2 text-lg font-semibold">Production ready</h3>
                <p className="text-sm text-neutral-700">
                  Comprehensive telemetry, incident playbooks, team training, and knowledge transfer for sustainable operations.
                </p>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* CTA Section */}
        <Section className="border-0 gradient-contrast-surface text-neutral-900 dark:text-neutral-100">
          <Reveal className="text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to discuss your AI roadmap?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-700 dark:text-neutral-300">
              Let&apos;s talk about your goals and how we can help you achieve them with measurable AI implementations.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <CTA href="/contact" size="lg" label="Start the conversation" />
              <CTA href="/case-studies" size="lg" tone="secondary" label="See case studies" />
            </div>
          </Reveal>
        </Section>
      </main>

      {/* Service Modal */}
      {activeService !== null && (
        <Modal
          open={true}
          onClose={() => setActiveService(null)}
          title={services[activeService]?.title ?? ""}
          overview={services[activeService]?.overview}
          technical={services[activeService]?.technical}
          features={services[activeService]?.features}
          icon={services[activeService]?.icon}
          color={services[activeService]?.color}
          primaryAction={{ label: "Get Started", href: "/contact" }}
        />
      )}
    </>
  );
}
