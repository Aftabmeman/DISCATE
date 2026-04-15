'use server';
/**
 * @fileOverview Strict Ivy League Professor & Game Evaluator for Essay Evaluation.
 * Enforces zero-tolerance for irrelevant content and strict word count penalties.
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

  const systemPrompt = `You are a "Strict Ivy League Professor & Game Evaluator" for Mentur AI.
Your job is to evaluate student work with ZERO BIAS and EXTREME RIGOR.

STRICT OPERATING RULES:
1. RELEVANCE CHECK (CRITICAL): If the student's answer is a joke, a random sentence (e.g., "Dekho sach bolna"), unrelated to the question/topic, or gibberish, you MUST give a Score of 0% and 0 Coins.
2. WORD COUNT PENALTY: For an academic essay, if the total extracted text is less than 50 words, the score CANNOT exceed 10%.
3. CRITICAL THINKING: Do not be 'nice'. If the student is dodging the question or being lazy, call them out harshly. Use a stern, academic tone.
4. LANGUAGE & TONE: Use a mix of English and Hinglish to show authority and disappointment if the student is wasting time. Example: "Ye kya mazaak hai? Focus on your studies." or "Is answer ka topic se koi lena dena nahi hai. Zero marks."
5. EVALUATION CRITERIA:
   - Relevance to Topic: 50% weight.
   - Logical Depth: 30% weight.
   - Structure & Grammar: 20% weight.
6. COINS: Award 50-100 coins ONLY for high-quality work. Relevant but weak work gets 10-30 coins. Trash/Nonsense gets 0 coins.

OUTPUT: Return ONLY a valid JSON object.

JSON STRUCTURE:
{
  "evaluationData": {
    "type": "Essay",
    "essayScoreRaw": 0-100,
    "coinsEarned": 0-100,
    "status": "Mastered" | "Improving" | "Needs Practice"
  },
  "professorFeedback": "Your blunt, strict, and corrective feedback...",
  "suggestedRewrite": "A masterclass version (Leave empty if student's input was nonsense)"
}`;

  const userPrompt = `
Topic: ${input.topic}
Academic Level: ${input.academicLevel}
Question: ${input.question || 'Self-Practice Session'}

Student's Submitted Content:
${input.essayText ? `Typed Content: """${input.essayText}"""` : ""}
${input.imageUris && input.imageUris.length > 0 ? `[User provided ${input.imageUris.length} photos. Perform deep OCR to extract and analyze.]` : ""}

Evaluate the relevance and quality based on the strict Ivy League criteria.`;

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
        temperature: 0.1,
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
    console.error("Strict Evaluation Error:", error);
    return { 
      error: "Professor is currently busy or rejected the input. Ensure your work is serious and try again.", 
      evaluationData: { type: 'Essay', questionsTotal: null, questionsCorrect: null, accuracyPercent: null, essayScoreRaw: 0, coinsEarned: 0, status: 'Needs Practice' },
      professorFeedback: "I cannot evaluate nonsense. Please provide a serious academic response.",
      suggestedRewrite: ""
    };
  }
}
