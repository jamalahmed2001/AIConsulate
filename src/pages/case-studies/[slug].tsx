import Link from "next/link";
import { NextSeo } from "next-seo";
import Script from "next/script";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { Reveal } from "@/components/ui/Reveal";
import {
  getAllSlugs,
  getPostBySlug,
  serializeMdx,
  type MDXFrontmatter,
} from "@/lib/mdx";

export async function getStaticPaths() {
  const slugs = getAllSlugs("case-studies");
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = getPostBySlug("case-studies", params.slug);
  if (!post) return { notFound: true };
  const mdxSource = await serializeMdx(post.content);
  return { props: { frontmatter: post.frontmatter, mdxSource } };
}

export default function CaseStudy({
  frontmatter,
  mdxSource,
}: {
  frontmatter: MDXFrontmatter;
  mdxSource: MDXRemoteSerializeResult;
}) {
  return (
    <>
      <NextSeo
        title={`${frontmatter.title} — Case Study`}
        description={frontmatter.excerpt ?? `Case study: ${frontmatter.title}`}
        openGraph={{
          title: `${frontmatter.title} — Case Study`,
          description: frontmatter.excerpt ?? `Case study: ${frontmatter.title}`,
          type: "article",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <Section className="bg-white border-b">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <Link 
                href="/case-studies"
                className="inline-flex items-center text-sm text-neutral-600 hover:text-brand-600 transition-colors"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                Back to Case Studies
              </Link>
            </div>
            
            <div className="max-w-4xl">
              <h1 className="text-4xl font-bold mb-4 md:text-5xl">{frontmatter.title}</h1>
              {frontmatter.excerpt && (
                <p className="text-xl text-neutral-700 leading-relaxed">
                  {frontmatter.excerpt}
                </p>
              )}
              {frontmatter.date && (
                <div className="mt-6 text-sm text-neutral-500">
                  Published {new Date(frontmatter.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </div>
              )}
            </div>
          </Reveal>
        </Section>

        {/* Content */}
        <Section className="bg-white">
          <Reveal>
            <div className="max-w-4xl">
              <Prose>
                <MDXRemote {...mdxSource} />
              </Prose>
            </div>
          </Reveal>
        </Section>

        {/* Related Actions */}
        <Section className="bg-neutral-50">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Interested in similar results?</h2>
              <p className="text-neutral-700 mb-6">
                Every case study started with understanding the specific business challenge and technical requirements.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/contact"
                  className="rounded-[var(--radius-md)] bg-brand-700 px-6 py-3 text-white font-semibold hover:bg-brand-800 transition-colors"
                >
                  Discuss your project
                </Link>
                <Link
                  href="/case-studies"
                  className="rounded-[var(--radius-md)] border border-brand-700 px-6 py-3 text-brand-700 font-semibold hover:bg-brand-50 transition-colors"
                >
                  View more case studies
                </Link>
              </div>
            </div>
          </Reveal>
        </Section>
      </main>

      <Script
        id="ld-case-study"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            headline: frontmatter.title,
            datePublished: frontmatter.date,
            image: frontmatter.ogImage ?? undefined,
          }),
        }}
      />
    </>
  );
}
