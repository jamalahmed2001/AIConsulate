import type { PropsWithChildren, ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

type SectionProps = PropsWithChildren<{
  title?: string | ReactNode;
  subtitle?: string;
  className?: string;
  containerClassName?: string;
  id?: string;
}>;

export function Section({
  title,
  subtitle,
  className = "",
  containerClassName = "",
  id,
  children,
}: SectionProps) {
  return (
    <section id={id} className={`border-t bg-white ${className}`}>
      <Container className={`py-20 ${containerClassName}`}>
        {(title ?? subtitle) && (
          <Reveal className="mb-8 text-center">
            {typeof title === "string" ? (
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{title}</h2>
            ) : (
              title
            )}
            {subtitle && (
              <p className="mx-auto mt-2 max-w-2xl text-neutral-700 dark:text-neutral-300">
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
