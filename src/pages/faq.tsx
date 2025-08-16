import { NextSeo, FAQPageJsonLd } from "next-seo";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTA } from "@/components/ui/CTA";

export default function FAQPage() {
  const faqSections = [
    {
      title: "Getting Started",
      faqs: [
        {
          q: "How do we start?",
          a: "We begin with a discovery workshop to align on goals, risks, and success criteria. Then we run a targeted pilot to prove value before scaling."
        },
        {
          q: "How quickly can we get started?",
          a: "Typically 1-2 weeks from signed agreement to kickoff. We always start with discovery workshops before any development work begins."
        },
        {
          q: "What do you need from us to begin?",
          a: "Access to key stakeholders for discovery workshops, sample data for testing, and alignment on success criteria. We handle the rest."
        },
        {
          q: "Do you work with our existing team?",
          a: "Yes. We enable your team rather than replace them. Every engagement includes knowledge transfer, training, and documentation so capabilities stick."
        }
      ]
    },
    {
      title: "Pricing & Contracts",
      faqs: [
        {
          q: "How do you price your services?",
          a: "Transparent fixed-scope pricing for pilots and discovery work. Monthly retainers for ongoing partnerships. We optimize for value delivered, not hours worked."
        },
        {
          q: "What if scope changes during the project?",
          a: "We pause the work and realign on scope, timeline, and budget before continuing. No surprise bills or scope creep—ever."
        },
        {
          q: "Do you work with existing contracts or MSAs?",
          a: "Yes. We can work under your existing master service agreements or preferred contractor arrangements to simplify procurement."
        },
        {
          q: "What's your payment structure?",
          a: "50% upfront for pilots, monthly billing for partnerships. Net 30 terms standard. We're flexible on enterprise arrangements."
        }
      ]
    },
    {
      title: "Security & Compliance",
      faqs: [
        {
          q: "How do you handle security requirements?",
          a: "We align with your security policies and implement least-privilege access by default. SOC compliance, security reviews, and audit trails available."
        },
        {
          q: "What about data privacy and compliance?",
          a: "We keep PII mapped, masked, and versioned across systems. GDPR, CCPA, and HIPAA compliance built into our standard practices."
        },
        {
          q: "Can you work in our environment?",
          a: "Yes. We can work within your VPN, use your approved tools, and follow your development practices. Security first, delivery second."
        },
        {
          q: "What about intellectual property?",
          a: "Your code, your infrastructure, your IP. We don't retain rights to work product—everything transfers to you upon completion."
        }
      ]
    },
    {
      title: "Delivery & Process",
      faqs: [
        {
          q: "What makes you different from other AI consultants?",
          a: "Calm, measurable delivery. Strong interfaces. Evidence before scale. We build production systems, not proof-of-concepts."
        },
        {
          q: "How do you measure success?",
          a: "Clear, measurable KPIs defined upfront. For pilots: accuracy metrics, cost targets, and user adoption. For partnerships: business impact and system reliability."
        },
        {
          q: "What if the project doesn't work out?",
          a: "We define go/no-go criteria with evidence thresholds. If targets aren't met, we help you understand why and recommend next steps. No hard feelings."
        },
        {
          q: "Do you provide ongoing support?",
          a: "All projects include training and documentation. Partnership engagements include ongoing optimization, monitoring, and 24/7 incident response."
        }
      ]
    }
  ];

  return (
    <>
      <NextSeo
        title="FAQ — AI Consulate Advisory"
        description="Frequently asked questions about our AI consulting services. Straight answers to help you decide quickly."
        openGraph={{
          title: "FAQ — AI Consulate Advisory",
          description: "Frequently asked questions about our AI consulting services. Straight answers to help you decide quickly.",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <PageHeader
          title="Frequently Asked Questions"
          subtitle="Straight answers so you can decide quickly."
          crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
        />
        <Section tone="surface">
          <Reveal>
            <div className="mx-auto max-w-4xl">
              {faqSections.map((section, sectionIdx) => (
                <div key={section.title} className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-center">{section.title}</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {section.faqs.map((faq, idx) => (
                      <Reveal key={faq.q} delayMs={(sectionIdx * 4 + idx) * 100}>
                        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
                          <h3 className="font-semibold mb-3 text-brand-700">{faq.q}</h3>
                          <p className="text-sm text-muted">{faq.a}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </Section>

        {/* Still have questions section */}
        <Section tone="muted">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-neutral-700 mb-6">
                Every organization has unique requirements. We&apos;re happy to discuss your specific situation and how we can help.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <CTA href="/contact" size="lg" label="Contact us" />
                <CTA href="/case-studies" size="lg" tone="secondary" label="See our work" />
              </div>
            </div>
          </Reveal>
        </Section>

        {/* Quick reference */}
        <Section 
          title="Quick reference"
          subtitle="Key facts about working with us."
          tone="surface"
        >
          <Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">1-2 weeks</div>
                <div className="text-sm font-medium mb-1">Time to kickoff</div>
                <div className="text-xs text-neutral-600">From signed agreement to first workshop</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">4-6 weeks</div>
                <div className="text-sm font-medium mb-1">Typical pilot duration</div>
                <div className="text-xs text-neutral-600">MVP with real data and measurable results</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">99.9%</div>
                <div className="text-sm font-medium mb-1">Production uptime</div>
                <div className="text-xs text-neutral-600">Across all deployed systems</div>
              </div>
            </div>
          </Reveal>
        </Section>
      </main>
      <FAQPageJsonLd
        mainEntity={faqSections.flatMap((section) =>
          section.faqs.map((f) => ({ questionName: f.q, acceptedAnswerText: f.a }))
        )}
      />
    </>
  );
}
