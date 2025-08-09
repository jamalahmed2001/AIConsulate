"use client";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

type ProcessStep = {
  title: string;
  description: string;
  details: string;
  duration: string;
  icon: string;
};

type ProcessTimelineProps = {
  steps: ProcessStep[];
};

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-8 h-full w-0.5 bg-gradient-to-b from-brand-200 via-brand-300 to-brand-200 md:left-1/2 md:ml-[-1px]" />
      
      <div className="space-y-12">
        {steps.map((step, idx) => (
          <Reveal key={step.title} delayMs={idx * 150}>
            <div className="relative flex items-start gap-6 md:gap-12">
              {/* Step indicator */}
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg md:absolute md:left-1/2 md:ml-[-16px]">
                <span className="text-sm font-semibold">{idx + 1}</span>
              </div>
              
              {/* Content */}
              <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? "md:ml-auto md:text-right" : ""}`}>
                <button
                  onClick={() => setActiveStep(activeStep === idx ? -1 : idx)}
                  className="w-full text-left transition-all duration-200 hover:scale-[1.02]"
                >
                  <Card className={`transition-all duration-300 ${activeStep === idx ? "ring-2 ring-brand-300 shadow-lg" : "hover:shadow-md"}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
                        <p className="mt-1 text-sm text-brand-600 font-medium">{step.duration}</p>
                        <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
                      </div>
                      <div className="ml-4 text-2xl">{step.icon}</div>
                    </div>
                    
                    {activeStep === idx && (
                      <div className="mt-4 border-t pt-4 text-sm text-neutral-700">
                        {step.details}
                      </div>
                    )}
                  </Card>
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
