"use client";
import { useState, useEffect } from "react";
import { Reveal } from "@/components/ui/Reveal";

type Stat = {
  value: string;
  label: string;
  suffix?: string;
  animate?: boolean;
};

type StatsGridProps = {
  stats: Stat[];
  className?: string;
};

function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  
  useEffect(() => {
    const numericValue = parseInt(value.replace(/[^\d]/g, ""));
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let current = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current).toString() + (value.includes("%") ? "%" : ""));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
}

export function StatsGrid({ stats, className = "" }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-2 gap-8 md:grid-cols-4 ${className}`}>
      {stats.map((stat, idx) => (
        <Reveal key={stat.label} delayMs={idx * 100} className="text-center">
          <div className="group">
            <div className="text-3xl font-bold text-brand-600 md:text-4xl dark:text-brand-400">
              {stat.animate ? (
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              ) : (
                <>
                  {stat.value}
                  {stat.suffix}
                </>
              )}
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{stat.label}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
