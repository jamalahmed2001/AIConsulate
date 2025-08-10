import { NextSeo } from "next-seo";
import { Section } from "@/components/ui/Section";
import { EnhancedPricingTable } from "@/components/ui/EnhancedPricingTable";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTA } from "@/components/ui/CTA";
import { Card } from "@/components/ui/Card";

export default function PricingPage() {
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
        title="Pricing — AI Consulate Advisory"
        description="Transparent pricing models. Value over hours. Start where it makes sense for your organization."
        openGraph={{
          title: "Pricing — AI Consulate Advisory",
          description: "Transparent pricing models. Value over hours. Start where it makes sense for your organization.",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <PageHeader
          title="Pricing"
          subtitle="Transparent models. Value over hours. Start where it makes sense."
          crumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
        />
        <Section tone="surface">
          <Reveal className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-sm text-neutral-700">
              Every engagement includes a clear definition of success, a crisp risk register, and weekly demos. We measure accuracy, latency, and cost so you have evidence before you scale.
            </p>
          </Reveal>
          <EnhancedPricingTable plans={pricingPlans} />

          {/* What's included */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card>
              <h3 className="mb-2 text-lg font-semibold">What&apos;s included</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• Dedicated lead with weekly demos</li>
                <li>• Clear interfaces and typed contracts</li>
                <li>• Security, privacy, and compliance review</li>
                <li>• Observability and evaluator suites</li>
                <li>• Documentation and handover</li>
              </ul>
            </Card>
            <Card>
              <h3 className="mb-2 text-lg font-semibold">Guarantees</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• No lock‑in: your code, your infra</li>
                <li>• Fixed scope or we pause and realign</li>
                <li>• Plain‑English dashboards and metrics</li>
                <li>• No surprise fees</li>
              </ul>
            </Card>
            <Card>
              <h3 className="mb-2 text-lg font-semibold">Common questions</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li><strong>Security?</strong> We align with your policies and least‑privilege by default.</li>
                <li><strong>Data?</strong> We keep PII mapped, masked, and versioned across systems.</li>
                <li><strong>Timeline?</strong> First demo in week one; measurable pilot by week four.</li>
              </ul>
            </Card>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section 
          title="Frequently asked questions"
          subtitle="Clear answers to help you make the right decision."
          tone="muted"
        >
          <Reveal>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing & Engagement</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">How do you price projects?</h4>
                    <p className="text-sm text-neutral-700">
                      We use fixed-scope pricing for pilots and discovery work, and monthly retainers for ongoing partnerships. No hourly billing—we optimize for value, not time.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">What if scope changes during the project?</h4>
                    <p className="text-sm text-neutral-700">
                      We pause the work and realign on scope, timeline, and budget before continuing. No surprise bills or scope creep.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Do you work with existing contracts/MSAs?</h4>
                    <p className="text-sm text-neutral-700">
                      Yes. We can work under your existing master service agreements or preferred contractor arrangements.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Process & Delivery</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">How quickly can we start?</h4>
                    <p className="text-sm text-neutral-700">
                      Typically 1-2 weeks from signed agreement to kickoff. We always start with discovery workshops before any development work.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">What does success look like?</h4>
                    <p className="text-sm text-neutral-700">
                      We define clear, measurable success criteria upfront. For pilots, it&apos;s typically accuracy metrics, cost targets, and user adoption thresholds.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Do you provide ongoing support?</h4>
                    <p className="text-sm text-neutral-700">
                      Yes. All projects include training and documentation. Partnership engagements include ongoing optimization and 24/7 incident response.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* CTA Section */}
        <Section tone="contrast" className="text-neutral-900 dark:text-neutral-100">
          <Reveal className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-gradient-brand">
              Ready to discuss pricing for your project?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-700 dark:text-neutral-300">
              Every project is different. Let&apos;s talk about your specific needs and find the right engagement model.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <CTA href="/contact" size="lg" label="Get custom pricing" />
              <CTA href="/case-studies" size="lg" tone="secondary" label="See case studies" />
            </div>
          </Reveal>
        </Section>
      </main>
    </>
  );
}
