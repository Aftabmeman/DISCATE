
'use server';

import { YoutubeTranscript } from 'youtube-transcript';

/**
 * YouTube Link to Notes Processor (Elite 8.0)
 * Bypasses ytdl-core completely for maximum resilience.
 * Uses Direct Transcript Engine + Raw HTML Metadata Fallback.
 */

export async function processYoutubeToNotes(
  videoUrl: string, 
  academicLevel: string = "Class 10th",
  preferredLanguage: string = "English"
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials missing in environment." };

  try {
    // Regex for video ID extraction as per instructions
    const videoIdMatch = videoUrl.match(/(?:v=|youtu\.be\/)([^&?\s]+)/);
    const videoId = videoIdMatch?.[1];
    
    if (!videoId) throw new Error("Invalid YouTube link format. Please use a standard URL.");

    let transcriptText = "";
    let method = "Direct Transcript Engine";

    // Attempt 1: Fetch using youtube-transcript (Auto-captions)
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      if (transcript && transcript.length > 0) {
        transcriptText = transcript.map(t => t.text).join(' ');
      }
    } catch (transcriptError) {
      console.warn("Direct Transcript Engine failed.");
    }

    // Attempt 2: Resilient HTML Metadata Fallback (Bypasses library blocks)
    if (!transcriptText || transcriptText.trim().length < 50) {
      try {
        const response = await fetch(videoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          },
          next: { revalidate: 3600 }
        });

        if (response.ok) {
          const html = await response.text();
          
          // Regex extraction for Title and Description
          const titleMatch = html.match(/<title>(.*?)<\/title>/i);
          const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) || 
                            html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
          
          const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'Academic Content';
          const description = descMatch ? descMatch[1].trim() : 'Metadata unavailable.';
          
          transcriptText = `VIDEO TITLE: ${title}\n\nVIDEO DESCRIPTION/CONTEXT:\n${description}`;
          method = "Resilient HTML Metadata Node";
        }
      } catch (fetchError) {
        console.warn("HTML Metadata fetch failed.");
      }
    }

    // Attempt 3: Safe Context Fallback (Prevents hard errors to user)
    if (!transcriptText || transcriptText.trim().length < 20) {
      transcriptText = "Video metadata and transcript currently unavailable due to platform security layers. Please provide a general academic overview and high-level synthesis based on the provided URL context and common subject knowledge for this level.";
      method = "Safe Context Fallback";
    }

    // --- FINAL STEP: Generate Elite Notes (Groq Logic preserved) ---
    const systemPrompt = `You are 'DISCATE AI', an Elite Academic Mentor. 
    Synthesize high-quality STUDY NOTES and 5 ANALYTICAL QUESTIONS based on the provided video intelligence.
    
    LEVEL: ${academicLevel}
    RESPONSE LANGUAGE STYLE: ${preferredLanguage}
    
    MANDATORY RULES:
    1. SCRIPT: MANDATORY SCRIPT RULE: If the user selects a feedback regional language mix (like Tamilish, Punjabish, Bengalish, Gujaratinglish, Marathish, etc.), you MUST write the entire response using ONLY the Roman alphabet (English letters). Under NO circumstances should you use native scripts like Devanagari, Tamil, Bengali, or Gurmukhi. The language should be the regional mix, but the script must be strictly English/Roman.
    2. CONTENT: Extract the core academic logic. If only metadata is available, expand intelligently using general subject knowledge.
    
    FORMAT: 
    # STUDY NOTES
    [Structured notes with headings and bullet points.]
    
    # 5 MASTERCLASS QUESTIONS
    [Deep analytical questions for concept mastery.]
    
    TONE: Professional, inspiring, and logical.`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

    if (!groqResponse.ok) {
      return { error: "Intelligence synthesis failed. AI node temporarily overloaded." };
    }

    const data = await groqResponse.json();
    
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
