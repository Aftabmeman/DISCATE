'use server';
/**
 * @fileOverview Expert Mentor Professor for Balanced Essay Evaluation.
 * Provides strict relevance checks for nonsense while being fair and supportive to genuine efforts.
 */

import { z } from 'zod';

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string().optional(),
  imageUris: z.array(z.string()).optional().describe("Data URIs of handwritten essay photos"),
  topic: z.string(),
  academicLevel: z.string(),
  question: z.string().optional(),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  evaluationData: z.object({
    type: z.literal('Essay'),
    questionsTotal: z.number().nullable(),
    questionsCorrect: z.number().nullable(),
    accuracyPercent: z.number().nullable(),
    essayScoreRaw: z.number(),
    coinsEarned: z.number(),
    status: z.enum(['Mastered', 'Improving', 'Needs Practice']),
  }),
  professorFeedback: z.string(),
  suggestedRewrite: z.string(),
  error: z.string().optional(),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { 
    error: "AI Key is missing.", 
    evaluationData: { type: 'Essay', questionsTotal: null, questionsCorrect: null, accuracyPercent: null, essayScoreRaw: 0, coinsEarned: 0, status: 'Needs Practice' },
    professorFeedback: "",
    suggestedRewrite: ""
  };

  const systemPrompt = `You are the Mentur AI "Expert Mentor Professor". Your mission is to provide accurate, balanced, and context-aware assessments. Do not swing between too nice or too mean.

STRICT OPERATING RULES:
1. STRICT RELEVANCE: If the student's submission is a joke, random text, or completely unrelated to the question (e.g., writing random sentences for a specific topic), give a Score of 0% and 0 Coins.
2. CONTEXTUAL ANALYSIS: If the submission is a genuine attempt (even if handwritten/OCR extracted), assess the content fairly. Do not mark relevant content as irrelevant solely due to handwritten nuances or minor spelling errors.
3. FAIR MARKING RUBRIC:
   - 0-40%: Poor effort. Relevant but fails to cover standard points. Many factual errors.
   - 41-70%: Fair/Good effort. Covers standard points, structure is understandable, genuine understanding shown.
   - 71-90%: Very good. Detailed analysis, relevant examples, clear logical flow.
   - 91-100%: Exceptional. Insightful analysis, outstanding structure.
4. MENTOR'S FEEDBACK: Guide the student. Even if they get 60%, tell them exactly how to reach 90% in a supportive but analytical tone. Be lenient on slight handwriting issues if the core idea is correct.
5. COINS:
   - High Quality (70%+): 50-100 Coins.
   - Genuine but Weak (41-69%): 10-30 Coins.
   - Irrelevant/Jokes (0-40%): 0 Coins.

OUTPUT: Return ONLY a valid JSON object.

{
  "evaluationData": {
    "type": "Essay",
    "essayScoreRaw": 0-100,
    "coinsEarned": 0-100,
    "status": "Mastered" | "Improving" | "Needs Practice"
  },
  "professorFeedback": "Analytical, supportive, and corrective guidance...",
  "suggestedRewrite": "A masterclass version that shows how to achieve 100%"
}`;

  const userPrompt = `
Topic: ${input.topic}
Academic Level: ${input.academicLevel}
Question: ${input.question || 'Self-Practice Session'}

Student's Submitted Content:
${input.essayText ? `Typed Content: """${input.essayText}"""` : ""}
${input.imageUris && input.imageUris.length > 0 ? `[User provided ${input.imageUris.length} photos of handwritten work. Analyze the OCR text for core concepts and logical flow.]` : ""}

Provide a balanced evaluation based on the Mentor Professor criteria.`;

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
    
    return EvaluateEssayFeedbackOutputSchema.parse({
      ...content,
      evaluationData: {
        ...content.evaluationData,
        type: 'Essay',
        questionsTotal: null,
        questionsCorrect: null,
        accuracyPercent: null,
      }
    });
  } catch (error: any) {
    console.error("Mentor Evaluation Error:", error);
    return { 
      error: "Professor is currently busy. Please try again shortly.", 
      evaluationData: { type: 'Essay', questionsTotal: null, questionsCorrect: null, accuracyPercent: null, essayScoreRaw: 0, coinsEarned: 0, status: 'Needs Practice' },
      professorFeedback: "I was unable to analyze your work due to a technical interruption. Please resubmit your serious academic response.",
      suggestedRewrite: ""
    };
  }
}
