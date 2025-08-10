"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";

type Service = {
  title: string;
  description: string;
  features: string[];
  icon: string;
  color: string;
};

type ServiceCardProps = {
  service: Service;
  onClick?: () => void;
};

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group w-full text-left transition-all duration-300 hover:scale-[1.02]"
    >
      <Card className={`relative overflow-hidden transition-all duration-300 ${
        isHovered ? "shadow-xl ring-2 ring-brand-200" : "hover:shadow-lg"
      }`}>
        {/* Background gradient */}
        <div 
          className={`absolute inset-0 opacity-5 transition-opacity duration-300 ${
            isHovered ? "opacity-10" : ""
          }`}
          style={{
            background: `linear-gradient(135deg, ${service.color}20, transparent)`
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className={`mb-4 text-3xl transition-transform duration-300 ${
            isHovered ? "scale-110" : ""
          }`}>
            {service.icon}
          </div>
          
          {/* Title */}
          <h3 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {service.title}
          </h3>
          
          {/* Description */}
          <p className="mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {service.description}
          </p>
          
          {/* Features */}
          <ul className="space-y-1">
            {service.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                <span className="mr-2 h-1 w-1 rounded-full bg-brand-400" />
                {feature}
              </li>
            ))}
          </ul>
          
          {/* CTA */}
          <div className={`mt-6 flex items-center justify-between`}>
            <div className={`flex items-center text-sm font-medium text-blue-600 transition-all duration-300 ${
              isHovered ? "translate-x-1" : ""
            }`}>
              Learn more
              <svg 
                className="ml-1 h-4 w-4 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </div>
            <div className={`rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-2 transition-all duration-300 ${
              isHovered ? "scale-110 shadow-md" : ""
            }`}>
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: service.color }}
              />
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}
