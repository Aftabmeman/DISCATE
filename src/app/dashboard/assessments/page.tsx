"use client"

import { useState, useRef } from "react"
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
  Info
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { generateStudyAssessments, type GenerateStudyAssessmentsOutput } from "@/ai/flows/generate-study-assessments-flow"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export default function AssessmentsPage() {
  const [material, setMaterial] = useState("")
  const [level, setLevel] = useState("Undergraduate")
  const [difficulty, setDifficulty] = useState<string>("Medium")
  const [count, setCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerateStudyAssessmentsOutput | null>(null)
  
  // Quiz Mode States
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)

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
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type) && !file.name.endsWith('.ppt') && !file.name.endsWith('.pptx')) {
      toast({
        title: "Unsupported file",
        description: "Please upload a PDF, PPT, or Image file.",
        variant: "destructive"
      })
      return
    }

    setUploadedFile(file)
    simulateExtraction(file)
  }

  const simulateExtraction = (file: File) => {
    setIsExtracting(true)
    setExtractProgress(0)
    
    const interval = setInterval(() => {
      setExtractProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    setTimeout(() => {
      setIsExtracting(false)
      const mockText = `This is the extracted content from ${file.name}. It contains key academic concepts and definitions required for the assessment generation. [Simulated Extraction Success]`
      setMaterial(mockText)
      toast({
        title: "Extraction Complete",
        description: `Successfully extracted text from ${file.name}.`
      })
    }, 2500)
  }

  const clearFile = () => {
    setUploadedFile(null)
    setMaterial("")
    setExtractProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleGenerate = async () => {
    if (!material) {
      toast({
        title: "Content missing",
        description: "Please provide study material text or upload a file.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const assessments = await generateStudyAssessments({
        studyMaterial: material,
        assessmentTypes: ["Mixed"],
        academicLevel: level,
        difficulty: difficulty as any,
        questionCount: count
      })
      setResult(assessments)
      toast({
        title: "Assessments Ready",
        description: `Successfully generated ${count} items.`
      })
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Something went wrong. Please check your material and try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionSelect = (option: string) => {
    if (isAnswerRevealed) return
    setSelectedOption(option)
    setIsAnswerRevealed(true)
  }

  const nextQuestion = () => {
    const mcqs = result?.mcqs || []
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswerRevealed(false)
    } else {
      setIsQuizMode(false)
      toast({
        title: "Quiz Finished!",
        description: "You've completed all MCQs in this set."
      })
    }
  }

  const startQuiz = () => {
    if (!result?.mcqs?.length) {
      toast({
        title: "No MCQs",
        description: "This set doesn't contain multiple choice questions.",
        variant: "destructive"
      })
      return
    }
    setIsQuizMode(true)
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsAnswerRevealed(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Assessment Center</h1>
        <p className="text-muted-foreground text-lg">Generate custom quizzes and flashcards from your study materials.</p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="font-headline text-xl">Material Input</CardTitle>
                <CardDescription>Provide the source content for your assessment.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl h-12 p-1 bg-slate-100">
                    <TabsTrigger value="paste" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="mt-0">
                    <textarea 
                      className="w-full min-h-[350px] rounded-xl border border-input bg-background px-4 py-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none leading-relaxed"
                      placeholder="Paste your study notes, textbook chapters, or articles here..."
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="upload" className="mt-0">
                    {!uploadedFile ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full min-h-[350px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 transition-all hover:bg-slate-50 hover:border-primary/30 cursor-pointer group"
                      >
                        <input 
                          type="file" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleFileChange}
                          accept=".pdf,.ppt,.pptx,image/*"
                        />
                        <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Click or drag to upload</h3>
                        <p className="text-slate-500 text-center max-w-xs mb-6">
                          Supports PDF, PPTX, and high-quality images for text extraction.
                        </p>
                        <div className="flex gap-3">
                          <Badge variant="outline" className="bg-white gap-1 py-1 px-3">
                            <FileIcon className="h-3 w-3" /> PDF
                          </Badge>
                          <Badge variant="outline" className="bg-white gap-1 py-1 px-3">
                            <FileStack className="h-3 w-3" /> PPT
                          </Badge>
                          <Badge variant="outline" className="bg-white gap-1 py-1 px-3">
                            <FileImage className="h-3 w-3" /> Image
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full min-h-[350px] border border-slate-200 rounded-2xl p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              {uploadedFile.type.includes('image') ? (
                                <FileImage className="h-6 w-6 text-primary" />
                              ) : uploadedFile.name.endsWith('.pdf') ? (
                                <FileText className="h-6 w-6 text-primary" />
                              ) : (
                                <FileStack className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{uploadedFile.name}</p>
                              <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={clearFile} className="hover:bg-destructive/10 hover:text-destructive rounded-full">
                            <X className="h-5 w-5" />
                          </Button>
                        </div>

                        {isExtracting ? (
                          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                            <div className="relative h-24 w-24">
                              <Loader2 className="h-24 w-24 text-primary animate-spin absolute" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">{extractProgress}%</span>
                              </div>
                            </div>
                            <div className="w-full max-w-md space-y-2">
                              <p className="text-sm font-medium text-slate-600 text-center">AI is extracting text and structure...</p>
                              <Progress value={extractProgress} className="h-2" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Extracted Preview</h4>
                              <Badge className="bg-emerald-100 text-emerald-700 border-none">Ready</Badge>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[150px] text-sm text-slate-600 leading-relaxed italic">
                              {material}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Academic Level</label>
                      <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High School">High School</SelectItem>
                          <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Difficulty Level</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Question Count</label>
                      <span className="text-primary font-bold text-lg">{count}</span>
                    </div>
                    <Slider 
                      value={[count]} 
                      min={1} 
                      max={20} 
                      step={1} 
                      onValueChange={(val) => setCount(val[0])}
                      className="py-4"
                    />
                  </div>

                  <Button 
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-md shadow-xl shadow-primary/20"
                    onClick={handleGenerate}
                    disabled={isLoading || isExtracting}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Assessments
                        <Zap className="ml-2 h-5 w-5 fill-current" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
             <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <BrainCircuit className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold font-headline mb-2">Master Your Topics</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Mentur AI identifies the core concepts in your material to build optimized testing sets.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Mixed MCQ & Flashcards
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Difficulty Adaptation
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Structural Analysis
                  </div>
                </div>
              </div>
          </div>
        </div>
      ) : isQuizMode ? (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setIsQuizMode(false)} className="text-slate-500 hover:text-slate-900">
                  Exit Quiz
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">Question {currentQuestionIndex + 1} of {result.mcqs?.length}</span>
                  <Progress value={((currentQuestionIndex + 1) / (result.mcqs?.length || 1)) * 100} className="w-32 h-1.5" />
                </div>
             </div>
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b p-8">
              <Badge className="mb-4 bg-primary/10 text-primary border-none font-bold">Multiple Choice</Badge>
              <CardTitle className="text-2xl font-headline leading-tight text-slate-900">
                {result.mcqs?.[currentQuestionIndex].question}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {result.mcqs?.[currentQuestionIndex].options.map((option, idx) => {
                  const isCorrect = option === result.mcqs?.[currentQuestionIndex].correctAnswer
                  const isSelected = selectedOption === option
                  
                  let buttonStyle = "bg-white border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-slate-50"
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      buttonStyle = "bg-emerald-50 border-emerald-400 text-emerald-700 font-bold"
                    } else if (isSelected && !isCorrect) {
                      buttonStyle = "bg-destructive/5 border-destructive/40 text-destructive font-bold"
                    } else {
                      buttonStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                    }
                  }

                  return (
                    <Button 
                      key={idx}
                      variant="outline"
                      className={cn("h-16 justify-start px-6 rounded-2xl border-2 transition-all text-base text-left whitespace-normal", buttonStyle)}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isAnswerRevealed}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-8 w-8 rounded-full border flex items-center justify-center font-bold text-sm shrink-0",
                          isSelected ? "bg-primary text-white border-primary" : "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        {option}
                      </div>
                    </Button>
                  )
                })}
              </div>

              {isAnswerRevealed && (
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-xl h-fit">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-slate-900">AI Explanation</p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {result.mcqs?.[currentQuestionIndex].explanation || "The correct answer is derived from the core concepts presented in your study material."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isAnswerRevealed && (
            <div className="flex justify-center">
              <Button 
                onClick={nextQuestion}
                className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-2xl transition-transform hover:scale-105"
              >
                {currentQuestionIndex < (result.mcqs?.length || 0) - 1 ? "Next Question" : "View Results"}
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setResult(null)} className="text-primary font-semibold">
              ← Create New Set
            </Button>
            <div className="flex gap-3">
              <Button 
                onClick={startQuiz}
                className="rounded-xl px-8 h-12 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20"
              >
                <Zap className="mr-2 h-4 w-4 fill-current" />
                Take Quiz Mode
              </Button>
              <Button variant="outline" className="rounded-xl px-6 h-12 border-slate-200 font-bold">Save Study Set</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Generated Set Preview</h3>
                  <p className="text-sm text-slate-500">Review your mixed assessment items below.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white px-3 py-1">{result.mcqs?.length || 0} MCQs</Badge>
                <Badge variant="secondary" className="bg-white px-3 py-1">{result.flashcards?.length || 0} Flashcards</Badge>
              </div>
            </div>

            {result.mcqs?.map((mcq, i) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Multiple Choice</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-semibold text-slate-900">{mcq.question}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {mcq.options.map((opt, j) => (
                      <div 
                        key={j} 
                        className={`p-3 rounded-xl border text-sm transition-colors ${
                          opt === mcq.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {result.flashcards?.map((card, i) => (
              <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow bg-amber-50/30">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-lg">Flashcard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">FRONT</p>
                    <p className="text-lg font-bold text-slate-900">{card.front}</p>
                  </div>
                  <div className="pt-4 border-t border-amber-200/50 space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">BACK</p>
                    <p className="text-slate-700 leading-relaxed">{card.back}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {result.essayPrompts?.map((essay, i) => (
              <Card key={i} className="lg:col-span-2 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Essay Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-xl font-bold text-slate-900 leading-tight">{essay.prompt}</p>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Model Answer Roadmap</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {essay.modelAnswerOutline.map((point, j) => (
                        <li key={j} className="flex gap-3 text-sm text-slate-700">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
