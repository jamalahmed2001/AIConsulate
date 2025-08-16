import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
};

export function Select({ className = "", error, options, placeholder, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      <select
        className={`ring-brand-300 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:ring-4 ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
