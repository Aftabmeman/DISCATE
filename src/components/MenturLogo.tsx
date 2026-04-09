'use client';

import { cn } from "@/lib/utils";
import { BrainCircuit } from "lucide-react";

interface MenturLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function MenturLogo({ className, size = "md", showText = false }: MenturLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-16 w-16",
    xl: "h-32 w-32",
  };

  const containerClasses = {
    sm: "p-1 rounded-lg",
    md: "p-1.5 rounded-xl",
    lg: "p-3 rounded-[24px]",
    xl: "p-6 rounded-[40px]",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-500",
        containerClasses[size],
        sizeClasses[size]
      )}>
        <BrainCircuit className={cn("text-white", size === "xl" ? "h-16 w-16" : "h-full w-full")} />
      </div>
      {showText && (
        <span className={cn(
          "font-black font-headline tracking-tighter text-slate-900 dark:text-white",
          size === "sm" ? "text-lg" : "text-2xl"
        )}>
          Mentur AI
        </span>
      )}
    </div>
  );
}
