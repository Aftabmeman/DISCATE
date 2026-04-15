'use server';
/**
 * @fileOverview Master Professor & Evaluator for Essay Evaluation using llama-3.3-70b.
 * Performs deep multi-dimensional analysis and provides structured DATA_BLOCK output.
 */

import { z } from 'zod';

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string().min(1, "Essay content cannot be empty"),
  topic: z.string(),
  academicLevel: z.string(),
  question: z.string().optional(),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  dataBlock: z.object({
    marks: z.number().describe("Score percentage out of 100"),
    coins: z.number().describe("Coins awarded (50-100 based on quality)"),
    status: z.enum(['Mastered', 'Improving', 'Needs Practice']),
  }),
  professorFeedback: z.string().describe("Detailed, professor-style explanation, corrections, and guidance."),
  suggestedRewrite: z.string().describe("A Masterclass version of the student's essay."),
  error: z.string().optional(),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { 
    error: "AI Key is missing.", 
    dataBlock: { marks: 0, coins: 0, status: 'Needs Practice' },
    professorFeedback: "",
    suggestedRewrite: ""
  };

  const systemPrompt = `You are the "Master Professor & Evaluator" for Mentur AI.
Your goal is to provide high-quality educational feedback while managing a reward system.

STRICT OPERATING RULES:
1. ROLE: Act as a supportive but strict academic professor.
2. EVALUATION LOGIC (ESSAYS):
   - Evaluate based on Clarity, Logic, and Depth.
   - Award 50 to 100 coins based on quality.
   - If the student provides a multi-dimensional perspective (e.g., Bio-Psycho-Social), award higher coins.
3. OUTPUT FORMAT: You must return valid JSON that includes a dataBlock and professorFeedback.

DATA_BLOCK STRUCTURE:
- Marks: [Score percentage]
- Coins: [50-100]
- Status: [Mastered/Improving/Needs Practice]

PROFESSOR_FEEDBACK:
- Be a strict marker. Don't give high scores easily.
- Explain WHY an answer is wrong or lacking depth.
- Include a specific 'Masterclass Rewrite' in the suggestedRewrite field.`;

  const userPrompt = `Topic: ${input.topic}
Level: ${input.academicLevel}
Question: ${input.question || 'Self-Practice'}

Student's Essay:
"""
${input.essayText}
"""

Return JSON format matching the schema.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error(`Groq Error: ${response.statusText}`);

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    return EvaluateEssayFeedbackOutputSchema.parse(content);
  } catch (error: any) {
    console.error("Evaluation Error:", error);
    return { 
      error: "Professor is busy. Please try again.", 
      dataBlock: { marks: 0, coins: 0, status: 'Needs Practice' },
      professorFeedback: "",
      suggestedRewrite: ""
    };
  }
}
