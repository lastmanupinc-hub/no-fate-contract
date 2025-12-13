/**
 * DBGO Policy Enforcement Module
 * 
 * HARD ENFORCEMENT of all four governance policies:
 * 1. COMPETING_SOLVERS_POLICY
 * 2. DISPUTE_RESOLUTION_POLICY
 * 3. CONTROLLED_SUPERSESSION_POLICY
 * 4. DECENTRALIZED_OPERATIONS_POLICY
 * 
 * This module provides enforcement mechanisms that CANNOT be bypassed.
 * All policy violations result in INDETERMINATE or INVALID_INPUT outcomes.
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: policy-enforcer
 */

import { CertificateIR, PolicyComplianceRecord } from '../core/types/certificate-ir';
import { HarnessResult } from '../harness';

/**
 * Policy Violation
 */
export interface PolicyViolation {
  policy: 'COMPETING_SOLVERS' | 'DISPUTE_RESOLUTION' | 'CONTROLLED_SUPERSESSION' | 'DECENTRALIZED_OPERATIONS';
  violation_type: string;
  severity: 'CRITICAL' | 'WARNING';
  description: string;
  detected_at: string;
}

/**
 * Policy Enforcement Result
 */
export interface PolicyEnforcementResult {
  compliant: boolean;
  violations: PolicyViolation[];
  enforcement_actions: string[];
  outcome_override?: 'INDETERMINATE' | 'INVALID_INPUT';
}

/**
 * Policy Enforcer
 * 
 * HARD ENFORCEMENT: This class enforces all four governance policies.
 * Violations result in forced INDETERMINATE or INVALID_INPUT outcomes.
 */
export class PolicyEnforcer {
  private readonly GENESIS_HASH = 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a';
  
  /**
   * Enforce All Policies
   * 
   * Checks certificate and harness result for policy compliance.
   * Returns violations and outcome overrides if needed.
   */
  enforceAllPolicies(result: HarnessResult): PolicyEnforcementResult {
    const violations: PolicyViolation[] = [];
    const actions: string[] = [];
    
    // Enforce COMPETING_SOLVERS_POLICY
    const solverViolations = this.enforceCompetingSolversPolicy(result);
    violations.push(...solverViolations);
    
    // Enforce DISPUTE_RESOLUTION_POLICY
    if (result.certificate) {
      const disputeViolations = this.enforceDisputeResolutionPolicy(result.certificate);
      violations.push(...disputeViolations);
    }
    
    // Enforce CONTROLLED_SUPERSESSION_POLICY
    if (result.certificate) {
      const supersessionViolations = this.enforceControlledSupersessionPolicy(result.certificate);
      violations.push(...supersessionViolations);
    }
    
    // Enforce DECENTRALIZED_OPERATIONS_POLICY
    if (result.certificate) {
      const decentralizedViolations = this.enforceDecentralizedOperationsPolicy(result.certificate);
      violations.push(...decentralizedViolations);
    }
    
    // Determine outcome override
    let outcomeOverride: 'INDETERMINATE' | 'INVALID_INPUT' | undefined;
    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
    
    if (criticalViolations.length > 0) {
      outcomeOverride = 'INDETERMINATE';
      actions.push(`FORCED OUTCOME TO INDETERMINATE due to ${criticalViolations.length} critical policy violation(s)`);
    }
    
    return {
      compliant: violations.length === 0,
      violations,
      enforcement_actions: actions,
      outcome_override: outcomeOverride
    };
  }
  
  /**
   * HARD ENFORCEMENT: COMPETING_SOLVERS_POLICY
   * 
   * Requirements:
   * - Multiple solvers MUST exist
   * - NO solver has special authority
   * - All solvers MUST agree byte-identically
   * - Divergence → INDETERMINATE
   */
  private enforceCompetingSolversPolicy(result: HarnessResult): PolicyViolation[] {
    const violations: PolicyViolation[] = [];
    const timestamp = new Date().toISOString();
    
    // Check: Multiple solvers executed
    const solverCount = Object.keys(result.solver_results).length;
    if (solverCount < 4) {
      violations.push({
        policy: 'COMPETING_SOLVERS',
        violation_type: 'INSUFFICIENT_SOLVERS',
        severity: 'CRITICAL',
        description: `Expected 4 solvers, found ${solverCount}`,
        detected_at: timestamp
      });
    }
    
    // Check: Consensus requirement
    if (!result.consensus && result.divergences.length > 0) {
      // This is actually CORRECT behavior - harness should return INDETERMINATE
      // Verify that outcome is INDETERMINATE
      if (result.outcome !== 'INDETERMINATE') {
        violations.push({
          policy: 'COMPETING_SOLVERS',
          violation_type: 'DIVERGENCE_NOT_HANDLED',
          severity: 'CRITICAL',
          description: `Solver divergence detected but outcome is ${result.outcome} (should be INDETERMINATE)`,
          detected_at: timestamp
        });
      }
    }
    
    // Check: No special authority
    // Verify that certificate (if present) tracks competing solver compliance
    if (result.certificate) {
      const solverCompliance = result.certificate.policy_compliance.competing_solvers;
      if (!solverCompliance || solverCompliance.enforcement !== 'HARD') {
        violations.push({
          policy: 'COMPETING_SOLVERS',
          violation_type: 'ENFORCEMENT_NOT_HARD',
          severity: 'CRITICAL',
          description: 'Certificate does not indicate HARD enforcement for competing solvers policy',
          detected_at: timestamp
        });
      }
      
      if (solverCompliance && !solverCompliance.solvers_agreed && result.outcome !== 'INDETERMINATE') {
        violations.push({
          policy: 'COMPETING_SOLVERS',
          violation_type: 'SOLVER_DISAGREEMENT_NOT_INDETERMINATE',
          severity: 'CRITICAL',
          description: 'Solvers disagreed but outcome is not INDETERMINATE',
          detected_at: timestamp
        });
      }
    }
    
    return violations;
  }
  
  /**
   * HARD ENFORCEMENT: DISPUTE_RESOLUTION_POLICY
   * 
   * Requirements:
   * - Replay-based resolution ONLY
   * - PASS/FAIL/INDETERMINATE/INVALID_INPUT outcomes ONLY
   * - NO narrative resolution
   * - NO discretionary outcomes
   */
  private enforceDisputeResolutionPolicy(certificate: CertificateIR): PolicyViolation[] {
    const violations: PolicyViolation[] = [];
    const timestamp = new Date().toISOString();
    
    // Check: Outcome is one of four allowed
    const allowedOutcomes = ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'];
    if (!allowedOutcomes.includes(certificate.outcome)) {
      violations.push({
        policy: 'DISPUTE_RESOLUTION',
        violation_type: 'INVALID_OUTCOME',
        severity: 'CRITICAL',
        description: `Outcome ${certificate.outcome} not in allowed set: ${allowedOutcomes.join(', ')}`,
        detected_at: timestamp
      });
    }
    
    // Check: Policy compliance record exists
    const disputeCompliance = certificate.policy_compliance.dispute_resolution;
    if (!disputeCompliance) {
      violations.push({
        policy: 'DISPUTE_RESOLUTION',
        violation_type: 'MISSING_COMPLIANCE_RECORD',
        severity: 'CRITICAL',
        description: 'Certificate missing dispute resolution policy compliance record',
        detected_at: timestamp
      });
    } else {
      // Check: Hard enforcement
      if (disputeCompliance.enforcement !== 'HARD') {
        violations.push({
          policy: 'DISPUTE_RESOLUTION',
          violation_type: 'ENFORCEMENT_NOT_HARD',
          severity: 'CRITICAL',
          description: 'Dispute resolution policy enforcement is not HARD',
          detected_at: timestamp
        });
      }
      
      // Check: Allowed outcomes only flag
      if (!disputeCompliance.allowed_outcomes_only) {
        violations.push({
          policy: 'DISPUTE_RESOLUTION',
          violation_type: 'OUTCOMES_NOT_RESTRICTED',
          severity: 'CRITICAL',
          description: 'Dispute resolution allows outcomes beyond PASS/FAIL/INDETERMINATE/INVALID_INPUT',
          detected_at: timestamp
        });
      }
    }
    
    return violations;
  }
  
  /**
   * HARD ENFORCEMENT: CONTROLLED_SUPERSESSION_POLICY
   * 
   * Requirements:
   * - Append-only evolution (NO mutation)
   * - Version locking
   * - Supersession metadata required
   * - NO destructive updates
   */
  private enforceControlledSupersessionPolicy(certificate: CertificateIR): PolicyViolation[] {
    const violations: PolicyViolation[] = [];
    const timestamp = new Date().toISOString();
    
    const supersessionCompliance = certificate.policy_compliance.controlled_supersession;
    if (!supersessionCompliance) {
      violations.push({
        policy: 'CONTROLLED_SUPERSESSION',
        violation_type: 'MISSING_COMPLIANCE_RECORD',
        severity: 'CRITICAL',
        description: 'Certificate missing controlled supersession policy compliance record',
        detected_at: timestamp
      });
      return violations;
    }
    
    // Check: Hard enforcement
    if (supersessionCompliance.enforcement !== 'HARD') {
      violations.push({
        policy: 'CONTROLLED_SUPERSESSION',
        violation_type: 'ENFORCEMENT_NOT_HARD',
        severity: 'CRITICAL',
        description: 'Controlled supersession policy enforcement is not HARD',
        detected_at: timestamp
      });
    }
    
    // Check: Append-only flag
    if (!supersessionCompliance.append_only) {
      violations.push({
        policy: 'CONTROLLED_SUPERSESSION',
        violation_type: 'NOT_APPEND_ONLY',
        severity: 'CRITICAL',
        description: 'Certificate indicates non-append-only evolution (mutation detected)',
        detected_at: timestamp
      });
    }
    
    // Check: If supersession occurred, metadata must be present
    if (supersessionCompliance.supersession_approved && !supersessionCompliance.prior_version) {
      violations.push({
        policy: 'CONTROLLED_SUPERSESSION',
        violation_type: 'MISSING_SUPERSESSION_METADATA',
        severity: 'CRITICAL',
        description: 'Supersession approved but prior version metadata missing',
        detected_at: timestamp
      });
    }
    
    return violations;
  }
  
  /**
   * HARD ENFORCEMENT: DECENTRALIZED_OPERATIONS_POLICY
   * 
   * Requirements:
   * - Distributed verification
   * - NO single point of authority
   * - System survives without founder
   * - Multiple independent verifiers
   */
  private enforceDecentralizedOperationsPolicy(certificate: CertificateIR): PolicyViolation[] {
    const violations: PolicyViolation[] = [];
    const timestamp = new Date().toISOString();
    
    const decentralizedCompliance = certificate.policy_compliance.decentralized_operations;
    if (!decentralizedCompliance) {
      violations.push({
        policy: 'DECENTRALIZED_OPERATIONS',
        violation_type: 'MISSING_COMPLIANCE_RECORD',
        severity: 'CRITICAL',
        description: 'Certificate missing decentralized operations policy compliance record',
        detected_at: timestamp
      });
      return violations;
    }
    
    // Check: Hard enforcement
    if (decentralizedCompliance.enforcement !== 'HARD') {
      violations.push({
        policy: 'DECENTRALIZED_OPERATIONS',
        violation_type: 'ENFORCEMENT_NOT_HARD',
        severity: 'CRITICAL',
        description: 'Decentralized operations policy enforcement is not HARD',
        detected_at: timestamp
      });
    }
    
    // Check: Distributed verification flag
    if (!decentralizedCompliance.distributed_verification) {
      violations.push({
        policy: 'DECENTRALIZED_OPERATIONS',
        violation_type: 'NOT_DISTRIBUTED',
        severity: 'CRITICAL',
        description: 'Certificate indicates centralized (non-distributed) verification',
        detected_at: timestamp
      });
    }
    
    // Check: No single authority flag
    if (!decentralizedCompliance.no_single_authority) {
      violations.push({
        policy: 'DECENTRALIZED_OPERATIONS',
        violation_type: 'SINGLE_AUTHORITY_DETECTED',
        severity: 'CRITICAL',
        description: 'Certificate indicates single point of authority exists',
        detected_at: timestamp
      });
    }
    
    return violations;
  }
  
  /**
   * Verify Genesis Hash Binding
   * 
   * Ensures all artifacts are bound to correct genesis hash.
   */
  verifyGenesisBinding(certificate: CertificateIR): PolicyViolation[] {
    const violations: PolicyViolation[] = [];
    const timestamp = new Date().toISOString();
    
    if (certificate.governance_binding.genesis_hash !== this.GENESIS_HASH) {
      violations.push({
        policy: 'DECENTRALIZED_OPERATIONS',
        violation_type: 'INVALID_GENESIS_HASH',
        severity: 'CRITICAL',
        description: `Genesis hash mismatch: expected ${this.GENESIS_HASH}, got ${certificate.governance_binding.genesis_hash}`,
        detected_at: timestamp
      });
    }
    
    return violations;
  }
}

/**
 * Convenience function: Enforce all policies on harness result
 */
export function enforceAllPolicies(result: HarnessResult): PolicyEnforcementResult {
  const enforcer = new PolicyEnforcer();
  return enforcer.enforceAllPolicies(result);
}

/**
 * Convenience function: Verify certificate policy compliance
 */
export function verifyCertificatePolicyCompliance(certificate: CertificateIR): PolicyViolation[] {
  const enforcer = new PolicyEnforcer();
  const violations: PolicyViolation[] = [];
  
  violations.push(...enforcer['enforceDisputeResolutionPolicy'](certificate));
  violations.push(...enforcer['enforceControlledSupersessionPolicy'](certificate));
  violations.push(...enforcer['enforceDecentralizedOperationsPolicy'](certificate));
  violations.push(...enforcer.verifyGenesisBinding(certificate));
  
  return violations;
}
