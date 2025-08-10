import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

type Crumb = { label: string; href?: string };

export function PageHeader({
  title,
  subtitle,
  crumbs = [],
  align = "center",
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  align?: "left" | "center";
}) {
  return (
    <section className="relative border-b bg-white">
      <Container className="py-14">
        <Reveal>
          {crumbs.length > 0 && (
            <nav className="mb-3 text-xs text-neutral-500" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1">
                {crumbs.map((c, i) => (
                  <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                    {c.href ? (
                      <Link href={c.href} className="hover:text-neutral-700">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-neutral-700">{c.label}</span>
                    )}
                    {i < crumbs.length - 1 && <span className="text-neutral-400">/</span>}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className={align === "center" ? "text-center" : "text-left"}>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mx-auto mt-3 max-w-2xl text-neutral-700">
                {subtitle}
              </p>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}


