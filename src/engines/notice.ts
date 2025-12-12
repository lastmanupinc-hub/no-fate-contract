/**
 * IRS Notice Response Analyzer
 * Scope: Deterministic extraction of notice data strictly as described in notice text
 * Domain: IRS notice classification and procedural requirement extraction
 */

import {
  DocumentSet,
  NoticeAnalysisResult,
  NoticeIdentification,
  DeadlineExtraction,
  RequiredDocument,
  ProceduralInstruction,
  ConsequenceExtraction,
  AnalysisError,
} from "../types";
import {
  validateTextInput,
  createEvidence,
  generateTimestamp,
  extractQuote,
} from "../utils/validation";

/**
 * Notice code detection patterns (common IRS notice types)
 */
const NOTICE_CODE_PATTERNS: Array<{ code: string; pattern: RegExp }> = [
  { code: "CP2000", pattern: /\bCP-?2000\b/i },
  { code: "CP14", pattern: /\bCP-?14\b/i },
  { code: "CP501", pattern: /\bCP-?501\b/i },
  { code: "CP503", pattern: /\bCP-?503\b/i },
  { code: "CP504", pattern: /\bCP-?504\b/i },
  { code: "CP523", pattern: /\bCP-?523\b/i },
  { code: "CP71C", pattern: /\bCP-?71C\b/i },
  { code: "LTR525", pattern: /\bLTR-?525\b/i },
  { code: "LTR566", pattern: /\bLTR-?566\b/i },
  { code: "LTR3219", pattern: /\bLTR-?3219\b/i },
  { code: "LTR4903", pattern: /\bLTR-?4903\b/i },
  { code: "CP12", pattern: /\bCP-?12\b/i },
  { code: "CP21", pattern: /\bCP-?21\b/i },
  { code: "CP22", pattern: /\bCP-?22\b/i },
].sort((a, b) => a.code.localeCompare(b.code));

/**
 * Date extraction patterns
 */
const DATE_PATTERNS = [
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i,
  /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
  /\b\d{1,2}-\d{1,2}-\d{4}\b/,
];

/**
 * Tax year extraction
 */
const TAX_YEAR_PATTERN = /\b(?:tax\s+year|for\s+(?:calendar\s+)?year)\s+(\d{4})\b/i;

/**
 * Deadline extraction patterns
 */
const DEADLINE_PATTERNS = [
  { pattern: /\bresponse.*(?:due|required).*by\s+([^.]+)/i, purpose: "response deadline" },
  { pattern: /\byou must respond.*by\s+([^.]+)/i, purpose: "mandatory response deadline" },
  { pattern: /\bpayment.*due.*by\s+([^.]+)/i, purpose: "payment deadline" },
  { pattern: /\bfile.*by\s+([^.]+)/i, purpose: "filing deadline" },
  { pattern: /\bdeadline[:\s]+([^.]+)/i, purpose: "general deadline" },
  { pattern: /\bwithin\s+(\d+\s+days)/i, purpose: "response timeframe" },
];

/**
 * Required document extraction patterns
 */
const REQUIRED_DOC_PATTERNS = [
  { pattern: /\byou must (?:submit|provide|send|attach)\s+([^.]+)/i },
  { pattern: /\brequired documents?[:\s]+([^.]+)/i },
  { pattern: /\bplease (?:send|provide|submit)\s+([^.]+)/i },
  { pattern: /\battach\s+(?:a\s+)?copy\s+of\s+([^.]+)/i },
];

/**
 * Procedural instruction patterns
 */
const PROCEDURAL_PATTERNS = [
  /^(?:\d+\.|step\s+\d+:?)\s+(.+)$/im,
  /\bto respond[,:]?\s+([^.]+)/i,
  /\byou (?:must|should|need to)\s+([^.]+)/i,
];

/**
 * Consequence extraction patterns
 */
const CONSEQUENCE_PATTERNS = [
  /\bif you (?:do not|don't|fail to)\s+(?:respond|pay|file)[,:]?\s+([^.]+)/i,
  /\bfailure to\s+(?:respond|pay|file)[^.]*may result in\s+([^.]+)/i,
  /\bconsequence[s]?[:\s]+([^.]+)/i,
  /\bpenalt(?:y|ies)[^.]*may\s+(?:be|include)\s+([^.]+)/i,
];

/**
 * Main analysis function
 */
export function analyze_notice(documentSet: DocumentSet): NoticeAnalysisResult {
  const errors: AnalysisError[] = [];
  let noticeIdentification: NoticeIdentification | undefined;
  const deadlines: DeadlineExtraction[] = [];
  const requiredDocs: RequiredDocument[] = [];
  const proceduralInstructions: ProceduralInstruction[] = [];
  let consequences: ConsequenceExtraction | undefined;

  // Validate and analyze all documents
  for (const doc of documentSet.documents) {
    const validationError = validateTextInput(doc.raw_text, doc.document_id);
    if (validationError) {
      errors.push(validationError);
      continue;
    }

    const text = doc.raw_text;

    // Identify notice code
    if (!noticeIdentification) {
      noticeIdentification = identifyNotice(text, doc.document_id);
    }

    // Extract deadlines
    extractDeadlines(text, doc.document_id, deadlines);

    // Extract required documents
    extractRequiredDocuments(text, doc.document_id, requiredDocs);

    // Extract procedural instructions
    extractProceduralInstructions(text, doc.document_id, proceduralInstructions);

    // Extract consequences
    if (!consequences) {
      consequences = extractConsequences(text, doc.document_id);
    }
  }

  // Sort arrays deterministically
  deadlines.sort((a, b) => a.deadline.localeCompare(b.deadline));
  requiredDocs.sort((a, b) => a.document_description.localeCompare(b.document_description));
  proceduralInstructions.sort((a, b) => {
    if (a.step_number !== undefined && b.step_number !== undefined) {
      return a.step_number - b.step_number;
    }
    return a.instruction.localeCompare(b.instruction);
  });

  // Generate summary
  const summary = {
    notice_identified: noticeIdentification !== undefined,
    deadlines_extracted: deadlines.length,
    documents_required: requiredDocs.length,
    procedural_steps_extracted: proceduralInstructions.length,
    consequences_described: consequences !== undefined,
  };

  return {
    engine: "IRS Notice Response Analyzer",
    timestamp: generateTimestamp(),
    errors,
    notice_identification: noticeIdentification,
    extracted_deadlines: deadlines,
    required_documents: requiredDocs,
    procedural_instructions: proceduralInstructions,
    consequences_of_non_response: consequences,
    summary,
  };
}

/**
 * Identifies notice code, date, and tax year
 */
function identifyNotice(text: string, documentId: string): NoticeIdentification | undefined {
  // Search for notice code
  for (const { code, pattern } of NOTICE_CODE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const matchIndex = text.indexOf(match[0]);
      const quote = extractQuote(text, matchIndex, 150);

      // Try to extract notice date
      let noticeDate: string | undefined;
      for (const datePattern of DATE_PATTERNS) {
        const dateMatch = text.match(datePattern);
        if (dateMatch) {
          noticeDate = dateMatch[0];
          break;
        }
      }

      // Try to extract tax year
      const taxYearMatch = text.match(TAX_YEAR_PATTERN);
      const taxYear = taxYearMatch ? taxYearMatch[1] : undefined;

      return {
        notice_code: code,
        notice_date: noticeDate,
        tax_year: taxYear,
        evidence: createEvidence(quote, documentId, `Notice code: ${match[0]}`),
      };
    }
  }

  return undefined;
}

/**
 * Extracts deadline information
 */
function extractDeadlines(text: string, documentId: string, deadlines: DeadlineExtraction[]): void {
  for (const { pattern, purpose } of DEADLINE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const deadlineText = match[1].trim();
      const matchIndex = text.indexOf(match[0]);
      const quote = extractQuote(text, matchIndex, 150);

      deadlines.push({
        deadline: deadlineText,
        deadline_purpose: purpose,
        evidence: createEvidence(quote, documentId, `Deadline extraction: ${match[0]}`),
      });
    }
  }
}

/**
 * Extracts required documents
 */
function extractRequiredDocuments(
  text: string,
  documentId: string,
  requiredDocs: RequiredDocument[]
): void {
  for (const { pattern } of REQUIRED_DOC_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const docDescription = match[1].trim();
      const matchIndex = text.indexOf(match[0]);
      const quote = extractQuote(text, matchIndex, 150);

      requiredDocs.push({
        document_description: docDescription,
        reason: "Explicitly required in notice",
        evidence: createEvidence(quote, documentId, `Required document: ${match[0]}`),
      });
    }
  }
}

/**
 * Extracts procedural instructions
 */
function extractProceduralInstructions(
  text: string,
  documentId: string,
  instructions: ProceduralInstruction[]
): void {
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for numbered steps
    const stepMatch = line.match(/^(?:(\d+)\.|step\s+(\d+):?)\s+(.+)$/i);
    if (stepMatch) {
      const stepNumber = parseInt(stepMatch[1] || stepMatch[2]);
      const instruction = stepMatch[3].trim();
      const quote = extractQuote(line, 0, 200);

      instructions.push({
        step_number: stepNumber,
        instruction,
        evidence: createEvidence(quote, documentId, `Step ${stepNumber}`),
      });
      continue;
    }

    // Check for general procedural patterns
    for (const pattern of PROCEDURAL_PATTERNS) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const instruction = match[1].trim();
        const quote = extractQuote(line, 0, 200);

        instructions.push({
          instruction,
          evidence: createEvidence(quote, documentId, "Procedural instruction"),
        });
        break;
      }
    }
  }
}

/**
 * Extracts consequences of non-response
 */
function extractConsequences(text: string, documentId: string): ConsequenceExtraction | undefined {
  for (const pattern of CONSEQUENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const consequenceText = match[1].trim();
      const matchIndex = text.indexOf(match[0]);
      const quote = extractQuote(text, matchIndex, 200);

      return {
        consequence_description: consequenceText,
        evidence: createEvidence(quote, documentId, "Consequence of non-response"),
      };
    }
  }

  return undefined;
}
