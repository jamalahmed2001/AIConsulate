import type { PropsWithChildren, ReactNode } from "react";

type CardTone = "surface" | "muted";

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  className?: string;
  tone?: CardTone;
}>;

export function Card({ title, className = "", tone = "surface", children }: CardProps) {
  const toneClass = tone === "muted" ? "bg-neutral-50" : "bg-white";
  return (
    <div
      className={`h-full min-h-[180px] rounded-[var(--radius-lg)] border ${toneClass} p-6 shadow-[var(--shadow-card)] ${className}`}
    >
      {title && <div className="mb-2 text-lg font-semibold">{title}</div>}
      {children}
    </div>
  );
}
