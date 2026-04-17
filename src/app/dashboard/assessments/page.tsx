
"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  Sparkles, 
  ListChecks,
  RotateCw,
  ClipboardList,
  Check,
  SendHorizontal,
  Coins,
  FileUp,
  ChevronRight,
  ArrowRight,
  Trophy,
  Zap,
  Globe,
  Target
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { evaluateEssayFeedback, type EvaluateEssayFeedbackOutput } from "@/ai/flows/evaluate-essay-feedback"
import { parseFileToText } from "@/app/actions/file-parser"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { incrementUserStats } from "@/firebase/non-blocking-updates"
import { Progress } from "@/components/ui/progress"
import { doc } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const maxDuration = 60;

const academicLevels = [
  "Class 8th", "Class 9th", "Class 10th", "Class 11th", "Class 12th",
  "UPSC", "JEE", "NEET", "GATE", "CAT", "CLAT", "SSC", "NDA"
];

const languages = [
  "English", "Hinglish", "Marathish", "Gujaratinglish", "Bengalish", 
  "Punjabish", "Tamilish", "Telugush", "Kannadish", "Malayalish"
];

export default function AssessmentsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "profile", "stats");
  }, [db, user?.uid]);
  
  const { data: profile } = useDoc(profileRef);

  const [step, setStep] = useState(1)
  const [material, setMaterial] = useState("")
  const [level, setLevel] = useState<string>("Class 10th")
  const [questionType, setQuestionType] = useState<string>("Mixed")
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [preferredLanguage, setPreferredLanguage] = useState("English")
  const [showLangConfirm, setShowLangConfirm] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  const [completedModes, setCompletedModes] = useState<string[]>([])
  
  const [activeMode, setActiveMode] = useState<'MCQ' | 'Flashcard' | 'Essay' | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  
  const [mcqCorrectCount, setMcqCorrectCount] = useState(0)
  const [essayContent, setEssayContent] = useState("")
  const [isAnalyzingEssay, setIsAnalyzingEssay] = useState(false)
  const [essayResult, setEssayResult] = useState<EvaluateEssayFeedbackOutput | null>(null)

  useEffect(() => {
    if (profile?.preferredLanguage) {
      setPreferredLanguage(profile.preferredLanguage);
    }
  }, [profile]);

  useEffect(() => {
    if (questionType === "Essay") {
      if (questionCount > 5) setQuestionCount(5);
    } else {
      if (questionCount < 10) setQuestionCount(10);
    }
  }, [questionType]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await parseFileToText(formData);
      if (response.error) {
        toast({ title: "Parsing Failed", description: response.error, variant: "destructive" });
      } else if (response.text) {
        setMaterial(response.text);
        toast({ title: "Elite Material Loaded", description: "Your resource has been ingested successfully." });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to parse document.", variant: "destructive" });
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (material.length < 30) {
      toast({ title: "Content Short", description: "Please add at least 30 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true)
    try {
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: questionType === "Mixed" ? ["MCQ", "Essay", "Flashcard"] : [questionType as any],
        academicLevel: level,
        difficulty: difficulty as any,
        questionCount: questionCount,
      })
      
      if (assessments.error) {
        toast({ title: "Error", description: assessments.error, variant: "destructive" });
      } else {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } })
        setResult(assessments)
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Generation failed. Try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEssayAnalysis = async () => {
    if (essayContent.trim().length < 30) {
      toast({ title: "Too Short", description: "Please provide a more detailed answer.", variant: "destructive" })
      return
    }

    setIsAnalyzingEssay(true)
    try {
      const evaluation = await evaluateEssayFeedback({
        topic: "Practice Session",
        question: result?.essayPrompts?.[currentIdx]?.prompt || "General Essay",
        essayText: essayContent,
        academicLevel: level,
        preferredLanguage: preferredLanguage,
      })

      if (evaluation.error) {
        toast({ title: "Analysis Failed", description: evaluation.error, variant: "destructive" })
      } else {
        setEssayResult(evaluation)
        if (db && user?.uid && evaluation.evaluationData.coinsEarned > 0) {
          incrementUserStats(db, user.uid, evaluation.evaluationData.coinsEarned, true);
        }
        confetti({ particleCount: 150, spread: 70 });
      }
    } catch (e) {
      toast({ title: "Error", description: "Professor is busy. Try again.", variant: "destructive" })
    } finally {
      setIsAnalyzingEssay(false)
    }
  }

  const startMode = (mode: 'MCQ' | 'Flashcard' | 'Essay') => {
    if (mode === 'Essay') {
      setShowLangConfirm(true)
      return;
    }
    launchMode(mode)
  }

  const launchMode = (mode: 'MCQ' | 'Flashcard' | 'Essay') => {
    setActiveMode(mode)
    setCurrentIdx(0)
    setIsAnswerRevealed(false)
    setEssayResult(null)
    setEssayContent("")
    setMcqCorrectCount(0)
    setShowLangConfirm(false)
  }

  const nextItem = () => {
    const list = activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts
    if (currentIdx < (list?.length || 0) - 1) {
      setCurrentIdx(prev => prev + 1)
      setIsAnswerRevealed(false)
      setEssayResult(null)
      setEssayContent("")
    } else {
      handleModeCompletion()
    }
  }

  const handleModeCompletion = () => {
    if (!activeMode) return;
    const currentMode = activeMode;
    setCompletedModes(prev => [...new Set([...prev, currentMode])])
    setActiveMode(null)

    let coinsEarned = 0;
    if (currentMode === 'MCQ') coinsEarned = mcqCorrectCount * 5;
    if (currentMode === 'Flashcard') coinsEarned = (result?.flashcards?.length || 0) * 2;

    if (db && user?.uid && coinsEarned > 0) {
      incrementUserStats(db, user.uid, coinsEarned, true);
    }
    toast({ title: `${currentMode} Complete!`, description: `Earned ${coinsEarned} Coins.` });
    confetti({ particleCount: 150, spread: 70 });
  }

  return (
    <div className="flex flex-col h-full space-y-6 sm:space-y-12 pb-40 animate-in fade-in duration-700 px-4 max-w-2xl mx-auto">
      <div className="px-1 text-center pt-6 sm:pt-10">
        <h1 className="text-3xl sm:text-6xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">Academic Practice</h1>
        <p className="text-[9px] sm:text-[11px] font-black text-slate-400 mt-3 sm:mt-6 tracking-[0.4em] sm:tracking-[0.6em] uppercase">Sequential Mastery Wizard</p>
      </div>

      {!result ? (
        <Card className="border-none shadow-2xl rounded-[2.5rem] sm:rounded-[3rem] bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-white/5">
          <CardContent className="p-6 sm:p-14 space-y-8 sm:space-y-12">
            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-6">
                  <div className="space-y-2 px-1 text-center sm:text-left">
                    <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Step 1: Content Ingestion</label>
                    <p className="text-lg sm:text-xl font-medium text-slate-500 leading-relaxed">Upload elite resources or paste text.</p>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <input type="file" accept=".txt,.pdf,.docx" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    <Button 
                      variant="outline"
                      type="button"
                      disabled={isParsing}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 sm:h-32 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all group disabled:opacity-50"
                    >
                      {isParsing ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                           <FileUp className="h-8 w-8 sm:h-10 sm:w-10 text-primary group-hover:scale-110 transition-transform" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Upload Document</span>
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">PDF, DOCX, TXT</span>
                        </div>
                      )}
                    </Button>

                    <textarea 
                      className="w-full min-h-[250px] sm:min-h-[300px] rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-none p-6 sm:p-10 text-lg sm:text-xl dark:text-white resize-none leading-relaxed transition-all outline-none shadow-inner placeholder:text-slate-200"
                      placeholder="Or paste your study material text here..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button onClick={() => setStep(2)} disabled={material.trim().length < 30 || isParsing} className="w-full h-16 sm:h-20 rounded-[1.5rem] bg-primary text-white font-black text-lg sm:text-xl shadow-xl group active:scale-95 transition-all">
                  Continue <ChevronRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-2 px-1 text-center sm:text-left">
                   <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Step 2: Academic Level</label>
                   <p className="text-lg sm:text-xl font-medium text-slate-500 leading-relaxed">Target the specific difficulty for your grade.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {academicLevels.map(l => (
                    <Button key={l} variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)} className={cn("h-14 sm:h-16 rounded-[1.2rem] font-black text-sm sm:text-lg transition-all border-none", level === l ? "bg-primary text-white shadow-xl" : "bg-slate-50 dark:bg-slate-950")}>
                      {l}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4 pt-6">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-14 rounded-[1.2rem] font-bold text-slate-400">Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-[2] h-14 rounded-[1.2rem] bg-primary text-white font-black text-lg shadow-xl">Next <ChevronRight className="ml-2 h-5 w-5" /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-2 px-1 text-center sm:text-left">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Step 3: Test Format</label>
                  <p className="text-lg sm:text-xl font-medium text-slate-500 leading-relaxed">Select how you want to be challenged.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {[
                    { id: "Mixed", label: "Mixed Mode", desc: "MCQ, Flashcards, and Essays." },
                    { id: "MCQ", label: "MCQs Only", desc: "Focus on objective accuracy." },
                    { id: "Flashcard", label: "Flashcards", desc: "Master active recall." },
                    { id: "Essay", label: "Writing Lab", desc: "Develop critical thinking." }
                  ].map(t => (
                    <Button key={t.id} variant={questionType === t.id ? "default" : "outline"} onClick={() => setQuestionType(t.id)} className={cn("h-auto py-5 sm:py-8 px-6 sm:px-10 rounded-[1.5rem] flex flex-col items-start gap-1 transition-all border-none", questionType === t.id ? "bg-primary text-white shadow-xl" : "bg-slate-50 dark:bg-slate-950 text-left")}>
                      <span className="font-black text-lg sm:text-2xl">{t.label}</span>
                      <span className={cn("text-xs sm:text-sm font-medium leading-relaxed", questionType === t.id ? "text-white/80" : "text-slate-500")}>{t.desc}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4 pt-6">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-14 rounded-[1.2rem] font-bold text-slate-400">Back</Button>
                  <Button onClick={() => setStep(4)} className="flex-[2] h-14 rounded-[1.2rem] bg-primary text-white font-black text-lg shadow-xl">Next <ChevronRight className="ml-2 h-5 w-5" /></Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-1">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Step 4: Intensity</label>
                       <p className="text-lg sm:text-xl font-medium text-slate-500 leading-relaxed">Set the scale.</p>
                    </div>
                    <Badge variant="secondary" className="rounded-[1.2rem] px-5 py-3 font-black text-xl sm:text-3xl text-primary bg-primary/10 border-none shadow-sm">{questionCount}</Badge>
                  </div>
                  <div className="px-2 py-4">
                    <Slider 
                      value={[questionCount]} 
                      onValueChange={(v) => setQuestionCount(v[0])} 
                      min={questionType === "Essay" ? 1 : 10} 
                      max={questionType === "Essay" ? 5 : 30} 
                      step={1} 
                      className="py-6 sm:py-10" 
                    />
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                      <span>{questionType === "Essay" ? 1 : 10} Qs</span>
                      <span>{questionType === "Essay" ? 5 : 30} Qs</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-6">
                  <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-16 sm:h-22 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-lg sm:text-2xl shadow-xl group">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Sparkles className="h-6 w-6 mr-3 group-hover:scale-125 transition-transform" />}
                    {isLoading ? "Forging Session..." : "Begin Session"}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(3)} className="h-10 rounded-xl font-black text-[9px] uppercase tracking-[0.4em] text-slate-300">Back to Format</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : showLangConfirm ? (
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 sm:p-20 text-center space-y-8 animate-in zoom-in-95 duration-700">
          <div className="h-16 w-16 sm:h-24 sm:w-24 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Globe className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black font-headline tracking-tighter leading-tight">Evaluation Mix</h2>
            <p className="text-slate-500 text-sm sm:text-lg font-medium leading-relaxed max-w-sm mx-auto">Choose your preferred style for the Mentor's feedback.</p>
          </div>
          <div className="space-y-6 max-w-sm mx-auto">
            <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
              <SelectTrigger className="h-14 sm:h-20 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 border-none font-black text-lg sm:text-2xl px-6 sm:px-12 shadow-inner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[1.2rem] border-none shadow-2xl">
                {languages.map(l => <SelectItem key={l} value={l} className="font-black h-12 text-sm sm:text-xl">{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => launchMode('Essay')} className="w-full h-16 sm:h-22 rounded-[1.2rem] bg-primary text-white font-black text-lg sm:text-2xl shadow-xl active:scale-95 transition-all">
              Enter Writing Lab <ArrowRight className="ml-3 h-6 w-6 sm:h-8 sm:w-8" />
            </Button>
          </div>
        </Card>
      ) : activeMode ? (
        <div className="flex flex-col h-full max-w-3xl mx-auto space-y-6 sm:space-y-10 animate-in slide-in-from-bottom-12 duration-700">
          <div className="flex items-center justify-between px-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveMode(null)} className="font-black text-[8px] uppercase tracking-[0.4em] text-slate-400 hover:text-slate-600">Exit Session</Button>
            <div className="bg-white dark:bg-slate-800 px-6 py-2 rounded-full shadow-lg border border-slate-100 dark:border-white/5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">{currentIdx + 1} / {(activeMode === 'MCQ' ? result?.mcqs : activeMode === 'Flashcard' ? result?.flashcards : result?.essayPrompts)?.length || 0}</span>
            </div>
          </div>

          {activeMode === 'MCQ' && result?.mcqs && (
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900 p-6 sm:p-16 flex flex-col space-y-8 min-h-[450px] sm:min-h-[550px] relative overflow-hidden">
              <div className="space-y-8 flex-1">
                <div className="h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${((currentIdx + 1) / result.mcqs.length) * 100}%` }} />
                </div>
                <h2 className="text-xl sm:text-3xl font-black font-headline text-slate-900 dark:text-white leading-relaxed">{result.mcqs[currentIdx]?.question}</h2>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {result.mcqs[currentIdx]?.options?.map((opt, i) => (
                    <Button key={i} variant="outline" onClick={() => { setIsAnswerRevealed(true); if (opt === result.mcqs![currentIdx].correctAnswer) setMcqCorrectCount(prev => prev + 1); }} disabled={isAnswerRevealed} className={cn("h-auto min-h-[60px] sm:min-h-[80px] justify-start px-6 sm:px-10 py-4 sm:py-6 rounded-[1.5rem] border-none text-left font-black w-full transition-all text-sm sm:text-xl", isAnswerRevealed ? (opt === result.mcqs![currentIdx].correctAnswer ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.3)]" : "opacity-40 bg-slate-50 dark:bg-slate-950") : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-inner")}>
                       <span className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center mr-4 text-[9px] font-black border border-slate-100 dark:border-white/10">{String.fromCharCode(65 + i)}</span>
                       <span className="flex-1">{opt}</span>
                    </Button>
                  ))}
                </div>
              </div>
              {isAnswerRevealed && (
                <div className="pt-6 sm:pt-10 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="p-6 sm:p-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-[1.5rem] sm:rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50 text-sm sm:text-lg text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed shadow-inner italic">
                    <p className="font-black mb-2 sm:mb-4 uppercase tracking-[0.4em] text-[8px] text-emerald-600 not-italic">Mentor's Perspective</p>
                    {result.mcqs[currentIdx].explanation}
                  </div>
                  <Button onClick={() => nextItem()} className="w-full h-16 sm:h-20 rounded-[1.5rem] bg-primary text-white font-black text-lg sm:text-2xl shadow-xl active:scale-95 transition-all">
                    Next Challenge <ChevronRight className="ml-4 h-6 w-6 sm:h-8 sm:w-8" />
                  </Button>
                </div>
              )}
            </Card>
          )}

          {activeMode === 'Flashcard' && result?.flashcards && (
            <div className="perspective-1000 w-full min-h-[400px] sm:min-h-[500px] cursor-pointer" onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}>
              <div className={cn("relative w-full h-full min-h-[400px] sm:min-h-[500px] transition-all duration-1000 preserve-3d shadow-2xl rounded-[2.5rem] sm:rounded-[3.5rem]", isAnswerRevealed ? "rotate-y-180" : "")}>
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-24 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-white/5">
                  <Badge className="bg-primary/10 text-primary mb-8 font-black uppercase text-[8px] tracking-[0.4em] px-8 py-3 rounded-full">Recall Prompt</Badge>
                  <h3 className="text-xl sm:text-4xl font-black font-headline text-slate-900 dark:text-white leading-relaxed">{result.flashcards[currentIdx]?.front}</h3>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-950 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-24 flex flex-col items-center justify-center text-center border border-white/5">
                  <Badge className="bg-emerald-500/10 text-emerald-400 mb-8 font-black uppercase text-[8px] tracking-[0.4em] px-8 py-3 rounded-full">Mastery Point</Badge>
                  <p className="text-lg sm:text-3xl font-black text-slate-100 leading-relaxed italic">"{result.flashcards[currentIdx]?.back}"</p>
                  <Button onClick={(e) => { e.stopPropagation(); nextItem(); }} className="mt-10 h-16 px-12 rounded-[1.5rem] bg-white text-slate-950 font-black text-lg sm:text-2xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all">Mastered <Check className="ml-3 h-6 w-6 sm:h-8 sm:w-8" /></Button>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'Essay' && result?.essayPrompts && (
            <div className="flex flex-col space-y-6 sm:space-y-10">
              <Card className="border-none shadow-xl rounded-[2rem] bg-white dark:bg-slate-900 p-8 sm:p-12 border border-slate-100 dark:border-white/5">
                <Badge className="bg-primary/10 text-primary mb-4 font-black uppercase text-[8px] tracking-[0.4em] px-8 py-3 rounded-full">Writing Lab Prompt</Badge>
                <h2 className="text-xl sm:text-4xl font-black font-headline leading-relaxed text-slate-900 dark:text-white">{result.essayPrompts[currentIdx]?.prompt}</h2>
              </Card>
              
              {!essayResult ? (
                <div className="flex flex-col space-y-6 sm:space-y-10">
                  <textarea 
                    className="w-full min-h-[350px] sm:min-h-[450px] rounded-[2rem] sm:rounded-[3rem] bg-white dark:bg-slate-950 border-none p-8 sm:p-16 text-lg sm:text-3xl font-medium dark:text-white resize-none leading-relaxed transition-all outline-none shadow-xl placeholder:text-slate-100"
                    placeholder="Express your thesis here..."
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                  />
                  <Button onClick={handleEssayAnalysis} disabled={isAnalyzingEssay} className="w-full h-16 sm:h-22 rounded-[1.5rem] sm:rounded-[2rem] bg-primary text-white font-black text-xl sm:text-3xl shadow-xl group active:scale-95 transition-all">
                    {isAnalyzingEssay ? <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8 mr-3" /> : <SendHorizontal className="h-6 w-6 sm:h-8 sm:w-8 mr-3 group-hover:translate-x-4 transition-transform" />}
                    Submit for Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-10 pb-20 animate-in zoom-in-95 duration-1000">
                  <div className="text-center space-y-6 mb-8">
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[8px] tracking-[0.4em] px-8 py-3 rounded-full shadow-lg">Scholar Report Card</Badge>
                     <div className="relative h-48 w-48 sm:h-64 sm:w-64 flex items-center justify-center mx-auto">
                        <svg className="h-full w-full rotate-[-90deg]">
                          <circle cx="96" cy="96" r="86" fill="transparent" stroke="currentColor" strokeWidth="16" className="text-slate-50 dark:text-slate-800" sm:cx="128" sm:cy="128" sm:r="116" sm:strokeWidth="20" />
                          <circle cx="96" cy="96" r="86" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="540" strokeDashoffset={540 - (540 * essayResult.evaluationData.overallScore) / 100} strokeLinecap="round" className="text-primary transition-all duration-[2.5s] ease-out shadow-lg" sm:cx="128" sm:cy="128" sm:r="116" sm:strokeWidth="20" sm:strokeDasharray="728" sm:strokeDashoffset={728 - (728 * essayResult.evaluationData.overallScore) / 100} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl sm:text-7xl font-black text-slate-900 dark:text-white">{essayResult.evaluationData.overallScore}%</span>
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">OVERALL SCORE</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="bg-slate-900 p-6 sm:p-10 rounded-[2rem] border border-amber-500/20 flex items-center justify-between shadow-xl relative overflow-hidden">
                    <div className="space-y-1 relative z-10 text-left">
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Scholar Reward</p>
                      <h3 className="text-4xl sm:text-6xl font-black text-amber-400">+{essayResult.evaluationData.coinsEarned}</h3>
                    </div>
                    <div className="h-14 w-14 sm:h-24 sm:w-24 rounded-[1.2rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                      <Coins className="h-8 w-8 sm:h-12 sm:w-12 text-amber-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: "Grammar Accuracy", val: essayResult.evaluationData.grammarScore, icon: Zap },
                      { label: "Content Depth", val: essayResult.evaluationData.contentDepthScore, icon: Trophy },
                      { label: "Relevancy Score", val: essayResult.evaluationData.relevancyScore, icon: Target }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900/60 p-6 sm:p-10 rounded-[1.5rem] border border-slate-100 dark:border-white/5 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <stat.icon className="h-4 w-4 text-primary" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                           </div>
                           <span className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white">{stat.val}%</span>
                        </div>
                        <Progress value={stat.val} className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" />
                      </div>
                    ))}
                  </div>

                  <div className="p-6 sm:p-10 bg-primary/5 rounded-[2rem] italic text-lg sm:text-3xl text-slate-700 dark:text-slate-100 leading-relaxed border-l-8 border-primary shadow-inner">
                    " {essayResult.professorFeedback} "
                  </div>

                  <Button onClick={() => nextItem()} className="w-full h-16 sm:h-22 rounded-[1.5rem] bg-primary text-white font-black text-lg sm:text-2xl shadow-xl active:scale-95 transition-all">
                    Next Challenge <ChevronRight className="ml-4 h-6 w-6 sm:h-8 sm:w-8" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Card className="border-none shadow-2xl rounded-[2.5rem] sm:rounded-[4rem] bg-white dark:bg-slate-900 p-8 sm:p-24 text-center space-y-10 sm:space-y-14 animate-in zoom-in-95 duration-700">
          <div className="relative inline-block">
            <div className="bg-primary/10 h-24 w-24 sm:h-32 w-32 rounded-[2rem] flex items-center justify-center mx-auto relative z-10 shadow-lg">
              <Sparkles className="h-10 w-10 sm:h-16 sm:w-16 text-primary" />
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-6xl font-black font-headline tracking-tighter leading-tight">Intelligence Ready</h2>
            <p className="text-slate-500 text-lg sm:text-2xl font-medium leading-relaxed max-w-sm mx-auto">Your customized academic practice set is finalized.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
            {[
              { id: 'MCQ', icon: ListChecks, label: 'Objective MCQs', list: result?.mcqs, color: 'text-blue-500' },
              { id: 'Flashcard', icon: RotateCw, label: 'Active Recall', list: result?.flashcards, color: 'text-amber-500' },
              { id: 'Essay', icon: ClipboardList, label: 'Writing Lab', list: result?.essayPrompts, color: 'text-emerald-500' }
            ].map((m) => m.list?.length ? (
              <Button key={m.id} variant="outline" onClick={() => startMode(m.id as any)} className="h-20 sm:h-24 rounded-[1.5rem] sm:rounded-[2.5rem] justify-start px-6 sm:px-10 group relative overflow-hidden border-none bg-slate-50 dark:bg-slate-950 hover:bg-white transition-all active:scale-95">
                <div className={cn("p-4 rounded-xl bg-white dark:bg-slate-900 mr-4 sm:mr-8 shadow-sm group-hover:scale-110 transition-transform", m.color)}>
                  <m.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg sm:text-2xl">{m.list.length} {m.label}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Available Session</p>
                </div>
                {completedModes.includes(m.id) && <Check className="ml-auto h-8 w-8 text-emerald-500 animate-in zoom-in-50" />}
              </Button>
            ) : null)}
          </div>
          <Button onClick={() => { setStep(1); setResult(null); }} variant="ghost" className="w-full font-black text-[9px] uppercase tracking-[0.5em] text-slate-300 pt-8 hover:text-slate-500">
            Reset Session Wizard
          </Button>
        </Card>
      )}
    </div>
  )
}
