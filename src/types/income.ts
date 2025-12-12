/**
 * IRS Income Classification Engine - Domain Models
 */

import { BaseResult, EvidenceAnchor, AmbiguityMarker } from "./core";

export interface IncomeClassificationResult extends BaseResult {
  engine: "IRS Income Classification Engine";
  income_categories: IncomeCategory[];
  ambiguous_classifications: AmbiguousIncome[];
  summary: IncomeSummary;
}

export interface IncomeCategory {
  /** Income category label */
  category: IncomeType;
  /** Document(s) containing this income type */
  source_documents: string[];
  /** Evidence supporting this classification */
  evidence: EvidenceAnchor[];
}

export interface AmbiguousIncome {
  /** Potential categories */
  possible_categories: IncomeType[];
  /** Document containing ambiguous income */
  document_id: string;
  /** Reason for ambiguity */
  ambiguity: AmbiguityMarker;
}

export interface IncomeSummary {
  total_income_categories_detected: number;
  total_ambiguous_classifications: number;
  detected_categories: IncomeType[];
}

/**
 * Standard IRS income categories
 * Based on explicit textual cues in tax documents
 */
export type IncomeType =
  | "wages"
  | "interest"
  | "dividends"
  | "self_employment"
  | "rental"
  | "capital_gains"
  | "capital_losses"
  | "retirement_distributions"
  | "social_security"
  | "unemployment"
  | "alimony"
  | "business_income"
  | "farm_income"
  | "royalties"
  | "partnership_income"
  | "s_corp_income"
  | "trust_income"
  | "other_income";
