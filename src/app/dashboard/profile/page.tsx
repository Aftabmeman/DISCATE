"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, ShieldCheck, Moon, Sun, ChevronRight, Award, Clock, BookMarked, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MenturLogo } from "@/components/MenturLogo"

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:bg-primary/30 transition-all duration-700" />
          <MenturLogo size="lg" />
          {/* Fixed Verification Badge */}
          <div className="absolute -top-1 -right-1 z-10 h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
             <ShieldCheck className="h-5 w-5 text-white" />
          </div>
        </div>
        <h1 className="mt-8 text-3xl font-black font-headline tracking-tight text-slate-900 dark:text-white">
          {user?.displayName || "Scholar"}
        </h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          {user?.email}
        </p>
        <Badge variant="secondary" className="mt-4 bg-primary/10 text-primary border-none px-6 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-[0.2em]">
           Verified Scholar
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Award, label: "Level", val: "1", color: "text-primary", bg: "bg-primary/5" },
          { icon: Clock, label: "Study Hrs", val: "0", color: "text-amber-500", bg: "bg-amber-50" },
          { icon: BookMarked, label: "Sets", val: "0", color: "text-emerald-500", bg: "bg-emerald-50" }
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex flex-col items-center justify-center text-center rounded-[32px] border-none bg-white dark:bg-slate-900 shadow-xl shadow-black/5">
            <stat.icon className={cn("h-7 w-7 mb-3", stat.color)} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.val}</span>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">System Settings</h3>
        
        <div className="space-y-3">
          <Card 
            className="flex items-center justify-between p-6 rounded-[32px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-none shadow-sm group active:scale-95"
            onClick={toggleTheme}
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-primary/10 transition-colors">
                {theme === "light" ? <Moon className="h-6 w-6 text-slate-500 group-hover:text-primary" /> : <Sun className="h-6 w-6 text-amber-500" />}
              </div>
              <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Card>

          <Card 
            className="flex items-center justify-between p-6 rounded-[32px] cursor-pointer hover:bg-destructive/5 transition-all border-none shadow-sm group active:scale-95"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-destructive/5 rounded-2xl group-hover:bg-destructive/10 transition-colors">
                <LogOut className="h-6 w-6 text-destructive" />
              </div>
              <span className="font-bold text-lg text-destructive">Sign Out</span>
            </div>
            <ChevronRight className="h-6 w-6 text-destructive/30" />
          </Card>
        </div>
      </div>

      <footer className="pt-12 text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <MenturLogo size="sm" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mentur AI Engine
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto leading-relaxed font-bold uppercase tracking-widest">
            Expert Academic Mentorship System
          </p>
          <p className="text-[9px] text-slate-300 dark:text-slate-600 tracking-[0.2em] font-medium">
            VERSION 2.6.0-NATIVE.PRO
          </p>
        </div>
      </footer>
    </div>
  )
}
