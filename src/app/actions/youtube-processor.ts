
'use server';

import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';

/**
 * YouTube Link to Notes Processor (Refactored for High TPM & Tracking)
 * Model: meta-llama/llama-4-scout-17b-16e-instruct (30k TPM)
 * Fallback: whisper-large-v3-turbo
 */

export async function processYoutubeToNotes(videoUrl: string, academicLevel: string = "Class 10th") {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials (GROQ_API_KEY) missing in environment." };

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube link format. Please provide a standard URL.");

    let transcriptText = "";
    let methodUsed = "native";
    let aiUsed = "meta-llama/llama-4-scout-17b-16e-instruct";

    // --- ATTEMPT 1: Native Subtitles (Fast & Free) ---
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(' ');
      methodUsed = "Attempt 1: Native Subtitles";
    } catch (e) {
      console.log("No native subtitles found, falling back to Whisper AI...");
      
      // --- ATTEMPT 2: AI Audio Fallback (Whisper) ---
      try {
        methodUsed = "Attempt 2: AI Audio Fallback";
        aiUsed = "Groq Whisper-large-v3-turbo + Llama 4 Scout";
        transcriptText = await transcribeWithWhisper(videoUrl, apiKey);
      } catch (whisperError: any) {
        console.error("Whisper Error:", whisperError.message);
        return { error: "Error: Video audio exceeds limits or Whisper failed." };
      }
    }

    if (!transcriptText || transcriptText.trim().length < 50) {
      throw new Error("Could not extract enough content from this video.");
    }

    // --- FINAL STEP: Generate Notes with Llama 4 Scout ---
    const systemPrompt = `You are an Expert Academic Evaluator. Transform the following transcript into high-quality Detailed Study Notes and 5 Deep Analytical Questions.
    LEVEL: ${academicLevel}
    
    FORMAT: 
    # STUDY NOTES
    [Provide structured, detailed notes with clear headings and logical bullet points]
    
    # 5 DEEP ANALYTICAL QUESTIONS
    1. [Provide a high-level question that tests deep understanding]
    ...etc.
    
    TONE: Brilliant, encouraging, and highly professional. Ensure technical accuracy.`;

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
          { role: 'user', content: `Transcript:\n"""\n${transcriptText.substring(0, 15000)}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      return { error: "Error: Groq Llama generation failed." };
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      tokenUsage: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0
      },
      method: methodUsed,
      aiUsed: aiUsed
    };

  } catch (error: any) {
    console.error("YouTube Processor Error:", error.message);
    return { error: error.message || "Failed to process video." };
  }
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : null;
}

async function transcribeWithWhisper(videoUrl: string, apiKey: string): Promise<string> {
  const info = await ytdl.getInfo(videoUrl);
  const audioFormat = ytdl.chooseFormat(info.formats, { 
    quality: 'lowestaudio',
    filter: 'audioonly'
  });
  
  if (!audioFormat.url) throw new Error("Could not find audio stream.");

  const audioResponse = await fetch(audioFormat.url);
  const audioBlob = await audioResponse.blob();
  
  if (audioBlob.size > 25 * 1024 * 1024) {
    throw new Error("Audio file too large (Max 25MB).");
  }
  
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.mp3');
  formData.append('model', 'whisper-large-v3-turbo');

  const whisperResponse = await fetch('https://api.groq.com/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });

  const result = await whisperResponse.json();
  return result.text;
}
