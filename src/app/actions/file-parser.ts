
'use server';

import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Server Action to parse various file types and extract text content.
 * Supports PDF, DOCX, and TXT.
 */
export async function parseFileToText(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("No file uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.name.split('.').pop()?.toLowerCase();

    let extractedText = "";

    if (fileType === 'pdf') {
      const data = await pdf(buffer);
      extractedText = data.text;
    } else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (fileType === 'txt') {
      extractedText = buffer.toString('utf-8');
    } else if (fileType === 'doc' || fileType === 'ppt' || fileType === 'pptx') {
      // Basic text extraction for legacy doc/ppt is complex without heavy local binaries.
      // We inform the user to use PDF/DOCX for now for better reliability.
      throw new Error(`The format .${fileType} is supported via conversion. Please convert to PDF for elite accuracy.`);
    } else {
      throw new Error("Unsupported file format. Please use PDF, DOCX, or TXT.");
    }

    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error("Could not extract meaningful text from the file.");
    }

    return { text: extractedText.trim() };
  } catch (error: any) {
    console.error("File Parsing Error:", error.message);
    return { error: error.message || "Failed to parse file." };
  }
}
