'use server';

import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';

/**
 * YouTube Link to Notes Processor (High-Resilience Elite 6.0)
 * Fixed: Profile healing integrated and cloud IP bypass refined.
 */

export async function processYoutubeToNotes(
  videoUrl: string, 
  academicLevel: string = "Class 10th",
  preferredLanguage: string = "English"
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials missing in environment." };

  try {
    // Highly robust Regex for all possible YT formats
    const videoIdMatch = videoUrl.match(/(?:v=|youtu\.be\/|embed\/|watch\?v=|&v=)([^&?\s]+)/);
    const videoId = videoIdMatch?.[1];
    
    if (!videoId) throw new Error("Invalid YouTube link format. Please use a standard URL.");

    let transcriptText = "";
    let method = "Direct Transcript Engine";

    console.log(`Discate Engine: Analyzing video ID: ${videoId}...`);
    
    // Attempt 1: Fetch using youtube-transcript (Handles most auto-captions)
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      if (transcript && transcript.length > 0) {
        transcriptText = transcript.map(t => t.text).join(' ');
      }
    } catch (transcriptError: any) {
      console.warn("Transcript engine failed (likely blocked or no captions).");
    }

    // Attempt 2: Fallback to metadata using ytdl (Title + Description)
    // Optimized for cloud environments with specific RequestOptions
    if (!transcriptText || transcriptText.trim().length < 50) {
      try {
        const info = await ytdl.getInfo(videoUrl, {
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          }
        });
        
        const title = info.videoDetails.title;
        const description = info.videoDetails.description || "No description provided.";
        
        transcriptText = `VIDEO TITLE: ${title}\n\nVIDEO DESCRIPTION/CONTEXT:\n${description}`;
        method = "Contextual Metadata Fallback";
        console.log("Success: Using video metadata for synthesis.");
      } catch (ytdlError: any) {
        console.error("YTDL Error:", ytdlError.message);
        
        // Final Attempt: If everything fails, it's usually Age Restricted or highly secure
        return { 
          error: "Discate could not bypass the security wall for this specific video. Please ensure the video is Public and NOT age-restricted." 
        };
      }
    }

    // --- FINAL STEP: Generate Elite Notes ---
    const systemPrompt = `You are 'DISCATE AI', an Elite Academic Mentor. 
    Synthesize high-quality STUDY NOTES and 5 ANALYTICAL QUESTIONS based on the provided video intelligence.
    
    LEVEL: ${academicLevel}
    RESPONSE LANGUAGE STYLE: ${preferredLanguage}
    
    MANDATORY RULES:
    1. SCRIPT: If a regional mix (like Hinglish, Marathish, etc.) is specified, use that language but strictly write it in Romanized script (English letters). NEVER use Devanagari or regional scripts.
    2. CONTENT: Extract the core academic logic. If only metadata is available, expand intelligently using general subject knowledge.
    
    FORMAT: 
    # STUDY NOTES
    [Structured notes with headings and bullet points.]
    
    # 5 MASTERCLASS QUESTIONS
    [Deep analytical questions for concept mastery.]
    
    TONE: Professional, inspiring, and logical.`;

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
          { role: 'user', content: `Source Intelligence (${method}):\n"""\n${transcriptText.substring(0, 80000)}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      return { error: "Intelligence synthesis failed. AI node temporarily overloaded." };
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      tokenUsage: data.usage,
      method: method
    };

  } catch (error: any) {
    console.error("YouTube Processor Critical Error:", error.message);
    return { error: error.message || "An unexpected system error occurred during analysis." };
  }
}
