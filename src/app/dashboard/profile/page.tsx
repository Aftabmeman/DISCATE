
"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LogOut, User, Mail, ShieldCheck, Moon, Sun, ChevronRight, Award, Clock, BookMarked } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="h-24 w-24 rounded-full bg-primary/10 border-4 border-background shadow-xl flex items-center justify-center relative group">
          <User className="h-12 w-12 text-primary" />
          <div className="absolute bottom-0 right-0 h-6 w-6 bg-emerald-500 rounded-full border-2 border-background"></div>
        </div>
        <h1 className="mt-4 text-2xl font-bold font-headline">{user?.displayName || "Scholar"}</h1>
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3" /> {user?.email}
        </p>
        <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-none">
          <ShieldCheck className="h-3 w-3 mr-1" /> Verified Member
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center text-center rounded-2xl border-none bg-slate-50 dark:bg-slate-800/50 shadow-sm">
          <Award className="h-6 w-6 text-primary mb-2" />
          <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Level</span>
          <span className="text-lg font-black">12</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center rounded-2xl border-none bg-slate-50 dark:bg-slate-800/50 shadow-sm">
          <Clock className="h-6 w-6 text-amber-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Hours</span>
          <span className="text-lg font-black">24</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center rounded-2xl border-none bg-slate-50 dark:bg-slate-800/50 shadow-sm">
          <BookMarked className="h-6 w-6 text-emerald-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Sets</span>
          <span className="text-lg font-black">8</span>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Settings</h3>
        
        <Card 
          className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-none shadow-sm"
          onClick={toggleTheme}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </div>
            <span className="font-semibold">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </Card>

        <Card className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-none shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <User className="h-5 w-5" />
            </div>
            <span className="font-semibold">Edit Profile</span>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </Card>

        <Card 
          className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-destructive/5 group transition-colors border-none shadow-sm"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-xl group-hover:bg-destructive/20">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <span className="font-semibold text-destructive">Log Out</span>
          </div>
          <ChevronRight className="h-5 w-5 text-destructive/30" />
        </Card>
      </div>
    </div>
  )
}
