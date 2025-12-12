/**
 * IRS Business Filing Category Router - Domain Models
 */

import { BaseResult, EvidenceAnchor, AmbiguityMarker } from "./core";

export interface FilingRouteResult extends BaseResult {
  engine: "IRS Business Filing Category Router";
  detected_business_type?: BusinessTypeDetection;
  recommended_filing_category?: FilingCategoryRecommendation;
  ambiguous_routing?: AmbiguousRouting;
  summary: FilingSummary;
}

export interface BusinessTypeDetection {
  /** Business entity type */
  entity_type: EntityType;
  /** Evidence supporting this classification */
  evidence: EvidenceAnchor[];
}

export interface FilingCategoryRecommendation {
  /** Recommended primary form */
  primary_form: string;
  /** Required schedules or attachments */
  required_schedules: string[];
  /** Reason for recommendation */
  reason: string;
  /** Supporting evidence */
  evidence: EvidenceAnchor[];
}

export interface AmbiguousRouting {
  /** Possible filing categories */
  possible_categories: string[];
  /** Reason for ambiguity */
  ambiguity: AmbiguityMarker;
}

export interface FilingSummary {
  routing_status: "routed" | "ambiguous" | "insufficient_evidence";
  entity_type_detected: boolean;
}

/**
 * Business entity types based on explicit textual descriptors
 */
export type EntityType =
  | "sole_proprietorship"
  | "single_member_llc"
  | "partnership"
  | "multi_member_llc"
  | "c_corporation"
  | "s_corporation"
  | "trust"
  | "estate"
  | "non_profit"
  | "other";
