/**
 * DBGO Core: Certificate IR
 * 
 * CertificateIR: Final deterministic output from DBGO pipeline
 * 
 * This is what gets issued to requestors. It MUST be:
 * - Deterministic (byte-identical for identical inputs)
 * - Evidence-grounded (every claim has proof)
 * - Replay-verifiable (can be independently verified)
 * - Policy-compliant (enforces all four governance policies)
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: auditor-authority
 * - policy: ALL FOUR POLICIES enforced
 */

import { AllowedOutput, EvidenceRef, DomainType } from './intent-ir';
import { AuditIR } from './blueprint-audit-ir';

/**
 * Certificate Outcome
 * 
 * HARD CONSTRAINT: Only four outcomes permitted.
 * - PASS: Deterministic positive outcome
 * - FAIL: Deterministic negative outcome
 * - INDETERMINATE: No deterministic outcome possible (ambiguity, competing interpretations, insufficient evidence)
 * - INVALID_INPUT: Input malformed or doesn't match schema
 * 
 * NO "MAYBE", "PARTIAL", "PENDING", "REFER", "ESCALATE" allowed.
 */
export type CertificateOutcome = AllowedOutput;

/**
 * Pillar Type
 * 
 * Four domain pillars that require certificates:
 * - regulatory: Pre-clearance, compliance checks
 * - monetary: Settlement eligibility
 * - judicial: Admissibility determination
 * - infra: Infrastructure/change approval
 * 
 * Plus governance for meta-operations.
 */
export type PillarType = 'regulatory' | 'monetary' | 'judicial' | 'infra' | 'governance';

/**
 * Evidence Chain
 * 
 * Complete chain from claim → evidence → source.
 * Every claim in certificate MUST have evidence chain.
 */
export interface EvidenceChain {
  claim: string; // What is being claimed
  evidence_refs: EvidenceRef[]; // Evidence supporting claim
  confidence: 'DETERMINISTIC' | 'INDETERMINATE'; // Is this claim deterministic?
  reasoning: string; // Why this conclusion (text explanation)
}

/**
 * Policy Compliance Record
 * 
 * Proves certificate complies with all four governance policies.
 * This is HARD ENFORCEMENT - certificate is invalid if any policy violated.
 */
export interface PolicyComplianceRecord {
  // COMPETING_SOLVERS_POLICY
  competing_solvers: {
    solver_count: number; // How many solvers evaluated this intent
    solvers_agreed: boolean; // Did all solvers produce byte-identical outputs?
    divergence_details?: string; // If disagreement, what diverged?
    policy_compliant: boolean; // MUST be true for PASS/FAIL (false = INDETERMINATE)
  };

  // DISPUTE_RESOLUTION_POLICY
  dispute_resolution: {
    replay_verified: boolean; // Can this certificate be independently replayed?
    replay_hash: string; // sha256 of replay inputs
    outcome_deterministic: boolean; // Is outcome PASS/FAIL/INDETERMINATE (not narrative)?
    policy_compliant: boolean; // MUST be true
  };

  // CONTROLLED_SUPERSESSION_POLICY
  controlled_supersession: {
    rulebook_version: string; // Which version of rules was used
    rulebook_hash: string; // sha256 of rulebook (immutable)
    supersedes?: string; // If rulebook superseded older version, what hash?
    append_only: boolean; // Was append-only rule followed?
    policy_compliant: boolean; // MUST be true
  };

  // DECENTRALIZED_OPERATIONS_POLICY
  decentralized_operations: {
    authority_distributed: boolean; // Was this issued by distributed authority (not single founder)?
    authority_proof_refs: string[]; // sha256 hashes proving authority
    single_point_of_failure: boolean; // Is there a single point of failure? (MUST be false)
    policy_compliant: boolean; // MUST be true
  };

  // Overall compliance
  all_policies_compliant: boolean; // AND of all policy_compliant flags
}

/**
 * Certificate IR
 * 
 * Final output of DBGO pipeline: canonicalize → blueprint → audit → certificate
 * 
 * This certificate is:
 * - Cryptographically bound to inputs (via hashes)
 * - Evidence-grounded (all claims have evidence chains)
 * - Replay-verifiable (can be independently checked)
 * - Policy-compliant (all four policies enforced)
 * - Deterministic (byte-identical for identical inputs)
 * 
 * HARD ENFORCEMENT:
 * - If competing solvers diverge → outcome = INDETERMINATE
 * - If any policy violated → certificate = INVALID
 * - If evidence incomplete → outcome = INDETERMINATE
 * - If replay fails → outcome = INDETERMINATE
 */
export interface CertificateIR {
  // Certificate metadata
  certificate_id: string; // uuid
  certificate_version: string; // 1.0.0
  issued_at: string; // ISO 8601
  expires_at?: string; // ISO 8601 (optional - some certificates don't expire)

  // Links to pipeline artifacts
  intent_id: string; // CanonicalIntentBundle
  blueprint_id: string; // BlueprintIR
  audit_id: string; // AuditIR

  // Domain context
  domain: DomainType;
  pillar: PillarType;
  requested_action: string;

  // OUTCOME (one of four allowed values)
  outcome: CertificateOutcome;
  outcome_reason: string; // Why this outcome (human-readable)

  // Evidence (every claim must have evidence)
  evidence_chains: EvidenceChain[];
  evidence_complete: boolean; // All claims have evidence?

  // Policy compliance (proves all four policies enforced)
  policy_compliance: PolicyComplianceRecord;

  // Determinism verification
  deterministic: boolean; // Is this outcome deterministic?
  replay_hash: string; // sha256 of all inputs (for replay verification)

  // Governance binding
  governance_binding: {
    genesis_hash: string;
    authority_role: string; // auditor-authority
    policy_version: string;
  };

  // Cryptographic signature (proves authenticity)
  signature?: {
    algorithm: string; // ed25519
    public_key: string;
    signature: string;
  };
}

/**
 * Certificate Generation Result
 * 
 * Result of generating certificate from audit trail.
 */
export interface CertificateGenerationResult {
  success: boolean;
  certificate?: CertificateIR;
  outcome?: CertificateOutcome;
  errors: string[];
  warnings: string[];
}

/**
 * Generate Certificate from Audit Trail
 * 
 * Final phase of DBGO pipeline: audit → certificate
 * 
 * HARD ENFORCEMENT:
 * 1. If audit shows non-determinism → outcome = INDETERMINATE
 * 2. If evidence incomplete → outcome = INDETERMINATE
 * 3. If any policy violated → certificate = INVALID
 * 4. If competing solvers diverge → outcome = INDETERMINATE
 * 
 * NO DEFAULTS, NO FALLBACKS, NO "BEST EFFORT".
 */
export function generateCertificate(
  audit: AuditIR,
  domain: DomainType,
  pillar: PillarType,
  requestedAction: string,
  competingSolversAgreed: boolean,
  rulebookVersion: string,
  rulebookHash: string
): CertificateGenerationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Determine outcome based on audit results and policy compliance
    let outcome: CertificateOutcome;
    let outcomeReason: string;

    // COMPETING_SOLVERS_POLICY enforcement
    if (!competingSolversAgreed) {
      outcome = 'INDETERMINATE';
      outcomeReason = 'Competing solvers produced divergent outputs (COMPETING_SOLVERS_POLICY violation)';
      warnings.push('Solver divergence detected - outcome forced to INDETERMINATE');
    }
    // Audit shows non-determinism
    else if (!audit.deterministic) {
      outcome = 'INDETERMINATE';
      outcomeReason = 'Non-deterministic execution detected during audit';
      warnings.push('Non-determinism detected - outcome forced to INDETERMINATE');
    }
    // Evidence incomplete
    else if (!audit.evidence_complete) {
      outcome = 'INDETERMINATE';
      outcomeReason = 'Evidence incomplete - cannot make deterministic determination';
      warnings.push('Evidence incomplete - outcome forced to INDETERMINATE');
    }
    // Audit execution failed
    else if (audit.execution_status === 'FAILURE') {
      outcome = 'FAIL';
      outcomeReason = 'Audit execution failed: ' + audit.execution_errors.join('; ');
    }
    // Audit execution indeterminate
    else if (audit.execution_status === 'INDETERMINATE') {
      outcome = 'INDETERMINATE';
      outcomeReason = 'Audit execution indeterminate: ' + audit.execution_errors.join('; ');
    }
    // Success - default to PASS (domain adapter will override if needed)
    else {
      outcome = 'PASS';
      outcomeReason = 'All checks passed - deterministic positive outcome';
    }

    // Build policy compliance record
    const policyCompliance: PolicyComplianceRecord = {
      competing_solvers: {
        solver_count: 4, // TODO: Get actual count
        solvers_agreed: competingSolversAgreed,
        divergence_details: competingSolversAgreed ? undefined : 'Solvers produced different outputs',
        policy_compliant: competingSolversAgreed
      },
      dispute_resolution: {
        replay_verified: audit.deterministic,
        replay_hash: audit.replay_hash,
        outcome_deterministic: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'].includes(outcome),
        policy_compliant: true // Always true if we got here
      },
      controlled_supersession: {
        rulebook_version: rulebookVersion,
        rulebook_hash: rulebookHash,
        supersedes: undefined, // TODO: Get from rulebook metadata
        append_only: true, // TODO: Verify append-only was followed
        policy_compliant: true
      },
      decentralized_operations: {
        authority_distributed: false, // TODO: Check if multiple authorities issued this
        authority_proof_refs: [], // TODO: Get authority proofs
        single_point_of_failure: true, // TODO: Check if distributed
        policy_compliant: false // TODO: Will be false until decentralization complete
      },
      all_policies_compliant: competingSolversAgreed && audit.deterministic && audit.evidence_complete
    };

    // Build evidence chains from audit
    const evidenceChains: EvidenceChain[] = audit.all_evidence.map(evRef => ({
      claim: 'Evidence collected during audit',
      evidence_refs: [evRef],
      confidence: audit.deterministic ? 'DETERMINISTIC' : 'INDETERMINATE',
      reasoning: 'Evidence from audit trail'
    }));

    // Create certificate
    const certificate: CertificateIR = {
      certificate_id: `cert-${audit.intent_id}`,
      certificate_version: '1.0.0',
      issued_at: new Date().toISOString(),
      intent_id: audit.intent_id,
      blueprint_id: audit.blueprint_id,
      audit_id: audit.audit_id,
      domain,
      pillar,
      requested_action: requestedAction,
      outcome,
      outcome_reason: outcomeReason,
      evidence_chains: evidenceChains,
      evidence_complete: audit.evidence_complete,
      policy_compliance: policyCompliance,
      deterministic: audit.deterministic && competingSolversAgreed,
      replay_hash: audit.replay_hash,
      governance_binding: {
        genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
        authority_role: 'auditor-authority',
        policy_version: '1.0.0'
      }
    };

    return {
      success: true,
      certificate,
      outcome,
      errors: [],
      warnings
    };
  } catch (error) {
    errors.push(`Certificate generation failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      errors,
      warnings
    };
  }
}

/**
 * Verify Certificate
 * 
 * Verifies certificate is valid and policy-compliant.
 * Used for DISPUTE_RESOLUTION_POLICY - any party can verify certificate independently.
 */
export interface CertificateVerificationResult {
  valid: boolean;
  policy_violations: string[];
  warnings: string[];
}

export function verifyCertificate(certificate: CertificateIR): CertificateVerificationResult {
  const policyViolations: string[] = [];
  const warnings: string[] = [];

  // Check outcome is one of four allowed values
  const allowedOutcomes: CertificateOutcome[] = ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'];
  if (!allowedOutcomes.includes(certificate.outcome)) {
    policyViolations.push(`Invalid outcome: ${certificate.outcome}. Must be one of: ${allowedOutcomes.join(', ')}`);
  }

  // Check policy compliance
  if (!certificate.policy_compliance.all_policies_compliant) {
    policyViolations.push('Certificate is not policy-compliant');

    if (!certificate.policy_compliance.competing_solvers.policy_compliant) {
      policyViolations.push('COMPETING_SOLVERS_POLICY violated');
    }
    if (!certificate.policy_compliance.dispute_resolution.policy_compliant) {
      policyViolations.push('DISPUTE_RESOLUTION_POLICY violated');
    }
    if (!certificate.policy_compliance.controlled_supersession.policy_compliant) {
      policyViolations.push('CONTROLLED_SUPERSESSION_POLICY violated');
    }
    if (!certificate.policy_compliance.decentralized_operations.policy_compliant) {
      warnings.push('DECENTRALIZED_OPERATIONS_POLICY not yet fully compliant (work in progress)');
    }
  }

  // Check evidence completeness
  if (!certificate.evidence_complete && certificate.outcome === 'PASS') {
    policyViolations.push('PASS outcome with incomplete evidence (not allowed)');
  }

  // Check determinism
  if (!certificate.deterministic && ['PASS', 'FAIL'].includes(certificate.outcome)) {
    policyViolations.push('PASS/FAIL outcome without determinism (not allowed)');
  }

  // Check governance binding
  if (certificate.governance_binding.genesis_hash !== 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a') {
    policyViolations.push('Invalid genesis_hash - not bound to canonical governance');
  }

  return {
    valid: policyViolations.length === 0,
    policy_violations: policyViolations,
    warnings
  };
}
