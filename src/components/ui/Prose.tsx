import type { PropsWithChildren } from "react";

export function Prose({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`prose prose-neutral mx-auto ${className}`}>{children}</div>
  );
}
