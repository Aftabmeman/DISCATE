
"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Sparkles, 
  CheckCircle2, 
  Lightbulb,
  FileSearch,
  Upload,
  Type,
  X,
  Loader2,
  Trophy,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  SendHorizontal
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { evaluateEssayFeedback, type EvaluateEssayFeedbackOutput } from "@/ai/flows/evaluate-essay-feedback"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const maxDuration = 30;

export default function WritingWizardPage() {
  const [step, setStep] = useState(1)
  const [question, setQuestion] = useState("")
  const [academicLevel, setAcademicLevel] = useState<any>("UG Year 1")
  const [chapterName, setChapterName] = useState("")
  const [essayText, setEssayText] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const [result, setResult] = useState<EvaluateEssayFeedbackOutput | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (uploadedImages.length + imageFiles.length > 5) {
      toast({ title: "Limit Exceeded", description: "Strict limit of 5 photos.", variant: "destructive" })
      return
    }
    setUploadedImages(prev => [...prev, ...imageFiles])
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleEvaluate = async () => {
    setIsLoading(true)
    try {
      const evaluation = await evaluateEssayFeedback({
        topic: chapterName || "General Practice",
        question: question,
        essayText: essayText || "[Handwritten Answer Analyzed]",
        academicLevel: academicLevel as any,
      })
      if (evaluation.error) {
        toast({ title: "Analysis Failed", description: evaluation.error, variant: "destructive" });
      } else {
        setResult(evaluation)
        setStep(5)
        toast({ title: "Analysis Complete", description: "Your response has been evaluated by AI." })
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Something went wrong during evaluation.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const levels = [
    'Class 8th', 'Class 9th', 'Class 10th', 'Class 11th', 'Class 12th',
    'Undergraduate Year 1', 'Undergraduate Year 2', 'Undergraduate Year 3',
    'Competitive Exams (UPSC)', 'Competitive Exams (JEE/NEET)', 'Competitive Exams (CAT/CLAT/SSC/NDA)'
  ]

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Self-Practice</h1>
          <p className="text-sm text-muted-foreground mt-1">Writing wizard for structured mastery.</p>
        </div>
        {step < 5 && (
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={cn("h-1.5 w-4 rounded-full transition-all", step >= s ? "bg-primary" : "bg-slate-200")} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        {step === 1 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Type className="h-5 w-5 text-primary" />
                </div>
                Step 1: Your Question
              </CardTitle>
              <CardDescription>What question are you practicing today?</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <Textarea 
                placeholder="Write or paste your practice question here..."
                className="min-h-[200px] rounded-2xl p-5 text-sm dark:bg-slate-950 border-none bg-slate-50 resize-none leading-relaxed"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button 
                onClick={() => setStep(2)} 
                disabled={!question.trim()}
                className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20"
              >
                Continue <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                </div>
                Step 2: Profile Context
              </CardTitle>
              <CardDescription>Help us understand your academic target.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Which class/level are you in?</label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(lvl => (
                        <SelectItem key={lvl} value={lvl} className="font-bold">{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Chapter Name / Topic</label>
                  <Input 
                    placeholder="e.g. Quantum Mechanics" 
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">
                  Next Step <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-headline flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                Step 3: Submit Answer
              </CardTitle>
              <CardDescription>Upload handwritten photos or type your response.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50/50"
              >
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple />
                <PlusCircle className="h-8 w-8 text-primary mb-2" />
                <p className="text-xs font-bold text-slate-500">Add Handwritten Pages (Limit 5)</p>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {uploadedImages.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-destructive h-5 w-5 rounded-full flex items-center justify-center">
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">OR Type Response</label>
                <Textarea 
                  placeholder="Start typing your answer here..."
                  className="min-h-[150px] rounded-2xl p-5 text-sm dark:bg-slate-950 border-none bg-slate-50 resize-none"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  disabled={!essayText.trim() && uploadedImages.length === 0}
                  className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold"
                >
                  Final Review <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in zoom-in-95">
            <CardHeader className="p-8 text-center">
              <div className="bg-primary/10 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Ready for Analysis?</CardTitle>
              <CardDescription>Mentur AI Professor will now evaluate your answer based on {academicLevel} standards.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</span>
                   <Badge className="bg-primary/10 text-primary border-none text-[9px]">{academicLevel}</Badge>
                 </div>
                 <p className="text-sm font-bold line-clamp-2">{question}</p>
                 <div className="pt-2 flex gap-4">
                   <div className="text-center">
                     <p className="text-[9px] text-slate-400 font-black uppercase">Photos</p>
                     <p className="text-lg font-black">{uploadedImages.length}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[9px] text-slate-400 font-black uppercase">Words</p>
                     <p className="text-lg font-black">{essayText.split(/\s+/).filter(Boolean).length}</p>
                   </div>
                 </div>
              </div>
              
              <Button 
                onClick={handleEvaluate} 
                disabled={isLoading}
                className="w-full h-16 rounded-3xl bg-slate-900 dark:bg-primary text-white font-black text-lg shadow-2xl shadow-primary/30"
              >
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <SendHorizontal className="h-6 w-6 mr-3" />}
                {isLoading ? "Consulting AI..." : "Analyze Now"}
              </Button>
              <Button variant="ghost" onClick={() => setStep(3)} className="w-full h-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
                Go back & edit
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 5 && result && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6 pb-10">
            <Card className="border-none shadow-2xl rounded-[40px] p-10 text-center bg-white dark:bg-slate-900 space-y-8">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mastery Score</p>
                 <h2 className="text-7xl font-black font-headline text-slate-900 dark:text-white">{result.score}<span className="text-2xl text-slate-300">/10</span></h2>
                 <Badge className="bg-emerald-500 text-white border-none px-4 py-1 mt-2">+5 Coins Earned</Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-4 text-left">
                 <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-6 space-y-3">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Key Strengths
                    </h4>
                    <ul className="space-y-2">
                      {result.strengths?.map((s, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">• {s}</li>
                      ))}
                    </ul>
                 </div>
                 <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-6 space-y-3">
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" /> Areas for Growth
                    </h4>
                    <ul className="space-y-2">
                      {result.improvementSuggestions?.map((s, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">• {s}</li>
                      ))}
                    </ul>
                 </div>
              </div>

              <Button onClick={() => {setResult(null); setStep(1); setUploadedImages([]); setEssayText(""); setQuestion("")}} className="w-full h-16 rounded-3xl bg-slate-900 dark:bg-primary font-black text-lg">
                Practice New Topic
              </Button>
            </Card>

            <Card className="border-none shadow-xl rounded-[32px] p-8 space-y-6 dark:bg-slate-900">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Model Answer Outline</h3>
               <div className="space-y-4">
                 {result.modelAnswerOutline?.map((point, i) => (
                   <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                     <span className="h-6 w-6 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                     <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{point}</p>
                   </div>
                 ))}
               </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
