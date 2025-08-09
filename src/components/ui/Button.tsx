import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: PropsWithChildren<ButtonProps>) {
  const base =
    "inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition";
  const styles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-black text-white hover:opacity-90",
    secondary: "border border-neutral-300 text-neutral-900 hover:bg-neutral-50",
    ghost: "text-neutral-900 hover:bg-neutral-100",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
