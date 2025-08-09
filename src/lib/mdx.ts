import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";

export type MDXFrontmatter = {
  title: string;
  slug: string;
  excerpt?: string;
  date?: string;
  tags?: string[];
  ogImage?: string;
};

export type MDXPost = {
  frontmatter: MDXFrontmatter;
  content: string;
};

const contentDir = path.join(process.cwd(), "content");

export function getAllSlugs(dir: "case-studies"): string[] {
  const full = path.join(contentDir, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(
  dir: "case-studies",
  slug: string,
): MDXPost | null {
  const full = path.join(contentDir, dir, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const file = fs.readFileSync(full, "utf8");
  const { data, content } = matter(file);
  const fm = data as Partial<MDXFrontmatter>;
  fm.title ??= slug;
  fm.slug ??= slug;
  if (fm.date && typeof fm.date !== "string") {
    try {
      const d = new Date(fm.date as unknown as string);
      fm.date = Number.isNaN(d.valueOf()) ? undefined : d.toISOString();
    } catch {
      fm.date = undefined;
    }
  }
  return { frontmatter: fm as MDXFrontmatter, content };
}

export async function serializeMdx(source: string) {
  return serialize(source, {
    mdxOptions: {
      development: process.env.NODE_ENV !== "production",
    },
  });
}

export function getAllFrontmatters(
  dir: "case-studies",
): MDXFrontmatter[] {
  return getAllSlugs(dir)
    .map((slug) => getPostBySlug(dir, slug))
    .filter(Boolean)
    .map((p) => p!.frontmatter)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
