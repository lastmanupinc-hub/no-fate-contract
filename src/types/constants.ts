/**
 * DIAMOND STANDARD DOCKING LAW
 * Determination Model (Public Output Law)
 */

/**
 * Top-level determination - exactly YES or NO
 */
export const DETERMINATION = {
  YES: 'YES',
  NO: 'NO',
} as const

export type Determination = typeof DETERMINATION[keyof typeof DETERMINATION]

/**
 * Failure modes - required when determination is NO
 * Exactly three modes, no others permitted
 */
export const FAILURE_MODE = {
  NON_COMPLIANT: 'NON_COMPLIANT',
  INCOMPLETE_INPUT: 'INCOMPLETE_INPUT',
  INVALID_INPUT: 'INVALID_INPUT',
} as const

export type FailureMode = typeof FAILURE_MODE[keyof typeof FAILURE_MODE]

/**
 * Lawful evaluation response
 * - YES: determination only
 * - NO: determination + failure_mode + reason
 */
export interface EvaluationResponse {
  determination: Determination
  failure_mode?: FailureMode  // Required iff determination is NO
  reason?: {
    code: string
    message: string
    evidence?: any
  }  // Required iff determination is NO
  gate_trace?: any[]
  temporal_status?: string
  staleness_ms?: number
  audit_head_hash?: string
  metering_units?: {
    bytes_in: number
    bytes_out: number
    gates_executed: number
    audit_writes: number
    wall_time_ms: number
  }
}

/**
 * Internal terminal states (for backward compatibility with gate engine)
 * These map to public determination model
 */
export const TERMINAL_STATES = {
  DETERMINISTIC_COMPLIANCE: 'DETERMINISTIC_COMPLIANCE',  // -> YES
  DETERMINISTIC_VIOLATION: 'DETERMINISTIC_VIOLATION',    // -> NO + NON_COMPLIANT
  INVALID_INPUT: 'INVALID_INPUT',                        // -> NO + INVALID_INPUT
} as const

export type TerminalState = typeof TERMINAL_STATES[keyof typeof TERMINAL_STATES]

/**
 * Map internal terminal state to public determination model
 */
export function mapToPublicDetermination(
  terminalState: TerminalState,
  reasonCode?: string
): Pick<EvaluationResponse, 'determination' | 'failure_mode'> {
  switch (terminalState) {
    case TERMINAL_STATES.DETERMINISTIC_COMPLIANCE:
      return { determination: DETERMINATION.YES }
    
    case TERMINAL_STATES.DETERMINISTIC_VIOLATION:
      return { 
        determination: DETERMINATION.NO,
        failure_mode: FAILURE_MODE.NON_COMPLIANT
      }
    
    case TERMINAL_STATES.INVALID_INPUT:
      return { 
        determination: DETERMINATION.NO,
        failure_mode: FAILURE_MODE.INVALID_INPUT
      }
    
    default:
      // Fallback for any unmapped state
      return { 
        determination: DETERMINATION.NO,
        failure_mode: FAILURE_MODE.NON_COMPLIANT
      }
  }
}

/**
 * Map reason codes to failure modes
 * Used when terminal state is ambiguous
 */
export function mapReasonCodeToFailureMode(reasonCode: string): FailureMode {
  // INVALID_INPUT cases
  if (
    reasonCode === 'MISSING_REQUIRED_FIELD' ||
    reasonCode === 'INVALID_TIMESTAMP' ||
    reasonCode === 'MALFORMED_PAYLOAD'
  ) {
    return FAILURE_MODE.INVALID_INPUT
  }
  
  // INCOMPLETE_INPUT cases
  if (
    reasonCode === 'STALE_INPUT' ||
    reasonCode === 'TIME_DRIFT_EXCEEDED'
  ) {
    return FAILURE_MODE.INCOMPLETE_INPUT
  }
  
  // NON_COMPLIANT cases (default)
  return FAILURE_MODE.NON_COMPLIANT
}

/**
 * Gate definitions (5 gates as per law)
 */
export const GATES = {
  INTAKE: 'intake',
  TEMPORAL: 'temporal',
  AUTHORITY: 'authority',
  RULES: 'rules',
  VALIDITY: 'validity',
} as const

export type Gate = typeof GATES[keyof typeof GATES]

export const GATE_ORDER: Gate[] = [
  GATES.INTAKE,
  GATES.TEMPORAL,
  GATES.AUTHORITY,
  GATES.RULES,
  GATES.VALIDITY,
]

/**
 * Temporal status
 */
export const TEMPORAL_STATUS = {
  FRESH: 'FRESH',
  STALE: 'STALE',
  DRIFTED: 'DRIFTED',
} as const

export type TemporalStatus = typeof TEMPORAL_STATUS[keyof typeof TEMPORAL_STATUS]

/**
 * Evaluation direction
 */
export const DIRECTION = {
  FORWARD: 'forward',
  BACKWARD: 'backward',
} as const

export type Direction = typeof DIRECTION[keyof typeof DIRECTION]

/**
 * Reason codes for failures
 */
export const REASON_CODES = {
  // INVALID_INPUT
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_TIMESTAMP: 'INVALID_TIMESTAMP',
  MALFORMED_PAYLOAD: 'MALFORMED_PAYLOAD',
  
  // INCOMPLETE_INPUT
  STALE_INPUT: 'STALE_INPUT',
  TIME_DRIFT_EXCEEDED: 'TIME_DRIFT_EXCEEDED',
  
  // NON_COMPLIANT
  AUTHORITY_REJECTED: 'AUTHORITY_REJECTED',
  RULE_VIOLATION: 'RULE_VIOLATION',
  BILLING_HOLD: 'BILLING_HOLD',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  MULTIPLE_RENDERINGS: 'MULTIPLE_RENDERINGS',
  
  // Gate failures
  INTAKE_FAILED: 'INTAKE_FAILED',
  TEMPORAL_FAILED: 'TEMPORAL_FAILED',
  AUTHORITY_FAILED: 'AUTHORITY_FAILED',
  RULES_FAILED: 'RULES_FAILED',
  VALIDITY_FAILED: 'VALIDITY_FAILED',
} as const

export type ReasonCode = typeof REASON_CODES[keyof typeof REASON_CODES]

/**
 * Audit event types
 */
export const AUDIT_EVENT_TYPES = {
  REQUEST_RECEIVED: 'request_received',
  GATE_PASSED: 'gate_passed',
  GATE_FAILED: 'gate_failed',
  RESPONSE_EMITTED: 'response_emitted',
  USAGE_RECORDED: 'usage_recorded',
  STRIPE_USAGE_REPORTED: 'stripe_usage_reported',
  INVOICE_STATE_CHANGED: 'invoice_state_changed',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
} as const

export type AuditEventType = typeof AUDIT_EVENT_TYPES[keyof typeof AUDIT_EVENT_TYPES]

/**
 * Billing status
 */
export const BILLING_STATUS = {
  ACTIVE: 'active',
  GRACE: 'grace',
  SUSPENDED: 'suspended',
} as const

export type BillingStatus = typeof BILLING_STATUS[keyof typeof BILLING_STATUS]
