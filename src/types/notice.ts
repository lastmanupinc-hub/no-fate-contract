/**
 * IRS Notice Response Analyzer - Domain Models
 */

import { BaseResult, EvidenceAnchor } from "./core";

export interface NoticeAnalysisResult extends BaseResult {
  engine: "IRS Notice Response Analyzer";
  notice_identification?: NoticeIdentification;
  extracted_deadlines: DeadlineExtraction[];
  required_documents: RequiredDocument[];
  procedural_instructions: ProceduralInstruction[];
  consequences_of_non_response?: ConsequenceExtraction;
  summary: NoticeSummary;
}

export interface NoticeIdentification {
  /** Notice code (e.g., CP2000, CP14, LTR525) */
  notice_code: string;
  /** Notice date */
  notice_date?: string;
  /** Tax year referenced */
  tax_year?: string;
  /** Evidence of identification */
  evidence: EvidenceAnchor;
}

export interface DeadlineExtraction {
  /** Deadline date or descriptor */
  deadline: string;
  /** What the deadline is for */
  deadline_purpose: string;
  /** Evidence from notice text */
  evidence: EvidenceAnchor;
}

export interface RequiredDocument {
  /** Document identifier or description */
  document_description: string;
  /** Why this document is required */
  reason: string;
  /** Evidence from notice text */
  evidence: EvidenceAnchor;
}

export interface ProceduralInstruction {
  /** Step number or order */
  step_number?: number;
  /** Instruction text (quoted exactly) */
  instruction: string;
  /** Evidence anchor */
  evidence: EvidenceAnchor;
}

export interface ConsequenceExtraction {
  /** Consequence description (quoted exactly) */
  consequence_description: string;
  /** Evidence from notice text */
  evidence: EvidenceAnchor;
}

export interface NoticeSummary {
  notice_identified: boolean;
  deadlines_extracted: number;
  documents_required: number;
  procedural_steps_extracted: number;
  consequences_described: boolean;
}
