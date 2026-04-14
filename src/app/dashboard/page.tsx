
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Trophy, 
  Target, 
  TrendingUp,
  ArrowRight,
  BrainCircuit,
  Sparkles,
  Zap,
  Loader2,
  Coins
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser, useFirestore } from "@/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
}

export default function DashboardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    avgScore: 0,
    assessmentsDone: 0,
    coins: 0,
    masteryLevel: 1
  })
  const [performanceData, setPerformanceData] = useState<any[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user || !db) return

      try {
        const attemptsRef = collection(db, "users", user.uid, "assessment_attempts")
        const q = query(attemptsRef, orderBy("attemptDate", "desc"), limit(10))
        const querySnapshot = await getDocs(q)
        
        let totalScore = 0
        let count = 0
        const chartData: any[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          totalScore += data.overallScore || 0
          count++
          chartData.unshift({
            date: new Date(data.attemptDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            score: data.overallScore || 0
          })
        })

        // Default data if none exists
        if (chartData.length === 0) {
          for(let i=1; i<=5; i++) chartData.push({ date: `Day ${i}`, score: 0 })
        }

        const avg = count > 0 ? Math.round(totalScore / count) : 0
        
        setStats({
          avgScore: avg,
          assessmentsDone: count,
          coins: (count * 10), // Mock logic: 10 coins per assessment
          masteryLevel: Math.floor(count / 5) + 1
        })
        setPerformanceData(chartData)

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, db])

  const statsConfig = [
    { label: "Overall Score", value: `${stats.avgScore}%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Gold Coins", value: stats.coins.toString(), icon: Coins, color: "text-amber-500", bg: "bg-amber-100" },
    { label: "Tests Done", value: stats.assessmentsDone.toString(), icon: Trophy, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Mastery Level", value: `Lvl ${stats.masteryLevel}`, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-headline">Welcome back, Scholar</h1>
        <p className="text-muted-foreground text-lg">Your academic journey is looking bright today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-none shadow-sm rounded-[24px]">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-10" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statsConfig.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm rounded-[24px] hover:shadow-md transition-shadow group dark:bg-slate-900/50">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3">
                  <div className={stat.bg + " p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform"}>
                    <stat.icon className={"h-5 w-5 " + stat.color} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400">{stat.label}</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm rounded-[28px] overflow-hidden bg-slate-900 text-white group">
          <CardContent className="p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-headline leading-tight dark:text-white">Start Building Knowledge</h3>
              <p className="text-slate-400 max-w-sm">Use our Self-Practice writing wizard or generate custom assessments instantly.</p>
            </div>
            <div className="flex gap-4 mt-8 relative z-10">
              <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/25" asChild>
                <Link href="/dashboard/assessments">Create Journey</Link>
              </Button>
              <Button variant="outline" className="h-12 px-8 border-white/20 text-white hover:bg-white/10 rounded-2xl font-bold" asChild>
                <Link href="/dashboard/essay-lab">Writing Lab</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-[28px] bg-white dark:bg-slate-900/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-headline text-xl dark:text-white">Performance Trend</h3>
              <p className="text-xs font-medium text-slate-500">Your last 10 activities</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
               <TrendingUp className="h-3 w-3 text-emerald-600" />
               <span className="text-[10px] font-black text-emerald-600 uppercase">Improving</span>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </Card>
      </div>

      <footer className="pt-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3" /> Powered by Mentur AI Engine — Fastest Generation
        </p>
      </footer>
    </div>
  )
}
