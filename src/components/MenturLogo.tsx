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
      {/* Human-Robot Hybrid Gradient SVG Logo */}
      <div className={cn("shrink-0 relative group", sizeClasses[size])}>
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Base Head Circle */}
          <circle cx="50" cy="50" r="48" fill="url(#logo-gradient)" />
          
          {/* Circuit Pattern / Brain Fusion */}
          <path 
            d="M50 25C38 25 28 35 28 48C28 61 38 72 50 72C62 72 72 61 72 48C72 35 62 25 50 25ZM50 65C41 65 34 58 34 48C34 38 41 31 50 31C59 31 66 38 66 48C66 58 59 65 50 65Z" 
            fill="white" 
            fillOpacity="0.2" 
          />
          
          {/* Core Processor / Eye */}
          <circle cx="50" cy="48" r="14" fill="white" />
          <path 
            d="M44 48H56M50 42V54" 
            stroke="#9333ea" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          
          {/* Outer Circuit Nodes */}
          <circle cx="50" cy="12" r="4" fill="white" />
          <circle cx="50" cy="88" r="4" fill="white" />
          <circle cx="12" cy="50" r="4" fill="white" />
          <circle cx="88" cy="50" r="4" fill="white" />
          
          <path d="M50 16V25M50 72V84M16 50H28M72 50H84" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
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
