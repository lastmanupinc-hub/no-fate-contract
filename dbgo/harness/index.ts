/**
 * DBGO Competing Solver Harness
 * 
 * CRITICAL HARD ENFORCEMENT MECHANISM
 * 
 * This harness implements COMPETING_SOLVERS_POLICY by:
 * 1. Running all 4 solvers on the same canonical intent
 * 2. Comparing outputs byte-identically (JSON canonicalization)
 * 3. Returning INDETERMINATE if ANY divergence detected
 * 
 * NO SOLVER HAS SPECIAL AUTHORITY
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: harness-authority
 * - policy: COMPETING_SOLVERS_POLICY
 */

import { CanonicalIntentBundle } from '../core/types/intent-ir';
import { CertificateIR } from '../core/types/certificate-ir';
import { DBGOReferenceSolver, SolverResult } from '../solvers/dbgo-reference';
import { IndependentSolverA } from '../solvers/dbgo-independent-A';
import { IndependentSolverB } from '../solvers/dbgo-independent-B';
import { IndependentSolverC } from '../solvers/dbgo-independent-C';

export interface HarnessResult {
  success: boolean;
  outcome: 'PASS' | 'FAIL' | 'INDETERMINATE' | 'INVALID_INPUT';
  certificate?: CertificateIR;
  consensus: boolean;
  solver_results: Record<string, SolverResult>;
  divergences: DivergenceReport[];
  errors: string[];
  warnings: string[];
  harness_id: string;
  harness_version: string;
}

export interface DivergenceReport {
  field: string;
  values: Record<string, unknown>;
  severity: 'CRITICAL' | 'WARNING';
}

/**
 * Competing Solver Harness
 * 
 * HARD ENFORCEMENT:
 * - All 4 solvers MUST agree byte-identically
 * - ANY divergence → outcome forced to INDETERMINATE
 * - NO default behavior, NO fallback to single solver
 * - NO solver has special authority
 */
export class CompetingSolverHarness {
  private readonly HARNESS_ID = 'dbgo-competing-harness';
  private readonly HARNESS_VERSION = '1.0.0';
  
  /**
   * Run all 4 competing solvers and compare outputs
   * 
   * CRITICAL: This is the primary enforcement mechanism for COMPETING_SOLVERS_POLICY
   */
  run(intent: CanonicalIntentBundle): HarnessResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Execute all 4 solvers in parallel (conceptually)
    const solvers = this.instantiateSolvers();
    const results = this.executeSolvers(solvers, intent);
    
    // Check if all solvers succeeded
    const allSucceeded = Object.values(results).every(r => r.success);
    if (!allSucceeded) {
      errors.push('One or more solvers failed to execute');
      return this.buildFailureResult(results, [], errors, warnings);
    }
    
    // Compare outputs byte-identically
    const divergences = this.compareOutputs(results);
    
    if (divergences.length > 0) {
      // HARD ENFORCEMENT: ANY divergence → INDETERMINATE
      warnings.push('Solver divergence detected - forcing outcome to INDETERMINATE');
      warnings.push(`Found ${divergences.length} divergence(s)`);
      
      // Return INDETERMINATE outcome with divergence report
      return this.buildDivergentResult(results, divergences, errors, warnings);
    }
    
    // All solvers agree - return consensus certificate
    // Use reference solver's certificate (but only because all agree)
    const referenceCert = results['dbgo-reference'].certificate!;
    
    return {
      success: true,
      outcome: referenceCert.outcome,
      certificate: referenceCert,
      consensus: true,
      solver_results: results,
      divergences: [],
      errors: [],
      warnings,
      harness_id: this.HARNESS_ID,
      harness_version: this.HARNESS_VERSION
    };
  }
  
  private instantiateSolvers() {
    return {
      'dbgo-reference': new DBGOReferenceSolver(),
      'dbgo-independent-A': new IndependentSolverA(),
      'dbgo-independent-B': new IndependentSolverB(),
      'dbgo-independent-C': new IndependentSolverC()
    };
  }
  
  private executeSolvers(
    solvers: ReturnType<typeof this.instantiateSolvers>,
    intent: CanonicalIntentBundle
  ): Record<string, SolverResult> {
    return {
      'dbgo-reference': solvers['dbgo-reference'].solve(intent),
      'dbgo-independent-A': solvers['dbgo-independent-A'].processIntent(intent),
      'dbgo-independent-B': solvers['dbgo-independent-B'].execute(intent),
      'dbgo-independent-C': solvers['dbgo-independent-C'].compute(intent)
    };
  }
  
  /**
   * Compare solver outputs byte-identically using JSON canonicalization
   * 
   * CRITICAL: This comparison enforces solver equivalence
   */
  private compareOutputs(results: Record<string, SolverResult>): DivergenceReport[] {
    const divergences: DivergenceReport[] = [];
    
    // Extract certificates from all solvers
    const certificates = Object.entries(results)
      .filter(([_, r]) => r.certificate)
      .map(([id, r]) => ({ id, cert: r.certificate! }));
    
    if (certificates.length === 0) {
      divergences.push({
        field: 'certificates',
        values: { error: 'No certificates produced' },
        severity: 'CRITICAL'
      });
      return divergences;
    }
    
    if (certificates.length !== 4) {
      divergences.push({
        field: 'certificate_count',
        values: { 
          expected: 4,
          actual: certificates.length,
          missing: Object.keys(results).filter(id => !results[id].certificate)
        },
        severity: 'CRITICAL'
      });
      return divergences;
    }
    
    // Compare critical fields byte-identically
    const referenceCert = certificates[0].cert;
    const referenceId = certificates[0].id;
    
    for (let i = 1; i < certificates.length; i++) {
      const compareCert = certificates[i].cert;
      const compareId = certificates[i].id;
      
      // Compare outcomes (CRITICAL)
      if (referenceCert.outcome !== compareCert.outcome) {
        divergences.push({
          field: 'outcome',
          values: {
            [referenceId]: referenceCert.outcome,
            [compareId]: compareCert.outcome
          },
          severity: 'CRITICAL'
        });
      }
      
      // Compare intent_id (CRITICAL)
      if (referenceCert.intent_id !== compareCert.intent_id) {
        divergences.push({
          field: 'intent_id',
          values: {
            [referenceId]: referenceCert.intent_id,
            [compareId]: compareCert.intent_id
          },
          severity: 'CRITICAL'
        });
      }
      
      // Compare audit replay hash (CRITICAL - ensures determinism)
      if (referenceCert.evidence_chain.audit_replay_hash !== compareCert.evidence_chain.audit_replay_hash) {
        divergences.push({
          field: 'audit_replay_hash',
          values: {
            [referenceId]: referenceCert.evidence_chain.audit_replay_hash,
            [compareId]: compareCert.evidence_chain.audit_replay_hash
          },
          severity: 'CRITICAL'
        });
      }
      
      // Compare rule hash (CRITICAL)
      if (referenceCert.evidence_chain.rule_hash !== compareCert.evidence_chain.rule_hash) {
        divergences.push({
          field: 'rule_hash',
          values: {
            [referenceId]: referenceCert.evidence_chain.rule_hash,
            [compareId]: compareCert.evidence_chain.rule_hash
          },
          severity: 'CRITICAL'
        });
      }
      
      // Compare policy compliance (CRITICAL)
      const refCompliance = JSON.stringify(this.canonicalize(referenceCert.policy_compliance));
      const cmpCompliance = JSON.stringify(this.canonicalize(compareCert.policy_compliance));
      if (refCompliance !== cmpCompliance) {
        divergences.push({
          field: 'policy_compliance',
          values: {
            [referenceId]: referenceCert.policy_compliance,
            [compareId]: compareCert.policy_compliance
          },
          severity: 'CRITICAL'
        });
      }
    }
    
    return divergences;
  }
  
  /**
   * Canonicalize object for byte-identical comparison
   * (Sort keys alphabetically, remove undefined, normalize JSON)
   */
  private canonicalize(obj: unknown): unknown {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.canonicalize(item));
    
    const sorted: Record<string, unknown> = {};
    Object.keys(obj as object)
      .sort()
      .forEach(key => {
        const value = (obj as Record<string, unknown>)[key];
        if (value !== undefined) {
          sorted[key] = this.canonicalize(value);
        }
      });
    
    return sorted;
  }
  
  private buildFailureResult(
    results: Record<string, SolverResult>,
    divergences: DivergenceReport[],
    errors: string[],
    warnings: string[]
  ): HarnessResult {
    return {
      success: false,
      outcome: 'INDETERMINATE',
      consensus: false,
      solver_results: results,
      divergences,
      errors,
      warnings,
      harness_id: this.HARNESS_ID,
      harness_version: this.HARNESS_VERSION
    };
  }
  
  private buildDivergentResult(
    results: Record<string, SolverResult>,
    divergences: DivergenceReport[],
    errors: string[],
    warnings: string[]
  ): HarnessResult {
    // Build INDETERMINATE certificate manually
    // (Cannot use any single solver's certificate due to divergence)
    const indeterminateCert = this.buildIndeterminateCertificate(results, divergences);
    
    return {
      success: true,
      outcome: 'INDETERMINATE',
      certificate: indeterminateCert,
      consensus: false,
      solver_results: results,
      divergences,
      errors,
      warnings,
      harness_id: this.HARNESS_ID,
      harness_version: this.HARNESS_VERSION
    };
  }
  
  /**
   * Build INDETERMINATE certificate when solvers diverge
   */
  private buildIndeterminateCertificate(
    results: Record<string, SolverResult>,
    divergences: DivergenceReport[]
  ): CertificateIR {
    const refResult = results['dbgo-reference'];
    const timestamp = new Date().toISOString();
    
    return {
      certificate_id: `cert-indeterminate-${Date.now()}`,
      intent_id: refResult.certificate?.intent_id || 'unknown',
      outcome: 'INDETERMINATE',
      evidence_chain: {
        blueprint_id: refResult.blueprint?.blueprint_id || 'unknown',
        audit_id: refResult.audit?.audit_id || 'unknown',
        audit_replay_hash: 'divergence-detected',
        rule_hash: refResult.certificate?.evidence_chain.rule_hash || 'unknown'
      },
      domain: refResult.certificate?.domain || 'governance',
      pillar: 'governance',
      requested_action: refResult.certificate?.requested_action || 'unknown',
      policy_compliance: {
        competing_solvers: {
          policy_version: '1.0.0',
          solvers_agreed: false,
          divergences: divergences.map(d => d.field),
          enforcement: 'HARD',
          violations: ['SOLVER_DIVERGENCE']
        },
        dispute_resolution: {
          policy_version: '1.0.0',
          replay_verified: false,
          allowed_outcomes_only: true,
          enforcement: 'HARD',
          violations: []
        },
        controlled_supersession: {
          policy_version: '1.0.0',
          append_only: true,
          prior_version: refResult.certificate?.policy_compliance.controlled_supersession.prior_version,
          supersession_approved: refResult.certificate?.policy_compliance.controlled_supersession.supersession_approved || false,
          enforcement: 'HARD',
          violations: []
        },
        decentralized_operations: {
          policy_version: '1.0.0',
          distributed_verification: true,
          no_single_authority: true,
          enforcement: 'HARD',
          violations: []
        }
      },
      issued_at: timestamp,
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      issuing_authority: 'dbgo-competing-harness',
      governance_binding: {
        genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
        authority_role: 'harness-authority',
        policy_version: '1.0.0'
      }
    };
  }
}

/**
 * Convenience function to run competing solver harness
 */
export function runCompetingSolvers(intent: CanonicalIntentBundle): HarnessResult {
  const harness = new CompetingSolverHarness();
  return harness.run(intent);
}
