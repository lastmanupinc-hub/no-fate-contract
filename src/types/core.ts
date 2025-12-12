/**
 * IRS No-Fate Tax Analysis Suite - Core Types
 * SPEC_COMPLETE — DEP_STATUS: CLAIM — RUNTIME_UNVERIFIED
 */

/**
 * DocumentSet
 * A collection of user-provided text-extracted IRS-related documents.
 * No images or binary. No external references.
 */
export interface DocumentSet {
  documents: Document[];
}

export interface Document {
  /** Unique identifier for this document */
  document_id: string;
  /** Document type (e.g., "1040", "W-2", "1099-INT", "CP2000") */
  document_type: string;
  /** Raw extracted text content */
  raw_text: string;
}

/**
 * Named Failure Codes
 * All engines use these uniform error codes.
 */
export type ErrorCode =
  | "error: unreadable_document"
  | "error: schema_violation"
  | "error: invalid_text_input"
  | "error: unsupported_document_type";

export interface AnalysisError {
  error_code: ErrorCode;
  error_message: string;
  document_id?: string;
}

/**
 * Evidence Anchor
 * All classifications, detections, and extractions must be anchored to explicit text evidence.
 */
export interface EvidenceAnchor {
  /** Exact quoted text from source document */
  quoted_text: string;
  /** Document ID where evidence was found */
  document_id: string;
  /** Optional context or location descriptor */
  context?: string;
}

/**
 * Ambiguity Marker
 * Used when explicit evidence is insufficient for deterministic classification.
 */
export interface AmbiguityMarker {
  reason: string;
  conflicting_evidence?: EvidenceAnchor[];
}

/**
 * Base Result
 * All engine outputs extend this structure.
 */
export interface BaseResult {
  /** Engine that produced this result */
  engine: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** List of errors encountered */
  errors: AnalysisError[];
}
