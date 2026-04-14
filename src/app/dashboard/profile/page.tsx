"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useTheme } from "@/components/providers/ThemeProvider"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LogOut, ShieldCheck, Moon, Sun, ChevronRight, Award, Clock, BookMarked, MessageSquare, Info, Send, Loader2, Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MenturLogo } from "@/components/MenturLogo"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  // Sync real profile data
  const profileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'profile', user.uid) : null, [user?.uid]);
  const { data: profileData } = useDoc(profileRef);

  const [contactName, setContactName] = useState(user?.displayName || "");
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch("https://formsubmit.co/ajax/aftabghaswala301@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: contactName,
          email: user?.email,
          message: contactMessage,
          _subject: "New Support Message from Mentur AI"
        })
      });

      if (response.ok) {
        toast({
          title: "Message sent to Aftab!",
          description: "We'll get back to you as soon as possible.",
        });
        setContactMessage("");
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not send message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:bg-primary/30 transition-all duration-700" />
          <MenturLogo size="lg" />
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
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest">
            Mentur AI v1.0.0
          </Badge>
          <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest bg-white dark:bg-slate-900">
            Student Edition
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Coins, label: "Coins", val: (profileData?.totalCoins || 0).toString(), color: "text-amber-500" },
          { icon: Award, label: "Level", val: (Math.floor((profileData?.assessmentsDone || 0) / 5) + 1).toString(), color: "text-primary" },
          { icon: BookMarked, label: "Sets", val: (profileData?.assessmentsDone || 0).toString(), color: "text-emerald-500" }
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex flex-col items-center justify-center text-center rounded-[32px] border-none bg-white dark:bg-slate-900 shadow-xl shadow-black/5">
            <stat.icon className={cn("h-7 w-7 mb-3", stat.color)} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.val}</span>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="space-y-3 px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">System</h3>
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
        </div>

        <div className="space-y-3 px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">About App</h3>
          <Card className="rounded-[32px] border-none shadow-sm overflow-hidden dark:bg-slate-900">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="motive" className="border-none px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-primary" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">Motive</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 dark:text-slate-400 pb-4">
                  To solve real academic struggles by providing a fast, stress-free, and intelligent study companion for students.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="vision" className="border-none px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">Vision</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 dark:text-slate-400 pb-4">
                  Making high-quality, personalized education accessible to every student, anytime, anywhere.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="features" className="border-none px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">Features</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 dark:text-slate-400 pb-4">
                  Instant Quizzes, Smart Flashcards, Custom Assessments, and AI Mentorship.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>

        <div className="space-y-3 px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Contact Us</h3>
          <Card className="rounded-[32px] border-none shadow-sm p-6 dark:bg-slate-900">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Name</label>
                <Input 
                  value={contactName} 
                  onChange={(e) => setContactName(e.target.value)} 
                  placeholder="Your Name"
                  className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 border-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Message</label>
                <Textarea 
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="rounded-2xl min-h-[100px] bg-slate-50 dark:bg-slate-800 border-none resize-none"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                disabled={isSending}
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Send Message
              </Button>
            </form>
          </Card>
        </div>

        <div className="px-2">
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
          <p className="text-[9px] text-slate-300 dark:text-slate-600 tracking-[0.2em] font-medium uppercase">
            v1.0.0 Student Edition
          </p>
        </div>
      </footer>
    </div>
  )
}