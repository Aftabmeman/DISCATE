
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Trophy, 
  Target, 
  TrendingUp,
  BrainCircuit,
  Sparkles,
  Zap,
  Coins,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
}

export default function DashboardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "profile", "stats");
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary/10" />
      </div>
    );
  }

  const statsConfig = [
    { 
      label: "Mastery", 
      value: profile?.overallScore ? `${profile.overallScore}%` : `--%`, 
      icon: Target, 
      color: "text-primary", 
      bg: "bg-primary/10" 
    },
    { 
      label: "Coins", 
      value: profile?.totalCoins?.toString() ?? "0", 
      icon: Coins, 
      color: "text-amber-500", 
      bg: "bg-amber-100/50" 
    },
    { 
      label: "Sets", 
      value: profile?.assessmentsDone?.toString() ?? "0", 
      icon: Trophy, 
      color: "text-blue-500", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Level", 
      value: profile?.level ?? `Lvl 1`, 
      icon: Zap, 
      color: "text-emerald-500", 
      bg: "bg-emerald-50" 
    },
  ]

  const performanceData = [
    { date: "Jan", score: 40 },
    { date: "Feb", score: 30 },
    { date: "Mar", score: 60 },
    { date: "Apr", score: 45 },
    { date: "May", score: 70 },
  ];

  return (
    <div className="space-y-8 sm:space-y-14 animate-in fade-in duration-700 pb-40 max-w-2xl mx-auto px-4">
      <div className="flex flex-col gap-2 sm:gap-4 text-center sm:text-left pt-6 sm:pt-10">
        <h1 className="text-2xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white font-headline leading-tight">
          Welcome, {user?.displayName?.split(' ')[0] || 'Scholar'}
        </h1>
        <p className="text-slate-500 text-sm sm:text-lg font-medium leading-relaxed">Your academic journey is looking bright today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-8">
        {statsConfig.map((stat) => (
          <Card key={stat.label} className="border-none shadow-xl rounded-[2rem] hover:shadow-2xl transition-all duration-500 group dark:bg-slate-900/50 bg-white border border-slate-50 dark:border-white/5">
            <CardContent className="p-6 sm:p-10">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className={cn("p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-sm", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5 sm:h-8 sm:w-8", stat.color)} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{stat.label}</p>
                  <h3 className="text-xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8 sm:space-y-12">
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-950 text-white relative border border-white/5">
          <CardContent className="p-8 sm:p-16 flex flex-col justify-between min-h-[320px] sm:min-h-[400px] relative z-10">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40 opacity-70"></div>
            
            <div className="space-y-6 sm:space-y-10">
              <div className="h-14 w-14 sm:h-20 sm:w-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-lg">
                <BrainCircuit className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div className="space-y-3 sm:space-y-5">
                <h3 className="text-2xl sm:text-4xl font-black font-headline leading-tight tracking-tight">Forge Your Elite Potential</h3>
                <p className="text-slate-400 text-sm sm:text-lg font-medium leading-relaxed max-w-[400px]">Transform static notes into deep, adaptive practice modules instantly.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button className="flex-1 h-14 sm:h-18 px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-[1.5rem] shadow-xl text-lg sm:text-xl active:scale-95 transition-all" asChild>
                <Link href="/dashboard/assessments">Create Journey</Link>
              </Button>
              <Button variant="ghost" className="flex-1 h-14 sm:h-18 px-8 border border-white/10 text-white hover:bg-white/10 rounded-[1.5rem] font-black bg-transparent text-lg sm:text-xl active:scale-95 transition-all" asChild>
                <Link href="/dashboard/essay-lab">Writing Lab</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900/50 p-8 sm:p-16 border border-slate-50 dark:border-white/5">
          <div className="flex items-center justify-between mb-8 sm:mb-14 px-1">
            <div>
              <h3 className="font-headline font-black text-xl sm:text-3xl dark:text-white tracking-tight">Trend</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Scholar Activity</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 bg-emerald-50 dark:bg-emerald-950 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-emerald-100 dark:border-emerald-800/30">
               <TrendingUp className="h-4 w-4 text-emerald-600" />
               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Improving</span>
            </div>
          </div>
          
          <div className="h-[250px] sm:h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 900 }}
                    dy={15}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    dot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 3, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
      </div>

      <footer className="pt-20 pb-10 text-center opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300 dark:text-slate-600 flex items-center justify-center gap-3">
          <Sparkles className="h-5 w-5" /> Mentur AI Engine — Peak Performance
        </p>
      </footer>
    </div>
  )
}
