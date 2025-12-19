import { z } from 'zod'
import { 
  TERMINAL_STATES, 
  GATES, 
  TEMPORAL_STATUS, 
  DIRECTION, 
  DETERMINATION,
  FAILURE_MODE,
} from './constants'

// Export types from constants
export type Gate = typeof GATES[keyof typeof GATES]
export type TerminalState = typeof TERMINAL_STATES[keyof typeof TERMINAL_STATES]
export type Determination = typeof DETERMINATION[keyof typeof DETERMINATION]
export type FailureMode = typeof FAILURE_MODE[keyof typeof FAILURE_MODE]

/**
 * Forward evaluation request
 */
export const ForwardRequestSchema = z.object({
  text: z.string().optional(),
  json_proposal: z.any().optional(),
  context: z.record(z.any()).optional(),
  observed_at: z.string().datetime().optional(),
  evaluated_at: z.string().datetime(),
  decision_window_ms: z.number().int().positive().optional(),
  idempotency_key: z.string(),
}).refine(data => data.text || data.json_proposal, {
  message: 'Either text or json_proposal must be provided',
})

export type ForwardRequest = z.infer<typeof ForwardRequestSchema>

/**
 * Backward evaluation request
 */
export const BackwardRequestSchema = z.object({
  core_ir: z.any(),
  render_targets: z.array(z.string()),
  context: z.record(z.any()).optional(),
  observed_at: z.string().datetime().optional(),
  evaluated_at: z.string().datetime(),
  decision_window_ms: z.number().int().positive().optional(),
  idempotency_key: z.string(),
})

export type BackwardRequest = z.infer<typeof BackwardRequestSchema>

/**
 * Gate trace entry
 */
export const GateTraceEntrySchema = z.object({
  gate: z.enum([GATES.INTAKE, GATES.TEMPORAL, GATES.AUTHORITY, GATES.RULES, GATES.VALIDITY]),
  passed: z.boolean(),
  timestamp: z.string().datetime(),
  duration_ms: z.number(),
  details: z.any().optional(),
})

export type GateTraceEntry = z.infer<typeof GateTraceEntrySchema>

/**
 * Evaluation response - Lawful YES/NO + failure_mode structure per Diamond Standard Docking Law v1.0.0
 */
export const EvaluationResponseSchema = z.object({
  determination: z.enum([DETERMINATION.YES, DETERMINATION.NO]),
  failure_mode: z.enum([
    FAILURE_MODE.NON_COMPLIANT,
    FAILURE_MODE.INCOMPLETE_INPUT,
    FAILURE_MODE.INVALID_INPUT,
  ]).optional(),
  reason: z.object({
    code: z.string(),
    message: z.string(),
    evidence: z.any(),
  }).optional(),
  gate_trace: z.array(GateTraceEntrySchema),
  temporal_status: z.enum([TEMPORAL_STATUS.FRESH, TEMPORAL_STATUS.STALE, TEMPORAL_STATUS.DRIFTED]).optional(),
  staleness_ms: z.number().optional(),
  audit_head_hash: z.string(),
  metering_units: z.object({
    bytes_in: z.number(),
    bytes_out: z.number(),
    gates_executed: z.number(),
    audit_writes: z.number(),
    wall_time_ms: z.number(),
  }),
}).refine(
  data => {
    // If NO, failure_mode and reason are required
    if (data.determination === DETERMINATION.NO) {
      return data.failure_mode !== undefined && data.reason !== undefined
    }
    // If YES, failure_mode and reason should not be present
    return data.failure_mode === undefined && data.reason === undefined
  },
  {
    message: 'NO determination requires failure_mode and reason; YES determination must not have them',
  }
)

export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>

/**
 * Metering record
 */
export interface MeteringRecord {
  evaluation_id: string
  bytes_in: number
  bytes_out: number
  gates_executed: number
  audit_writes: number
  wall_time_ms: number
  cost_cents: number
}

/**
 * Usage aggregation
 */
export interface UsageAggregation {
  tenant_id: string
  period_start: Date
  period_end: Date
  total_bytes_in: bigint
  total_bytes_out: bigint
  total_gates: bigint
  total_audit_writes: bigint
  total_cost_cents: bigint
}

/**
 * Pricing configuration
 */
export interface PricingConfig {
  price_per_mb_in: number   // cents
  price_per_mb_out: number  // cents
  price_per_gate: number    // cents
  price_per_audit_event: number // cents
}

/**
 * Tenant API response
 */
export interface TenantInfo {
  id: string
  name: string
  billing_status: string
  stripe_customer_id?: string
  created_at: string
}

/**
 * Admin metrics response
 */
export interface MetricsResponse {
  tenant_id: string
  period: string
  total_evaluations: number
  compliance_count: number
  violation_count: number
  no_outcome_count: number
  invalid_count: number
  refusal_rate: number
  failures_by_gate: Record<string, number>
  p95_latency_ms: number
  staleness_distribution: {
    fresh: number
    stale: number
    drifted: number
  }
}
