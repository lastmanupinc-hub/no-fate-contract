/**
 * IRS Deduction Documentation Verifier
 * Scope: Deterministic verification of documentation presence for common deductions
 * Domain: Document-based deduction-support verification
 */

import {
  DocumentSet,
  DeductionVerificationResult,
  ClaimedDeduction,
  DocumentationStatus,
  DocumentationEvidence,
  DeductionType,
  AnalysisError,
} from "../types";
import {
  validateTextInput,
  createEvidence,
  generateTimestamp,
  extractQuote,
} from "../utils/validation";

/**
 * Deduction claim detection patterns
 */
const DEDUCTION_PATTERNS: Array<{ type: DeductionType; patterns: RegExp[] }> = [
  {
    type: "charitable_contributions",
    patterns: [
      /\bcharitable contribution\b/i,
      /\bcharitable donation\b/i,
      /\bSchedule A.*charitable\b/is,
    ],
  },
  {
    type: "mortgage_interest",
    patterns: [/\bmortgage interest\b/i, /\bhome mortgage\b/i, /\bForm 1098\b/i],
  },
  {
    type: "state_local_taxes",
    patterns: [/\bstate.*local tax\b/i, /\bSALT deduction\b/i, /\bproperty tax\b/i],
  },
  {
    type: "medical_expenses",
    patterns: [/\bmedical expense\b/i, /\bhealth care cost\b/i, /\bSchedule A.*medical\b/is],
  },
  {
    type: "business_expenses",
    patterns: [
      /\bbusiness expense\b/i,
      /\bSchedule C.*expense\b/is,
      /\bordinary.*necessary expense\b/i,
    ],
  },
  {
    type: "home_office",
    patterns: [/\bhome office\b/i, /\bForm 8829\b/i, /\bbusiness use of home\b/i],
  },
  {
    type: "vehicle_expenses",
    patterns: [
      /\bvehicle expense\b/i,
      /\bauto expense\b/i,
      /\bmileage\b/i,
      /\bstandard mileage rate\b/i,
    ],
  },
  {
    type: "travel_expenses",
    patterns: [/\btravel expense\b/i, /\bbusiness travel\b/i, /\blodging\b/i],
  },
  {
    type: "education_expenses",
    patterns: [/\beducation expense\b/i, /\btuition\b/i, /\bForm 1098-T\b/i, /\bstudent loan\b/i],
  },
  {
    type: "retirement_contributions",
    patterns: [
      /\bretirement contribution\b/i,
      /\bIRA contribution\b/i,
      /\b401\(k\) contribution\b/i,
    ],
  },
  {
    type: "hsa_contributions",
    patterns: [/\bHSA contribution\b/i, /\bhealth savings account\b/i, /\bForm 8889\b/i],
  },
  {
    type: "casualty_losses",
    patterns: [/\bcasualty loss\b/i, /\btheft loss\b/i, /\bForm 4684\b/i],
  },
  {
    type: "investment_expenses",
    patterns: [/\binvestment expense\b/i, /\binvestment fee\b/i, /\bbrokerage fee\b/i],
  },
  {
    type: "other_itemized",
    patterns: [/\bitemized deduction\b/i, /\bSchedule A\b/i],
  },
].sort((a, b) => a.type.localeCompare(b.type));

/**
 * Documentation requirements for each deduction type
 */
const DOCUMENTATION_REQUIREMENTS: Record<DeductionType, string[]> = {
  charitable_contributions: ["receipt", "acknowledgment letter", "Form 1098-C", "bank statement"],
  mortgage_interest: ["Form 1098", "mortgage statement"],
  state_local_taxes: ["tax bill", "payment receipt", "W-2"],
  medical_expenses: ["receipt", "invoice", "explanation of benefits", "insurance statement"],
  business_expenses: ["receipt", "invoice", "bank statement", "credit card statement"],
  home_office: ["measurement documentation", "expense records", "Form 8829"],
  vehicle_expenses: ["mileage log", "expense receipt", "lease agreement"],
  travel_expenses: ["receipt", "itinerary", "lodging invoice", "airline ticket"],
  education_expenses: ["Form 1098-T", "tuition statement", "receipt"],
  retirement_contributions: ["contribution statement", "Form 5498", "account statement"],
  hsa_contributions: ["Form 5498-SA", "contribution statement", "Form 8889"],
  moving_expenses: ["receipt", "moving invoice", "mileage log"],
  casualty_losses: ["insurance claim", "appraisal", "police report", "Form 4684"],
  investment_expenses: ["brokerage statement", "Form 1099-B", "fee disclosure"],
  other_itemized: ["Schedule A", "supporting documentation"],
};

/**
 * Supporting document detection patterns
 */
const SUPPORT_DOC_PATTERNS: Array<{ docType: string; patterns: RegExp[] }> = [
  { docType: "receipt", patterns: [/\breceipt\b/i, /\bpayment confirmation\b/i] },
  { docType: "invoice", patterns: [/\binvoice\b/i, /\bbill\b/i] },
  { docType: "bank statement", patterns: [/\bbank statement\b/i, /\baccount statement\b/i] },
  { docType: "Form 1098", patterns: [/\bForm 1098\b/i, /\bmortgage interest statement\b/i] },
  { docType: "Form 1098-C", patterns: [/\bForm 1098-C\b/i] },
  { docType: "Form 1098-T", patterns: [/\bForm 1098-T\b/i, /\btuition statement\b/i] },
  { docType: "Form 5498", patterns: [/\bForm 5498\b/i, /\bIRA contribution\b/i] },
  { docType: "Form 5498-SA", patterns: [/\bForm 5498-SA\b/i, /\bHSA contribution\b/i] },
  { docType: "Form 8889", patterns: [/\bForm 8889\b/i] },
  { docType: "Form 4684", patterns: [/\bForm 4684\b/i] },
  { docType: "mileage log", patterns: [/\bmileage log\b/i, /\bmileage record\b/i] },
  { docType: "acknowledgment letter", patterns: [/\backnowledgment\b/i, /\bdonation letter\b/i] },
  {
    docType: "insurance statement",
    patterns: [/\binsurance statement\b/i, /\bexplanation of benefits\b/i],
  },
  { docType: "tax bill", patterns: [/\btax bill\b/i, /\bproperty tax\b/i] },
  { docType: "credit card statement", patterns: [/\bcredit card statement\b/i] },
].sort((a, b) => a.docType.localeCompare(b.docType));

/**
 * Main analysis function
 */
export function verify_deduction_docs(documentSet: DocumentSet): DeductionVerificationResult {
  const errors: AnalysisError[] = [];
  const claimedDeductions: ClaimedDeduction[] = [];
  const supportingDocs: Map<string, DocumentationEvidence[]> = new Map();

  // Validate all documents
  for (const doc of documentSet.documents) {
    const validationError = validateTextInput(doc.raw_text, doc.document_id);
    if (validationError) {
      errors.push(validationError);
      continue;
    }

    // Scan for deduction claims
    scanForDeductions(doc, claimedDeductions);

    // Scan for supporting documentation
    scanForSupportingDocs(doc, supportingDocs);
  }

  // Sort claimed deductions
  claimedDeductions.sort((a, b) => a.deduction_type.localeCompare(b.deduction_type));

  // Verify documentation status for each claimed deduction
  const documentationStatus: DocumentationStatus[] = [];
  for (const claim of claimedDeductions) {
    const status = verifyDocumentation(claim.deduction_type, supportingDocs);
    documentationStatus.push(status);
  }

  // Sort documentation status
  documentationStatus.sort((a, b) => a.deduction_type.localeCompare(b.deduction_type));

  // Generate summary
  const summary = {
    total_deductions_claimed: claimedDeductions.length,
    total_fully_documented: documentationStatus.filter((s) => s.status === "documented").length,
    total_partially_documented: documentationStatus.filter((s) => s.status === "partially_documented")
      .length,
    total_undocumented: documentationStatus.filter((s) => s.status === "undocumented").length,
  };

  return {
    engine: "IRS Deduction Documentation Verifier",
    timestamp: generateTimestamp(),
    errors,
    claimed_deductions: claimedDeductions,
    documentation_status: documentationStatus,
    summary,
  };
}

/**
 * Scans for deduction claims
 */
function scanForDeductions(doc: any, claimedDeductions: ClaimedDeduction[]): void {
  const text = doc.raw_text;

  for (const { type, patterns } of DEDUCTION_PATTERNS) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const matchIndex = text.indexOf(match[0]);
        const quote = extractQuote(text, matchIndex, 120);

        claimedDeductions.push({
          deduction_type: type,
          source_document: doc.document_id,
          evidence: createEvidence(quote, doc.document_id, `Deduction claim: ${match[0]}`),
        });
        break; // One match per type per document
      }
    }
  }
}

/**
 * Scans for supporting documentation
 */
function scanForSupportingDocs(
  doc: any,
  supportingDocs: Map<string, DocumentationEvidence[]>
): void {
  const text = doc.raw_text;

  for (const { docType, patterns } of SUPPORT_DOC_PATTERNS) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (!supportingDocs.has(docType)) {
          supportingDocs.set(docType, []);
        }

        const matchIndex = text.indexOf(match[0]);
        const quote = extractQuote(text, matchIndex, 100);

        supportingDocs.get(docType)!.push({
          document_type: docType,
          document_id: doc.document_id,
          evidence: createEvidence(quote, doc.document_id, `Supporting document: ${match[0]}`),
        });
        break; // One match per type per document
      }
    }
  }
}

/**
 * Verifies documentation for a deduction type
 */
function verifyDocumentation(
  deductionType: DeductionType,
  supportingDocs: Map<string, DocumentationEvidence[]>
): DocumentationStatus {
  const requiredDocs = DOCUMENTATION_REQUIREMENTS[deductionType] || [];
  const present: DocumentationEvidence[] = [];
  const missing: string[] = [];

  for (const requiredDocType of requiredDocs) {
    const found = supportingDocs.get(requiredDocType);
    if (found && found.length > 0) {
      present.push(...found);
    } else {
      missing.push(requiredDocType);
    }
  }

  let status: "documented" | "partially_documented" | "undocumented";
  if (missing.length === 0 && present.length > 0) {
    status = "documented";
  } else if (present.length > 0) {
    status = "partially_documented";
  } else {
    status = "undocumented";
  }

  return {
    deduction_type: deductionType,
    required_documentation: requiredDocs.sort(),
    documentation_present: present,
    documentation_missing: missing.sort(),
    status,
  };
}
