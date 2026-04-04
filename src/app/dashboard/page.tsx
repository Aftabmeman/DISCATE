
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  Inbox,
  Cpu,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const stats = [
    { label: "Overall Score", value: "0%", icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Assessments Done", value: "0", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Study Time", value: "0h", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Avg. Tokens/Run", value: "3.2k", icon: Cpu, color: "text-emerald-500", bg: "bg-emerald-50" },
  ]

  const recentMaterials: any[] = []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-headline">Welcome back, Scholar</h1>
          <p className="text-muted-foreground mt-1 text-lg">Your academic journey is looking bright today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full h-11 px-6 font-medium">View History</Button>
          <Button className="rounded-full h-11 px-6 font-medium bg-primary hover:bg-primary/90" asChild>
            <Link href="/dashboard/assessments">
              <BrainCircuit className="mr-2 h-4 w-4" />
              New Assessment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={stat.bg + " p-3 rounded-2xl group-hover:scale-110 transition-transform"}>
                  <stat.icon className={"h-6 w-6 " + stat.color} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-xl">Academic Progress</CardTitle>
              <CardDescription>Visualizing your growth over the last 30 days</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">Details</Button>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-t bg-slate-50/30">
            <div className="flex flex-col items-center gap-3">
              <TrendingUp className="h-12 w-12 text-slate-200" />
              <p className="text-sm font-medium">No performance data available yet.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Cpu className="h-5 w-5" />
              <CardTitle className="font-headline text-xl">AI Token Insight</CardTitle>
            </div>
            <CardDescription className="text-slate-400">Current Groq model efficiency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Assessment Flow</span>
                <span className="font-bold text-primary">~4.5k tokens</span>
              </div>
              <Progress value={75} className="h-1 bg-white/10" />
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Essay Evaluation</span>
                <span className="font-bold text-primary">~1.8k tokens</span>
              </div>
              <Progress value={30} className="h-1 bg-white/10" />
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Active Model</p>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium">Llama 3.1 8B Instant</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-xl">Recent Materials</CardTitle>
            <Link href="/dashboard/materials">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentMaterials.length > 0 ? (
              <div className="divide-y">
                {recentMaterials.map((material, i) => (
                  <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{material.title}</p>
                        <p className="text-xs text-muted-foreground">{material.date} • {material.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary" asChild>
                      <Link href="/dashboard/materials">
                         <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <Inbox className="h-10 w-10 text-slate-200 mb-4" />
                <p className="text-slate-500 text-sm font-medium">No materials added yet.</p>
                <p className="text-slate-400 text-xs mt-1">Upload your notes to see them here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] text-white">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-headline leading-tight">Ready to test your knowledge?</h3>
              <p className="text-slate-400">Generate a custom assessment based on your uploaded materials and get instant feedback.</p>
            </div>
            <Button className="w-fit mt-8 h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25" asChild>
              <Link href="/dashboard/assessments">Start Evaluation</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
