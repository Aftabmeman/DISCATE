'use client';

import { cn } from "@/lib/utils";

interface MenturLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function MenturLogo({ 
  className, 
  size = "md", 
  showText = false
}: MenturLogoProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const textClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-6xl",
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Brain-Processor Fusion Gradient SVG */}
      <div className={cn("shrink-0 relative group", sizeClasses[size])}>
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="inner-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Base Brain Shape */}
          <path 
            d="M50 10C30 10 15 25 15 45C15 65 30 80 50 90C70 80 85 65 85 45C85 25 70 10 50 10Z" 
            fill="url(#neural-gradient)" 
          />
          
          {/* Circuit / Brain Fold Patterns */}
          <path 
            d="M50 25C40 25 32 33 32 43C32 53 40 61 50 61C60 61 68 53 68 43C68 33 60 25 50 25ZM50 54C44 54 39 49 39 43C39 37 44 32 50 32C56 32 61 37 61 43C61 49 56 54 50 54Z" 
            fill="white" 
            fillOpacity="0.2" 
          />
          
          {/* Core Processor Node */}
          <circle cx="50" cy="43" r="12" fill="white" filter="url(#inner-glow)" />
          <path 
            d="M45 43H55M50 38V48" 
            stroke="#9333ea" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          
          {/* Connectivity Nodes */}
          <circle cx="50" cy="20" r="3" fill="white" fillOpacity="0.8" />
          <circle cx="50" cy="66" r="3" fill="white" fillOpacity="0.8" />
          <circle cx="27" cy="43" r="3" fill="white" fillOpacity="0.8" />
          <circle cx="73" cy="43" r="3" fill="white" fillOpacity="0.8" />
          
          <path d="M50 24V32M50 54V62M31 43H39M61 43H69" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          "font-black font-headline tracking-tighter bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x",
          textClasses[size]
        )}>
          Mentur AI
        </span>
      )}
    </div>
  );
}
