
'use server';

import { YoutubeTranscript } from 'youtube-transcript';

/**
 * YouTube Link to Notes Processor (Multi-Language Optimized)
 * Focus: High-tier Native Subtitles with multi-language support.
 * Model: meta-llama/llama-4-scout-17b-16e-instruct
 */

export async function processYoutubeToNotes(
  videoUrl: string, 
  academicLevel: string = "Class 10th",
  preferredLanguage: string = "English"
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials missing in environment." };

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube link format. Please provide a standard URL.");

    let transcriptText = "";

    // --- NATIVE SUBTITLES (Multi-Language Fallback) ---
    try {
      console.log(`Discate Engine: Fetching subtitles for ${videoId}...`);
      
      // Attempt 1: Fetch default transcript
      let transcript = await YoutubeTranscript.fetchTranscript(videoId).catch(() => null);
      
      // Attempt 2: If default fails, try common regional (Hindi)
      if (!transcript) {
        transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'hi' }).catch(() => null);
      }

      if (transcript && transcript.length > 0) {
        transcriptText = transcript.map(t => t.text).join(' ');
      } else {
        throw new Error("No Subtitles Found");
      }
    } catch (e) {
      console.error("Subtitle Fetch Error:", e);
      return { 
        error: "This video doesn't have active captions (English or Hindi). Discate requires subtitled videos for elite intelligence generation." 
      };
    }

    if (!transcriptText || transcriptText.trim().length < 50) {
      throw new Error("The subtitles for this video are too short to generate quality notes.");
    }

    // --- FINAL STEP: Generate Notes with Llama 4 Scout ---
    const systemPrompt = `You are an Expert Academic Evaluator for Discate AI. 
    Transform the following transcript into high-quality Detailed Study Notes and 5 Deep Analytical Questions.
    
    LEVEL: ${academicLevel}
    RESPONSE LANGUAGE/STYLE: ${preferredLanguage}
    
    SCRIPT RULE: If a regional mix (like Hinglish, Marathish, Tamilish, etc.) is specified, you MUST use that language but strictly write it in the Romanized script (English letters). NEVER use Devanagari, Tamil, or any other regional script characters.
    
    FORMAT: 
    # STUDY NOTES
    [Structured notes with headings and logical bullet points. Capture all core logic.]
    
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
          { role: 'user', content: `Transcript Content (May be in any language):\n"""\n${transcriptText.substring(0, 80000)}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Groq Error:", errData);
      return { error: "AI Generation failed. The session was too intense for the current node." };
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      tokenUsage: data.usage,
      method: "Multi-Lang Subtitles"
    };

  } catch (error: any) {
    console.error("YouTube Processor Error:", error.message);
    return { error: error.message || "An unexpected system error occurred." };
  }
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : null;
}
