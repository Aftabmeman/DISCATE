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
import { Loader2, PlayCircle, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';
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
 * Final Monetization Modal: Direct Link + 10s Verification
 * Opens external ad network and rewards user after a wait.
 */
export function AdLimitModal({ isOpen, onClose, reason = 'LIMIT_REACHED' }: AdLimitModalProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [view, setView] = useState<'prompt' | 'verifying' | 'success'>('prompt');
  const [timer, setTimer] = useState(10);
  const [isGranting, setIsGranting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setView('prompt');
      setTimer(10);
      setIsGranting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'verifying' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (view === 'verifying' && timer === 0 && !isGranting) {
      handleClaimReward();
    }
    return () => clearInterval(interval);
  }, [view, timer, isGranting]);

  const handleStartAd = () => {
    // Open temporary link in new tab (replacing omg10 with google)
    window.open('https://google.com', '_blank');
    // Switch current tab to verification state
    setView('verifying');
    setTimer(10);
  };

  const handleClaimReward = async () => {
    if (!db || !user?.uid) return;
    setIsGranting(true);
    
    // grantAdReward: +1 Coin and -1 DailyUsed (Bypasses limit for this session)
    const result = await grantAdReward(db, user.uid);
    if (result.success) {
      setView('success');
      toast({
        title: "🎉 Reward Granted!",
        description: "1 Bonus Coin added and your quota refreshed.",
      });
      // Auto-close after success to let user click Generate again
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Failed to credit reward. Please try again.",
      });
      setView('prompt');
      setIsGranting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && view !== 'verifying' && onClose()}>
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
                You've hit your usage threshold. Support our elite servers by visiting an ad partner to earn <strong>+1 Bonus Coin</strong> and continue immediately.
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

        {view === 'verifying' && (
          <div className="relative min-h-[400px] flex flex-col items-center justify-center bg-slate-950 p-8 sm:p-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse" />
            
            <div className="relative z-10 space-y-8 w-full">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
                   <Loader2 className="h-3 w-3 animate-spin" /> Verifying Interaction
                </div>
                <h3 className="text-2xl font-black text-white font-headline uppercase tracking-tight">Syncing Reward Node</h3>
              </div>
              
              <div className="relative h-32 w-32 flex items-center justify-center mx-auto">
                 <svg className="absolute inset-0 h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * (10 - timer)) / 10} strokeLinecap="round" className="text-primary transition-all duration-1000 ease-linear" />
                 </svg>
                 <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-white tabular-nums">{timer}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Seconds</span>
                 </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 text-left">
                 <ExternalLink className="h-5 w-5 text-slate-400 shrink-0" />
                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                   Please keep the ad tab open for a few moments while we verify your academic credit.
                 </p>
              </div>
            </div>
          </div>
        )}

        {view === 'success' && (
          <div className="p-8 sm:p-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
               <CheckCircle2 className="h-14 w-14 text-white" />
            </div>
            <div className="space-y-2">
               <h3 className="text-3xl font-black font-headline text-slate-900 dark:text-white uppercase tracking-tighter">Reward Unlocked!</h3>
               <p className="text-slate-500 font-medium">Your academic wallet has been updated. You can now proceed with your generation.</p>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-full">
               <div className="h-full bg-emerald-500 animate-progress" style={{ width: '100%' }} />
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
