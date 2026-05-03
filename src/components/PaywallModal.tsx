'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Rocket, 
  X,
  Infinity,
  BrainCircuit,
  Star,
  CheckCircle2
} from 'lucide-react';
import { DiscateLogo } from '@/components/DiscateLogo';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: Infinity,
    title: "Unlimited Extractions",
    desc: "Remove all daily limits on YouTube and Document intelligence forging.",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    icon: BrainCircuit,
    title: "Elite Feedback Node",
    desc: "Access deeper analysis with advanced logic and higher token priority.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: Star,
    title: "Zero Wait Time",
    desc: "Skip all ad requirements and synchronization delays instantly.",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  }
];

const plans = [
  {
    id: '1mo',
    name: 'Standard',
    period: '1 Month',
    featured: false,
    tag: 'Starter'
  },
  {
    id: '3mo',
    name: 'Elite',
    period: '3 Months',
    featured: true,
    tag: 'MOST POPULAR'
  },
  {
    id: '6mo',
    name: 'Legend',
    period: '6 Months',
    featured: false,
    tag: 'Best Value'
  }
];

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [featureIdx, setFeatureIdx] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setFeatureIdx((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleWaitlist = () => {
    toast({
      title: "Waitlist Registered! 🚀",
      description: "We'll notify you the moment elite access goes live.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 border-none bg-white dark:bg-slate-950 overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] shadow-3xl sm:max-h-[90vh]">
        {/* Accessibility Titles (Visually Hidden) */}
        <div className="sr-only">
          <DialogTitle>DISCATE Elite Subscription</DialogTitle>
          <DialogDescription>Upgrade to Masterclass for unlimited forging, zero ads, and priority logic synthesis.</DialogDescription>
        </div>

        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] opacity-60" />
           <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-accent/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-6 sm:py-8">
            <div className="flex items-center gap-3">
              <DiscateLogo size="sm" />
              <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary">Elite</span>
              </div>
            </div>
            {/* Standard ShadCN Close button handles the 'X' already, but we'll ensure the spacing is right */}
          </div>

          <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-10 no-scrollbar">
            {/* Feature Carousel */}
            <div className="text-center space-y-4 sm:space-y-6 py-4 sm:py-6 animate-in fade-in duration-700">
              <div key={featureIdx} className="flex flex-col items-center space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                <div className={cn("h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center shadow-lg", features[featureIdx].bg)}>
                  {(() => {
                    const Icon = features[featureIdx].icon;
                    return <Icon className={cn("h-7 w-7 sm:h-8 sm:w-8", features[featureIdx].color)} />;
                  })()}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black font-headline tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                    {features[featureIdx].title}
                  </h3>
                  <p className="text-slate-500 text-[11px] sm:text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                    {features[featureIdx].desc}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center gap-1.5 pt-2">
                {features.map((_, i) => (
                  <div key={i} className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    featureIdx === i ? "w-6 bg-primary" : "w-1.5 bg-slate-200 dark:bg-slate-800"
                  )} />
                ))}
              </div>
            </div>

            {/* Plan Cards */}
            <div className="flex items-end justify-center gap-1.5 sm:gap-4 py-8 px-1">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={cn(
                    "relative flex-1 rounded-[1.5rem] sm:rounded-[1.8rem] p-3 sm:p-6 transition-all duration-500 flex flex-col items-center text-center",
                    plan.featured 
                      ? "bg-white dark:bg-slate-900 shadow-2xl ring-2 ring-primary scale-110 z-20 h-[220px] sm:h-[260px] shadow-primary/20" 
                      : "bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 opacity-60 grayscale-[0.5] h-[180px] sm:h-[220px]"
                  )}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                      {plan.tag}
                    </div>
                  )}
                  
                  <div className="space-y-1 pt-2 sm:pt-4">
                    <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{plan.period}</span>
                    <h4 className="text-sm sm:text-xl font-black text-slate-900 dark:text-white leading-tight">{plan.name}</h4>
                  </div>

                  <div className="mt-auto mb-4">
                    <p className="text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em]">Coming Soon</p>
                    <p className="text-slate-300 dark:text-slate-700 text-[6px] sm:text-[8px] font-bold line-through">Finalizing Rates</p>
                  </div>

                  {plan.featured && (
                    <div className="w-full h-7 sm:h-8 rounded-xl bg-primary/5 flex items-center justify-center">
                       <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-6 sm:pt-8 space-y-4">
              <Button 
                onClick={handleWaitlist}
                className="w-full h-14 sm:h-16 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-base sm:text-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group"
              >
                Join the Elite Waitlist
                <Rocket className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
              
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">
                   <ShieldCheck className="h-3 w-3 text-emerald-500" />
                   Secure Verification
                </div>
                <div className="h-1 w-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">
                   <Crown className="h-3 w-3 text-amber-500" />
                   Priority Access
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
