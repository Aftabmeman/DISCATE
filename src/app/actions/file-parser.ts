'use server';

import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Set the worker source to a stable CDN to bypass environment-specific filesystem issues
pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Server Action to parse various file types and extract text content.
 * Forced to use external CDN for PDF worker to ensure stability on Render/Cloudflare.
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
      try {
        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
          useWorkerFetch: true, // Crucial: Fetch worker from the defined CDN URL
          isEvalSupported: false,
          disableFontFace: true,
          verbosity: 0
        });
        
        const pdf = await loadingTask.promise;
        let fullText = "";
        
        // Sequential page processing for memory efficiency
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
      } catch (pdfError: any) {
        console.error("PDF Parsing Error:", pdfError);
        throw new Error(`PDF Engine Error: ${pdfError.message || "Failed to parse PDF pages."}`);
      }
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
    return { error: error.message || "Failed to parse document." };
  }
}
