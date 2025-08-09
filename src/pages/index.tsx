import Link from "next/link";
import { NextSeo, OrganizationJsonLd } from "next-seo";
import { Hero } from "@/components/layout/Hero";
import { Section } from "@/components/ui/Section";
import { LogoCloud } from "@/components/ui/LogoCloud";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ProcessTimeline } from "@/components/ui/ProcessTimeline";
import { TestimonialSlider } from "@/components/ui/TestimonialSlider";
import { EnhancedPricingTable } from "@/components/ui/EnhancedPricingTable";
import { Reveal } from "@/components/ui/Reveal";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";

export default function Home() {
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
      color: "#3B82F6"
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
      color: "#10B981"
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
      color: "#8B5CF6"
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
      color: "#F59E0B"
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
      color: "#EF4444"
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
      color: "#06B6D4"
    }
  ];

  const processSteps = [
              {
                title: "Discover",
                description: "Get crisp on goals, risks, and constraints.",
      details: "Discovery workshops, domain mapping, stakeholder interviews, risk assessment, and initial KPI definition. We deliver a clear brief with success criteria and measurable outcomes.",
      duration: "1-2 weeks",
      icon: "🔍"
              },
              {
                title: "Design",
      description: "Architecture and rollout plan that will age well.",
      details: "System architecture, data contracts, integration patterns, security model, and phased implementation plan. Everything documented for long-term maintainability.",
      duration: "2-3 weeks",
      icon: "📐"
              },
              {
                title: "Prove",
                description: "De-risk with evidence before scale.",
      details: "Build evaluator suites, run pilots against real tasks, measure accuracy/cost/latency, and establish go/no-go criteria with clear success metrics.",
      duration: "3-4 weeks",
      icon: "🧪"
              },
              {
                title: "Implement",
                description: "Ship fast without drama.",
      details: "Short development cycles with weekly demos, comprehensive telemetry, structured logging, and steady progress toward production readiness.",
      duration: "4-8 weeks",
      icon: "🚀"
              },
              {
                title: "Scale",
                description: "Harden and enable the org.",
      details: "Production hardening, SLA/SLO definition, incident playbooks, team training, and knowledge transfer to ensure sustainable operations.",
      duration: "2-4 weeks",
      icon: "📈"
    }
  ];

  const testimonials = [
    {
      quote: "AI Consulate delivered exactly what they promised. No fluff, just results. Our inbound response time dropped by 78% in the first month.",
      author: "Sarah Chen",
      role: "VP of Operations",
      company: "TechFlow",
      metric: "78% faster response time"
    },
    {
      quote: "Finally, an AI partner that understands production systems. They built guardrails that actually work and gave us confidence to scale.",
      author: "Marcus Rodriguez",
      role: "CTO",
      company: "DataCore",
      metric: "Zero AI incidents in 6 months"
    },
    {
      quote: "The ROI was immediate. We saved 1,200 hours per quarter on back-office work, and the team loves the new automation workflows.",
      author: "Lisa Park",
      role: "Head of Finance",
      company: "ScaleUp",
      metric: "1,200 hours saved/quarter"
    }
  ];

  const stats = [
    { value: "78%", label: "Average response time improvement", animate: true },
    { value: "1200", label: "Hours saved per quarter", animate: true, suffix: "+" },
    { value: "99.9%", label: "Uptime across all deployments", animate: true },
    { value: "6", label: "Week average to production", animate: true }
  ];

  const pricingPlans = [
    {
      name: "Discovery",
      price: "$8k",
      period: "2 weeks",
      description: "Perfect for getting started with a clear AI strategy",
      features: [
        "Stakeholder workshops & alignment",
        "Risk assessment & KPI definition", 
        "Initial architecture & roadmap",
        "ROI modeling & budget planning",
        "Governance framework setup"
      ],
      cta: "Start Discovery",
      ctaHref: "/contact?plan=discovery"
    },
    {
      name: "Accelerator", 
      price: "$28k",
      period: "4-6 weeks",
      description: "Build and validate your first AI automation or agent",
      features: [
        "Targeted automation or agent MVP",
        "Evaluator suites & guardrails",
        "Pilot deployment with real data",
        "Go/no-go criteria & metrics",
        "Production readiness assessment"
      ],
      highlight: true,
      popular: true,
      cta: "Get Started",
      ctaHref: "/contact?plan=accelerator"
    },
    {
      name: "Partnership",
      price: "From $12k",
      period: "per month",
      description: "Ongoing AI delivery across multiple workstreams",
      features: [
        "Retained delivery team",
        "SLAs, training & enablement",
        "Continuous evaluation & optimization",
        "Multi-project coordination",
        "24/7 incident response"
      ],
      cta: "Let's Talk",
      ctaHref: "/contact?plan=partnership"
    }
  ];

  return (
    <>
      <NextSeo
        title="Ship AI that works"
        description="Strategy, automation, and agentic systems that move real metrics. We design, build, and scale AI safely with measurable outcomes."
        openGraph={{
          title: "Ship AI that works",
          description:
            "Strategy, automation, and agentic systems that move real metrics. We design, build, and scale AI safely with measurable outcomes.",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <Hero />

        {/* Social Proof */}
        <Section className="border-t bg-white">
          <Reveal>
            <LogoCloud />
          </Reveal>
        </Section>

        {/* Stats */}
        <Section className="bg-neutral-50">
          <Reveal>
            <StatsGrid stats={stats} />
          </Reveal>
        </Section>

        {/* Services */}
        <Section 
          title="What we do" 
          subtitle="AI that integrates seamlessly with your existing systems and processes."
          className="bg-white"
        >
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

        {/* Process Timeline */}
        <Section 
          title="How we work" 
          subtitle="Evidence before scale. Demos every week. No heroics required."
          className="bg-white"
        >
          <ProcessTimeline steps={processSteps} />
        </Section>

        {/* Testimonials */}
        <Section 
          title="Results that matter"
          subtitle="Real problems solved. Measurable outcomes delivered."
          className="bg-neutral-50"
        >
          <TestimonialSlider testimonials={testimonials} />
        </Section>

        {/* Pricing */}
        <Section
          title="Simple, transparent pricing"
          subtitle="Choose the engagement that matches where you are in your AI journey."
          className="bg-white"
        >
          <Reveal className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-sm text-neutral-700">
              Every engagement includes a clear definition of success, a crisp risk register, and weekly demos. We measure accuracy, latency, and cost so you have evidence before you scale.
            </p>
          </Reveal>
          <EnhancedPricingTable plans={pricingPlans} />

          {/* What's included */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
              <h3 className="mb-2 text-lg font-semibold">What’s included</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• Dedicated lead with weekly demos</li>
                <li>• Clear interfaces and typed contracts</li>
                <li>• Security, privacy, and compliance review</li>
                <li>• Observability and evaluator suites</li>
                <li>• Documentation and handover</li>
              </ul>
            </div>
            <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
              <h3 className="mb-2 text-lg font-semibold">Guarantees</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• No lock‑in: your code, your infra</li>
                <li>• Fixed scope or we pause and realign</li>
                <li>• Plain‑English dashboards and metrics</li>
                <li>• No surprise fees</li>
              </ul>
            </div>
            <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
              <h3 className="mb-2 text-lg font-semibold">Common questions</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li><strong>Security?</strong> We align with your policies and least‑privilege by default.</li>
                <li><strong>Data?</strong> We keep PII mapped, masked, and versioned across systems.</li>
                <li><strong>Timeline?</strong> First demo in week one; measurable pilot by week four.</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Final CTA */}
        <Section className="bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
          <Reveal className="text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to ship AI that actually works?
          </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-brand-100">
              No lengthy sales cycles. No vague promises. Just a conversation about your goals and how we can help you achieve them.
          </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
                className="rounded-[var(--radius-md)] bg-white px-8 py-4 text-lg font-semibold text-brand-700 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            Start the conversation
          </Link>
              <Link
                href="/case-studies"
                className="rounded-[var(--radius-md)] border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10"
              >
                See case studies
              </Link>
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
          overview={services[activeService]?.description}
          technical={`Our approach to ${services[activeService]?.title.toLowerCase()} focuses on: ${services[activeService]?.features.join(", ")}`}
          features={services[activeService]?.features}
          icon={services[activeService]?.icon}
          color={services[activeService]?.color}
          primaryAction={{ label: "Get Started", href: "/contact" }}
        />
      )}

      <OrganizationJsonLd
        type="Organization"
        id="https://your-agency.example/#organization"
        name="AI Consulate Advisory"
        url="https://your-agency.example"
        sameAs={[]}
        slogan="Build with AI, ship outcomes."
      />
    </>
  );
}
