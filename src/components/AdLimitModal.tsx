'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, Coins, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { grantAdReward } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'LIMIT_REACHED' | 'NO_COINS';
}

/**
 * Just-In-Time Reward Ad Modal for Discate.
 * Appears when limits are hit. Shows a dummy 5-second ad.
 */
export function AdLimitModal({ isOpen, onClose, reason = 'LIMIT_REACHED' }: AdLimitModalProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [view, setView] = useState<'prompt' | 'playing' | 'success'>('prompt');
  const [timer, setTimer] = useState(5);
  const [isGranting, setIsGranting] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setView('prompt');
      setTimer(5);
      setIsGranting(false);
    }
  }, [isOpen]);

  // Handle countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'playing' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (view === 'playing' && timer === 0) {
      // Auto-transition to claim step
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  const handleStartAd = () => {
    setView('playing');
    setTimer(5);
  };

  const handleClaimReward = async () => {
    if (!db || !user?.uid) return;
    setIsGranting(true);
    
    const result = await grantAdReward(db, user.uid);
    if (result.success) {
      setView('success');
      toast({
        title: "🎉 Reward Granted!",
        description: "1 Bonus Coin added and your quota refreshed.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Failed to credit coins. Please try again.",
      });
      setIsGranting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && view !== 'playing' && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-3xl overflow-hidden p-0 bg-white dark:bg-slate-900">
        
        {view === 'prompt' && (
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
               <ShieldAlert className="h-10 w-10 text-amber-600" />
            </div>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl sm:text-3xl font-black font-headline tracking-tighter uppercase leading-tight">
                {reason === 'LIMIT_REACHED' ? "Daily Limit Reached 🛑" : "Insufficient Coins 🪙"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
                You've hit your usage threshold. Watch a quick 5-second ad to earn <strong>+1 Bonus Coin</strong> and continue your elite study session immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleStartAd}
                className="h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-125 transition-transform" />
                Watch Ad to Continue
              </Button>
              <Button variant="ghost" onClick={onClose} className="h-12 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                Maybe Later
              </Button>
            </div>
          </div>
        )}

        {view === 'playing' && (
          <div className="relative min-h-[400px] flex flex-col items-center justify-center bg-slate-950 p-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-pulse" />
            
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Elite Sponsor Session</p>
                <h3 className="text-2xl font-black text-white font-headline uppercase tracking-tight">Intelligence Buffering</h3>
              </div>
              
              <div className="relative h-32 w-32 flex items-center justify-center mx-auto">
                 <svg className="absolute inset-0 h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * (5 - timer)) / 5} strokeLinecap="round" className="text-primary transition-all duration-1000 ease-linear" />
                 </svg>
                 <span className="text-5xl font-black text-white tabular-nums">{timer}</span>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-xs text-slate-400 font-medium italic">"Real scholars don't wait for resets, they create opportunities."</p>
              </div>
            </div>

            {timer === 0 && (
              <Button 
                onClick={handleClaimReward}
                disabled={isGranting}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 h-14 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-2xl shadow-emerald-500/30 animate-in zoom-in-50 duration-500"
              >
                {isGranting ? <Loader2 className="animate-spin h-6 w-6" /> : "Claim +1 Bonus Coin"}
              </Button>
            )}
          </div>
        )}

        {view === 'success' && (
          <div className="p-8 sm:p-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
               <CheckCircle2 className="h-14 w-14 text-white" />
            </div>
            <div className="space-y-2">
               <h3 className="text-3xl font-black font-headline text-slate-900 dark:text-white uppercase tracking-tighter">Reward Unlocked!</h3>
               <p className="text-slate-500 font-medium">Your academic wallet has been updated. The 5-coin restriction for this session is now lifted.</p>
            </div>
            <Button 
              onClick={onClose}
              className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-xl shadow-xl active:scale-95 transition-all"
            >
              Continue Generation
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
