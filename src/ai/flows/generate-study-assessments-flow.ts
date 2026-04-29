
'use server';
/**
 * @fileOverview High-performance academic assessment generator.
 * Strict Contractual Count Enforcement for Mixed Mode.
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

function extractJson(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse intelligence into scholarly data.");
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

  // ELITE ENFORCEMENT PROMPT
  const systemPrompt = `You are a Senior Academic Intelligence Developer.
CRITICAL MANDATE: You MUST generate exactly the counts requested. Failure to provide all three categories will cause a system crash.

ACADEMIC PARAMETERS:
- LEVEL: ${input.academicLevel}
- DIFFICULTY: ${input.difficulty}

COUNTS TO GENERATE (STRICT):
- mcqs: ${targetMcq} items
- flashcards: ${targetFlash} items
- essayPrompts: ${targetEssay} items

JSON STRUCTURE RULES:
- You MUST return a JSON object with exactly three keys: "mcqs", "flashcards", "essayPrompts".
- Even if a count is 0, the key MUST exist as an empty array [].
- "essayPrompts" MUST contain thought-provoking prompts with evaluationCriteria and modelAnswerOutline.

DO NOT BE LAZY. Generate high-quality content for ALL requested counts.`;

  const userPrompt = `Source Material:
"""
${material}
"""

OUTPUT RAW JSON ONLY.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) throw new Error("Groq Node Error");
    
    const data = await response.json();
    const content = extractJson(data.choices[0].message.content);
    
    return GenerateStudyAssessmentsOutputSchema.parse({
      mcqs: content.mcqs || [],
      flashcards: content.flashcards || [],
      essayPrompts: content.essayPrompts || [],
      totalTokens: data.usage?.total_tokens
    });
  } catch (error: any) {
    console.error("Discate Forge Failure:", error.message);
    return { error: "Session forging failed. Try reducing item counts or content length." };
  }
}
