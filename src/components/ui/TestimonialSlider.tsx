"use client";
import { useState, useEffect } from "react";
import { Reveal } from "@/components/ui/Reveal";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  metric?: string;
};

type TestimonialSliderProps = {
  testimonials: Testimonial[];
  autoRotate?: boolean;
  interval?: number;
};

export function TestimonialSlider({ 
  testimonials, 
  autoRotate = true, 
  interval = 5000 
}: TestimonialSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate) return;
    
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoRotate, interval, testimonials.length]);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <div className="relative">
      <Reveal className="text-center">
        <div className="mx-auto max-w-4xl">
          {/* Quote */}
          <blockquote className="text-xl leading-relaxed text-neutral-800 dark:text-neutral-100 md:text-2xl">
            &quot;{activeTestimonial?.quote}&quot;
          </blockquote>
          
          {/* Metric */}
          {activeTestimonial?.metric && (
            <div className="mt-6 text-2xl font-bold text-brand-600">
              {activeTestimonial.metric}
            </div>
          )}
          
          {/* Author */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {activeTestimonial?.avatar && (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold">
                {activeTestimonial.author.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{activeTestimonial?.author}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                {activeTestimonial?.role} at {activeTestimonial?.company}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Navigation dots */}
      <div className="mt-8 flex justify-center gap-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              idx === activeIndex 
                ? "bg-brand-600 w-6" 
                : "bg-neutral-300 hover:bg-neutral-400"
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
