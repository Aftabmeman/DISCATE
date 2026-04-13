
"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BrainCircuit, 
  Settings2, 
  Zap, 
  CheckCircle2, 
  HelpCircle,
  Upload,
  FileText,
  FileImage,
  FileStack,
  X,
  Loader2,
  FileIcon,
  ChevronRight,
  ChevronLeft,
  Info,
  Type,
  RotateCw,
  Trophy,
  BookOpen,
  EyeOff,
  Sparkles,
  MessageSquare,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  Cpu,
  FileUp,
  ListChecks,
  History
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc } from "firebase/firestore"

export default function AssessmentsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [material, setMaterial] = useState("")
  const [level, setLevel] = useState("Undergraduate Year 1")
  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [questionType, setQuestionType] = useState<string>("Mixed")
  
  // Mixed Mode Counts
  const [mcqCount, setMcqCount] = useState(10)
  const [flashcardCount, setFlashcardCount] = useState(5)
  const [essayCount, setEssayCount] = useState(2)

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  
  // States for interactive modes
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  // File Upload States
  const [inputType, setInputType] = useState<string>("paste")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleExtractText = () => {
    if (!uploadedFile) return
    setIsExtracting(true)
    setExtractProgress(0)
    
    const interval = setInterval(() => {
      setExtractProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExtracting(false)
          setMaterial(`Extracted content from ${uploadedFile.name}: \n\nAcademic context for ${level} at ${difficulty} difficulty. This document provides a comprehensive overview of the subject matter, including theoretical frameworks and practical applications...`)
          toast({ title: "Extraction Complete", description: "Material ingested successfully." })
          setInputType("paste")
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleGenerate = async () => {
    if (!material && !uploadedFile) {
      toast({ title: "Content missing", description: "Provide study material text or upload a file.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const typesMapping: any = questionType === "Mixed" ? ["MCQ", "Flashcard", "Essay"] : [questionType]
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: typesMapping,
        academicLevel: level,
        difficulty: difficulty as any,
        questionCount: mcqCount // Simplification for MVP
      })
      setResult(assessments)
      toast({ title: "Assessments Ready", description: "Journey generated." })
    } catch (error) {
      toast({ title: "Generation Error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = () => {
    if (!result?.mcqs?.length) return
    setIsQuizMode(true)
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsAnswerRevealed(false)
    setQuizScore(0)
  }

  const handleOptionSelect = (option: string) => {
    if (isAnswerRevealed) return
    setSelectedOption(option)
    setIsAnswerRevealed(true)
    if (option === result?.mcqs?.[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < (result?.mcqs?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswerRevealed(false)
    } else {
      setIsQuizMode(false)
      toast({ title: "Quiz Finished!", description: `Score: ${quizScore}/${result?.mcqs?.length}` })
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-28 animate-in fade-in duration-500">
      <div className="px-1">
        <h1 className="text-2xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Assessment Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Transform documents into native study experiences.</p>
      </div>

      {!result ? (
        <div className="space-y-6 overflow-y-auto no-scrollbar pb-10">
          <Card className="border-none shadow-sm rounded-[24px] overflow-hidden bg-white dark:bg-slate-900/50">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-headline">Study Source</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
                  <TabsTrigger value="paste" className="rounded-lg text-xs font-bold">Paste Text</TabsTrigger>
                  <TabsTrigger value="upload" className="rounded-lg text-xs font-bold">Upload File</TabsTrigger>
                </TabsList>
                
                <TabsContent value="paste">
                  <Textarea 
                    className="min-h-[180px] rounded-2xl dark:bg-slate-950 dark:border-slate-800 text-sm p-4"
                    placeholder="Paste notes here..."
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="upload">
                  {!uploadedFile ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-[180px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx" />
                      <div className="bg-primary/10 p-4 rounded-full mb-3">
                        <FileUp className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Tap to Upload PDF/PPT</p>
                    </div>
                  ) : (
                    <div className="h-[180px] bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 w-full truncate">
                        <FileIcon className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-xs font-bold truncate flex-1">{uploadedFile.name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setUploadedFile(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button onClick={handleExtractText} disabled={isExtracting} className="w-full rounded-xl bg-slate-900 dark:bg-primary font-bold h-11 text-xs">
                        {isExtracting ? `Extracting ${extractProgress}%` : "Extract & Process"}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[24px] bg-white dark:bg-slate-900/50">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Level</label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Undergraduate Year 1">UG Year 1</SelectItem>
                        <SelectItem value="Competitive Exams (UPSC)">UPSC/Govt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Standard</SelectItem>
                        <SelectItem value="Hard">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Mode</label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mixed">Mixed Learning Journey</SelectItem>
                      <SelectItem value="MCQ">Pure MCQs</SelectItem>
                      <SelectItem value="Flashcard">Flashcards Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {questionType === "Mixed" && (
                  <div className="grid grid-cols-3 gap-3 pt-2 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">MCQs</label>
                      <Input type="number" value={mcqCount} onChange={(e) => setMcqCount(Number(e.target.value))} className="h-10 rounded-xl text-center text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Flash</label>
                      <Input type="number" value={flashcardCount} onChange={(e) => setFlashcardCount(Number(e.target.value))} className="h-10 rounded-xl text-center text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Essay</label>
                      <Input type="number" value={essayCount} onChange={(e) => setEssayCount(Number(e.target.value))} className="h-10 rounded-xl text-center text-xs" />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading} 
                className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Build Experience
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : isQuizMode ? (
        <div className="flex flex-col h-full max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-between px-1">
            <Button variant="ghost" size="sm" onClick={() => setIsQuizMode(false)} className="text-slate-500 text-xs font-bold">Exit</Button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Question {currentQuestionIndex + 1} of {result.mcqs?.length}</span>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${((currentQuestionIndex + 1) / (result.mcqs?.length || 1)) * 100}%` }} />
              </div>
            </div>
          </div>

          <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 flex-1 flex flex-col">
            <div className="p-8 pb-4 flex-1 overflow-y-auto no-scrollbar">
              <h2 className="text-xl font-bold font-headline leading-tight dark:text-white">
                {result.mcqs?.[currentQuestionIndex].question}
              </h2>
              <div className="mt-8 space-y-3">
                {result.mcqs?.[currentQuestionIndex].options.map((option, idx) => {
                  const isCorrect = option === result.mcqs?.[currentQuestionIndex].correctAnswer
                  const isSelected = selectedOption === option
                  let style = "bg-slate-50 border-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  if (isAnswerRevealed) {
                    if (isCorrect) style = "bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-400"
                    else if (isSelected) style = "bg-destructive/5 border-destructive/40 text-destructive"
                    else style = "opacity-40"
                  }
                  return (
                    <Button 
                      key={idx} 
                      variant="outline" 
                      onClick={() => handleOptionSelect(option)}
                      disabled={isAnswerRevealed}
                      className={cn("h-auto min-h-[64px] justify-start px-5 rounded-2xl border-2 transition-all text-sm text-left py-3", style)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="h-6 w-6 rounded-full border border-slate-200 flex items-center justify-center text-[10px] font-black shrink-0 bg-white dark:bg-slate-950">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-snug">{option}</span>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
            {isAnswerRevealed && (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t">
                <Button onClick={nextQuestion} className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-primary text-white font-bold">
                  Continue Journey <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar space-y-6">
          <Card className="border-none shadow-xl rounded-[32px] bg-white dark:bg-slate-900 p-8 text-center space-y-6">
            <div className="bg-primary/10 h-16 w-16 rounded-[20px] flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-headline dark:text-white">Native Journey Ready</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">AI Mentorship context built for {level}.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 py-2 text-left">
              {result.mcqs?.length ? (
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-bold dark:text-white">{result.mcqs.length} Knowledge Checks</p>
                    <p className="text-[10px] text-slate-400">Adaptive MCQ assessment</p>
                  </div>
                </div>
              ) : null}
              {result.flashcards?.length ? (
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <RotateCw className="h-5 w-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-xs font-bold dark:text-white">{result.flashcards.length} Active Recall Cards</p>
                    <p className="text-[10px] text-slate-400">Focused practice sessions</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={startQuiz} className="h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20">
                Start Assessment
              </Button>
              <Button variant="ghost" onClick={() => setResult(null)} className="h-12 rounded-xl text-slate-500 text-xs font-bold">
                Reset Material
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
