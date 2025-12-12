/**
 * IRS No-Fate Tax Analysis Suite - Shared Utilities
 * No-Fate truth rules: non-inferential, strict text grounding, evidence-bound
 */

import { EvidenceAnchor, AnalysisError, ErrorCode } from "../types";

/**
 * Validates that input text is readable and non-empty
 */
export function validateTextInput(text: string, documentId: string): AnalysisError | null {
  if (!text || text.trim().length === 0) {
    return {
      error_code: "error: unreadable_document",
      error_message: "Document contains no readable text",
      document_id: documentId,
    };
  }
  
  // Check for binary or corrupted patterns
  const nonPrintableRatio = (text.match(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g) || []).length / text.length;
  if (nonPrintableRatio > 0.3) {
    return {
      error_code: "error: unreadable_document",
      error_message: "Document appears to contain binary or corrupted data",
      document_id: documentId,
    };
  }
  
  return null;
}

/**
 * Creates an evidence anchor from text and document
 */
export function createEvidence(
  quotedText: string,
  documentId: string,
  context?: string
): EvidenceAnchor {
  return {
    quoted_text: quotedText.trim(),
    document_id: documentId,
    context,
  };
}

/**
 * Extracts exact quoted text from source, limited to maxLength
 */
export function extractQuote(text: string, startIndex: number, maxLength: number = 200): string {
  const quote = text.substring(startIndex, startIndex + maxLength);
  return quote.length < text.length - startIndex ? quote + "..." : quote;
}

/**
 * Generates ISO 8601 timestamp
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Deterministic alphabetical sort for arrays
 */
export function sortAlphabetically<T>(array: T[], key?: keyof T): T[] {
  return [...array].sort((a, b) => {
    const aVal = key ? String(a[key]) : String(a);
    const bVal = key ? String(b[key]) : String(b);
    return aVal.localeCompare(bVal);
  });
}

/**
 * Validates that no financial numeric extraction occurred
 * Allowed: form numbers, schedule numbers, notice codes, tax years
 * Forbidden: amounts, balances, percentages, totals
 */
export function validateNoFinancialNumerics(text: string): AnalysisError | null {
  // Patterns that suggest financial numeric extraction
  const forbiddenPatterns = [
    /\$\s*[\d,]+\.?\d*/,  // Dollar amounts
    /total:?\s*[\d,]+/i,
    /balance:?\s*[\d,]+/i,
    /amount:?\s*[\d,]+/i,
    /penalty:?\s*[\d,]+/i,
    /interest:?\s*[\d,]+/i,
    /\d+\s*%/,  // Percentages
  ];
  
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      return {
        error_code: "error: schema_violation",
        error_message: "Output contains forbidden financial numeric content",
      };
    }
  }
  
  return null;
}

/**
 * Validates that output contains no prescriptive or advisory language
 */
export function validateNoAdvice(text: string): AnalysisError | null {
  const advisoryPatterns = [
    /you should/i,
    /we recommend/i,
    /it is advisable/i,
    /consider filing/i,
    /best practice/i,
    /you must/i,
    /required to file/i,
  ];
  
  for (const pattern of advisoryPatterns) {
    if (pattern.test(text)) {
      return {
        error_code: "error: schema_violation",
        error_message: "Output contains advisory or prescriptive language",
      };
    }
  }
  
  return null;
}

/**
 * Normalizes whitespace for consistent comparison
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Checks if text contains explicit evidence of a pattern
 */
export function containsExplicitEvidence(text: string, patterns: RegExp[]): RegExpMatchArray | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match;
    }
  }
  return null;
}
