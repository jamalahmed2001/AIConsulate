"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  once?: boolean;
};

export function useInView({
  threshold = 0.15,
  root = null,
  rootMargin = "0px",
  once = true,
}: UseInViewOptions = {}) {
  const [inView, setInView] = useState(false);
  const targetRef = useRef<Element | null>(null);
  const hasEnteredRef = useRef(false);

  const setRef = useCallback((node: Element | null) => {
    targetRef.current = node;
  }, []);

  useEffect(() => {
    if (!targetRef.current) return;
    const el = targetRef.current;
    if (once && hasEnteredRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            hasEnteredRef.current = true;
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, root, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, root, rootMargin, once]);

  return { ref: setRef, inView } as const;
}


