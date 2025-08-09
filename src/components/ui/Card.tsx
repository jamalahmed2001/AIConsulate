import type { PropsWithChildren, ReactNode } from "react";

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  className?: string;
}>;

export function Card({ title, className = "", children }: CardProps) {
  return (
    <div
      className={`h-full min-h-[180px] rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)] ${className}`}
    >
      {title && <div className="mb-2 text-lg font-semibold">{title}</div>}
      {children}
    </div>
  );
}
