import type { PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import { Footer } from "@/components/layout/Footer";
const DynamicNavbar = dynamic(() => import("@/components/layout/Navbar").then(m => m.Navbar), { ssr: false });
import { useEffect, useState } from "react";

export function SiteLayout({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const scrolled = total > 0 ? (doc.scrollTop / total) * 100 : 0;
      setProgress(scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="flex min-h-screen flex-col">
      {/* Render Navbar client-side only to avoid SSR/client session drift causing hydration mismatch */}
      <DynamicNavbar />
      {/* Journey progress bar */}
      <div className="sticky top-16 z-30 h-1 w-full bg-transparent">
        <div
          className="h-1 bg-gradient-to-r from-brand-500 to-brand-700 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
