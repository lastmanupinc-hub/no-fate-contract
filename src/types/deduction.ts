/**
 * IRS Deduction Documentation Verifier - Domain Models
 */

import { BaseResult, EvidenceAnchor } from "./core";

export interface DeductionVerificationResult extends BaseResult {
  engine: "IRS Deduction Documentation Verifier";
  claimed_deductions: ClaimedDeduction[];
  documentation_status: DocumentationStatus[];
  summary: DeductionSummary;
}

export interface ClaimedDeduction {
  /** Deduction type */
  deduction_type: DeductionType;
  /** Document claiming this deduction */
  source_document: string;
  /** Evidence of claim */
  evidence: EvidenceAnchor;
}

export interface DocumentationStatus {
  /** Deduction being verified */
  deduction_type: DeductionType;
  /** Required documentation types */
  required_documentation: string[];
  /** Documentation found */
  documentation_present: DocumentationEvidence[];
  /** Documentation missing */
  documentation_missing: string[];
  /** Overall status */
  status: "documented" | "partially_documented" | "undocumented";
}

export interface DocumentationEvidence {
  /** Type of supporting document */
  document_type: string;
  /** Document ID */
  document_id: string;
  /** Evidence anchor */
  evidence: EvidenceAnchor;
}

export interface DeductionSummary {
  total_deductions_claimed: number;
  total_fully_documented: number;
  total_partially_documented: number;
  total_undocumented: number;
}

/**
 * Common deduction types that require documentation
 */
export type DeductionType =
  | "charitable_contributions"
  | "mortgage_interest"
  | "state_local_taxes"
  | "medical_expenses"
  | "business_expenses"
  | "home_office"
  | "vehicle_expenses"
  | "travel_expenses"
  | "education_expenses"
  | "retirement_contributions"
  | "hsa_contributions"
  | "moving_expenses"
  | "casualty_losses"
  | "investment_expenses"
  | "other_itemized";
