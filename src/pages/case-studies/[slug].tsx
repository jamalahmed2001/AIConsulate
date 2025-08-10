import { NextSeo } from "next-seo";
import Script from "next/script";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTA } from "@/components/ui/CTA";
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
        <PageHeader
          title={frontmatter.title}
          subtitle={frontmatter.excerpt ?? undefined}
          crumbs={[{ label: "Home", href: "/" }, { label: "Case Studies", href: "/case-studies" }, { label: "Case" }]}
          align="left"
        />

        {/* Content */}
        <Section tone="surface">
          <Reveal>
            <div className="max-w-4xl">
              <Prose>
                <MDXRemote {...mdxSource} />
              </Prose>
            </div>
          </Reveal>
        </Section>

        {/* Related Actions */}
        <Section tone="muted">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Interested in similar results?</h2>
              <p className="text-neutral-700 mb-6">
                Every case study started with understanding the specific business challenge and technical requirements.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <CTA href="/contact" size="lg" label="Discuss your project" />
                <CTA href="/case-studies" size="lg" tone="secondary" label="View more case studies" />
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
