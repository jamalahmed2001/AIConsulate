"use client";
import type { PropsWithChildren, CSSProperties, ElementType } from "react";
import { useMemo } from "react";
import { useInView } from "@/hooks/useInView";

type RevealProps = PropsWithChildren<{
  className?: string;
  delayMs?: number;
  y?: number; // translateY offset before reveal
  as?: ElementType;
}>;

export function Reveal({
  children,
  className = "",
  delayMs = 0,
  y = 12,
  as: Tag = "div",
}: RevealProps) {
  const { ref, inView } = useInView({ threshold: 0.12, once: true });

  const style = useMemo<CSSProperties>(
    () => ({
      transition: "opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1), transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      transitionDelay: `${delayMs}ms`,
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : `translateY(${y}px)`,
      willChange: "opacity, transform",
    }),
    [inView, delayMs, y],
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    <Tag ref={ref as any} className={className} style={style}>
      {children}
    </Tag>
  );
}


