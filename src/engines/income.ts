/**
 * IRS Income Classification Engine
 * Scope: Deterministic textual classification of income types based solely on document evidence
 * Domain: IRS income-category detection and evidence-bound classification
 */

import {
  DocumentSet,
  IncomeClassificationResult,
  IncomeCategory,
  AmbiguousIncome,
  IncomeType,
  AnalysisError,
} from "../types";
import {
  validateTextInput,
  createEvidence,
  generateTimestamp,
  extractQuote,
} from "../utils/validation";

/**
 * Income pattern definitions - explicit textual cues only
 */
const INCOME_PATTERNS: Array<{ type: IncomeType; patterns: RegExp[]; priority: number }> = [
  {
    type: "wages",
    patterns: [/\bW-?2\b/i, /\bwages?\b/i, /\bsalary\b/i, /\bemployee compensation\b/i],
    priority: 1,
  },
  {
    type: "interest",
    patterns: [/\b1099-INT\b/i, /\binterest income\b/i, /\btaxable interest\b/i],
    priority: 1,
  },
  {
    type: "dividends",
    patterns: [
      /\b1099-DIV\b/i,
      /\bdividend income\b/i,
      /\bordinary dividends\b/i,
      /\bqualified dividends\b/i,
    ],
    priority: 1,
  },
  {
    type: "self_employment",
    patterns: [
      /\bSchedule C\b/i,
      /\bself-employment\b/i,
      /\bindependent contractor\b/i,
      /\b1099-NEC\b/i,
    ],
    priority: 1,
  },
  {
    type: "rental",
    patterns: [/\bSchedule E\b/i, /\brental income\b/i, /\brental property\b/i],
    priority: 1,
  },
  {
    type: "capital_gains",
    patterns: [
      /\bcapital gain\b/i,
      /\bSchedule D\b/i,
      /\b1099-B\b/i,
      /\bForm 8949\b/i,
      /\bsale of capital asset\b/i,
    ],
    priority: 1,
  },
  {
    type: "capital_losses",
    patterns: [/\bcapital loss\b/i, /\bloss from sale\b/i],
    priority: 1,
  },
  {
    type: "retirement_distributions",
    patterns: [
      /\b1099-R\b/i,
      /\bretirement distribution\b/i,
      /\bpension\b/i,
      /\bIRA distribution\b/i,
      /\b401\(k\) distribution\b/i,
    ],
    priority: 1,
  },
  {
    type: "social_security",
    patterns: [/\bSSA-1099\b/i, /\bsocial security benefits\b/i, /\bsocial security income\b/i],
    priority: 1,
  },
  {
    type: "unemployment",
    patterns: [/\b1099-G\b/i, /\bunemployment compensation\b/i, /\bunemployment benefits\b/i],
    priority: 1,
  },
  {
    type: "business_income",
    patterns: [/\bbusiness income\b/i, /\bgross receipts\b/i, /\bSchedule C\b/i],
    priority: 2,
  },
  {
    type: "partnership_income",
    patterns: [/\bSchedule K-1\b/i, /\bpartnership income\b/i, /\bForm 1065\b/i],
    priority: 1,
  },
  {
    type: "s_corp_income",
    patterns: [/\bS Corporation\b/i, /\bS-Corp\b/i, /\bForm 1120-?S\b/i],
    priority: 1,
  },
  {
    type: "royalties",
    patterns: [/\broyalty income\b/i, /\broyalties\b/i],
    priority: 1,
  },
  {
    type: "alimony",
    patterns: [/\balimony\b/i, /\bseparate maintenance\b/i],
    priority: 1,
  },
  {
    type: "farm_income",
    patterns: [/\bSchedule F\b/i, /\bfarm income\b/i, /\bagricultural\b/i],
    priority: 1,
  },
  {
    type: "trust_income",
    patterns: [/\btrust income\b/i, /\bestate income\b/i, /\bForm 1041\b/i],
    priority: 1,
  },
  {
    type: "other_income",
    patterns: [/\bother income\b/i, /\b1099-MISC\b/i, /\bmiscellaneous income\b/i],
    priority: 3,
  },
].sort((a, b) => a.type.localeCompare(b.type));

/**
 * Main analysis function
 */
export function classify_income(documentSet: DocumentSet): IncomeClassificationResult {
  const errors: AnalysisError[] = [];
  const incomeCategories: Map<IncomeType, IncomeCategory> = new Map();
  const ambiguousClassifications: AmbiguousIncome[] = [];

  // Validate and scan all documents
  for (const doc of documentSet.documents) {
    const validationError = validateTextInput(doc.raw_text, doc.document_id);
    if (validationError) {
      errors.push(validationError);
      continue;
    }

    // Scan for income patterns
    scanForIncomePatterns(doc, incomeCategories, ambiguousClassifications);
  }

  // Convert map to sorted array
  const incomeCategoriesArray = Array.from(incomeCategories.values()).sort((a, b) =>
    a.category.localeCompare(b.category)
  );

  // Sort ambiguous classifications
  ambiguousClassifications.sort((a, b) => a.document_id.localeCompare(b.document_id));

  // Generate summary
  const detectedCategories = incomeCategoriesArray
    .map((c) => c.category)
    .sort((a, b) => a.localeCompare(b));

  const summary = {
    total_income_categories_detected: incomeCategoriesArray.length,
    total_ambiguous_classifications: ambiguousClassifications.length,
    detected_categories: detectedCategories,
  };

  return {
    engine: "IRS Income Classification Engine",
    timestamp: generateTimestamp(),
    errors,
    income_categories: incomeCategoriesArray,
    ambiguous_classifications: ambiguousClassifications,
    summary,
  };
}

/**
 * Scans a document for income patterns
 */
function scanForIncomePatterns(
  doc: any,
  incomeCategories: Map<IncomeType, IncomeCategory>,
  ambiguousClassifications: AmbiguousIncome[]
): void {
  const text = doc.raw_text;
  const matchedTypes: Array<{ type: IncomeType; match: string; index: number; priority: number }> = [];

  // Find all matching patterns
  for (const { type, patterns, priority } of INCOME_PATTERNS) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const matchIndex = text.indexOf(match[0]);
        matchedTypes.push({ type, match: match[0], index: matchIndex, priority });
        break; // Only record one match per type per document
      }
    }
  }

  // If no matches, no classification
  if (matchedTypes.length === 0) {
    return;
  }

  // Check for ambiguity (multiple high-priority matches that could conflict)
  const highPriorityMatches = matchedTypes.filter((m) => m.priority === 1);
  if (highPriorityMatches.length > 3) {
    // Many distinct income types - potentially ambiguous
    ambiguousClassifications.push({
      possible_categories: highPriorityMatches.map((m) => m.type).sort((a, b) => a.localeCompare(b)),
      document_id: doc.document_id,
      ambiguity: {
        reason: "Multiple distinct income type indicators detected",
        conflicting_evidence: highPriorityMatches.slice(0, 3).map((m) =>
          createEvidence(extractQuote(text, m.index, 100), doc.document_id, `Pattern: ${m.match}`)
        ),
      },
    });
  }

  // Record all matched types
  for (const { type, match, index } of matchedTypes) {
    if (!incomeCategories.has(type)) {
      incomeCategories.set(type, {
        category: type,
        source_documents: [],
        evidence: [],
      });
    }

    const category = incomeCategories.get(type)!;
    if (!category.source_documents.includes(doc.document_id)) {
      category.source_documents.push(doc.document_id);
      category.source_documents.sort();
    }

    const quote = extractQuote(text, index, 120);
    category.evidence.push(
      createEvidence(quote, doc.document_id, `Income type indicator: ${match}`)
    );
  }
}
