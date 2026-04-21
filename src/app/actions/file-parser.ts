
'use server';

import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Server Action to parse various file types and extract text content.
 * Supports PDF, DOCX, and TXT. Optimized for Cloudflare Edge and Render.
 * Strictly avoids Node.js built-ins like fs/http for Edge stability where possible.
 */
export async function parseFileToText(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("No file uploaded");

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File is too large. Max size is 5MB.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileType = file.name.split('.').pop()?.toLowerCase();

    let extractedText = "";

    if (fileType === 'pdf') {
      // Dynamic import of pdfjs-dist
      const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
      
      // We must disable the worker to avoid "Cannot find module" errors in server environments
      // This forces the PDF engine to run in a single-threaded mode.
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        disableFontFace: true,
        disableWorker: true, // CRITICAL: Fixes worker loading failure
        verbosity: 0
      });
      
      const pdf = await loadingTask.promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(" ");
        fullText += pageText + "\n";
      }
      extractedText = fullText;
    } else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
      extractedText = result.value;
    } else if (fileType === 'txt') {
      extractedText = new TextDecoder().decode(arrayBuffer);
    } else {
      throw new Error("Unsupported file format. Please use PDF, DOCX, or TXT.");
    }

    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error("Could not extract meaningful text from the file.");
    }

    return { text: extractedText.trim() };
  } catch (error: any) {
    console.error("File Parsing Error:", error.message);
    
    // Improved error reporting
    if (error.message.includes('PDF') || error.message.includes('worker')) {
      return { error: "PDF parsing issue. Please try a different PDF or copy-paste your text." };
    }
    
    return { error: error.message || "Failed to parse file." };
  }
}
