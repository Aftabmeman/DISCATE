
'use server';

import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';

/**
 * YouTube Link to Notes Processor (Elite High-Resilience 2.0)
 * Focus: Native Auto-Generated Caption Extraction with Metadata Fallback.
 */

export async function processYoutubeToNotes(
  videoUrl: string, 
  academicLevel: string = "Class 10th",
  preferredLanguage: string = "English"
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials missing in environment." };

  try {
    // Exact requested regex for videoId
    const videoId = videoUrl.match(/(?:v=|youtu.be\/)([^&?\s]+)/)?.[1];
    if (!videoId) throw new Error("Invalid YouTube link format. Please provide a standard URL.");

    let transcriptText = "";
    let method = "Direct Auto-Caption Node";

    console.log(`Discate Engine: Analyzing intelligence for ${videoId}...`);
    
    try {
      // Primary Attempt: Fetch using youtube-transcript (handles auto-generated well)
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      if (transcript && transcript.length > 0) {
        transcriptText = transcript.map(t => t.text).join(' ');
      }
    } catch (transcriptError) {
      console.warn("Transcript extraction failed, attempting metadata fallback...");
    }

    // Fallback: Use @distube/ytdl-core for Title + Description context
    if (!transcriptText || transcriptText.trim().length < 50) {
      try {
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title;
        const description = info.videoDetails.description || "No description provided.";
        
        transcriptText = `VIDEO TITLE: ${title}\n\nVIDEO DESCRIPTION/CONTEXT:\n${description}`;
        method = "Contextual Metadata Fallback";
        console.log("Success: Using video metadata for intelligence generation.");
      } catch (ytdlError) {
        return { 
          error: "Discate could not extract intelligence or metadata from this video. Please ensure the link is public and accessible." 
        };
      }
    }

    // --- FINAL STEP: Generate Notes with Llama 4 Scout ---
    const systemPrompt = `You are an Expert Academic Evaluator for Discate AI. 
    Transform the following video intelligence into high-quality Detailed Study Notes and 5 Deep Analytical Questions.
    
    LEVEL: ${academicLevel}
    RESPONSE LANGUAGE/STYLE: ${preferredLanguage}
    
    SCRIPT RULE: If a regional mix (like Hinglish, Marathish, Tamilish, etc.) is specified, you MUST use that language but strictly write it in the Romanized script (English letters). NEVER use Devanagari, Tamil, or any other regional script characters.
    
    FORMAT: 
    # STUDY NOTES
    [Structured notes with headings and logical bullet points. Capture all core logic. If only metadata is provided, expand based on known academic principles of the topic.]
    
    # 5 DEEP ANALYTICAL QUESTIONS
    [Provide 5 questions that test deep concept mastery, not just memory.]
    
    TONE: Brilliant, professional, and encouraging. Use the specified regional mix style if provided.`;

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
          { role: 'user', content: `Video Data (${method}):\n"""\n${transcriptText.substring(0, 80000)}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      return { error: "AI Generation failed. The session node is temporarily overloaded." };
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      tokenUsage: data.usage,
      method: method
    };

  } catch (error: any) {
    console.error("YouTube Processor Critical Error:", error.message);
    return { error: error.message || "An unexpected system error occurred." };
  }
}
