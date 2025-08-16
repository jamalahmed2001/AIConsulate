"use client";
import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type CtaSize = "sm" | "md" | "lg";
type CtaTone = "primary" | "secondary" | "ghost" | "white" | "ghost-white";

type SharedProps = {
  size?: CtaSize;
  tone?: CtaTone;
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  label?: string;
  children?: ReactNode;
};

type CtaAsButton = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
};

type CtaAsLink = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
};

export type CTAProps = CtaAsButton | CtaAsLink;

function baseClasses(size: CtaSize, fullWidth?: boolean) {
  const bySize: Record<CtaSize, string> = {
    sm: "text-xs px-3.5 py-2 h-9",
    md: "text-sm px-5 py-2.5 h-10",
    lg: "text-base px-7 py-3.5 h-12",
  };
  return [
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
    "transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 ring-brand-300",
    fullWidth ? "w-full" : "",
    bySize[size],
  ]
    .filter(Boolean)
    .join(" ");
}

function toneClasses(tone: CtaTone) {
  switch (tone) {
    case "primary":
      return "gradient-cta btn-sheen text-white hover:shadow-xl hover:scale-[1.02] shadow-elev-2";
    case "secondary":
      return "glass text-neutral-900 dark:text-white hover:shadow-md";
    case "ghost":
      return "bg-transparent text-neutral-900 dark:text-neutral-100 hover:bg-white/10 border border-transparent";
    case "white":
      return "bg-white text-brand-700 hover:bg-neutral-50 shadow-lg hover:shadow-xl hover:scale-[1.02]";
    case "ghost-white":
      return "bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50";
  }
}

export function CTA(props: CTAProps) {
  const {
    size = "md",
    tone = "primary",
    className = "",
    iconLeft,
    iconRight,
    fullWidth,
    label,
    children,
    ...rest
  } = props as CTAProps & { href?: string };

  const content = (
    <span className="inline-flex items-center gap-2">
      {iconLeft}
      <span>{label ?? children}</span>
      {iconRight}
    </span>
  );

  const classes = `${baseClasses(size, fullWidth)} ${toneClasses(tone)} ${className}`;

  if ("href" in props && props.href) {
    const { href, prefetch, ...anchorRest } = props as CtaAsLink & { fullWidth?: boolean };
    // Remove non-DOM prop to avoid React unknown prop warning
    delete (anchorRest as Record<string, unknown>).fullWidth;
    return (
      <Link href={href} prefetch={prefetch} className={classes} {...anchorRest}>
        {content}
      </Link>
    );
  }

  const buttonProps = { ...(rest as CtaAsButton & { fullWidth?: boolean }) } as Record<string, unknown>;
  delete buttonProps.fullWidth;
  return (
    <button className={classes} {...(buttonProps as CtaAsButton)}>
      {content}
    </button>
  );
}

export default CTA;