'use server';
/**
 * @fileOverview High-performance academic assessment generator.
 * Strictly enforces Mixed Mode counts for MCQs, Flashcards, and Essays.
 */

import { z } from 'zod';

const MCQSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string(),
});

const FlashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
});

const EssayPromptSchema = z.object({
  prompt: z.string(),
  evaluationCriteria: z.array(z.string()),
  modelAnswerOutline: z.array(z.string()),
});

const GenerateStudyAssessmentsInputSchema = z.object({
  studyMaterial: z.string().min(1, "Study material cannot be empty"),
  assessmentTypes: z.array(z.enum(['MCQ', 'Flashcard', 'Essay', 'Mixed'])),
  academicLevel: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  questionCount: z.number().int().min(1).max(100).optional().default(10),
  mcqCount: z.number().optional(),
  flashcardCount: z.number().optional(),
  essayCount: z.number().optional(),
});
export type GenerateStudyAssessmentsInput = z.infer<typeof GenerateStudyAssessmentsInputSchema>;

const GenerateStudyAssessmentsOutputSchema = z.object({
  mcqs: z.array(MCQSchema).default([]),
  flashcards: z.array(FlashcardSchema).default([]),
  essayPrompts: z.array(EssayPromptSchema).default([]),
  totalTokens: z.number().optional(),
  error: z.string().optional(),
});
export type GenerateStudyAssessmentsOutput = z.infer<typeof GenerateStudyAssessmentsOutputSchema>;

/**
 * Resilient JSON extractor that handles markdown blocks and loose formatting.
 */
function extractJson(text: string) {
  try {
    const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const rawContent = jsonBlockMatch ? jsonBlockMatch[1] : text;
    
    const start = rawContent.indexOf('{');
    const end = rawContent.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      throw new Error("No JSON structure found in AI response.");
    }
    
    return JSON.parse(rawContent.substring(start, end + 1));
  } catch (e: any) {
    console.error("JSON Extraction Error:", e.message);
    throw new Error("The AI provided an invalid data structure.");
  }
}

export async function generateStudyAssessments(input: GenerateStudyAssessmentsInput): Promise<GenerateStudyAssessmentsOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { error: "AI credentials missing." };
  
  if (input.studyMaterial.length < 30) {
    return { error: "Content too short for scholarship." };
  }

  let material = input.studyMaterial;
  if (material.length > 8000) material = material.substring(0, 8000) + "...";

  const isMixed = input.assessmentTypes.includes('Mixed');
  const targetMcq = isMixed ? (input.mcqCount || 0) : (input.assessmentTypes.includes('MCQ') ? input.questionCount : 0);
  const targetFlash = isMixed ? (input.flashcardCount || 0) : (input.assessmentTypes.includes('Flashcard') ? input.questionCount : 0);
  const targetEssay = isMixed ? (input.essayCount || 0) : (input.assessmentTypes.includes('Essay') ? input.questionCount : 0);

  const systemPrompt = `You are an Expert Academic Intelligence Generator for Discate AI. 
CRITICAL: You MUST return a SINGLE JSON object containing ALL three keys: "mcqs", "flashcards", and "essayPrompts".

MANDATORY COUNTS TO GENERATE:
- mcqs: ${targetMcq} items (DO NOT SKIP)
- flashcards: ${targetFlash} items (DO NOT SKIP)
- essayPrompts: ${targetEssay} items (DO NOT SKIP)

If any count is greater than 0, you MUST populate that array. Do not return only one type if multiple are requested. 
If Mixed Mode is selected, failing to return Essays or Flashcards is an academic failure.

ACADEMIC PARAMETERS:
- Level: ${input.academicLevel}
- Difficulty: ${input.difficulty}

JSON FORMAT RULES:
- mcqs: array of objects {question, options[], correctAnswer, explanation}
- flashcards: array of objects {front, back}
- essayPrompts: array of objects {prompt, evaluationCriteria[], modelAnswerOutline[]}

DO NOT include any text before or after the JSON block.`;

  const userPrompt = `Source Material:
"""
${material}
"""

Generate exactly ${targetMcq} MCQs, ${targetFlash} Flashcards, and ${targetEssay} Essay Prompts in pure JSON.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error("Groq API error occurred.");
    
    const data = await response.json();
    const content = extractJson(data.choices[0].message.content);
    
    return GenerateStudyAssessmentsOutputSchema.parse({
      mcqs: Array.isArray(content.mcqs) ? content.mcqs : [],
      flashcards: Array.isArray(content.flashcards) ? content.flashcards : [],
      essayPrompts: Array.isArray(content.essayPrompts) ? content.essayPrompts : [],
      totalTokens: data.usage?.total_tokens
    });
  } catch (error: any) {
    console.error("Discate Forge Failure:", error.message);
    return { error: "Failed to forge scholarly data. AI connection unstable, please try again." };
  }
}