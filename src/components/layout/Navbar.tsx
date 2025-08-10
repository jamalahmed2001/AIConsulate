"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { CTA } from "@/components/ui/CTA";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/ai", label: "AI" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize from system or existing class
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = (dark: boolean) => {
      if (dark) {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
      }
      setIsDark(dark);
      // keep mobile UI theme-color in sync
      const setThemeMeta = (color: string, media: string) => {
        const meta = document.querySelector(`meta[name=theme-color][media='${media}']`);
        if (meta) (meta as HTMLMetaElement).content = color;
      };
      if (dark) {
        setThemeMeta("#0b0f1a", "(prefers-color-scheme: light)");
        setThemeMeta("#0b0f1a", "(prefers-color-scheme: dark)");
      } else {
        setThemeMeta("#ffffff", "(prefers-color-scheme: light)");
        setThemeMeta("#ffffff", "(prefers-color-scheme: dark)");
      }
    };

    if (stored === "dark") {
      apply(true);
    } else if (stored === "light") {
      apply(false);
    } else {
      apply(media.matches);
    }

    // Respond to system changes only if user hasn't chosen explicitly
    const onChange = (e: MediaQueryListEvent) => {
      const hasExplicit = localStorage.getItem("theme");
      if (!hasExplicit) apply(e.matches);
    };
    media.addEventListener("change", onChange);
    setMounted(true);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = !(isDark ?? false);
    setIsDark(next);
    if (next) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-sm)] border px-3 text-sm text-neutral-700 opacity-50">
        <div className="h-4 w-4 animate-pulse rounded-full bg-neutral-300" />
        <span className="hidden sm:inline">Theme</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-sm)] border px-3 text-sm text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-white/10"
    >
      {/* Sun/Moon icon */}
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414"
          />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          />
        </svg>
      )}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-surface-80 supports-[backdrop-filter]:bg-surface-60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <span className="inline-block h-6 w-6 rounded bg-brand-600" aria-hidden />
          AI Consulate Advisory
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-neutral-700 hover:text-neutral-900"
            >
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
          <CTA href="/contact" size="sm" className="ml-2" label="Contact us" />
        </nav>
        <button
          aria-label="Toggle menu"
          className="inline-flex items-center justify-center rounded p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="sr-only">Menu</span>
        </button>
      </Container>
      {open && (
        <div className="bg-surface-80 border-t md:hidden">
          <Container className="flex flex-col py-2">
            {navItems.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded px-2 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <div className="px-2 py-2 flex items-center justify-between">
              <ThemeToggle />
              <CTA href="/contact" size="sm" onClick={() => setOpen(false)} label="Contact us" />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
