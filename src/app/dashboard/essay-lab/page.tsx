"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Sparkles, 
  CheckCircle2, 
  Type, 
  X, 
  Loader2, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  SendHorizontal, 
  Eye,
  ScanText
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

export const maxDuration = 60;

export default function WritingWizardPage() {
  const [step, setStep] = useState(1)
  const [question, setQuestion] = useState("")
  const [academicLevel, setAcademicLevel] = useState<string>("UG Year 1")
  const [chapterName, setChapterName] = useState("")
  const [essayText, setEssayText] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<EvaluateEssayFeedbackOutput | null>(null)
  const [showModelAnswer, setShowModelAnswer] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (uploadedImages.length + files.length > 5) {
      toast({ title: "Limit Exceeded", description: "Max 5 photos allowed.", variant: "destructive" })
      return
    }
    setUploadedImages(prev => [...prev, ...files])
  }

  const handleEvaluate = async () => {
    if (!essayText.trim() && uploadedImages.length === 0) {
      toast({ title: "Content Missing", description: "Please type or upload your work.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    if (uploadedImages.length > 0) setIsScanning(true)

    try {
      // Simulate OCR delay if images are present
      if (uploadedImages.length > 0) {
        await new Promise(r => setTimeout(r, 2000))
        setIsScanning(false)
      }

      const evaluation = await evaluateEssayFeedback({
        topic: chapterName || "Self Practice Session",
        question: question,
        essayText: essayText || "[Handwritten context scanned from images]",
        academicLevel: academicLevel,
      })

      if (evaluation.error) {
        toast({ title: "Analysis Failed", description: evaluation.error, variant: "destructive" })
      } else {
        setResult(evaluation)
        setStep(5)
      }
    } catch (error: any) {
      console.error("Evaluation Error:", error)
      toast({ title: "Critical Error", description: "Professor is currently unavailable. Try again later.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setIsScanning(false)
    }
  }

  const levels = ['Class 8th', 'Class 9th', 'Class 10th', 'Class 11th', 'Class 12th', 'UG Year 1', 'Competitive (UPSC)', 'Competitive (JEE)']

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Self-Practice</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered writing mentorship.</p>
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
            <CardHeader className="p-8"><CardTitle className="text-xl font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center"><Type className="h-5 w-5 text-primary" /></div>Step 1: The Question</CardTitle></CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <Textarea placeholder="Paste the question you are practicing..." className="min-h-[200px] rounded-2xl p-5 text-sm dark:bg-slate-950 border-none bg-slate-50 resize-none leading-relaxed" value={question} onChange={(e) => setQuestion(e.target.value)} />
              <Button onClick={() => setStep(2)} disabled={!question.trim()} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20">Set Profile <ChevronRight className="ml-2 h-5 w-5" /></Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
            <CardHeader className="p-8"><CardTitle className="text-xl font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-amber-600" /></div>Step 2: Profile Context</CardTitle></CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Class / Level</label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>{levels.map(lvl => <SelectItem key={lvl} value={lvl} className="font-bold">{lvl}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Chapter Name</label>
                  <Input placeholder="e.g. Modern History" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold" value={chapterName} onChange={(e) => setChapterName(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-14 w-14 rounded-2xl bg-slate-50"><ChevronLeft className="h-6 w-6" /></Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">Write Answer <ChevronRight className="ml-2 h-5 w-5" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
            <CardHeader className="p-8"><CardTitle className="text-xl font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center"><BookOpen className="h-5 w-5 text-emerald-600" /></div>Step 3: Submission</CardTitle></CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div onClick={() => fileInputRef.current?.click()} className="h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50/50">
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple />
                <PlusCircle className="h-8 w-8 text-primary mb-2" /><p className="text-xs font-bold text-slate-500">Upload Handwriting (Max 5)</p>
              </div>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {uploadedImages.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-destructive h-5 w-5 rounded-full flex items-center justify-center text-white"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <Textarea placeholder="OR type your full response here..." className="min-h-[150px] rounded-2xl p-5 bg-slate-50 border-none" value={essayText} onChange={(e) => setEssayText(e.target.value)} />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} className="h-14 w-14 rounded-2xl bg-slate-50"><ChevronLeft className="h-6 w-6" /></Button>
                <Button onClick={() => setStep(4)} disabled={!essayText.trim() && uploadedImages.length === 0} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">Review Submission <ChevronRight className="ml-2 h-5 w-5" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="border-none shadow-xl rounded-[40px] bg-white p-10 text-center animate-in zoom-in-95">
             <div className="bg-primary/10 h-20 w-20 rounded-[28px] flex items-center justify-center mx-auto mb-6"><Sparkles className="h-10 w-10 text-primary" /></div>
             <h2 className="text-3xl font-black font-headline">Ready for Analysis?</h2>
             <p className="text-sm font-medium text-slate-500 mt-2">The Professor will evaluate your logic, grammar, and structure.</p>
             <div className="mt-8 space-y-4">
               <Button onClick={handleEvaluate} disabled={isLoading} className="w-full h-18 rounded-[28px] bg-slate-900 text-white font-black text-lg">
                 {isLoading ? (
                   <>
                     <Loader2 className="h-6 w-6 animate-spin mr-3" />
                     {isScanning ? "Scanning Handwriting..." : "Analyzing Answer..."}
                   </>
                 ) : (
                   <><SendHorizontal className="h-6 w-6 mr-3" /> Analyze Answer</>
                 )}
               </Button>
               <Button variant="ghost" onClick={() => setStep(3)} className="font-bold text-slate-400">Back to Edit</Button>
             </div>
          </Card>
        )}

        {step === 5 && result && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6 pb-20">
            <Card className="border-none shadow-2xl rounded-[40px] p-10 text-center bg-white dark:bg-slate-900 space-y-8">
              <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analysis Score</p><h2 className="text-7xl font-black font-headline text-slate-900 dark:text-white">{result.score}<span className="text-2xl text-slate-300">/10</span></h2></div>
              <div className="grid grid-cols-1 gap-4 text-left">
                {[
                  { title: "Intro", content: result.feedbackBySection.introduction, color: "text-blue-500", bg: "bg-blue-50" },
                  { title: "Main Body", content: result.feedbackBySection.mainBody, color: "text-primary", bg: "bg-primary/5" },
                  { title: "Conclusion", content: result.feedbackBySection.conclusion, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { title: "Grammar", content: result.feedbackBySection.grammarAndVocabulary, color: "text-amber-500", bg: "bg-amber-50" }
                ].map((sec, i) => (
                  <div key={i} className={cn("p-6 rounded-3xl border border-slate-100 dark:border-slate-800", sec.bg)}>
                    <h4 className={cn("text-[10px] font-black uppercase tracking-widest mb-2", sec.color)}>{sec.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{sec.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => {setResult(null); setStep(1)}} className="flex-1 h-14 rounded-2xl font-bold">New Session</Button>
                <Button onClick={() => setShowModelAnswer(!showModelAnswer)} className="flex-1 h-14 rounded-2xl bg-slate-900 dark:bg-primary font-bold gap-2"><Eye className="h-5 w-5" />{showModelAnswer ? "Hide Rewrite" : "See Rewrite"}</Button>
              </div>
            </Card>

            {showModelAnswer && (
              <Card className="border-none shadow-2xl rounded-[32px] p-10 space-y-8 bg-slate-900 text-white animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary" /></div>
                  <div><h3 className="text-lg font-bold">Professor's Perfect Rewrite</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mastery Level Example</p></div>
                </div>
                <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap italic bg-white/5 p-6 rounded-2xl border border-white/10">{result.suggestedRewrite}</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}