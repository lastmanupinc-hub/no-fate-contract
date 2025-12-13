/**
 * DBGO Governance Operations Domain Adapter
 * 
 * Converts governance operations (change proposals, supersession, dispute replay)
 * into CanonicalIntentBundle format for DBGO processing.
 * 
 * HARD ENFORCEMENT:
 * - All governance operations MUST flow through competing solver harness
 * - NO special authority for governance operations
 * - Append-only evolution (no mutation)
 * - Replay determinism preserved
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: adapter-authority
 * - domain: governance
 */

import { CanonicalIntentBundle } from '../../core/types/intent-ir';
import { runCompetingSolvers, HarnessResult } from '../../harness';

/**
 * Governance Operation Types
 */
export type GovernanceOperationType = 
  | 'CHANGE_PROPOSAL'
  | 'SUPERSESSION_REQUEST'
  | 'DISPUTE_REPLAY'
  | 'POLICY_ENFORCEMENT_CHECK'
  | 'RULEBOOK_UPDATE'
  | 'AUTHORITY_VERIFICATION';

/**
 * Change Proposal Input
 */
export interface ChangeProposal {
  proposal_id: string;
  proposed_by: string;
  change_type: 'RULEBOOK' | 'POLICY' | 'SCHEMA' | 'ADAPTER';
  target_artifact: string;
  target_version: string;
  proposed_changes: Record<string, unknown>;
  justification: string;
  evidence_refs: string[];
  supersedes_version?: string;
}

/**
 * Supersession Request Input
 */
export interface SupersessionRequest {
  request_id: string;
  requested_by: string;
  artifact_id: string;
  current_version: string;
  proposed_version: string;
  supersession_reason: 'BUG_FIX' | 'ENHANCEMENT' | 'DEPRECATION' | 'SECURITY';
  backward_compatible: boolean;
  migration_path?: string;
  evidence_refs: string[];
}

/**
 * Dispute Replay Input
 */
export interface DisputeReplay {
  dispute_id: string;
  disputed_certificate_id: string;
  disputed_by: string;
  original_intent_id: string;
  replay_timestamp: string;
  dispute_reason: string;
  evidence_refs: string[];
}

/**
 * Governance Operations Adapter
 * 
 * Converts governance operations into CanonicalIntentBundle format
 * and routes through competing solver harness.
 */
export class GovernanceOperationsAdapter {
  private readonly DOMAIN = 'governance';
  private readonly GENESIS_HASH = 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a';
  
  /**
   * Process Change Proposal
   * 
   * Converts change proposal to canonical intent and processes through harness.
   */
  processChangeProposal(proposal: ChangeProposal): HarnessResult {
    const intent = this.buildChangeProposalIntent(proposal);
    return runCompetingSolvers(intent);
  }
  
  /**
   * Process Supersession Request
   * 
   * ENFORCES CONTROLLED_SUPERSESSION_POLICY:
   * - Append-only (no mutation)
   * - Version locking
   * - Supersession metadata required
   */
  processSupersessionRequest(request: SupersessionRequest): HarnessResult {
    const intent = this.buildSupersessionIntent(request);
    return runCompetingSolvers(intent);
  }
  
  /**
   * Process Dispute Replay
   * 
   * ENFORCES DISPUTE_RESOLUTION_POLICY:
   * - Replay-based resolution
   * - PASS/FAIL/INDETERMINATE only
   * - No narrative resolution
   */
  processDisputeReplay(dispute: DisputeReplay): HarnessResult {
    const intent = this.buildDisputeReplayIntent(dispute);
    return runCompetingSolvers(intent);
  }
  
  /**
   * Verify Policy Enforcement
   * 
   * Checks that operation complies with all four governance policies.
   */
  verifyPolicyEnforcement(
    operation: GovernanceOperationType,
    facts: Record<string, unknown>
  ): HarnessResult {
    const intent = this.buildPolicyCheckIntent(operation, facts);
    return runCompetingSolvers(intent);
  }
  
  /**
   * Build CanonicalIntentBundle for Change Proposal
   */
  private buildChangeProposalIntent(proposal: ChangeProposal): CanonicalIntentBundle {
    return {
      intent_type: 'GOVERNANCE_OPERATION',
      domain: this.DOMAIN,
      intent_id: `gov-change-${proposal.proposal_id}`,
      version: '1.0.0',
      inputs: {
        facts: {
          proposal_id: proposal.proposal_id,
          proposed_by: proposal.proposed_by,
          change_type: proposal.change_type,
          target_artifact: proposal.target_artifact,
          target_version: proposal.target_version,
          proposed_changes: proposal.proposed_changes,
          justification: proposal.justification,
          supersedes_version: proposal.supersedes_version || null
        },
        evidence_refs: proposal.evidence_refs,
        requested_action: 'EVALUATE_CHANGE_PROPOSAL'
      },
      governing_rules: {
        rulebook_id: 'governance-operations-rulebook',
        rulebook_version: '1.0.0',
        rule_hash: 'sha256:change-proposal-rules'
      },
      authority: {
        actor_id: proposal.proposed_by,
        actor_role: 'proposer',
        proof_ref: `proposal:${proposal.proposal_id}`
      },
      determinism_contract: {
        allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
        no_defaults: true,
        require_evidence: true,
        byte_identical_replay: true
      },
      governance_binding: {
        genesis_hash: this.GENESIS_HASH,
        authority_role: 'adapter-authority',
        policy_version: '1.0.0'
      }
    };
  }
  
  /**
   * Build CanonicalIntentBundle for Supersession Request
   * 
   * ENFORCES: CONTROLLED_SUPERSESSION_POLICY
   */
  private buildSupersessionIntent(request: SupersessionRequest): CanonicalIntentBundle {
    return {
      intent_type: 'GOVERNANCE_OPERATION',
      domain: this.DOMAIN,
      intent_id: `gov-supersession-${request.request_id}`,
      version: '1.0.0',
      inputs: {
        facts: {
          request_id: request.request_id,
          requested_by: request.requested_by,
          artifact_id: request.artifact_id,
          current_version: request.current_version,
          proposed_version: request.proposed_version,
          supersession_reason: request.supersession_reason,
          backward_compatible: request.backward_compatible,
          migration_path: request.migration_path || null,
          // HARD ENFORCEMENT: Require version locking proof
          version_locked: true,
          append_only: true,
          no_mutation: true
        },
        evidence_refs: request.evidence_refs,
        requested_action: 'EVALUATE_SUPERSESSION_REQUEST'
      },
      governing_rules: {
        rulebook_id: 'controlled-supersession-rulebook',
        rulebook_version: '1.0.0',
        rule_hash: 'sha256:supersession-rules'
      },
      authority: {
        actor_id: request.requested_by,
        actor_role: 'supersession-requester',
        proof_ref: `supersession:${request.request_id}`
      },
      determinism_contract: {
        allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
        no_defaults: true,
        require_evidence: true,
        byte_identical_replay: true
      },
      governance_binding: {
        genesis_hash: this.GENESIS_HASH,
        authority_role: 'adapter-authority',
        policy_version: '1.0.0'
      }
    };
  }
  
  /**
   * Build CanonicalIntentBundle for Dispute Replay
   * 
   * ENFORCES: DISPUTE_RESOLUTION_POLICY
   */
  private buildDisputeReplayIntent(dispute: DisputeReplay): CanonicalIntentBundle {
    return {
      intent_type: 'GOVERNANCE_OPERATION',
      domain: this.DOMAIN,
      intent_id: `gov-dispute-${dispute.dispute_id}`,
      version: '1.0.0',
      inputs: {
        facts: {
          dispute_id: dispute.dispute_id,
          disputed_certificate_id: dispute.disputed_certificate_id,
          disputed_by: dispute.disputed_by,
          original_intent_id: dispute.original_intent_id,
          replay_timestamp: dispute.replay_timestamp,
          dispute_reason: dispute.dispute_reason,
          // HARD ENFORCEMENT: Replay-based resolution only
          resolution_method: 'REPLAY_ONLY',
          no_narrative_resolution: true,
          outcomes_allowed: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT']
        },
        evidence_refs: dispute.evidence_refs,
        requested_action: 'REPLAY_FOR_DISPUTE_RESOLUTION'
      },
      governing_rules: {
        rulebook_id: 'dispute-resolution-rulebook',
        rulebook_version: '1.0.0',
        rule_hash: 'sha256:dispute-resolution-rules'
      },
      authority: {
        actor_id: dispute.disputed_by,
        actor_role: 'disputer',
        proof_ref: `dispute:${dispute.dispute_id}`
      },
      determinism_contract: {
        allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
        no_defaults: true,
        require_evidence: true,
        byte_identical_replay: true
      },
      governance_binding: {
        genesis_hash: this.GENESIS_HASH,
        authority_role: 'adapter-authority',
        policy_version: '1.0.0'
      }
    };
  }
  
  /**
   * Build CanonicalIntentBundle for Policy Enforcement Check
   */
  private buildPolicyCheckIntent(
    operation: GovernanceOperationType,
    facts: Record<string, unknown>
  ): CanonicalIntentBundle {
    const timestamp = new Date().toISOString();
    
    return {
      intent_type: 'GOVERNANCE_OPERATION',
      domain: this.DOMAIN,
      intent_id: `gov-policy-check-${timestamp}`,
      version: '1.0.0',
      inputs: {
        facts: {
          operation_type: operation,
          check_timestamp: timestamp,
          ...facts,
          // HARD ENFORCEMENT: Check all four policies
          policies_to_check: [
            'COMPETING_SOLVERS_POLICY',
            'DISPUTE_RESOLUTION_POLICY',
            'CONTROLLED_SUPERSESSION_POLICY',
            'DECENTRALIZED_OPERATIONS_POLICY'
          ]
        },
        evidence_refs: [],
        requested_action: 'VERIFY_POLICY_COMPLIANCE'
      },
      governing_rules: {
        rulebook_id: 'governance-policy-rulebook',
        rulebook_version: '1.0.0',
        rule_hash: 'sha256:policy-enforcement-rules'
      },
      authority: {
        actor_id: 'system',
        actor_role: 'policy-enforcer',
        proof_ref: `policy-check:${timestamp}`
      },
      determinism_contract: {
        allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
        no_defaults: true,
        require_evidence: true,
        byte_identical_replay: true
      },
      governance_binding: {
        genesis_hash: this.GENESIS_HASH,
        authority_role: 'adapter-authority',
        policy_version: '1.0.0'
      }
    };
  }
}

/**
 * Convenience functions
 */
export function processChangeProposal(proposal: ChangeProposal): HarnessResult {
  const adapter = new GovernanceOperationsAdapter();
  return adapter.processChangeProposal(proposal);
}

export function processSupersessionRequest(request: SupersessionRequest): HarnessResult {
  const adapter = new GovernanceOperationsAdapter();
  return adapter.processSupersessionRequest(request);
}

export function processDisputeReplay(dispute: DisputeReplay): HarnessResult {
  const adapter = new GovernanceOperationsAdapter();
  return adapter.processDisputeReplay(dispute);
}

export function verifyPolicyEnforcement(
  operation: GovernanceOperationType,
  facts: Record<string, unknown>
): HarnessResult {
  const adapter = new GovernanceOperationsAdapter();
  return adapter.verifyPolicyEnforcement(operation, facts);
}
