/**
 * DBGO Core: Blueprint IR and Audit IR
 * 
 * BlueprintIR: Execution plan showing HOW the solver will process the intent
 * AuditIR: Evidence trail showing WHAT the solver actually did
 * 
 * Both MUST be deterministic and reproducible.
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: auditor-authority
 * - policy: DISPUTE_RESOLUTION_POLICY v1.0.0
 */

import { AllowedOutput, EvidenceRef } from './intent-ir';

/**
 * Blueprint Step Type
 * 
 * Each step in execution plan has a type:
 * - VALIDATE: Check input validity
 * - LOAD_RULES: Load governing rulebook
 * - EVALUATE: Apply rules to facts
 * - CLASSIFY: Determine outcome classification
 * - CERTIFY: Generate certificate
 */
export type BlueprintStepType = 
  | 'VALIDATE'
  | 'LOAD_RULES'
  | 'EVALUATE'
  | 'CLASSIFY'
  | 'CERTIFY';

/**
 * Blueprint Step
 * 
 * Single step in execution plan.
 * MUST be deterministic (no randomness, no timestamps except input timestamps).
 */
export interface BlueprintStep {
  step_id: string; // uuid
  step_type: BlueprintStepType;
  step_order: number; // 0, 1, 2, ...
  description: string;
  inputs: Record<string, unknown>;
  expected_outputs: Record<string, unknown>;
  deterministic: boolean; // MUST be true (non-deterministic steps = INDETERMINATE)
}

/**
 * Blueprint IR
 * 
 * Execution plan showing how solver will process intent.
 * Generated BEFORE execution (this is the "plan").
 * 
 * COMPETING_SOLVERS_POLICY enforcement:
 * - All solvers MUST produce identical blueprint for identical intent
 * - Any divergence in blueprint = INDETERMINATE
 */
export interface BlueprintIR {
  // Blueprint metadata
  blueprint_id: string; // uuid
  blueprint_version: string; // 1.0.0
  created_at: string; // ISO 8601
  intent_id: string; // links to CanonicalIntentBundle

  // Execution plan
  steps: BlueprintStep[];
  total_steps: number;

  // Determinism guarantees
  deterministic: boolean; // MUST be true for PASS/FAIL
  non_deterministic_reason?: string; // If deterministic=false, why?

  // Governance binding
  governance_binding: {
    genesis_hash: string;
    authority_role: string; // auditor-authority
    policy_version: string;
  };
}

/**
 * Audit Step Result
 * 
 * Result of executing one blueprint step.
 * Records ACTUAL outputs (vs expected outputs in blueprint).
 */
export interface AuditStepResult {
  step_id: string; // matches BlueprintStep.step_id
  step_type: BlueprintStepType;
  step_order: number;
  executed_at: string; // ISO 8601
  duration_ms: number;
  
  // Actual outputs
  actual_outputs: Record<string, unknown>;
  matched_expected: boolean; // Did actual match blueprint expected?
  
  // Evidence collected during execution
  evidence_collected: EvidenceRef[];
  
  // Errors/warnings
  errors: string[];
  warnings: string[];
}

/**
 * Audit IR
 * 
 * Evidence trail showing what solver actually did.
 * Generated AFTER execution (this is the "trace").
 * 
 * DISPUTE_RESOLUTION_POLICY enforcement:
 * - Disputes resolved by replaying audit trail
 * - Identical intent + identical blueprint MUST produce identical audit
 * - Any divergence = non-deterministic solver = INDETERMINATE
 */
export interface AuditIR {
  // Audit metadata
  audit_id: string; // uuid
  audit_version: string; // 1.0.0
  created_at: string; // ISO 8601
  intent_id: string; // links to CanonicalIntentBundle
  blueprint_id: string; // links to BlueprintIR

  // Execution trace
  step_results: AuditStepResult[];
  total_steps_executed: number;
  total_duration_ms: number;

  // Execution outcome
  execution_status: 'SUCCESS' | 'FAILURE' | 'INDETERMINATE';
  execution_errors: string[];

  // Evidence trail
  all_evidence: EvidenceRef[];
  evidence_complete: boolean; // All facts have evidence?

  // Determinism verification
  replay_hash: string; // sha256 of entire audit trail (for replay verification)
  deterministic: boolean; // Did execution follow blueprint deterministically?

  // Governance binding
  governance_binding: {
    genesis_hash: string;
    authority_role: string; // auditor-authority
    policy_version: string;
  };
}

/**
 * Blueprint Generation Result
 * 
 * Result of generating execution plan from intent.
 */
export interface BlueprintGenerationResult {
  success: boolean;
  blueprint?: BlueprintIR;
  errors: string[];
  warnings: string[];
}

/**
 * Generate Blueprint from Intent
 * 
 * Converts CanonicalIntentBundle into execution plan.
 * This is Phase 1 of DBGO pipeline (canonicalize → blueprint).
 * 
 * HARD ENFORCEMENT:
 * - Identical intents MUST produce identical blueprints
 * - Non-deterministic steps MUST set deterministic=false
 * - No randomness, no external dependencies
 */
export function generateBlueprint(
  intentId: string,
  requestedAction: string,
  governingRulesHash: string
): BlueprintGenerationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Create deterministic blueprint
    const blueprint: BlueprintIR = {
      blueprint_id: `blueprint-${intentId}`, // Deterministic ID
      blueprint_version: '1.0.0',
      created_at: new Date().toISOString(),
      intent_id: intentId,
      steps: [
        {
          step_id: 'validate-intent',
          step_type: 'VALIDATE',
          step_order: 0,
          description: 'Validate intent bundle schema and requirements',
          inputs: { intent_id: intentId },
          expected_outputs: { valid: true },
          deterministic: true
        },
        {
          step_id: 'load-rules',
          step_type: 'LOAD_RULES',
          step_order: 1,
          description: 'Load governing rulebook from hash',
          inputs: { rule_hash: governingRulesHash },
          expected_outputs: { rulebook_loaded: true },
          deterministic: true
        },
        {
          step_id: 'evaluate',
          step_type: 'EVALUATE',
          step_order: 2,
          description: 'Evaluate facts against rules',
          inputs: { requested_action: requestedAction },
          expected_outputs: { evaluation_complete: true },
          deterministic: true
        },
        {
          step_id: 'classify',
          step_type: 'CLASSIFY',
          step_order: 3,
          description: 'Classify outcome as PASS/FAIL/INDETERMINATE',
          inputs: { evaluation_result: 'pending' },
          expected_outputs: { classification: 'one of: PASS, FAIL, INDETERMINATE' },
          deterministic: true
        },
        {
          step_id: 'certify',
          step_type: 'CERTIFY',
          step_order: 4,
          description: 'Generate certificate with outcome and evidence',
          inputs: { classification: 'pending' },
          expected_outputs: { certificate_issued: true },
          deterministic: true
        }
      ],
      total_steps: 5,
      deterministic: true,
      governance_binding: {
        genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
        authority_role: 'auditor-authority',
        policy_version: '1.0.0'
      }
    };

    return {
      success: true,
      blueprint,
      errors: [],
      warnings: []
    };
  } catch (error) {
    errors.push(`Blueprint generation failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      errors,
      warnings
    };
  }
}

/**
 * Audit Execution Result
 * 
 * Result of executing blueprint and recording audit trail.
 */
export interface AuditExecutionResult {
  success: boolean;
  audit?: AuditIR;
  outcome?: AllowedOutput;
  errors: string[];
  warnings: string[];
}

/**
 * Execute Blueprint and Generate Audit Trail
 * 
 * Executes blueprint steps and records actual outcomes.
 * This is Phase 2 of DBGO pipeline (blueprint → audit).
 * 
 * HARD ENFORCEMENT:
 * - Identical blueprint MUST produce identical audit (determinism)
 * - All steps MUST be traceable (evidence required)
 * - Non-determinism detected = INDETERMINATE outcome
 */
export function executeBlueprint(
  blueprint: BlueprintIR,
  factsData: Record<string, unknown>
): AuditExecutionResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stepResults: AuditStepResult[] = [];

  const startTime = Date.now();

  try {
    // Execute each step in blueprint
    for (const step of blueprint.steps) {
      const stepStartTime = Date.now();

      // Execute step (placeholder - actual execution depends on domain adapter)
      const stepResult: AuditStepResult = {
        step_id: step.step_id,
        step_type: step.step_type,
        step_order: step.step_order,
        executed_at: new Date().toISOString(),
        duration_ms: Date.now() - stepStartTime,
        actual_outputs: { ...step.expected_outputs }, // Placeholder
        matched_expected: true,
        evidence_collected: [],
        errors: [],
        warnings: []
      };

      stepResults.push(stepResult);
    }

    const totalDuration = Date.now() - startTime;

    // Create audit trail
    const audit: AuditIR = {
      audit_id: `audit-${blueprint.intent_id}`,
      audit_version: '1.0.0',
      created_at: new Date().toISOString(),
      intent_id: blueprint.intent_id,
      blueprint_id: blueprint.blueprint_id,
      step_results: stepResults,
      total_steps_executed: stepResults.length,
      total_duration_ms: totalDuration,
      execution_status: 'SUCCESS',
      execution_errors: [],
      all_evidence: [],
      evidence_complete: true,
      replay_hash: 'sha256:placeholder', // TODO: Compute actual hash
      deterministic: true,
      governance_binding: {
        genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
        authority_role: 'auditor-authority',
        policy_version: '1.0.0'
      }
    };

    return {
      success: true,
      audit,
      outcome: 'PASS', // Placeholder
      errors: [],
      warnings: []
    };
  } catch (error) {
    errors.push(`Audit execution failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      errors,
      warnings
    };
  }
}
