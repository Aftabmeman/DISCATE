"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  X, 
  Loader2, 
  FileIcon, 
  ChevronRight, 
  Sparkles, 
  ListChecks,
  RotateCw,
  FileUp,
  BrainCircuit,
  GraduationCap,
  ClipboardList,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  PartyPopper,
  Zap
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { extractTextFromPDF } from "@/app/actions/pdf-parser"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'

export const maxDuration = 60;

export default function AssessmentsPage() {
  const [wizardStep, setWizardStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCelebration, setIsCelebration] = useState(false)

  const [material, setMaterial] = useState("")
  const [level, setLevel] = useState<any>("UG Year 1")
  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [questionType, setQuestionType] = useState<string>("Mixed")
  
  const [mcqCount, setMcqCount] = useState(5)
  const [essayCount, setEssayCount] = useState(2)
  const [flashcardCount, setFlashcardCount] = useState(5)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  
  const [activeMode, setActiveMode] = useState<'MCQ' | 'Flashcard' | 'Essay' | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  const [inputType, setInputType] = useState<string>("paste")
  const [isExtracting, setIsExtracting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setUploadedFile(file)
  }

  const handleExtractText = async () => {
    if (!uploadedFile) return
    setIsExtracting(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      const response = await extractTextFromPDF(formData)
      if (response.error) {
        toast({ title: "Extraction Failed", description: response.error, variant: "destructive" })
      } else if (response.text) {
        setMaterial(response.text)
        toast({ title: "Resource Ingested", description: `Successfully extracted ${response.text.length} characters.` })
        setWizardStep(2)
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to process PDF.", variant: "destructive" })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: questionType === "Mixed" ? ["MCQ", "Essay", "Flashcard"] : [questionType as any],
        academicLevel: level,
        difficulty: difficulty as any,
        mcqCount: (questionType === "MCQ" || questionType === "Mixed") ? mcqCount : 0,
        essayCount: (questionType === "Essay" || questionType === "Mixed") ? essayCount : 0,
        flashcardCount: (questionType === "Flashcard" || questionType === "Mixed") ? flashcardCount : 0,
      })
      
      if (assessments.error) {
        toast({ title: "Journey Failed", description: assessments.error, variant: "destructive" });
      } else {
        setIsCelebration(true)
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#9333ea', '#4f46e5', '#3b82f6'] })
        setTimeout(() => {
          setResult(assessments)
          setIsCelebration(false)
        }, 1500)
      }
    } catch (error: any) {
      toast({ title: "System Error", description: "Generation failed. Check console.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const startMode = (mode: 'MCQ' | 'Flashcard' | 'Essay') => {
    setActiveMode(mode)
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsAnswerRevealed(false)
    setIsCardFlipped(false)
    setQuizScore(0)
  }

  const handleOptionSelect = (option: string) => {
    if (isAnswerRevealed || !result?.mcqs) return
    setSelectedOption(option)
    setIsAnswerRevealed(true)
    if (option === result.mcqs[currentIdx].correctAnswer) setQuizScore(prev => prev + 1)
  }

  const nextItem = () => {
    const list = activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts
    if (currentIdx < (list?.length || 0) - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswerRevealed(false)
      setIsCardFlipped(false)
    } else {
      setActiveMode(null)
      toast({ title: "Session Complete", description: "You've finished this section!" })
    }
  }

  if (isCelebration) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="bg-primary/10 p-8 rounded-full">
           <PartyPopper className="h-20 w-20 text-primary animate-bounce" />
        </div>
        <div className="text-center space-y-2">
           <h2 className="text-3xl font-black font-headline text-slate-900 dark:text-white">Journey Created!</h2>
           <p className="text-slate-500 font-medium">Your AI-powered study session is ready.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Learning Journey</h1>
          <p className="text-sm text-muted-foreground mt-1">Refining academic growth with AI.</p>
        </div>
        {!result && !activeMode && (
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1.5 w-6 rounded-full transition-all", wizardStep >= s ? "bg-primary" : "bg-slate-200")} />
            ))}
          </div>
        )}
      </div>

      {!result ? (
        <div className="space-y-6 overflow-y-auto no-scrollbar pb-10">
          {/* Steps 1-3 implementation same as before but refined inputs */}
          {wizardStep === 1 && (
            <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 animate-in slide-in-from-right-4">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-headline flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-primary" /></div>
                  Step 1: Ingest Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <Tabs value={inputType} onValueChange={setInputType}>
                  <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
                    <TabsTrigger value="paste" className="rounded-xl text-xs font-bold">Paste Notes</TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-xl text-xs font-bold">Upload PDF</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paste">
                    <Textarea 
                      className="min-h-[220px] rounded-2xl bg-slate-50 dark:bg-slate-950 border-none p-5 text-sm"
                      placeholder="Paste your study materials here (min 300 chars)..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="upload">
                    {!uploadedFile ? (
                      <div onClick={() => fileInputRef.current?.click()} className="h-[220px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" />
                        <FileUp className="h-7 w-7 text-primary mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select PDF Document</p>
                      </div>
                    ) : (
                      <div className="h-[220px] bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center gap-3 bg-white p-4 rounded-xl w-full border">
                          <FileIcon className="h-5 w-5 text-primary" />
                          <span className="text-xs font-bold truncate">{uploadedFile.name}</span>
                        </div>
                        <Button onClick={handleExtractText} disabled={isExtracting} className="w-full rounded-2xl h-14 bg-slate-900 font-bold">
                          {isExtracting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                          {isExtracting ? "Extracting..." : "Scan PDF for Step 2"}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                {inputType === "paste" && (
                  <Button onClick={() => setWizardStep(2)} disabled={material.length < 300} className="w-full h-16 rounded-3xl bg-primary text-white font-bold shadow-xl">
                    Continue to Step 2 <ChevronRight className="ml-2 h-6 w-6" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Wizard Step 2 & 3 simplified for focus */}
          {wizardStep === 2 && (
             <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900">
               <CardHeader className="p-8 pb-4"><CardTitle className="text-xl font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-amber-600" /></div>Step 2: Profile</CardTitle></CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                 <Select value={level} onValueChange={setLevel}>
                   <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold"><SelectValue /></SelectTrigger>
                   <SelectContent>{['Class 8th', 'Class 9th', 'Class 10th', 'Class 11th', 'Class 12th', 'UG Year 1', 'Competitive (UPSC)', 'Competitive (JEE)'].map(l => <SelectItem key={l} value={l} className="font-bold">{l}</SelectItem>)}</SelectContent>
                 </Select>
                 <Button onClick={() => setWizardStep(3)} className="w-full h-14 rounded-2xl bg-primary font-bold">Continue <ChevronRight className="ml-2 h-5 w-5" /></Button>
               </CardContent>
             </Card>
          )}

          {wizardStep === 3 && (
            <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900">
               <CardHeader className="p-8 pb-4"><CardTitle className="text-xl font-headline flex items-center gap-3"><div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center"><BrainCircuit className="h-5 w-5 text-emerald-600" /></div>Step 3: Format</CardTitle></CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                 <div className="grid grid-cols-1 gap-3">
                   {[{id:"Mixed", label:"Mixed Journey", icon:Sparkles}, {id:"MCQ", label:"Knowledge Checks", icon:ListChecks}, {id:"Flashcard", label:"Active Recall", icon:RotateCw}, {id:"Essay", label:"Writing Skills", icon:ClipboardList}].map(item => (
                     <div key={item.id} onClick={() => setQuestionType(item.id)} className={cn("p-5 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all", questionType === item.id ? "border-primary bg-primary/5" : "border-slate-100 hover:bg-slate-50")}>
                       <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", questionType === item.id ? "bg-primary text-white" : "bg-slate-100")}><item.icon className="h-5 w-5" /></div>
                       <span className="font-bold text-sm">{item.label}</span>
                     </div>
                   ))}
                 </div>
                 <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-16 rounded-3xl bg-slate-900 text-white font-black text-lg">
                   {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Sparkles className="h-6 w-6 mr-3" />}
                   Start Journey
                 </Button>
               </CardContent>
            </Card>
          )}
        </div>
      ) : activeMode ? (
        <div className="flex flex-col h-full max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setActiveMode(null)} className="font-bold text-slate-400">Exit Session</Button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item {currentIdx + 1} of {(activeMode === 'MCQ' ? result.mcqs : activeMode === 'Flashcard' ? result.flashcards : result.essayPrompts)?.length}</span>
          </div>

          <Card className="border-none shadow-2xl rounded-[40px] bg-white dark:bg-slate-900 flex-1 flex flex-col p-10">
            {activeMode === 'MCQ' && result.mcqs && (
              <div className="space-y-8 h-full">
                <h2 className="text-2xl font-black font-headline dark:text-white leading-tight">{result.mcqs[currentIdx].question}</h2>
                <div className="space-y-3">
                  {result.mcqs[currentIdx].options.map((opt, i) => (
                    <Button key={i} variant="outline" onClick={() => handleOptionSelect(opt)} disabled={isAnswerRevealed} className={cn("h-auto min-h-[64px] justify-start px-6 rounded-2xl border-2 text-left font-medium w-full", isAnswerRevealed ? (opt === result.mcqs![currentIdx].correctAnswer ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "opacity-40") : "bg-slate-50 border-slate-100")}>
                       {opt}
                    </Button>
                  ))}
                </div>
                {isAnswerRevealed && (
                  <div className="pt-6 animate-in slide-in-from-top-4">
                    <div className="p-4 bg-emerald-50 rounded-xl mb-4 text-xs text-emerald-700 font-medium leading-relaxed">{result.mcqs[currentIdx].explanation}</div>
                    <Button onClick={nextItem} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">Next Insight</Button>
                  </div>
                )}
              </div>
            )}

            {activeMode === 'Flashcard' && result.flashcards && (
              <div className="flex-1 flex flex-col justify-center items-center">
                 <div 
                   onClick={() => setIsCardFlipped(!isCardFlipped)}
                   className="relative w-full aspect-[4/5] cursor-pointer group [perspective:1000px]"
                 >
                   <div className={cn("relative h-full w-full rounded-[40px] transition-all duration-500 [transform-style:preserve-3d]", isCardFlipped ? "[transform:rotateY(180deg)]" : "")}>
                     <div className="absolute inset-0 h-full w-full rounded-[40px] bg-slate-50 border-2 border-slate-200 flex items-center justify-center p-10 text-center [backface-visibility:hidden]">
                       <p className="text-2xl font-black font-headline text-slate-900">{result.flashcards[currentIdx].front}</p>
                       <p className="absolute bottom-6 text-[9px] font-black uppercase text-slate-300">Tap to flip</p>
                     </div>
                     <div className="absolute inset-0 h-full w-full rounded-[40px] bg-primary text-white flex items-center justify-center p-10 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                       <p className="text-xl font-bold leading-relaxed">{result.flashcards[currentIdx].back}</p>
                     </div>
                   </div>
                 </div>
                 <Button onClick={nextItem} className="mt-8 w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">Next Card</Button>
              </div>
            )}

            {activeMode === 'Essay' && result.essayPrompts && (
              <div className="space-y-8 flex-1 flex flex-col">
                <Badge className="bg-emerald-100 text-emerald-600 border-none w-fit font-black">ESSAY CHALLENGE</Badge>
                <h2 className="text-2xl font-black font-headline dark:text-white leading-tight">{result.essayPrompts[currentIdx].prompt}</h2>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Concepts to Include:</p>
                  <ul className="space-y-2">
                    {result.essayPrompts[currentIdx].modelAnswerOutline.map((p, i) => (
                      <li key={i} className="flex gap-2 text-xs font-medium text-slate-600"><div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                   <Button onClick={nextItem} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">Complete Practice</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
          <Card className="border-none shadow-xl rounded-[40px] bg-white p-10 text-center space-y-8 animate-in zoom-in-95">
            <div className="bg-primary/10 h-20 w-20 rounded-[28px] flex items-center justify-center mx-auto"><Sparkles className="h-10 w-10 text-primary" /></div>
            <div><h2 className="text-3xl font-black font-headline">Intelligence Injected</h2><p className="text-sm text-slate-500 font-medium">Session ready for {level}</p></div>
            <div className="grid grid-cols-1 gap-4">
              {result.mcqs?.length ? (
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border">
                  <ListChecks className="h-6 w-6 text-primary" />
                  <div className="flex-1 text-left"><p className="text-sm font-black">{result.mcqs.length} Knowledge Checks</p></div>
                  <Button size="sm" onClick={() => startMode('MCQ')} className="rounded-xl bg-slate-900 text-xs font-black">START</Button>
                </div>
              ) : null}
              {result.flashcards?.length ? (
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border">
                  <RotateCw className="h-6 w-6 text-amber-500" />
                  <div className="flex-1 text-left"><p className="text-sm font-black">{result.flashcards.length} Mastery Cards</p></div>
                  <Button size="sm" onClick={() => startMode('Flashcard')} className="rounded-xl bg-slate-900 text-xs font-black">START</Button>
                </div>
              ) : null}
              {result.essayPrompts?.length ? (
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border">
                  <ClipboardList className="h-6 w-6 text-emerald-500" />
                  <div className="flex-1 text-left"><p className="text-sm font-black">{result.essayPrompts.length} Writing Prompts</p></div>
                  <Button size="sm" onClick={() => startMode('Essay')} className="rounded-xl bg-slate-900 text-xs font-black">PRACTICE</Button>
                </div>
              ) : null}
            </div>
            <Button variant="ghost" onClick={() => setResult(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Build New Journey</Button>
          </Card>
        </div>
      )}
    </div>
  )
}