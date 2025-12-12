/**
 * IRS Document Completeness Checker
 * Scope: Deterministic tax-document presence scanning only
 * Domain: Document classification and dependency detection for U.S. tax form sets
 */

import {
  DocumentSet,
  CompletenessResult,
  FormDetection,
  DependencyDetection,
  MissingDependency,
  AnalysisError,
} from "../types";
import {
  validateTextInput,
  createEvidence,
  generateTimestamp,
  sortAlphabetically,
  extractQuote,
} from "../utils/validation";

/**
 * Form detection patterns - explicit form identifiers only
 */
const FORM_PATTERNS: Array<{ pattern: RegExp; formId: string; formName: string }> = [
  { pattern: /\bForm\s+1040\b/i, formId: "1040", formName: "U.S. Individual Income Tax Return" },
  { pattern: /\bSchedule\s+C\b/i, formId: "Schedule C", formName: "Profit or Loss from Business" },
  { pattern: /\bSchedule\s+D\b/i, formId: "Schedule D", formName: "Capital Gains and Losses" },
  { pattern: /\bSchedule\s+E\b/i, formId: "Schedule E", formName: "Supplemental Income and Loss" },
  { pattern: /\bSchedule\s+1\b/i, formId: "Schedule 1", formName: "Additional Income and Adjustments" },
  { pattern: /\bSchedule\s+2\b/i, formId: "Schedule 2", formName: "Additional Taxes" },
  { pattern: /\bSchedule\s+3\b/i, formId: "Schedule 3", formName: "Additional Credits and Payments" },
  { pattern: /\bForm\s+W-?2\b/i, formId: "W-2", formName: "Wage and Tax Statement" },
  { pattern: /\bForm\s+1099-INT\b/i, formId: "1099-INT", formName: "Interest Income" },
  { pattern: /\bForm\s+1099-DIV\b/i, formId: "1099-DIV", formName: "Dividends and Distributions" },
  { pattern: /\bForm\s+1099-B\b/i, formId: "1099-B", formName: "Proceeds from Broker Transactions" },
  { pattern: /\bForm\s+1099-R\b/i, formId: "1099-R", formName: "Distributions from Pensions" },
  { pattern: /\bForm\s+1099-MISC\b/i, formId: "1099-MISC", formName: "Miscellaneous Income" },
  { pattern: /\bForm\s+1099-NEC\b/i, formId: "1099-NEC", formName: "Nonemployee Compensation" },
  { pattern: /\bForm\s+8949\b/i, formId: "8949", formName: "Sales and Other Dispositions of Capital Assets" },
  { pattern: /\bForm\s+4562\b/i, formId: "4562", formName: "Depreciation and Amortization" },
  { pattern: /\bForm\s+8829\b/i, formId: "8829", formName: "Expenses for Business Use of Home" },
  { pattern: /\bSchedule\s+SE\b/i, formId: "Schedule SE", formName: "Self-Employment Tax" },
  { pattern: /\bForm\s+2106\b/i, formId: "2106", formName: "Employee Business Expenses" },
  { pattern: /\bSchedule\s+A\b/i, formId: "Schedule A", formName: "Itemized Deductions" },
].sort((a, b) => a.formId.localeCompare(b.formId));

/**
 * Dependency rules - explicit requirements only
 */
const DEPENDENCY_RULES: Array<{ parent: string; required: string; reason: string }> = [
  { parent: "1040", required: "W-2", reason: "W-2 required when wages reported" },
  { parent: "1040", required: "Schedule 1", reason: "Schedule 1 required for additional income or adjustments" },
  { parent: "Schedule C", required: "Schedule SE", reason: "Schedule SE required for self-employment tax calculation" },
  { parent: "Schedule D", required: "8949", reason: "Form 8949 required to report capital asset transactions" },
  { parent: "Schedule C", required: "8829", reason: "Form 8829 required when home office deduction claimed" },
  { parent: "Schedule C", required: "4562", reason: "Form 4562 required when depreciation claimed" },
  { parent: "1040", required: "1099-INT", reason: "1099-INT required when interest income reported" },
  { parent: "1040", required: "1099-DIV", reason: "1099-DIV required when dividend income reported" },
  { parent: "Schedule E", required: "1099-MISC", reason: "1099-MISC may be required for rental or royalty income" },
].sort((a, b) => a.parent.localeCompare(b.parent));

/**
 * Tax year extraction pattern
 */
const TAX_YEAR_PATTERN = /(?:tax\s+year|for\s+calendar\s+year)\s+(\d{4})/i;

/**
 * Main analysis function
 */
export function analyze_completeness(documentSet: DocumentSet): CompletenessResult {
  const errors: AnalysisError[] = [];
  const formsDetected: FormDetection[] = [];
  const dependenciesDetected: DependencyDetection[] = [];
  const missingDependencies: MissingDependency[] = [];

  // Validate all documents
  for (const doc of documentSet.documents) {
    const validationError = validateTextInput(doc.raw_text, doc.document_id);
    if (validationError) {
      errors.push(validationError);
      continue;
    }

    // Scan for forms
    scanForForms(doc, formsDetected);
  }

  // Sort forms deterministically
  formsDetected.sort((a, b) => a.form_id.localeCompare(b.form_id));

  // Build set of detected form IDs
  const detectedFormIds = new Set(formsDetected.map((f) => f.form_id));

  // Check dependencies
  for (const form of formsDetected) {
    checkDependencies(form.form_id, detectedFormIds, dependenciesDetected, missingDependencies);
  }

  // Sort dependencies deterministically
  dependenciesDetected.sort((a, b) => a.parent_form.localeCompare(b.parent_form));
  missingDependencies.sort((a, b) => a.parent_form.localeCompare(b.parent_form));

  // Generate summary
  const summary = {
    total_forms_detected: formsDetected.length,
    total_dependencies_required: dependenciesDetected.length,
    total_dependencies_satisfied: dependenciesDetected.filter((d) => d.satisfied).length,
    total_dependencies_missing: missingDependencies.length,
    completeness_status: determineCompletenessStatus(dependenciesDetected, missingDependencies),
  };

  return {
    engine: "IRS Document Completeness Checker",
    timestamp: generateTimestamp(),
    errors,
    forms_detected: formsDetected,
    dependencies_detected: dependenciesDetected,
    missing_dependencies: missingDependencies,
    summary,
  };
}

/**
 * Scans a document for form patterns
 */
function scanForForms(doc: any, formsDetected: FormDetection[]): void {
  const text = doc.raw_text;
  const foundForms = new Set<string>();

  for (const { pattern, formId, formName } of FORM_PATTERNS) {
    const match = text.match(pattern);
    if (match && !foundForms.has(formId)) {
      foundForms.add(formId);

      // Extract tax year if present
      const taxYearMatch = text.match(TAX_YEAR_PATTERN);
      const taxYear = taxYearMatch ? taxYearMatch[1] : undefined;

      const matchIndex = text.indexOf(match[0]);
      const quote = extractQuote(text, matchIndex, 150);

      formsDetected.push({
        form_id: formId,
        form_name: formName,
        tax_year: taxYear,
        evidence: createEvidence(quote, doc.document_id, `Form identifier: ${match[0]}`),
      });
    }
  }
}

/**
 * Checks dependencies for a given form
 */
function checkDependencies(
  parentFormId: string,
  detectedFormIds: Set<string>,
  dependenciesDetected: DependencyDetection[],
  missingDependencies: MissingDependency[]
): void {
  const relevantRules = DEPENDENCY_RULES.filter((rule) => rule.parent === parentFormId);

  for (const rule of relevantRules) {
    const satisfied = detectedFormIds.has(rule.required);

    dependenciesDetected.push({
      parent_form: rule.parent,
      required_form: rule.required,
      evidence: createEvidence(
        `Dependency rule: ${rule.reason}`,
        "system",
        "Configured dependency requirement"
      ),
      satisfied,
    });

    if (!satisfied) {
      missingDependencies.push({
        parent_form: rule.parent,
        missing_form: rule.required,
        reason: rule.reason,
      });
    }
  }
}

/**
 * Determines completeness status
 */
function determineCompletenessStatus(
  dependencies: DependencyDetection[],
  missing: MissingDependency[]
): "complete" | "incomplete" | "indeterminate" {
  if (dependencies.length === 0) {
    return "indeterminate";
  }
  return missing.length === 0 ? "complete" : "incomplete";
}
