
'use server';
/**
 * @fileOverview DISCATE AI - Elite Academic Mentor (Inspired by Rancho).
 * Handles deep-metric evaluation with personality-driven feedback.
 */

import { z } from 'zod';

const EvaluateEssayFeedbackInputSchema = z.object({
  essayText: z.string(),
  topic: z.string(),
  academicLevel: z.string(),
  question: z.string().optional(),
  preferredLanguage: z.string().optional().default("English"),
});
export type EvaluateEssayFeedbackInput = z.infer<typeof EvaluateEssayFeedbackInputSchema>;

const EvaluateEssayFeedbackOutputSchema = z.object({
  evaluationData: z.object({
    type: z.literal('Essay'),
    overallScore: z.number(),
    grammarScore: z.number(),
    contentDepthScore: z.number(),
    relevancyScore: z.number(),
    coinsEarned: z.number(),
    status: z.enum(['Mastered', 'Improving', 'Needs Practice']),
  }),
  professorFeedback: z.string(),
  suggestedRewrite: z.string(),
  error: z.string().optional(),
});
export type EvaluateEssayFeedbackOutput = z.infer<typeof EvaluateEssayFeedbackOutputSchema>;

function extractJson(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse AI response.");
  }
}

export async function evaluateEssayFeedback(input: EvaluateEssayFeedbackInput): Promise<EvaluateEssayFeedbackOutput> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) return { 
    error: "AI Key is missing.", 
    evaluationData: { type: 'Essay', overallScore: 0, grammarScore: 0, contentDepthScore: 0, relevancyScore: 0, coinsEarned: 0, status: 'Needs Practice' },
    professorFeedback: "",
    suggestedRewrite: ""
  };

  const systemPrompt = `You are 'DISCATE AI', an elite academic mentor inspired by 'Rancho' from 3 Idiots. 
Your goal is excellence, not just degrees. "Success ke piche mat bhago, Excellence ka picha karo, Success jhak maarkey tumhare piche ayegi."

TONE: Brilliant, encouraging, logical, and slightly witty. Respond in ${input.preferredLanguage}.

THE "ANTI-PARAGRAPH" RULE:
If the student submits a single long paragraph without structure, criticize it firmly. Real scholars use points, headings, and clear divisions.

LEVEL-BASED CRITERIA:
1. 8th-10th Standard: Must have Intro, Points (Body), and Simple Conclusion. Focus on clarity.
2. 11th-Graduation: Must have Professional Intro, Body with 1-2 Real-world Examples, and a Forward-looking Conclusion. Focus on application.
3. Competitive Exams (UPSC/GATE etc.): Must have Contextual Intro, Body with Sub-headings/Facts, and a Balanced Conclusion. Focus on multidimensional thinking.

JSON FORMAT ONLY:
{
  "evaluationData": {
    "overallScore": number,
    "grammarScore": number,
    "contentDepthScore": number,
    "relevancyScore": number,
    "coinsEarned": number,
    "status": "Mastered" | "Improving" | "Needs Practice"
  },
  "professorFeedback": "Rancho-style feedback (Elaborated critique of structure/logic, no rattu-popat allowed)",
  "suggestedRewrite": "The Ideal Path: Structured [Introduction] -> [Main Body with points/examples] -> [Conclusion]"
}`;

  const userPrompt = `
Academic Level: ${input.academicLevel}
Topic: ${input.topic}
Question: ${input.question || 'Practice'}

Student's Submission:
"""
${input.essayText}
"""`;

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
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error("Groq API Error");

    const data = await response.json();
    const content = extractJson(data.choices[0].message.content);
    
    return EvaluateEssayFeedbackOutputSchema.parse({
      ...content,
      evaluationData: {
        ...content.evaluationData,
        type: 'Essay',
      }
    });
  } catch (error: any) {
    return { 
      error: "Evaluation failed. Rancho is busy solving a machine problem. Try again.", 
      evaluationData: { type: 'Essay', overallScore: 0, grammarScore: 0, contentDepthScore: 0, relevancyScore: 0, coinsEarned: 0, status: 'Needs Practice' },
      professorFeedback: "Technical interruption. Excellence requires a stable connection.",
      suggestedRewrite: ""
    };
  }
}
