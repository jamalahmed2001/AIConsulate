import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

export function Textarea({ className = "", error, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      <textarea
        className={`ring-brand-300 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:ring-4 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
