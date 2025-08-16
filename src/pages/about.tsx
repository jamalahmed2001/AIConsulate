import { NextSeo } from "next-seo";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTA } from "@/components/ui/CTA";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  const principles = [
    {
      title: "Outcomes first",
      description: "Evidence over theater.",
      details: "We value clarity, reliability, and measured progress. If it doesn't move a metric, we don't ship it.",
      icon: "📊"
    },
    {
      title: "Production ready",
      description: "Systems that work on Monday morning.",
      details: "Agents, automations, retrieval, and systems integration—with the guardrails that enterprises expect.",
      icon: "🛡️"
    },
    {
      title: "Calm delivery",
      description: "Steady results, no heroics.",
      details: "We don't do heroics. We do well-run software projects that compound over time.",
      icon: "🎯"
    }
  ];

  const expertise = [
    {
      area: "AI Strategy & Governance",
      description: "Risk assessment, compliance frameworks, ROI modeling, and adoption roadmaps that align with business objectives."
    },
    {
      area: "Intelligent Automation",
      description: "Event-driven workflows with human-in-the-loop approvals, SLOs, and comprehensive observability."
    },
    {
      area: "Agentic Systems",
      description: "Task-focused AI agents with proper guardrails, evaluator suites, and policy enforcement."
    },
    {
      area: "RAG & LLM Operations",
      description: "Production-grade retrieval systems with hybrid strategies, continuous evaluation, and cost optimization."
    },
    {
      area: "Systems Integration",
      description: "Typed contracts, circuit breakers, dead letter queues, and end-to-end traceability across systems."
    },
    {
      area: "Team Enablement",
      description: "Training, playbooks, incident response, and change management to ensure sustainable adoption."
    }
  ];

  const stats = [
    { value: "10+", label: "Years combined AI/ML experience", animate: true },
    { value: "50+", label: "Production AI systems delivered", animate: true },
    { value: "99.9%", label: "Uptime across deployments", animate: true },
    { value: "6", label: "Week average to production", animate: true }
  ];

  return (
    <>
      <NextSeo
        title="About — AI Consulate Advisory"
        description="We design and ship AI that stands up to production and scrutiny. Outcomes first, evidence over theater."
        openGraph={{
          title: "About — AI Consulate Advisory",
          description: "We design and ship AI that stands up to production and scrutiny. Outcomes first, evidence over theater.",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <PageHeader
          title="About"
          subtitle="We design and ship AI that stands up to production and scrutiny."
          crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        />
        <Section tone="surface">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center mb-12">
              <p className="text-lg text-muted leading-relaxed">
                We&apos;re a team of experienced AI practitioners who&apos;ve learned that the real challenge isn&apos;t building AI—it&apos;s building AI that works reliably in production, integrates cleanly with existing systems, and delivers measurable business value.
              </p>
            </div>
          </Reveal>

          {/* Principles */}
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {principles.map((principle, idx) => (
              <Reveal key={principle.title} delayMs={idx * 100}>
                <Card className="text-center">
                  <div className="text-4xl mb-4">{principle.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{principle.title}</h3>
                  <p className="text-brand-600 font-medium mb-3">{principle.description}</p>
                  <p className="text-sm text-muted">{principle.details}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Stats */}
        <Section tone="muted">
          <Reveal>
            <StatsGrid stats={stats} />
          </Reveal>
        </Section>

        {/* Expertise */}
        <Section 
          title="Our expertise"
          subtitle="Deep experience across the AI stack, from strategy to production operations."
          tone="surface"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {expertise.map((item, idx) => (
              <Reveal key={item.area} delayMs={idx * 100}>
                <Card>
                  <h3 className="text-lg font-semibold mb-3">{item.area}</h3>
                  <p className="text-sm text-neutral-700">{item.description}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* How we work */}
        <Section 
          title="How we work"
          subtitle="Disciplined process, transparent communication, measurable outcomes."
          tone="muted"
        >
          <Reveal>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold mb-4">Our process</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600 font-bold">1.</span>
                    <div>
                      <strong>Discovery:</strong> Workshops, stakeholder alignment, risk assessment, and clear success criteria.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600 font-bold">2.</span>
                    <div>
                      <strong>Design:</strong> Architecture planning, integration patterns, security model, and phased rollout.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600 font-bold">3.</span>
                    <div>
                      <strong>Prove:</strong> Build evaluators, run pilots, measure performance, establish go/no-go criteria.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600 font-bold">4.</span>
                    <div>
                      <strong>Implement:</strong> Short cycles, weekly demos, comprehensive telemetry, production readiness.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600 font-bold">5.</span>
                    <div>
                      <strong>Scale:</strong> Hardening, SLA definition, incident playbooks, team training, knowledge transfer.
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">What sets us apart</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600">✓</span>
                    <div>
                      <strong>Production focus:</strong> We build for Monday morning, not demo day.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600">✓</span>
                    <div>
                      <strong>Evidence-based:</strong> Evaluator suites, A/B tests, and measurable KPIs drive decisions.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600">✓</span>
                    <div>
                      <strong>Security first:</strong> RBAC, audit trails, and compliance built in from day one.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600">✓</span>
                    <div>
                      <strong>Team enablement:</strong> We leave you with knowledge, not dependencies.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-600">✓</span>
                    <div>
                      <strong>Transparent delivery:</strong> Weekly demos, decision logs, and clear communication.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* CTA Section */}
        <Section tone="contrast" className="text-neutral-900 dark:text-neutral-100">
          <Reveal className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-gradient-brand">
              Ready to work with experienced AI practitioners?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-700 dark:text-neutral-300">
              Let&apos;s discuss your AI goals and how our disciplined approach can help you achieve them safely and effectively.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <CTA href="/contact" size="lg" label="Start the conversation" />
              <CTA href="/services" size="lg" tone="secondary" label="Explore our services" />
            </div>
          </Reveal>
        </Section>
      </main>
    </>
  );
}
