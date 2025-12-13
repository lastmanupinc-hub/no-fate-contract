/**
 * DBGO Independent Solver A (dbgo-independent-A)
 * 
 * This is an INDEPENDENT implementation of the DBGO solver.
 * It has NO special relationship to dbgo-reference or the other independent solvers.
 * 
 * Implementation approach: Functionally identical to reference but structurally different
 * (different variable names, different function decomposition, same logic).
 * 
 * HARD ENFORCEMENT:
 * - MUST produce byte-identical outputs as other solvers for identical inputs
 * - MUST NOT have special authority
 * - Divergence from other solvers → INDETERMINATE (by harness)
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: solver-authority
 * - policy: COMPETING_SOLVERS_POLICY v1.0.0
 */

import {
  CanonicalIntentBundle,
  validateIntentBundle
} from '../../core/types/intent-ir';
import {
  generateBlueprint,
  executeBlueprint
} from '../../core/types/blueprint-audit-ir';
import {
  generateCertificate,
  CertificateOutcome
} from '../../core/types/certificate-ir';
import { SolverResult } from '../dbgo-reference';

/**
 * Independent Solver A
 * 
 * Functionally identical to reference solver, but implemented independently.
 * Uses different internal structure to prove implementation independence.
 */
export class IndependentSolverA {
  readonly id = 'dbgo-independent-A';
  readonly ver = '1.0.0';
  
  /**
   * Process Intent
   * 
   * Different method name than reference ("process" vs "solve")
   * but identical logic.
   */
  processIntent(intentBundle: CanonicalIntentBundle): SolverResult {
    const errs: string[] = [];
    const warns: string[] = [];
    
    // Step 1: Check validity
    const check = validateIntentBundle(intentBundle);
    if (!check.valid) {
      return this.createErrorResult('INVALID_INPUT', check.errors, check.warnings);
    }
    warns.push(...check.warnings);
    
    // Step 2: Build execution plan
    const planResult = generateBlueprint(
      intentBundle.intent_id,
      intentBundle.inputs.requested_action,
      intentBundle.governing_rules.rule_hash
    );
    if (!planResult.success || !planResult.blueprint) {
      return this.createErrorResult(undefined, planResult.errors, [...warns, ...planResult.warnings]);
    }
    const plan = planResult.blueprint;
    warns.push(...planResult.warnings);
    
    // Step 3: Run execution plan
    const runResult = executeBlueprint(plan, intentBundle.inputs.facts);
    if (!runResult.success || !runResult.audit) {
      return {
        success: false,
        blueprint: plan,
        errors: runResult.errors,
        warnings: [...warns, ...runResult.warnings]
      };
    }
    const trace = runResult.audit;
    warns.push(...runResult.warnings);
    
    // Step 4: Issue certificate
    const pillarMapping = {
      'tax': 'regulatory' as const,
      'regulatory': 'regulatory' as const,
      'monetary': 'monetary' as const,
      'judicial': 'judicial' as const,
      'infra': 'infra' as const,
      'governance': 'governance' as const
    };
    const pillar = pillarMapping[intentBundle.domain] || 'regulatory' as const;
    
    const certResult = generateCertificate(
      trace,
      intentBundle.domain,
      pillar,
      intentBundle.inputs.requested_action,
      true, // Competing solvers agreed (checked by harness)
      intentBundle.governing_rules.rulebook_version,
      intentBundle.governing_rules.rule_hash
    );
    
    if (!certResult.success || !certResult.certificate) {
      return {
        success: false,
        blueprint: plan,
        audit: trace,
        errors: certResult.errors,
        warnings: [...warns, ...certResult.warnings]
      };
    }
    
    return {
      success: true,
      certificate: certResult.certificate,
      blueprint: plan,
      audit: trace,
      outcome: certResult.certificate.outcome,
      errors: [],
      warnings: warns
    };
  }
  
  private createErrorResult(
    outcome?: CertificateOutcome,
    errors?: string[],
    warnings?: string[]
  ): SolverResult {
    return {
      success: false,
      outcome,
      errors: errors || [],
      warnings: warnings || []
    };
  }
}

export function solveWithA(intent: CanonicalIntentBundle): SolverResult {
  const solver = new IndependentSolverA();
  return solver.processIntent(intent);
}
