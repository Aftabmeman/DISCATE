
'use server';

import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Server Action to parse various file types and extract text content.
 * Optimized for high-stability across Node.js (Render) and Edge-like environments.
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
      // Use the standard distribution for better compatibility in Node
      const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
      
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        disableFontFace: true, // Saves memory
        disableWorker: true,    // Run in main thread for stability in serverless
        verbosity: 0
      });
      
      const pdf = await loadingTask.promise;
      let fullText = "";
      
      // Process pages sequentially to avoid memory spikes
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: any) => 'str' in item)
          .map((item: any) => item.str)
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
      throw new Error("Unsupported format. Use PDF, DOCX, or TXT.");
    }

    const trimmedText = extractedText.trim();
    if (!trimmedText || trimmedText.length < 10) {
      throw new Error("The document seems to be empty or contains no readable text.");
    }

    return { text: trimmedText };
  } catch (error: any) {
    console.error("Discate Parser Error:", error.message);
    // Return the specific error message to the UI for better debugging
    return { error: error.message || "Failed to parse document." };
  }
}
