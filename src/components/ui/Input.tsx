import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className = "", error, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <input
        className={`ring-brand-300 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:ring-4 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
