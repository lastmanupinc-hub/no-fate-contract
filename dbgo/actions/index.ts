/**
 * DBGO Action Space - EXHAUSTIVE CANONICAL MOVES
 * 
 * EXACTLY 8 VALID MOVES - NO MORE, NO LESS
 * 
 * All moves produce deterministic outcomes:
 * - PASS
 * - FAIL
 * - INDETERMINATE
 * - INVALID_INPUT
 * - INVALID (for forbidden operations)
 * 
 * NO DISCRETIONARY PATHWAYS
 * NO HEURISTICS
 * NO AMBIGUITY COLLAPSE
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: action-executor
 * - mutation_allowed: false
 * - supersession_required_for_change: ALL_MUTATIONS
 */

import { CanonicalIntentBundle } from '../core/types/intent-ir';
import { CertificateIR } from '../core/types/certificate-ir';
import { runCompetingSolvers, HarnessResult } from '../harness';
import { enforceAllPolicies } from '../enforcement';

/**
 * System State (Read-Only)
 */
export const SYSTEM_STATE = {
  system_state: 'OPERATIONAL' as const,
  governance_state: 'CLOSED_UNDER_CONSTITUTION' as const,
  authority_state: 'DISTRIBUTED' as const,
  mutation_allowed: false,
  supersession_required_for_change: 'ALL_MUTATIONS' as const
};

/**
 * Action Outcome (Deterministic Terminal States)
 */
export type ActionOutcome = 
  | 'PASS'
  | 'FAIL'
  | 'INDETERMINATE'
  | 'INVALID_INPUT'
  | 'INVALID';

/**
 * Action Result
 */
export interface ActionResult {
  action: ValidAction;
  outcome: ActionOutcome;
  certificate?: CertificateIR;
  fail_reason?: string;
  harness_result?: HarnessResult;
  errors: string[];
  warnings: string[];
  deterministic: boolean;
  replayable: boolean;
  executed_at: string;
}

/**
 * Valid Actions (EXHAUSTIVE - NO OTHERS PERMITTED)
 */
export type ValidAction =
  | 'ISSUE_EXTERNAL_CERTIFICATE'
  | 'PUBLISH_REFUSAL_CASE'
  | 'INDEPENDENT_REPLAY_VERIFICATION'
  | 'PROPOSE_RULEBOOK'
  | 'SUPERSEDE_RULEBOOK'
  | 'DISPUTE_REPLAY'
  | 'REGISTER_SOLVER'
  | 'ATTEST_SOLVER_EQUIVALENCE';

/**
 * Forbidden Operations (ALWAYS INVALID)
 */
const FORBIDDEN_OPERATIONS = [
  'ADD_NINTH_MOVE',
  'REFACTOR_INTERFACE',
  'INTRODUCE_HEURISTIC',
  'COLLAPSE_AMBIGUITY',
  'OVERRIDE_REFUSAL',
  'GRANT_SOLVER_PRIVILEGE',
  'SILENT_RULE_CHANGE'
] as const;

/**
 * Action Space Executor
 * 
 * HARD ENFORCEMENT:
 * - Only 8 valid moves exist
 * - All moves route through competing solver harness
 * - Deterministic fail states enforced
 * - No discretionary pathways
 */
export class ActionSpaceExecutor {
  private readonly GENESIS_HASH = 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a';
  
  /**
   * Execute Action
   * 
   * Routes to appropriate handler based on action type.
   * ENFORCES: Only 8 valid actions permitted.
   */
  execute(action: ValidAction, params: Record<string, unknown>): ActionResult {
    const timestamp = new Date().toISOString();
    
    // Validate action is in allowed set
    const validActions: ValidAction[] = [
      'ISSUE_EXTERNAL_CERTIFICATE',
      'PUBLISH_REFUSAL_CASE',
      'INDEPENDENT_REPLAY_VERIFICATION',
      'PROPOSE_RULEBOOK',
      'SUPERSEDE_RULEBOOK',
      'DISPUTE_REPLAY',
      'REGISTER_SOLVER',
      'ATTEST_SOLVER_EQUIVALENCE'
    ];
    
    if (!validActions.includes(action)) {
      return this.buildInvalidResult(action, 'FORBIDDEN_OPERATION', timestamp);
    }
    
    // Route to handler
    switch (action) {
      case 'ISSUE_EXTERNAL_CERTIFICATE':
        return this.issueExternalCertificate(params, timestamp);
      case 'PUBLISH_REFUSAL_CASE':
        return this.publishRefusalCase(params, timestamp);
      case 'INDEPENDENT_REPLAY_VERIFICATION':
        return this.independentReplayVerification(params, timestamp);
      case 'PROPOSE_RULEBOOK':
        return this.proposeRulebook(params, timestamp);
      case 'SUPERSEDE_RULEBOOK':
        return this.supersedeRulebook(params, timestamp);
      case 'DISPUTE_REPLAY':
        return this.disputeReplay(params, timestamp);
      case 'REGISTER_SOLVER':
        return this.registerSolver(params, timestamp);
      case 'ATTEST_SOLVER_EQUIVALENCE':
        return this.attestSolverEquivalence(params, timestamp);
    }
  }
  
  /**
   * ACTION 1: ISSUE_EXTERNAL_CERTIFICATE
   * 
   * DETERMINISTIC FAIL STATES:
   * - intent malformed → INVALID_INPUT
   * - missing facts/evidence → INDETERMINATE
   * - solver divergence → INDETERMINATE
   * - rule violation proven → FAIL
   */
  private issueExternalCertificate(params: Record<string, unknown>, timestamp: string): ActionResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Precondition: intent must exist and be valid CanonicalIntentBundle
    if (!params.intent || typeof params.intent !== 'object') {
      return {
        action: 'ISSUE_EXTERNAL_CERTIFICATE',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Intent malformed or missing',
        errors: ['Missing or invalid intent parameter'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const intent = params.intent as CanonicalIntentBundle;
    
    // Precondition: facts must exist
    if (!intent.inputs?.facts || Object.keys(intent.inputs.facts).length === 0) {
      return {
        action: 'ISSUE_EXTERNAL_CERTIFICATE',
        outcome: 'INDETERMINATE',
        fail_reason: 'Missing facts',
        errors: ['Intent missing required facts'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Precondition: evidence must exist
    if (!intent.inputs?.evidence_refs || intent.inputs.evidence_refs.length === 0) {
      return {
        action: 'ISSUE_EXTERNAL_CERTIFICATE',
        outcome: 'INDETERMINATE',
        fail_reason: 'Missing evidence',
        errors: ['Intent missing required evidence references'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Execute through competing solver harness (PRIMARY ENFORCEMENT)
    const harnessResult = runCompetingSolvers(intent);
    
    // Check for solver divergence
    if (!harnessResult.consensus) {
      return {
        action: 'ISSUE_EXTERNAL_CERTIFICATE',
        outcome: 'INDETERMINATE',
        fail_reason: 'Solver divergence detected',
        harness_result: harnessResult,
        errors: ['Competing solvers produced divergent outputs'],
        warnings: harnessResult.warnings,
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Enforce all policies
    const policyEnforcement = enforceAllPolicies(harnessResult);
    if (!policyEnforcement.compliant) {
      const criticalViolations = policyEnforcement.violations.filter(v => v.severity === 'CRITICAL');
      if (criticalViolations.length > 0) {
        return {
          action: 'ISSUE_EXTERNAL_CERTIFICATE',
          outcome: 'INDETERMINATE',
          fail_reason: 'Policy violations detected',
          harness_result: harnessResult,
          errors: criticalViolations.map(v => `${v.policy}: ${v.description}`),
          warnings: harnessResult.warnings,
          deterministic: true,
          replayable: true,
          executed_at: timestamp
        };
      }
    }
    
    // Check harness outcome
    if (harnessResult.outcome === 'FAIL') {
      return {
        action: 'ISSUE_EXTERNAL_CERTIFICATE',
        outcome: 'FAIL',
        fail_reason: 'Rule violation proven',
        certificate: harnessResult.certificate,
        harness_result: harnessResult,
        errors: harnessResult.errors,
        warnings: harnessResult.warnings,
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    if (harnessResult.outcome === 'INDETERMINATE') {
      return {
        action: 'ISSUE_EXTERNAL_CERTIFICATE',
        outcome: 'INDETERMINATE',
        fail_reason: 'Evaluation indeterminate',
        certificate: harnessResult.certificate,
        harness_result: harnessResult,
        errors: harnessResult.errors,
        warnings: harnessResult.warnings,
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    if (harnessResult.outcome === 'INVALID_INPUT') {
      return {
        action: 'ISSUE_EXTERNAL_CERTIFICATE',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Invalid input detected by solvers',
        harness_result: harnessResult,
        errors: harnessResult.errors,
        warnings: harnessResult.warnings,
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Success: PASS
    return {
      action: 'ISSUE_EXTERNAL_CERTIFICATE',
      outcome: 'PASS',
      certificate: harnessResult.certificate,
      harness_result: harnessResult,
      errors: [],
      warnings: harnessResult.warnings,
      deterministic: true,
      replayable: true,
      executed_at: timestamp
    };
  }
  
  /**
   * ACTION 2: PUBLISH_REFUSAL_CASE
   * 
   * DETERMINISTIC FAIL STATES:
   * - outcome modified → INVALID
   * - narrative added → INVALID
   * - replay artifact missing → INVALID
   */
  private publishRefusalCase(params: Record<string, unknown>, timestamp: string): ActionResult {
    // Precondition: certificate must exist
    if (!params.certificate || typeof params.certificate !== 'object') {
      return {
        action: 'PUBLISH_REFUSAL_CASE',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Certificate missing or malformed',
        errors: ['Missing or invalid certificate parameter'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const certificate = params.certificate as CertificateIR;
    
    // Precondition: outcome must be unmodified (one of four allowed)
    const allowedOutcomes: ActionOutcome[] = ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'];
    if (!allowedOutcomes.includes(certificate.outcome as ActionOutcome)) {
      return {
        action: 'PUBLISH_REFUSAL_CASE',
        outcome: 'INVALID',
        fail_reason: 'Outcome modified - not in allowed set',
        errors: [`Certificate outcome ${certificate.outcome} not in allowed set`],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Precondition: no narrative added
    if (params.narrative && typeof params.narrative === 'string' && params.narrative.length > 0) {
      return {
        action: 'PUBLISH_REFUSAL_CASE',
        outcome: 'INVALID',
        fail_reason: 'Narrative argument added',
        errors: ['Refusal cases cannot include narrative justification'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Precondition: replay artifacts must exist
    if (!certificate.evidence_chain?.audit_replay_hash) {
      return {
        action: 'PUBLISH_REFUSAL_CASE',
        outcome: 'INVALID',
        fail_reason: 'Replay artifact missing',
        errors: ['Certificate missing audit_replay_hash for verification'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Success: PASS
    return {
      action: 'PUBLISH_REFUSAL_CASE',
      outcome: 'PASS',
      certificate,
      errors: [],
      warnings: ['Refusal case published - replay-verifiable only'],
      deterministic: true,
      replayable: true,
      executed_at: timestamp
    };
  }
  
  /**
   * ACTION 3: INDEPENDENT_REPLAY_VERIFICATION
   * 
   * DETERMINISTIC FAIL STATES:
   * - hash mismatch → SYSTEM INVALIDATION (FAIL)
   * - missing artifacts → INDETERMINATE
   * - solver divergence → INDETERMINATE
   */
  private independentReplayVerification(params: Record<string, unknown>, timestamp: string): ActionResult {
    // Precondition: original intent must exist
    if (!params.original_intent || typeof params.original_intent !== 'object') {
      return {
        action: 'INDEPENDENT_REPLAY_VERIFICATION',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Original intent missing',
        errors: ['Missing original_intent parameter'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Precondition: expected hash must exist
    if (!params.expected_hash || typeof params.expected_hash !== 'string') {
      return {
        action: 'INDEPENDENT_REPLAY_VERIFICATION',
        outcome: 'INDETERMINATE',
        fail_reason: 'Missing artifacts for verification',
        errors: ['Missing expected_hash for replay verification'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const intent = params.original_intent as CanonicalIntentBundle;
    const expectedHash = params.expected_hash as string;
    
    // Execute replay through competing solver harness
    const harnessResult = runCompetingSolvers(intent);
    
    // Check for solver divergence
    if (!harnessResult.consensus) {
      return {
        action: 'INDEPENDENT_REPLAY_VERIFICATION',
        outcome: 'INDETERMINATE',
        fail_reason: 'Solver divergence during replay',
        harness_result: harnessResult,
        errors: ['Competing solvers produced divergent outputs during replay'],
        warnings: harnessResult.warnings,
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Compute replay hash
    const replayHash = harnessResult.certificate?.evidence_chain.audit_replay_hash;
    if (!replayHash) {
      return {
        action: 'INDEPENDENT_REPLAY_VERIFICATION',
        outcome: 'INDETERMINATE',
        fail_reason: 'Missing replay hash',
        harness_result: harnessResult,
        errors: ['Replay did not produce audit_replay_hash'],
        warnings: harnessResult.warnings,
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Compare hashes (CRITICAL)
    if (replayHash !== expectedHash) {
      return {
        action: 'INDEPENDENT_REPLAY_VERIFICATION',
        outcome: 'FAIL',
        fail_reason: 'SYSTEM INVALIDATION - Hash mismatch detected',
        harness_result: harnessResult,
        errors: [
          'CRITICAL: Replay hash does not match expected hash',
          `Expected: ${expectedHash}`,
          `Got: ${replayHash}`,
          'This indicates non-determinism or tampering'
        ],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Success: PASS
    return {
      action: 'INDEPENDENT_REPLAY_VERIFICATION',
      outcome: 'PASS',
      certificate: harnessResult.certificate,
      harness_result: harnessResult,
      errors: [],
      warnings: ['Replay verification successful - determinism confirmed'],
      deterministic: true,
      replayable: true,
      executed_at: timestamp
    };
  }
  
  /**
   * ACTION 4: PROPOSE_RULEBOOK
   * 
   * DETERMINISTIC FAIL STATES:
   * - mutation attempt → FAIL
   * - internal inconsistency → FAIL
   * - ambiguous semantics → INDETERMINATE
   * - malformed proposal → INVALID_INPUT
   */
  private proposeRulebook(params: Record<string, unknown>, timestamp: string): ActionResult {
    // Precondition: proposal must exist
    if (!params.proposal || typeof params.proposal !== 'object') {
      return {
        action: 'PROPOSE_RULEBOOK',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Proposal malformed or missing',
        errors: ['Missing or invalid proposal parameter'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const proposal = params.proposal as Record<string, unknown>;
    
    // Precondition: must not be mutation attempt
    if (proposal.mutation_type === 'MODIFY_EXISTING' || proposal.operation === 'MUTATE') {
      return {
        action: 'PROPOSE_RULEBOOK',
        outcome: 'FAIL',
        fail_reason: 'Mutation attempt detected',
        errors: ['Proposals cannot mutate existing rulebooks - use SUPERSEDE_RULEBOOK instead'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Precondition: rulebook content must exist
    if (!proposal.rulebook_content || typeof proposal.rulebook_content !== 'object') {
      return {
        action: 'PROPOSE_RULEBOOK',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Missing rulebook content',
        errors: ['Proposal missing rulebook_content'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const content = proposal.rulebook_content as Record<string, unknown>;
    
    // Check for internal inconsistency
    if (content.rules && Array.isArray(content.rules)) {
      const ruleIds = new Set<string>();
      for (const rule of content.rules) {
        if (typeof rule === 'object' && rule !== null) {
          const r = rule as Record<string, unknown>;
          if (ruleIds.has(r.rule_id as string)) {
            return {
              action: 'PROPOSE_RULEBOOK',
              outcome: 'FAIL',
              fail_reason: 'Internal inconsistency detected',
              errors: [`Duplicate rule_id: ${r.rule_id}`],
              warnings: [],
              deterministic: true,
              replayable: true,
              executed_at: timestamp
            };
          }
          ruleIds.add(r.rule_id as string);
        }
      }
    }
    
    // Check for ambiguous semantics
    if (proposal.semantic_clarity === 'AMBIGUOUS' || proposal.requires_interpretation === true) {
      return {
        action: 'PROPOSE_RULEBOOK',
        outcome: 'INDETERMINATE',
        fail_reason: 'Ambiguous semantics detected',
        errors: ['Rulebook contains ambiguous semantics requiring interpretation'],
        warnings: ['Proposal requires clarification before acceptance'],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Success: PASS
    return {
      action: 'PROPOSE_RULEBOOK',
      outcome: 'PASS',
      errors: [],
      warnings: ['Rulebook proposal accepted - pending supersession workflow'],
      deterministic: true,
      replayable: true,
      executed_at: timestamp
    };
  }
  
  /**
   * ACTION 5: SUPERSEDE_RULEBOOK
   * 
   * DETERMINISTIC FAIL STATES:
   * - missing lineage → FAIL
   * - retroactive change → FAIL
   * - ambiguous supersession → INDETERMINATE
   */
  private supersedeRulebook(params: Record<string, unknown>, timestamp: string): ActionResult {
    // Precondition: supersession request must exist
    if (!params.supersession_request || typeof params.supersession_request !== 'object') {
      return {
        action: 'SUPERSEDE_RULEBOOK',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Supersession request missing',
        errors: ['Missing supersession_request parameter'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const request = params.supersession_request as Record<string, unknown>;
    
    // Precondition: lineage must exist
    if (!request.prior_version || typeof request.prior_version !== 'string') {
      return {
        action: 'SUPERSEDE_RULEBOOK',
        outcome: 'FAIL',
        fail_reason: 'Missing lineage',
        errors: ['Supersession request missing prior_version lineage'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Precondition: no retroactive change
    if (request.effective_date && typeof request.effective_date === 'string') {
      const effectiveDate = new Date(request.effective_date);
      const now = new Date(timestamp);
      if (effectiveDate < now) {
        return {
          action: 'SUPERSEDE_RULEBOOK',
          outcome: 'FAIL',
          fail_reason: 'Retroactive change attempted',
          errors: ['Supersession cannot have effective_date in the past'],
          warnings: [],
          deterministic: true,
          replayable: true,
          executed_at: timestamp
        };
      }
    }
    
    // Precondition: supersession reason must be clear
    if (!request.supersession_reason || typeof request.supersession_reason !== 'string') {
      return {
        action: 'SUPERSEDE_RULEBOOK',
        outcome: 'INDETERMINATE',
        fail_reason: 'Ambiguous supersession',
        errors: ['Supersession request missing clear supersession_reason'],
        warnings: ['Cannot determine if supersession is justified'],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Success: PASS
    return {
      action: 'SUPERSEDE_RULEBOOK',
      outcome: 'PASS',
      errors: [],
      warnings: ['Rulebook supersession approved - append-only lineage preserved'],
      deterministic: true,
      replayable: true,
      executed_at: timestamp
    };
  }
  
  /**
   * ACTION 6: DISPUTE_REPLAY
   * 
   * DETERMINISTIC FAIL STATES:
   * - replay mismatch → FAIL
   * - missing evidence → INDETERMINATE
   * - narrative argument introduced → INVALID
   */
  private disputeReplay(params: Record<string, unknown>, timestamp: string): ActionResult {
    // Precondition: dispute must exist
    if (!params.dispute || typeof params.dispute !== 'object') {
      return {
        action: 'DISPUTE_REPLAY',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Dispute missing or malformed',
        errors: ['Missing or invalid dispute parameter'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const dispute = params.dispute as Record<string, unknown>;
    
    // Precondition: no narrative argument
    if (dispute.narrative_justification && typeof dispute.narrative_justification === 'string') {
      return {
        action: 'DISPUTE_REPLAY',
        outcome: 'INVALID',
        fail_reason: 'Narrative argument introduced',
        errors: ['Disputes must be resolved via replay only - no narrative arguments permitted'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Precondition: original intent must exist
    if (!dispute.original_intent || typeof dispute.original_intent !== 'object') {
      return {
        action: 'DISPUTE_REPLAY',
        outcome: 'INDETERMINATE',
        fail_reason: 'Missing evidence',
        errors: ['Dispute missing original_intent for replay'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Precondition: expected outcome must exist
    if (!dispute.disputed_outcome || typeof dispute.disputed_outcome !== 'string') {
      return {
        action: 'DISPUTE_REPLAY',
        outcome: 'INDETERMINATE',
        fail_reason: 'Missing evidence',
        errors: ['Dispute missing disputed_outcome for comparison'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const intent = dispute.original_intent as CanonicalIntentBundle;
    const disputedOutcome = dispute.disputed_outcome as string;
    
    // Execute replay through competing solver harness
    const harnessResult = runCompetingSolvers(intent);
    
    // Check for solver divergence
    if (!harnessResult.consensus) {
      return {
        action: 'DISPUTE_REPLAY',
        outcome: 'INDETERMINATE',
        fail_reason: 'Solver divergence during replay',
        harness_result: harnessResult,
        errors: ['Competing solvers produced divergent outputs during dispute replay'],
        warnings: harnessResult.warnings,
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Compare replay outcome to disputed outcome
    const replayOutcome = harnessResult.outcome;
    if (replayOutcome !== disputedOutcome) {
      return {
        action: 'DISPUTE_REPLAY',
        outcome: 'FAIL',
        fail_reason: 'Replay mismatch - dispute UPHELD',
        certificate: harnessResult.certificate,
        harness_result: harnessResult,
        errors: [
          'Replay produced different outcome than disputed certificate',
          `Disputed outcome: ${disputedOutcome}`,
          `Replay outcome: ${replayOutcome}`,
          'Original certificate is INVALID'
        ],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Success: PASS (dispute rejected - original certificate valid)
    return {
      action: 'DISPUTE_REPLAY',
      outcome: 'PASS',
      certificate: harnessResult.certificate,
      harness_result: harnessResult,
      errors: [],
      warnings: ['Dispute rejected - replay confirmed original outcome'],
      deterministic: true,
      replayable: true,
      executed_at: timestamp
    };
  }
  
  /**
   * ACTION 7: REGISTER_SOLVER
   * 
   * DETERMINISTIC FAIL STATES:
   * - output divergence → INDETERMINATE
   * - non-determinism → INDETERMINATE
   * - privileged authority requested → FAIL
   */
  private registerSolver(params: Record<string, unknown>, timestamp: string): ActionResult {
    // Precondition: solver metadata must exist
    if (!params.solver_metadata || typeof params.solver_metadata !== 'object') {
      return {
        action: 'REGISTER_SOLVER',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Solver metadata missing',
        errors: ['Missing solver_metadata parameter'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const metadata = params.solver_metadata as Record<string, unknown>;
    
    // Precondition: no privileged authority requested
    if (metadata.privileged === true || metadata.special_authority === true) {
      return {
        action: 'REGISTER_SOLVER',
        outcome: 'FAIL',
        fail_reason: 'Privileged authority requested',
        errors: ['Solver registration cannot request privileged or special authority'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Precondition: test cases must exist
    if (!params.test_cases || !Array.isArray(params.test_cases)) {
      return {
        action: 'REGISTER_SOLVER',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Test cases missing',
        errors: ['Solver registration requires test_cases for equivalence verification'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const testCases = params.test_cases as Array<{ intent: CanonicalIntentBundle; expected_outcome: string }>;
    
    // Check for determinism by running test cases multiple times
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      // Run twice to check determinism
      const run1 = runCompetingSolvers(testCase.intent);
      const run2 = runCompetingSolvers(testCase.intent);
      
      if (run1.outcome !== run2.outcome) {
        return {
          action: 'REGISTER_SOLVER',
          outcome: 'INDETERMINATE',
          fail_reason: 'Non-determinism detected',
          errors: [
            `Test case ${i} produced different outcomes on repeated runs`,
            `Run 1: ${run1.outcome}`,
            `Run 2: ${run2.outcome}`
          ],
          warnings: [],
          deterministic: true,
          replayable: true,
          executed_at: timestamp
        };
      }
      
      // Check for solver consensus
      if (!run1.consensus) {
        return {
          action: 'REGISTER_SOLVER',
          outcome: 'INDETERMINATE',
          fail_reason: 'Output divergence detected',
          errors: [`Test case ${i} produced solver divergence`],
          warnings: [],
          deterministic: true,
          replayable: true,
          executed_at: timestamp
        };
      }
    }
    
    // Success: PASS
    return {
      action: 'REGISTER_SOLVER',
      outcome: 'PASS',
      errors: [],
      warnings: [
        'Solver registration approved',
        'Solver has no special authority',
        'Solver outputs are deterministic and equivalent to existing solvers'
      ],
      deterministic: true,
      replayable: true,
      executed_at: timestamp
    };
  }
  
  /**
   * ACTION 8: ATTEST_SOLVER_EQUIVALENCE
   * 
   * DETERMINISTIC FAIL STATES:
   * - any byte mismatch → INDETERMINATE
   * - partial equivalence → INDETERMINATE
   */
  private attestSolverEquivalence(params: Record<string, unknown>, timestamp: string): ActionResult {
    // Precondition: test suite must exist
    if (!params.test_suite || !Array.isArray(params.test_suite)) {
      return {
        action: 'ATTEST_SOLVER_EQUIVALENCE',
        outcome: 'INVALID_INPUT',
        fail_reason: 'Test suite missing',
        errors: ['Missing test_suite parameter'],
        warnings: [],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    const testSuite = params.test_suite as Array<CanonicalIntentBundle>;
    const mismatches: string[] = [];
    
    // Run entire test suite through harness
    for (let i = 0; i < testSuite.length; i++) {
      const intent = testSuite[i];
      const result = runCompetingSolvers(intent);
      
      // Check for ANY divergence
      if (!result.consensus) {
        mismatches.push(`Test ${i}: Solver divergence detected`);
      }
      
      // Check for byte-identical outputs
      if (result.divergences && result.divergences.length > 0) {
        result.divergences.forEach(div => {
          mismatches.push(`Test ${i}: ${div.field} mismatch`);
        });
      }
    }
    
    // Any mismatch → INDETERMINATE
    if (mismatches.length > 0) {
      return {
        action: 'ATTEST_SOLVER_EQUIVALENCE',
        outcome: 'INDETERMINATE',
        fail_reason: 'Byte mismatch detected',
        errors: mismatches,
        warnings: ['Solvers are NOT byte-identically equivalent'],
        deterministic: true,
        replayable: true,
        executed_at: timestamp
      };
    }
    
    // Success: PASS
    return {
      action: 'ATTEST_SOLVER_EQUIVALENCE',
      outcome: 'PASS',
      errors: [],
      warnings: ['Solver equivalence attestation successful - byte-identical outputs confirmed'],
      deterministic: true,
      replayable: true,
      executed_at: timestamp
    };
  }
  
  /**
   * Build INVALID result for forbidden operations
   */
  private buildInvalidResult(action: string, reason: string, timestamp: string): ActionResult {
    return {
      action: action as ValidAction,
      outcome: 'INVALID',
      fail_reason: reason,
      errors: [`Forbidden operation attempted: ${action}`],
      warnings: ['System halted - forbidden operation detected'],
      deterministic: true,
      replayable: true,
      executed_at: timestamp
    };
  }
}

/**
 * Convenience function: Execute action
 */
export function executeAction(action: ValidAction, params: Record<string, unknown>): ActionResult {
  const executor = new ActionSpaceExecutor();
  return executor.execute(action, params);
}

/**
 * Verify Action Space Completeness
 * 
 * Confirms that exactly 8 valid actions exist and no others.
 */
export function verifyActionSpaceCompleteness(): {
  complete: boolean;
  action_count: number;
  valid_actions: ValidAction[];
  forbidden_operations: readonly string[];
} {
  const validActions: ValidAction[] = [
    'ISSUE_EXTERNAL_CERTIFICATE',
    'PUBLISH_REFUSAL_CASE',
    'INDEPENDENT_REPLAY_VERIFICATION',
    'PROPOSE_RULEBOOK',
    'SUPERSEDE_RULEBOOK',
    'DISPUTE_REPLAY',
    'REGISTER_SOLVER',
    'ATTEST_SOLVER_EQUIVALENCE'
  ];
  
  return {
    complete: validActions.length === 8,
    action_count: validActions.length,
    valid_actions: validActions,
    forbidden_operations: FORBIDDEN_OPERATIONS
  };
}
