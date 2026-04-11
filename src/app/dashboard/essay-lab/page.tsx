
"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  FileSearch,
  BookOpen,
  Upload,
  Type,
  FileImage,
  X,
  Loader2,
  Trophy,
  MessageSquare,
  PlusCircle,
  ImageIcon
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function EssayLabPage() {
  const [topic, setTopic] = useState("")
  const [question, setQuestion] = useState("")
  const [essayText, setEssayText] = useState("")
  const [academicLevel, setAcademicLevel] = useState<any>("College")
  const [wordLimit, setWordLimit] = useState("500-1000")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EvaluateEssayFeedbackOutput | null>(null)
  
  const [inputType, setInputType] = useState("typed")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (uploadedImages.length + imageFiles.length > 10) {
      toast({
        title: "Limit Exceeded",
        description: "You can upload a maximum of 10 photos.",
        variant: "destructive"
      })
      return
    }

    if (imageFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...imageFiles])
      toast({
        title: "Images Added",
        description: `${imageFiles.length} photos added for transcription.`
      })
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const processAllImages = () => {
    if (uploadedImages.length === 0) return
    setIsProcessingImages(true)
    
    // Simulating OCR for multiple pages
    setTimeout(() => {
      setIsProcessingImages(false)
      setEssayText(`[Transcript from ${uploadedImages.length} handwritten pages]\n\nThe analysis presented in these pages explores the fundamental shifts in pedagogical approaches. Through extensive research, we've identified that student engagement is the primary driver of retention...`)
      toast({
        title: "Multi-page Transcription Done",
        description: "All handwritten pages have been digitized."
      })
      setInputType("typed")
    }, 1500 + (uploadedImages.length * 500))
  }

  const handleEvaluate = async () => {
    if (!topic || !essayText) {
      toast({ title: "Missing Information", description: "Topic and content are required.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const evaluation = await evaluateEssayFeedback({
        topic,
        question,
        essayText,
        academicLevel: academicLevel as any,
        wordLimit
      })
      setResult(evaluation)
    } catch (error) {
      toast({ title: "Error", description: "Failed to evaluate essay.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900 dark:text-white">Essay Lab</h1>
        <p className="text-muted-foreground text-lg dark:text-slate-400">Native AI evaluation for critical writing.</p>
      </div>

      {!result ? (
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[32px] dark:bg-slate-900/50">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="font-headline text-xl text-slate-900 dark:text-white">Draft Assessment</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Subject Topic</label>
                  <Input placeholder="e.g. Modern Philosophy" value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-2xl h-12 dark:bg-slate-950 dark:border-slate-800 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Target Level</label>
                  <Select value={academicLevel} onValueChange={setAcademicLevel}>
                    <SelectTrigger className="rounded-2xl h-12 dark:bg-slate-950 dark:border-slate-800 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 rounded-2xl h-12 p-1 bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="typed" className="rounded-xl text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">Typed Answer</TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-xl text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">Scan Handwriting</TabsTrigger>
                  </TabsList>

                  <TabsContent value="typed" className="mt-0">
                    <div className="relative">
                      <Textarea 
                        placeholder="Write or paste your analysis here..." 
                        className="min-h-[350px] rounded-[24px] p-6 text-lg border-2 focus-visible:ring-primary/20 resize-none leading-relaxed dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                        value={essayText}
                        onChange={(e) => setEssayText(e.target.value)}
                      />
                      <Badge className="absolute bottom-6 right-6 bg-slate-100 text-slate-900 border-none font-bold dark:bg-slate-800 dark:text-white">
                        Words: {wordCount}
                      </Badge>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-0">
                    <div className="space-y-6">
                      <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-full min-h-[200px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center p-8 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer group"
                      >
                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple />
                        <div className="bg-primary/10 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                          <PlusCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold dark:text-white">Add Hand-written Pages</h3>
                        <p className="text-xs text-slate-400 mt-1">Select up to 10 photos</p>
                      </div>

                      {uploadedImages.length > 0 && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {uploadedImages.map((file, idx) => (
                              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 group">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={`Page ${idx + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                  className="absolute top-1 right-1 h-6 w-6 bg-destructive/90 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[10px] text-white py-1 px-2 font-bold">
                                  Page {idx + 1}
                                </div>
                              </div>
                            ))}
                          </div>

                          <Button 
                            onClick={processAllImages}
                            disabled={isProcessingImages}
                            className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-primary text-white font-bold"
                          >
                            {isProcessingImages ? (
                              <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Transcribing {uploadedImages.length} Pages...
                              </>
                            ) : (
                              <>
                                <Type className="h-5 w-5 mr-2" />
                                Transcribe All Pages
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Button size="lg" onClick={handleEvaluate} disabled={isLoading || isProcessingImages} className="w-full h-16 rounded-[24px] bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95">
                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Analyze Writing"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-20">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setResult(null)} className="text-slate-500 font-bold h-10 px-0 dark:text-slate-400">← Back</Button>
            <Badge className="bg-primary/10 text-primary border-none uppercase font-bold text-[10px] tracking-widest">Report Ready</Badge>
          </div>

          <Card className="border-none shadow-2xl rounded-[32px] p-8 text-center bg-white space-y-6 dark:bg-slate-900">
            <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Academic Score</p>
               <h2 className="text-6xl font-black font-headline text-slate-900 dark:text-white">{result.score}<span className="text-lg text-slate-300 dark:text-slate-700">/10</span></h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 text-left">
               <div className="bg-emerald-50 rounded-[24px] p-6 space-y-3 dark:bg-emerald-900/10">
                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.slice(0, 3).map((s, i) => (
                      <li key={i} className="text-sm text-slate-700 font-medium leading-relaxed dark:text-slate-200">• {s}</li>
                    ))}
                  </ul>
               </div>
               <div className="bg-amber-50 rounded-[24px] p-6 space-y-3 dark:bg-amber-900/10">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2 dark:text-amber-400">
                    <Lightbulb className="h-4 w-4" /> Refinement
                  </h4>
                  <ul className="space-y-2">
                    {result.improvementSuggestions.slice(0, 2).map((s, i) => (
                      <li key={i} className="text-sm text-slate-700 font-medium leading-relaxed dark:text-slate-200">• {s}</li>
                    ))}
                  </ul>
               </div>
            </div>
          </Card>

          <footer className="pt-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Powered by Mentur AI Engine — High Speed Analysis
            </p>
          </footer>
        </div>
      )}
    </div>
  )
}
