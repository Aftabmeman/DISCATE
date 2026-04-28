'use server';

import { YoutubeTranscript } from 'youtube-transcript';

/**
 * YouTube Link to Notes Processor (Final Optimized Logic)
 * Focus: High-tier Native Subtitles only to ensure zero latency and no Whisper limit issues.
 * Model: meta-llama/llama-4-scout-17b-16e-instruct
 */

export async function processYoutubeToNotes(videoUrl: string, academicLevel: string = "Class 10th") {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials missing in environment." };

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube link format. Please provide a standard URL.");

    let transcriptText = "";

    // --- NATIVE SUBTITLES ONLY ---
    try {
      console.log(`Discate Engine: Fetching subtitles for ${videoId}...`);
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId).catch(async () => {
        // Fallback: try English specifically if default fails
        return await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
      });
      
      if (transcript && transcript.length > 0) {
        transcriptText = transcript.map(t => t.text).join(' ');
      } else {
        throw new Error("No Subtitles Found");
      }
    } catch (e) {
      console.error("Subtitle Fetch Error:", e);
      return { 
        error: "Subtitles are disabled for this video. Discate requires videos with active captions (English/Auto-generated) for elite notes generation." 
      };
    }

    if (!transcriptText || transcriptText.trim().length < 50) {
      throw new Error("The subtitles for this video are too short to generate quality notes.");
    }

    // --- FINAL STEP: Generate Notes with Llama 4 Scout ---
    const systemPrompt = `You are an Expert Academic Evaluator for Discate AI. 
    Transform the following transcript into high-quality Detailed Study Notes and 5 Deep Analytical Questions.
    LEVEL: ${academicLevel}
    
    FORMAT: 
    # STUDY NOTES
    [Structured notes with headings and logical bullet points. Capture all core logic.]
    
    # 5 DEEP ANALYTICAL QUESTIONS
    [Provide 5 questions that test deep concept mastery, not just memory.]
    
    TONE: Brilliant, professional, and encouraging.`;

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
          { role: 'user', content: `Transcript:\n"""\n${transcriptText.substring(0, 80000)}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Groq Error:", errData);
      return { error: "AI Generation failed. The transcript might be too complex for a single pass." };
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      tokenUsage: data.usage,
      method: "Native Subtitles"
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
