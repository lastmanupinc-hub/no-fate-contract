import { describe, it, expect } from 'vitest'
import { GateEngine } from '@/lib/gate-engine'
import { TERMINAL_STATES, REASON_CODES, DETERMINATION, FAILURE_MODE, mapToPublicDetermination, mapReasonCodeToFailureMode } from '@/types/constants'

describe('GateEngine - Diamond Standard Docking Law v1.0.0', () => {
  it('should pass all 5 gates with valid input', async () => {
    const engine = new GateEngine()
    
    const result = await engine.execute({
      direction: 'forward',
      payload: {
        text: 'test input',
      },
      evaluated_at: new Date().toISOString(),
      observed_at: new Date().toISOString(),
      decision_window_ms: 5000,
    })
    
    expect(result.terminal_state).toBe(TERMINAL_STATES.DETERMINISTIC_COMPLIANCE)
    expect(result.gate_trace).toHaveLength(5) // 5 gates: INTAKE, TEMPORAL, AUTHORITY, RULES, VALIDITY
    expect(result.gate_trace.every(t => t.passed)).toBe(true)
    
    // Public API: Maps to YES
    const determination = mapToPublicDetermination(result.terminal_state)
    expect(determination).toBe(DETERMINATION.YES)
  })
  
  it('should fail intake gate with missing text and json_proposal', async () => {
    const engine = new GateEngine()
    
    const result = await engine.execute({
      direction: 'forward',
      payload: {},
      evaluated_at: new Date().toISOString(),
    })
    
    expect(result.terminal_state).toBe(TERMINAL_STATES.INVALID_INPUT)
    expect(result.failed_gate).toBe('intake')
    expect(result.reason_code).toBe(REASON_CODES.MISSING_REQUIRED_FIELD)
    
    // Public API: Maps to NO + INVALID_INPUT
    const determination = mapToPublicDetermination(result.terminal_state)
    const failureMode = mapReasonCodeToFailureMode(result.reason_code)
    expect(determination).toBe(DETERMINATION.NO)
    expect(failureMode).toBe(FAILURE_MODE.INVALID_INPUT)
  })
  
  it('should fail temporal gate with stale input and map to INVALID_INPUT', async () => {
    const engine = new GateEngine()
    
    const observedAt = new Date()
    observedAt.setSeconds(observedAt.getSeconds() - 10) // 10 seconds ago
    
    const result = await engine.execute({
      direction: 'forward',
      payload: {
        text: 'test',
      },
      evaluated_at: new Date().toISOString(),
      observed_at: observedAt.toISOString(),
      decision_window_ms: 1000, // 1 second window
    })
    
    // Internal: Maps STALE_INPUT or TIME_DRIFT_EXCEEDED to INVALID_INPUT (not NO_DETERMINISTIC_OUTCOME)
    expect(result.terminal_state).toBe(TERMINAL_STATES.INVALID_INPUT)
    expect(result.failed_gate).toBe('temporal')
    expect([REASON_CODES.STALE_INPUT, REASON_CODES.TIME_DRIFT_EXCEEDED]).toContain(result.reason_code)
    
    // Public API: Maps to NO + INVALID_INPUT per law
    const determination = mapToPublicDetermination(result.terminal_state)
    const failureMode = mapReasonCodeToFailureMode(result.reason_code)
    expect(determination).toBe(DETERMINATION.NO)
    expect(failureMode).toBe(FAILURE_MODE.INVALID_INPUT)
  })
  
  it('should reject forbidden authority and map to NON_COMPLIANT', async () => {
    const engine = new GateEngine()
    
    const result = await engine.execute({
      direction: 'forward',
      payload: {
        text: 'test',
      },
      evaluated_at: new Date().toISOString(),
      context: {
        forbidden_authority: true,
      },
    })
    
    expect(result.terminal_state).toBe(TERMINAL_STATES.DETERMINISTIC_VIOLATION)
    expect(result.failed_gate).toBe('authority')
    expect(result.reason_code).toBe(REASON_CODES.AUTHORITY_REJECTED)
    
    // Public API: Maps to NO + NON_COMPLIANT
    const determination = mapToPublicDetermination(result.terminal_state)
    const failureMode = mapReasonCodeToFailureMode(result.reason_code)
    expect(determination).toBe(DETERMINATION.NO)
    expect(failureMode).toBe(FAILURE_MODE.NON_COMPLIANT)
  })
  
  it('should only return one of 3 lawful terminal states', async () => {
    const engine = new GateEngine()
    
    const result = await engine.execute({
      direction: 'forward',
      payload: {
        text: 'test',
      },
      evaluated_at: new Date().toISOString(),
    })
    
    // Per Diamond Standard Docking Law v1.0.0: Only 3 internal terminal states
    const validStates = [
      TERMINAL_STATES.DETERMINISTIC_COMPLIANCE,
      TERMINAL_STATES.DETERMINISTIC_VIOLATION,
      TERMINAL_STATES.INVALID_INPUT,
    ]
    
    expect(validStates).toContain(result.terminal_state)
  })
  
  it('should prove NO_DETERMINISTIC_OUTCOME cannot be produced', async () => {
    // Per Diamond Standard Docking Law v1.0.0: NO_DETERMINISTIC_OUTCOME is unlawful
    // All cases that previously returned NO_DETERMINISTIC_OUTCOME now map to:
    // - INVALID_INPUT (for STALE_INPUT, TIME_DRIFT_EXCEEDED, malformed payloads)
    // - DETERMINISTIC_VIOLATION (for RATE_LIMIT_EXCEEDED, BILLING_HOLD via refusal paths)
    
    const engine = new GateEngine()
    
    // Test stale input (previously NO_DETERMINISTIC_OUTCOME)
    const observedAt = new Date()
    observedAt.setSeconds(observedAt.getSeconds() - 10)
    
    const result = await engine.execute({
      direction: 'forward',
      payload: { text: 'test' },
      evaluated_at: new Date().toISOString(),
      observed_at: observedAt.toISOString(),
      decision_window_ms: 1000,
    })
    
    // Should be INVALID_INPUT, not NO_DETERMINISTIC_OUTCOME
    expect(result.terminal_state).toBe(TERMINAL_STATES.INVALID_INPUT)
    expect(result.terminal_state).not.toBe('NO_DETERMINISTIC_OUTCOME')
    
    // Public API: Maps to NO + INVALID_INPUT
    const determination = mapToPublicDetermination(result.terminal_state)
    expect(determination).toBe(DETERMINATION.NO)
  })
  
  it('should map all internal states to YES or NO (no other outcomes)', async () => {
    const allInternalStates = [
      TERMINAL_STATES.DETERMINISTIC_COMPLIANCE,
      TERMINAL_STATES.DETERMINISTIC_VIOLATION,
      TERMINAL_STATES.INVALID_INPUT,
    ]
    
    allInternalStates.forEach(state => {
      const determination = mapToPublicDetermination(state)
      expect([DETERMINATION.YES, DETERMINATION.NO]).toContain(determination)
    })
  })
  
  it('should execute exactly 5 gates (not 6)', async () => {
    // Per Diamond Standard Docking Law v1.0.0: CARDINALITY gate removed
    // 5 gates: INTAKE, TEMPORAL, AUTHORITY, RULES, VALIDITY
    const engine = new GateEngine()
    
    const result = await engine.execute({
      direction: 'forward',
      payload: { text: 'test' },
      evaluated_at: new Date().toISOString(),
    })
    
    // Should execute 5 gates, not 6
    expect(result.gate_trace).toHaveLength(5)
    
    // Gate names should not include CARDINALITY
    const gateNames = result.gate_trace.map(t => t.gate)
    expect(gateNames).not.toContain('cardinality')
    expect(gateNames).toContain('intake')
    expect(gateNames).toContain('temporal')
    expect(gateNames).toContain('authority')
    expect(gateNames).toContain('rules')
    expect(gateNames).toContain('validity')
  })
})
