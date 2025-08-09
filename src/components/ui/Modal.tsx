"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  overview?: string;
  technical?: string;
  primaryAction?: { label: string; href: string };
  features?: string[];
  icon?: string;
  color?: string;
};

export function Modal({
  open,
  onClose,
  title,
  overview,
  technical,
  primaryAction,
  features,
  icon,
  color,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"overview" | "technical">("overview");
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      setTimeout(() => closeButtonRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = "";
      lastActiveRef.current?.focus?.();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 md:items-center md:p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-t-[var(--radius-lg)] border bg-white shadow-2xl md:rounded-[var(--radius-lg)] transform transition-all duration-300 ease-out scale-100"
        onClick={(e) => e.stopPropagation()}
        style={{
          animationFillMode: "forwards",
        }}
      >
        {/* Header with enhanced design */}
        <div className="relative overflow-hidden rounded-t-[var(--radius-lg)]">
          {color && (
            <div 
              className="absolute inset-0 opacity-5"
              style={{ backgroundColor: color }}
            />
          )}
          <div className="relative flex items-start justify-between gap-4 border-b p-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {icon && (
                  <div 
                    className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center text-2xl"
                    style={{ 
                      backgroundColor: color ? `${color}15` : 'var(--color-brand-50)',
                      color: color ?? 'var(--color-brand-600)'
                    }}
                  >
                    {icon}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">Service Details</p>
                </div>
              </div>
              
              {/* Enhanced Tab Design */}
              <div className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-neutral-100 p-1">
                <button
                  className={`rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    tab === "overview" 
                      ? "bg-white shadow-sm text-neutral-900" 
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                  onClick={() => setTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    tab === "technical" 
                      ? "bg-white shadow-sm text-neutral-900" 
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                  onClick={() => setTab("technical")}
                >
                  Details
                </button>
              </div>
            </div>
            
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close modal"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content with improved styling */}
        <div className="p-6 min-h-[200px]">
          {tab === "overview" ? (
            <div className="space-y-4">
              <p className="text-neutral-700 leading-relaxed">
                {overview ?? "No overview available."}
              </p>
              
              {features && features.length > 0 && (
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div 
                          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: color ?? 'var(--color-brand-600)' }}
                        />
                        <span className="text-sm text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-900 mb-3">Technical Implementation</h4>
              <div className="rounded-[var(--radius-md)] border bg-neutral-50 p-4">
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {technical ?? "Technical details provide insights into our implementation approach, architecture decisions, and the specific technologies we use to deliver reliable, scalable solutions."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between gap-4 border-t bg-neutral-50 px-6 py-4 rounded-b-[var(--radius-lg)]">
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            <kbd className="px-2 py-1 text-xs bg-white border rounded shadow-sm">Esc</kbd>
            to close
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-[var(--radius-md)] border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-white hover:border-neutral-400 transition-colors"
            >
              Close
            </button>
            {primaryAction && (
              <a
                href={primaryAction.href}
                className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 shadow-lg"
                style={{ 
                  backgroundColor: color ?? 'var(--color-brand-700)',
                  boxShadow: `0 4px 14px 0 ${color ?? 'var(--color-brand-700)'}25`
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = color ? `${color}dd` : 'var(--color-brand-800)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = color ?? 'var(--color-brand-700)';
                }}
              >
                {primaryAction.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
