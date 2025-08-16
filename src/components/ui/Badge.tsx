import type { HTMLAttributes, PropsWithChildren } from "react";

type BadgeProps = PropsWithChildren<HTMLAttributes<HTMLSpanElement>> & {
  variant?: "default" | "outline";
};

export function Badge({
  children,
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const styles = {
    default: "bg-brand-100 text-brand-800 border border-brand-200",
    outline: "border border-border text-muted",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
