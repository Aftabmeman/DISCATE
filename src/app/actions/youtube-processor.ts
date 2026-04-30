
'use server';

import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';

/**
 * YouTube Link to Notes Processor (Elite High-Resilience 4.0)
 * Uses high-tier model and robust multi-method intelligence extraction.
 */

export async function processYoutubeToNotes(
  videoUrl: string, 
  academicLevel: string = "Class 10th",
  preferredLanguage: string = "English"
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials missing in environment." };

  try {
    // Robust regex to handle all YT formats including embed and shorts
    const videoIdMatch = videoUrl.match(/(?:v=|youtu\.be\/|embed\/|watch\?v=)([^&?\s]+)/);
    const videoId = videoIdMatch?.[1];
    
    if (!videoId) throw new Error("Invalid YouTube link format. Please provide a standard URL.");

    let transcriptText = "";
    let method = "Direct Transcript Engine";

    console.log(`Discate Engine: Analyzing video intelligence for ID: ${videoId}...`);
    
    try {
      // Primary Attempt: Fetch using youtube-transcript
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      if (transcript && transcript.length > 0) {
        transcriptText = transcript.map(t => t.text).join(' ');
      }
    } catch (transcriptError) {
      console.warn("Transcript engine failed, attempting metadata fallback...");
    }

    // Fallback: Use @distube/ytdl-core for Title + Description context if transcript is missing or short
    if (!transcriptText || transcriptText.trim().length < 50) {
      try {
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title;
        const description = info.videoDetails.description || "No description provided.";
        
        transcriptText = `VIDEO TITLE: ${title}\n\nVIDEO DESCRIPTION/CONTEXT:\n${description}`;
        method = "Contextual Metadata Fallback";
        console.log("Success: Using video metadata for synthesis.");
      } catch (ytdlError) {
        // Final catch-all if even metadata fails
        return { 
          error: "Discate could not extract intelligence from this video. Ensure the link is public and not age-restricted." 
        };
      }
    }

    // --- FINAL STEP: Generate Notes with Resilient Formatting ---
    const systemPrompt = `You are an Elite Academic Mentor for Discate AI. 
    Synthesize high-quality STUDY NOTES and 5 ANALYTICAL QUESTIONS based on the provided video intelligence.
    
    LEVEL: ${academicLevel}
    RESPONSE LANGUAGE STYLE: ${preferredLanguage}
    
    SCRIPT RULE: If a regional mix (like Hinglish, Marathish, Tamilish, etc.) is specified, use that language but strictly write it in the Romanized script (English letters).
    
    FORMAT: 
    # STUDY NOTES
    [Structured notes with headings and bullet points. Capture core logic. If only metadata is available, expand using general academic knowledge of the topic.]
    
    # 5 MASTERCLASS QUESTIONS
    [Deep analytical questions to test concept mastery.]
    
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
          { role: 'user', content: `Source Intelligence (${method}):\n"""\n${transcriptText.substring(0, 100000)}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      return { error: "Intelligence synthesis failed. The AI node is temporarily overloaded." };
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
