import type { PropsWithChildren, ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

type SectionProps = PropsWithChildren<{
  title?: string | ReactNode;
  subtitle?: string;
  className?: string;
  containerClassName?: string;
  id?: string;
  tone?: "surface" | "muted" | "contrast" | "transparent";
}>;

export function Section({
  title,
  subtitle,
  className = "",
  containerClassName = "",
  id,
  tone = "surface",
  children,
}: SectionProps) {
  const toneClass =
    tone === "surface"
      ? "border-t border-border bg-surface"
      : tone === "muted"
      ? "border-t border-border bg-surface-2"
      : tone === "contrast"
      ? "border-0 gradient-contrast-surface"
      : "border-0 bg-transparent";
  return (
    <section id={id} className={`${toneClass} ${className}`}>
      <Container className={`py-20 ${containerClassName}`}>
        {(title ?? subtitle) && (
          <Reveal className="mb-8 text-center">
            {typeof title === "string" ? (
              <h2 className="text-3xl font-bold tracking-tight text-fg">{title}</h2>
            ) : (
              title
            )}
            {subtitle && (
              <p className="mx-auto mt-2 max-w-2xl text-muted">
                {subtitle}
              </p>
            )}
          </Reveal>
        )}
        {children}
      </Container>
    </section>
  );
}
