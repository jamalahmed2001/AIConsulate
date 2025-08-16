import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

type Crumb = { label: string; href?: string };

export function PageHeader({
  title,
  subtitle,
  crumbs = [],
  align = "center",
  tone = "surface",
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  align?: "left" | "center";
  tone?: "surface" | "muted" | "contrast" | "transparent";
}) {
  const toneClass =
    tone === "surface"
      ? "border-b border-border bg-surface"
      : tone === "muted"
      ? "border-b border-border bg-surface-2"
      : tone === "contrast"
      ? "border-0 gradient-contrast-surface"
      : "border-0 bg-transparent";
  return (
    <section className={`relative ${toneClass}`}>
      <Container className="py-14">
        <Reveal>
          {crumbs.length > 0 && (
            <nav className="mb-3 text-xs text-muted" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1">
                {crumbs.map((c, i) => (
                  <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                    {c.href ? (
                      <Link href={c.href} className="hover:text-fg">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-fg">{c.label}</span>
                    )}
                    {i < crumbs.length - 1 && <span className="text-muted-2">/</span>}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className={align === "center" ? "text-center" : "text-left"}>
            <h1 className="text-4xl font-bold tracking-tight text-fg md:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mx-auto mt-3 max-w-2xl text-muted">
                {subtitle}
              </p>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}


