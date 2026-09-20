import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker for Vite using dynamic import URL pattern
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
} catch (err) {
  console.warn('Failed to set pdfjs workerSrc:', err);
}

export interface ParsedPage {
  pageNumber: number;
  text: string;
}

export interface ParsedDocument {
  docId: string;
  name: string;
  type: string;
  size: number;
  pageCount: number;
  wordCount: number;
  pages: ParsedPage[];
  fullText: string;
  error?: string;
}

export class DocumentParser {
  /**
   * Parses a browser File (.pdf, .docx, .txt, .md) into a structured ParsedDocument with page-level text.
   */
  static async parseFile(file: File): Promise<ParsedDocument> {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

    try {
      if (fileExt === 'pdf') {
        return await DocumentParser.parsePdf(file, docId);
      } else if (fileExt === 'docx') {
        return await DocumentParser.parseDocx(file, docId);
      } else if (fileExt === 'txt' || fileExt === 'md') {
        return await DocumentParser.parsePlainText(file, docId);
      } else {
        // Fallback: attempt plain text read
        return await DocumentParser.parsePlainText(file, docId);
      }
    } catch (err: any) {
      console.error(`Error parsing document ${fileName}:`, err);
      return {
        docId,
        name: fileName,
        type: file.type || fileExt,
        size: file.size,
        pageCount: 0,
        wordCount: 0,
        pages: [],
        fullText: '',
        error: err?.message || 'Failed to parse document content.'
      };
    }
  }

  private static async parsePdf(file: File, docId: string): Promise<ParsedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    
    let pdf: pdfjsLib.PDFDocumentProxy;
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      pdf = await loadingTask.promise;
    } catch (loadErr: any) {
      return {
        docId,
        name: file.name,
        type: 'application/pdf',
        size: file.size,
        pageCount: 0,
        wordCount: 0,
        pages: [],
        fullText: '',
        error: 'No extractable text found — try a text-based PDF'
      };
    }

    const numPages = pdf.numPages;
    const pages: ParsedPage[] = [];
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .filter((item: any) => typeof item.str === 'string')
          .map((item: any) => item.str);
        
        const pageText = pageStrings.join(' ').replace(/\s+/g, ' ').trim();
        pages.push({
          pageNumber: i,
          text: pageText
        });
        fullText += (i > 1 ? '\n\n' : '') + pageText;
      } catch (pageErr) {
        console.warn(`Could not extract text from PDF page ${i}:`, pageErr);
        pages.push({
          pageNumber: i,
          text: ''
        });
      }
    }

    const wordCount = fullText.trim().length > 0 
      ? fullText.trim().split(/\s+/).filter(Boolean).length 
      : 0;

    // Detect scanned / image-only PDF with no selectable text
    if (wordCount === 0 || fullText.trim().length < 10) {
      return {
        docId,
        name: file.name,
        type: 'application/pdf',
        size: file.size,
        pageCount: numPages,
        wordCount: 0,
        pages: [],
        fullText: '',
        error: 'No extractable text found — try a text-based PDF'
      };
    }

    return {
      docId,
      name: file.name,
      type: 'application/pdf',
      size: file.size,
      pageCount: numPages,
      wordCount,
      pages,
      fullText
    };
  }

  private static async parseDocx(file: File, docId: string): Promise<ParsedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const fullText = (result.value || '').trim();
    const wordCount = fullText.length > 0 ? fullText.split(/\s+/).filter(Boolean).length : 0;

    if (wordCount === 0) {
      return {
        docId,
        name: file.name,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: file.size,
        pageCount: 1,
        wordCount: 0,
        pages: [],
        fullText: '',
        error: 'No extractable text found in .docx file.'
      };
    }

    // Estimate pages based on 350 words per page
    const pageCount = Math.max(1, Math.ceil(wordCount / 350));
    const paragraphs = fullText.split(/\n\s*\n/).filter(Boolean);
    const pages: ParsedPage[] = [];

    // Chunk into approximate pages for citations
    const parasPerPage = Math.max(1, Math.ceil(paragraphs.length / pageCount));
    for (let i = 0; i < pageCount; i++) {
      const pageText = paragraphs.slice(i * parasPerPage, (i + 1) * parasPerPage).join('\n\n');
      pages.push({
        pageNumber: i + 1,
        text: pageText
      });
    }

    return {
      docId,
      name: file.name,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: file.size,
      pageCount,
      wordCount,
      pages,
      fullText
    };
  }

  private static async parsePlainText(file: File, docId: string): Promise<ParsedDocument> {
    const text = (await file.text()).trim();
    const wordCount = text.length > 0 ? text.split(/\s+/).filter(Boolean).length : 0;

    if (wordCount === 0) {
      return {
        docId,
        name: file.name,
        type: file.type || 'text/plain',
        size: file.size,
        pageCount: 1,
        wordCount: 0,
        pages: [],
        fullText: '',
        error: 'Uploaded text file is empty.'
      };
    }

    // Single or multi-page estimate for text files
    const pageCount = Math.max(1, Math.ceil(wordCount / 400));
    const lines = text.split('\n');
    const linesPerPage = Math.max(1, Math.ceil(lines.length / pageCount));
    const pages: ParsedPage[] = [];

    for (let i = 0; i < pageCount; i++) {
      const pageText = lines.slice(i * linesPerPage, (i + 1) * linesPerPage).join('\n').trim();
      pages.push({
        pageNumber: i + 1,
        text: pageText
      });
    }

    return {
      docId,
      name: file.name,
      type: file.type || 'text/plain',
      size: file.size,
      pageCount,
      wordCount,
      pages,
      fullText: text
    };
  }
}
