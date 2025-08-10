import Link from "next/link";
import { NextSeo } from "next-seo";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { getAllFrontmatters, type MDXFrontmatter } from "@/lib/mdx";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTA } from "@/components/ui/CTA";

type ExtendedCaseStudy = MDXFrontmatter & {
  industry?: string;
  challenge?: string;
  result?: string;
};

export async function getStaticProps() {
  const studies = getAllFrontmatters("case-studies");
  // Augment with requested brands if not present with enhanced metadata
  const requested = [
    {
      slug: "zvault",
      title: "ZVAULT",
      excerpt: "Secure knowledge retrieval at scale.",
      industry: "Financial Services",
      challenge: "Compliance & Security",
      result: "99.9% uptime, 50% faster queries",
      tags: ["RAG", "Security", "Compliance"]
    },
    {
      slug: "blastable",
      title: "BLASTable",
      excerpt: "High-throughput AI automation for ops.",
      industry: "Technology",
      challenge: "Manual Operations",
      result: "1,200 hours saved, 83% fewer errors",
      tags: ["Automation", "Operations", "Efficiency"]
    },
    {
      slug: "clutr",
      title: "CLUTR",
      excerpt: "Customer clustering and personalization with LLMs.",
      industry: "E-commerce",
      challenge: "Customer Segmentation",
      result: "40% increase in conversion rates",
      tags: ["Personalization", "ML", "Customer Analytics"]
    },
    {
      slug: "umbrella",
      title: "Umbrella",
      excerpt: "Enterprise rollout of agentic copilots.",
      industry: "Enterprise Software",
      challenge: "Developer Productivity",
      result: "3x faster development cycles",
      tags: ["AI Agents", "Developer Tools", "Enterprise"]
    },
  ];
  
  const existingSlugs = new Set(studies.map((s) => s.slug));
  const augmented = [
    ...studies.map((s: ExtendedCaseStudy) => ({
      ...s,
      industry: s.industry ?? "Technology",
      challenge: s.challenge ?? "AI Implementation",
      result: s.result ?? "Measurable improvement",
      tags: s.tags ?? ["AI", "Automation"]
    })),
    ...requested.filter((r) => !existingSlugs.has(r.slug)),
  ];
  return { props: { studies: augmented } };
}

export default function CaseStudiesIndex({
  studies,
}: {
  studies: Array<{
    slug: string;
    title: string;
    excerpt: string;
    industry: string;
    challenge: string;
    result: string;
    tags: string[];
  }>;
}) {
  return (
    <>
      <NextSeo
        title="Case Studies — AI Consulate Advisory"
        description="Real client outcomes: AI implementations that deliver measurable business results. Problem → Approach → Outcome."
        openGraph={{
          title: "Case Studies — AI Consulate Advisory",
          description: "Real client outcomes: AI implementations that deliver measurable business results.",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <PageHeader
          title="Case Studies"
          subtitle="Real client outcomes. Problem → Approach → Outcome."
          crumbs={[{ label: "Home", href: "/" }, { label: "Case Studies" }]}
        />
        <Section className="bg-white">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center mb-12">
              <p className="text-lg text-neutral-700 leading-relaxed">
                Every engagement focuses on measurable business impact. Here&apos;s how we&apos;ve helped clients 
                achieve their AI goals with evidence-based implementations.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {studies.map((study, idx) => (
              <Reveal key={study.slug} delayMs={idx * 100}>
                <Link href={`/case-studies/${study.slug}`}>
                  <div className="group rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:scale-[1.02] hover:shadow-xl">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold text-neutral-900 group-hover:text-brand-700 transition-colors">
                          {study.title}
                        </h3>
                        <span className="text-xs bg-neutral-100 px-2 py-1 rounded-[var(--radius-sm)] text-neutral-600">
                          {study.industry}
                        </span>
                      </div>
                      <p className="text-neutral-700 mt-2">{study.excerpt}</p>
                    </div>

                    {/* Challenge & Result */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Challenge</span>
                        <p className="text-sm text-neutral-600 mt-1">{study.challenge}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Result</span>
                        <p className="text-sm font-medium text-neutral-900 mt-1">{study.result}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {study.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-[var(--radius-sm)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Read More Arrow */}
                    <div className="flex items-center text-sm font-medium text-brand-600 group-hover:text-brand-700">
                      Read full case study
                      <svg
                        className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Results Summary */}
        <Section 
          title="By the numbers"
          subtitle="Measurable outcomes across our client engagements."
          className="bg-neutral-50"
        >
          <Reveal>
            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">4,800+</div>
                <div className="text-sm font-medium">Hours Saved</div>
                <div className="text-xs text-neutral-600">Per quarter across clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">78%</div>
                <div className="text-sm font-medium">Average Improvement</div>
                <div className="text-xs text-neutral-600">In target metrics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">99.9%</div>
                <div className="text-sm font-medium">System Uptime</div>
                <div className="text-xs text-neutral-600">Production deployments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">6 weeks</div>
                <div className="text-sm font-medium">Average to Production</div>
                <div className="text-xs text-neutral-600">From project start</div>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* CTA Section */}
        <Section className="border-0 gradient-contrast-surface text-neutral-900 dark:text-neutral-100">
          <Reveal className="text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to create your own success story?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-700 dark:text-neutral-300">
              Every case study started with a conversation about business goals and technical challenges.
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
