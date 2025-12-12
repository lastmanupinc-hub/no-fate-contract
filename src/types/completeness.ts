/**
 * IRS Document Completeness Checker - Domain Models
 */

import { BaseResult, EvidenceAnchor } from "./core";

export interface CompletenessResult extends BaseResult {
  engine: "IRS Document Completeness Checker";
  forms_detected: FormDetection[];
  dependencies_detected: DependencyDetection[];
  missing_dependencies: MissingDependency[];
  summary: CompletenessSummary;
}

export interface FormDetection {
  /** Form identifier (e.g., "1040", "Schedule C") */
  form_id: string;
  /** Normalized form name */
  form_name: string;
  /** Tax year if detected */
  tax_year?: string;
  /** Evidence of detection */
  evidence: EvidenceAnchor;
}

export interface DependencyDetection {
  /** Form that declares the dependency */
  parent_form: string;
  /** Required dependent form/attachment */
  required_form: string;
  /** Evidence of dependency requirement */
  evidence: EvidenceAnchor;
  /** Whether the requirement is satisfied */
  satisfied: boolean;
}

export interface MissingDependency {
  /** Form that requires the missing dependency */
  parent_form: string;
  /** Missing form identifier */
  missing_form: string;
  /** Reason for requirement */
  reason: string;
}

export interface CompletenessSummary {
  total_forms_detected: number;
  total_dependencies_required: number;
  total_dependencies_satisfied: number;
  total_dependencies_missing: number;
  completeness_status: "complete" | "incomplete" | "indeterminate";
}
