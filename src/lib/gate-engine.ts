import { GATES, TERMINAL_STATES, TEMPORAL_STATUS, REASON_CODES } from '@/types/constants'
import type { Gate, TerminalState, GateTraceEntry } from '@/types/schemas'

export interface GateContext {
  direction: 'forward' | 'backward'
  payload: any
  observed_at?: string
  evaluated_at: string
  decision_window_ms?: number
  context?: Record<string, any>
  
  // For backward
  core_ir?: any
  render_targets?: string[]
  cardinality_mode?: 'one' | 'all'
}

export interface GateResult {
  passed: boolean
  reason_code?: string
  evidence?: any
  temporal_status?: string
  staleness_ms?: number
}

/**
 * Gate Engine - Deterministic boundary evaluation
 * Executes gates in order, halting on first failure
 */
export class GateEngine {
  private trace: GateTraceEntry[] = []
  
  /**
   * Execute all gates in sequence
   */
  async execute(ctx: GateContext): Promise<{
    terminal_state: TerminalState
    failed_gate?: Gate
    reason_code?: string
    gate_trace: GateTraceEntry[]
    evidence?: any
    temporal_status?: string
    staleness_ms?: number
  }> {
    this.trace = []
    
    for (const gate of [
      GATES.INTAKE,
      GATES.TEMPORAL,
      GATES.AUTHORITY,
      GATES.RULES,
      GATES.VALIDITY,
    ]) {
      const start = Date.now()
      const result = await this.executeGate(gate, ctx)
      const duration_ms = Date.now() - start
      
      this.trace.push({
        gate,
        passed: result.passed,
        timestamp: new Date().toISOString(),
        duration_ms,
        details: result.evidence,
      })
      
      if (!result.passed) {
        // Gate failed - determine terminal state
        const terminal_state = this.determineTerminalState(gate, result)
        
        return {
          terminal_state,
          failed_gate: gate,
          reason_code: result.reason_code,
          gate_trace: this.trace,
          evidence: result.evidence,
          temporal_status: result.temporal_status,
          staleness_ms: result.staleness_ms,
        }
      }
    }
    
    // All gates passed
    return {
      terminal_state: TERMINAL_STATES.DETERMINISTIC_COMPLIANCE,
      gate_trace: this.trace,
    }
  }
  
  /**
   * Execute individual gate
   */
  private async executeGate(gate: Gate, ctx: GateContext): Promise<GateResult> {
    switch (gate) {
      case GATES.INTAKE:
        return this.gateIntake(ctx)
      case GATES.TEMPORAL:
        return this.gateTemporal(ctx)
      case GATES.AUTHORITY:
        return this.gateAuthority(ctx)
      case GATES.RULES:
        return this.gateRules(ctx)
      case GATES.VALIDITY:
        return this.gateValidity(ctx)
      default:
        throw new Error(`Unknown gate: ${gate}`)
    }
  }
  
  /**
   * INTAKE GATE
   * Validates payload structure and required fields
   */
  private gateIntake(ctx: GateContext): GateResult {
    if (ctx.direction === 'forward') {
      if (!ctx.payload.text && !ctx.payload.json_proposal) {
        return {
          passed: false,
          reason_code: REASON_CODES.MISSING_REQUIRED_FIELD,
          evidence: { missing: 'text or json_proposal' },
        }
      }
    } else {
      if (!ctx.core_ir) {
        return {
          passed: false,
          reason_code: REASON_CODES.MISSING_REQUIRED_FIELD,
          evidence: { missing: 'core_ir' },
        }
      }
      if (!ctx.render_targets || ctx.render_targets.length === 0) {
        return {
          passed: false,
          reason_code: REASON_CODES.MISSING_REQUIRED_FIELD,
          evidence: { missing: 'render_targets' },
        }
      }
    }
    
    if (!ctx.evaluated_at) {
      return {
        passed: false,
        reason_code: REASON_CODES.INVALID_TIMESTAMP,
        evidence: { missing: 'evaluated_at' },
      }
    }
    
    return { passed: true }
  }
  
  /**
   * TEMPORAL GATE
   * Checks time drift and staleness
   */
  private gateTemporal(ctx: GateContext): GateResult {
    const evaluated_at = new Date(ctx.evaluated_at)
    
    if (isNaN(evaluated_at.getTime())) {
      return {
        passed: false,
        reason_code: REASON_CODES.INVALID_TIMESTAMP,
        evidence: { evaluated_at: ctx.evaluated_at },
      }
    }
    
    // If observed_at provided, check staleness
    if (ctx.observed_at) {
      const observed_at = new Date(ctx.observed_at)
      
      if (isNaN(observed_at.getTime())) {
        return {
          passed: false,
          reason_code: REASON_CODES.INVALID_TIMESTAMP,
          evidence: { observed_at: ctx.observed_at },
        }
      }
      
      const staleness_ms = evaluated_at.getTime() - observed_at.getTime()
      
      // Determine temporal status
      let temporal_status: string
      if (ctx.decision_window_ms) {
        if (staleness_ms <= ctx.decision_window_ms) {
          temporal_status = TEMPORAL_STATUS.FRESH
        } else if (staleness_ms <= ctx.decision_window_ms * 2) {
          temporal_status = TEMPORAL_STATUS.STALE
        } else {
          temporal_status = TEMPORAL_STATUS.DRIFTED
        }
      } else {
        // No window defined - use defaults
        if (staleness_ms <= 1000) {
          temporal_status = TEMPORAL_STATUS.FRESH
        } else if (staleness_ms <= 5000) {
          temporal_status = TEMPORAL_STATUS.STALE
        } else {
          temporal_status = TEMPORAL_STATUS.DRIFTED
        }
      }
      
      // STALE or DRIFTED => fail gate
      if (temporal_status !== TEMPORAL_STATUS.FRESH) {
        return {
          passed: false,
          reason_code: temporal_status === TEMPORAL_STATUS.STALE 
            ? REASON_CODES.STALE_INPUT 
            : REASON_CODES.TIME_DRIFT_EXCEEDED,
          evidence: { staleness_ms, temporal_status },
          temporal_status,
          staleness_ms,
        }
      }
      
      return {
        passed: true,
        temporal_status,
        staleness_ms,
      }
    }
    
    return { passed: true }
  }
  
  /**
   * AUTHORITY GATE
   * Validates authority claims (deterministic stub)
   */
  private gateAuthority(ctx: GateContext): GateResult {
    // Deterministic stub - no emission authority inside classifier
    // In production, this would check cryptographic signatures, delegation chains, etc.
    
    // Example: reject if context contains forbidden_authority flag
    if (ctx.context?.forbidden_authority === true) {
      return {
        passed: false,
        reason_code: REASON_CODES.AUTHORITY_REJECTED,
        evidence: { reason: 'forbidden authority flag set' },
      }
    }
    
    return { passed: true }
  }
  
  /**
   * RULES GATE
   * Applies deterministic rules (stub)
   */
  private gateRules(ctx: GateContext): GateResult {
    // Deterministic stub - no heuristics, no probabilistic scoring
    // In production, this would apply formal rules from a rules engine
    
    // Example: check for explicit rule violations in context
    if (ctx.context?.violates_rule) {
      return {
        passed: false,
        reason_code: REASON_CODES.RULE_VIOLATION,
        evidence: { violated_rule: ctx.context.violates_rule },
      }
    }
    
    return { passed: true }
  }
  
  /**
   * VALIDITY GATE
   * Final validity check (deterministic stub)
   */
  private gateValidity(ctx: GateContext): GateResult {
    // Deterministic stub - validates final output structure
    
    // Example: check for validity markers in context
    if (ctx.context?.invalid_marker === true) {
      return {
        passed: false,
        reason_code: REASON_CODES.VALIDITY_FAILED,
        evidence: { reason: 'invalid marker detected' },
      }
    }
    
    return { passed: true }
  }
  
  /**
   * Determine terminal state based on gate failure
   * Maps to exactly 3 terminal states per Diamond Standard Docking Law
   */
  private determineTerminalState(gate: Gate, result: GateResult): TerminalState {
    // INVALID_INPUT cases
    if (
      gate === GATES.INTAKE ||
      result.reason_code === REASON_CODES.MISSING_REQUIRED_FIELD ||
      result.reason_code === REASON_CODES.INVALID_TIMESTAMP ||
      result.reason_code === REASON_CODES.MALFORMED_PAYLOAD ||
      result.reason_code === REASON_CODES.STALE_INPUT ||
      result.reason_code === REASON_CODES.TIME_DRIFT_EXCEEDED
    ) {
      return TERMINAL_STATES.INVALID_INPUT
    }
    
    // DETERMINISTIC_VIOLATION cases (all other gate failures)
    return TERMINAL_STATES.DETERMINISTIC_VIOLATION
  }
  
  /**
   * Simulate renderings for backward evaluation (deterministic stub)
   */
  private simulateRenderings(core_ir: any, render_targets: string[]): any[] {
    // Deterministic stub - in production, this would perform actual rendering
    // For now, return one rendering per target
    return render_targets.map(target => ({
      target,
      rendered: `${JSON.stringify(core_ir)}_${target}`,
    }))
  }
}
