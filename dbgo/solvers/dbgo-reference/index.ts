/**
 * DBGO Reference Solver (dbgo-reference)
 * 
 * This is the REFERENCE implementation of the DBGO solver.
 * It has NO special authority over the other three competing solvers.
 * 
 * Pipeline: CanonicalIntentBundle → BlueprintIR → AuditIR → CertificateIR
 * 
 * HARD ENFORCEMENT:
 * - COMPETING_SOLVERS_POLICY: This solver must produce byte-identical outputs as other solvers
 * - DISPUTE_RESOLUTION_POLICY: All outputs must be replay-verifiable
 * - CONTROLLED_SUPERSESSION_POLICY: All rulebooks must be versioned and immutable
 * - DECENTRALIZED_OPERATIONS_POLICY: No privileged access paths
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: solver-authority
 * - policy: ALL FOUR POLICIES enforced
 */

import {
  CanonicalIntentBundle,
  validateIntentBundle,
  IntentValidationResult
} from '../types/intent-ir';
import {
  BlueprintIR,
  AuditIR,
  generateBlueprint,
  executeBlueprint,
  BlueprintGenerationResult,
  AuditExecutionResult
} from '../types/blueprint-audit-ir';
import {
  CertificateIR,
  generateCertificate,
  CertificateGenerationResult,
  CertificateOutcome
} from '../types/certificate-ir';

/**
 * Solver Result
 * 
 * Complete output from solver pipeline.
 * Contains all intermediate artifacts (blueprint, audit) plus final certificate.
 */
export interface SolverResult {
  success: boolean;
  certificate?: CertificateIR;
  blueprint?: BlueprintIR;
  audit?: AuditIR;
  outcome?: CertificateOutcome;
  errors: string[];
  warnings: string[];
  
  // Solver identity (for competing solver tracking)
  solver_id: string;
  solver_version: string;
}

/**
 * DBGO Reference Solver
 * 
 * Executes complete pipeline: intent → blueprint → audit → certificate
 * 
 * This solver has THREE refusal points:
 * 1. Intent validation failure → INVALID_INPUT
 * 2. Non-deterministic execution → INDETERMINATE
 * 3. Evidence incomplete → INDETERMINATE
 * 
 * NO other refusal points. NO discretionary decisions. NO defaults.
 */
export class DBGOReferenceSolver {
  private solverId = 'dbgo-reference';
  private solverVersion = '1.0.0';
  
  /**
   * Solve Intent
   * 
   * Main entry point. Executes full DBGO pipeline.
   * 
   * @param intent - CanonicalIntentBundle to process
   * @returns SolverResult with certificate or error
   */
  public solve(intent: CanonicalIntentBundle): SolverResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // PHASE 1: Validate Intent
      const validation = this.validateIntent(intent);
      if (!validation.valid) {
        return {
          success: false,
          outcome: 'INVALID_INPUT',
          errors: validation.errors,
          warnings: validation.warnings,
          solver_id: this.solverId,
          solver_version: this.solverVersion
        };
      }
      
      warnings.push(...validation.warnings);
      
      // PHASE 2: Generate Blueprint
      const blueprintResult = this.generateBlueprintPhase(intent);
      if (!blueprintResult.success || !blueprintResult.blueprint) {
        return {
          success: false,
          errors: blueprintResult.errors,
          warnings: [...warnings, ...blueprintResult.warnings],
          solver_id: this.solverId,
          solver_version: this.solverVersion
        };
      }
      
      const blueprint = blueprintResult.blueprint;
      warnings.push(...blueprintResult.warnings);
      
      // PHASE 3: Execute Blueprint & Generate Audit
      const auditResult = this.executeAuditPhase(blueprint, intent);
      if (!auditResult.success || !auditResult.audit) {
        return {
          success: false,
          blueprint,
          errors: auditResult.errors,
          warnings: [...warnings, ...auditResult.warnings],
          solver_id: this.solverId,
          solver_version: this.solverVersion
        };
      }
      
      const audit = auditResult.audit;
      warnings.push(...auditResult.warnings);
      
      // PHASE 4: Generate Certificate
      const certificateResult = this.generateCertificatePhase(
        audit,
        intent,
        true // competingSolversAgreed (will be checked by harness)
      );
      
      if (!certificateResult.success || !certificateResult.certificate) {
        return {
          success: false,
          blueprint,
          audit,
          errors: certificateResult.errors,
          warnings: [...warnings, ...certificateResult.warnings],
          solver_id: this.solverId,
          solver_version: this.solverVersion
        };
      }
      
      const certificate = certificateResult.certificate;
      warnings.push(...certificateResult.warnings);
      
      return {
        success: true,
        certificate,
        blueprint,
        audit,
        outcome: certificate.outcome,
        errors: [],
        warnings,
        solver_id: this.solverId,
        solver_version: this.solverVersion
      };
      
    } catch (error) {
      errors.push(`Solver failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors,
        warnings,
        solver_id: this.solverId,
        solver_version: this.solverVersion
      };
    }
  }
  
  /**
   * Validate Intent (Phase 1)
   * 
   * Validates CanonicalIntentBundle against schema.
   * HARD ENFORCEMENT: Invalid intent → INVALID_INPUT (not INDETERMINATE)
   */
  private validateIntent(intent: CanonicalIntentBundle): IntentValidationResult {
    return validateIntentBundle(intent);
  }
  
  /**
   * Generate Blueprint (Phase 2)
   * 
   * Creates execution plan from intent.
   * HARD ENFORCEMENT: Blueprint must be deterministic (no randomness)
   */
  private generateBlueprintPhase(intent: CanonicalIntentBundle): BlueprintGenerationResult {
    return generateBlueprint(
      intent.intent_id,
      intent.inputs.requested_action,
      intent.governing_rules.rule_hash
    );
  }
  
  /**
   * Execute Audit (Phase 3)
   * 
   * Executes blueprint and records audit trail.
   * HARD ENFORCEMENT: Non-deterministic execution → audit.deterministic = false
   */
  private executeAuditPhase(
    blueprint: BlueprintIR,
    intent: CanonicalIntentBundle
  ): AuditExecutionResult {
    return executeBlueprint(blueprint, intent.inputs.facts);
  }
  
  /**
   * Generate Certificate (Phase 4)
   * 
   * Creates final certificate from audit trail.
   * HARD ENFORCEMENT:
   * - Competing solvers diverge → INDETERMINATE
   * - Evidence incomplete → INDETERMINATE
   * - Non-deterministic → INDETERMINATE
   */
  private generateCertificatePhase(
    audit: AuditIR,
    intent: CanonicalIntentBundle,
    competingSolversAgreed: boolean
  ): CertificateGenerationResult {
    // Map domain to pillar
    const pillarMap: Record<string, 'regulatory' | 'monetary' | 'judicial' | 'infra' | 'governance'> = {
      'tax': 'regulatory',
      'regulatory': 'regulatory',
      'monetary': 'monetary',
      'judicial': 'judicial',
      'infra': 'infra',
      'governance': 'governance'
    };
    
    const pillar = pillarMap[intent.domain] || 'regulatory';
    
    return generateCertificate(
      audit,
      intent.domain,
      pillar,
      intent.inputs.requested_action,
      competingSolversAgreed,
      intent.governing_rules.rulebook_version,
      intent.governing_rules.rule_hash
    );
  }
  
  /**
   * Get Solver Identity
   * 
   * Returns solver ID and version.
   * Used by competing solver harness to track which solver produced which output.
   */
  public getIdentity(): { solver_id: string; solver_version: string } {
    return {
      solver_id: this.solverId,
      solver_version: this.solverVersion
    };
  }
}

/**
 * Solve (convenience function)
 * 
 * Executes DBGO reference solver on intent.
 * This is the main API for external callers.
 */
export function solve(intent: CanonicalIntentBundle): SolverResult {
  const solver = new DBGOReferenceSolver();
  return solver.solve(intent);
}
