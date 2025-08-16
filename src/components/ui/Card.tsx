import type { PropsWithChildren, ReactNode } from "react";

type CardTone = "surface" | "muted";

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  className?: string;
  tone?: CardTone;
}>;

export function Card({ title, className = "", tone = "surface", children }: CardProps) {
  const toneClass = tone === "muted" ? "bg-surface-2" : "bg-surface";
  return (
    <div
      className={`h-full min-h-[180px] rounded-[var(--radius-lg)] border border-border ${toneClass} p-6 shadow-[var(--shadow-card)] ${className}`}
    >
      {title && <div className="mb-2 text-lg font-semibold">{title}</div>}
      {children}
    </div>
  );
}
