/**
 * DBGO Core: Canonical Intent IR
 * 
 * This is the domain-agnostic intent format consumed by ALL competing solvers.
 * Any solver that cannot consume this format is non-conformant.
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: solver-authority
 * - policy: COMPETING_SOLVERS_POLICY v1.0.0
 */

/**
 * Intent Type: Domain evaluation vs governance operation
 * 
 * DOMAIN_EVALUATION: Evaluate facts against rules (tax, regulatory, monetary, judicial, infra)
 * GOVERNANCE_OPERATION: Apply governance rules (change proposals, disputes, supersession)
 */
export type IntentType = 'DOMAIN_EVALUATION' | 'GOVERNANCE_OPERATION';

/**
 * Domain Type: Which pillar this intent targets
 * 
 * tax: IRS/tax compliance determination
 * regulatory: Pre-clearance, compliance checks
 * monetary: Settlement eligibility, financial infrastructure
 * judicial: Admissibility, evidence verification
 * infra: Infrastructure/change approval
 * governance: Governance operations (proposals, disputes, supersession)
 */
export type DomainType = 'tax' | 'regulatory' | 'monetary' | 'judicial' | 'infra' | 'governance';

/**
 * Allowed Output Types
 * 
 * PASS: Deterministic outcome exists, request satisfied
 * FAIL: Deterministic outcome exists, request denied
 * INDETERMINATE: No deterministic outcome (ambiguity, insufficient evidence, competing interpretations)
 * INVALID_INPUT: Input malformed or doesn't match schema
 * 
 * NO OTHER OUTCOMES PERMITTED. No "MAYBE", "PARTIAL", "PENDING", "REFER".
 */
export type AllowedOutput = 'PASS' | 'FAIL' | 'INDETERMINATE' | 'INVALID_INPUT';

/**
 * Determinism Contract
 * 
 * Declares hard constraints on solver behavior:
 * - allowed_outputs: Only these outcomes permitted (no defaults, no fallbacks)
 * - no_defaults: Solver MUST NOT provide default values for missing inputs
 * - require_evidence: Every claim MUST have evidence pointer
 * - byte_identical_replay: Identical inputs MUST produce byte-identical outputs
 */
export interface DeterminismContract {
  allowed_outputs: AllowedOutput[];
  no_defaults: boolean;
  require_evidence: boolean;
  byte_identical_replay: boolean;
}

/**
 * Evidence Reference
 * 
 * Points to source document, attestation, or record that grounds a fact.
 * All evidence MUST be content-addressed (hash).
 */
export interface EvidenceRef {
  hash: string; // sha256:...
  type: 'doc' | 'record' | 'attestation' | 'rulebook';
  description: string;
}

/**
 * Governing Rules Reference
 * 
 * Points to rulebook that governs this intent.
 * Rulebook MUST be versioned and hashed (append-only, no mutation).
 */
export interface GoverningRules {
  rulebook_id: string;
  rulebook_version: string;
  rule_hash: string; // sha256:...
  supersedes?: string; // hash of previous rulebook (if applicable)
}

/**
 * Authority Context
 * 
 * Who is requesting this evaluation and with what jurisdiction/proof.
 * Used for DECENTRALIZED_OPERATIONS_POLICY enforcement.
 */
export interface AuthorityContext {
  actor_id: string;
  proof_ref: string; // sha256:... (points to authority proof)
  jurisdiction?: string;
  role?: string; // governance-authority, auditor-authority, etc.
}

/**
 * Canonical Intent Bundle
 * 
 * This is THE interface that all competing solvers consume.
 * Any divergence in how solvers interpret this bundle = INDETERMINATE.
 * 
 * HARD REQUIREMENTS (enforced by COMPETING_SOLVERS_POLICY):
 * 1. All solvers MUST accept this exact type signature
 * 2. All solvers MUST produce byte-identical outputs for identical bundles
 * 3. Any non-determinism detected = solver is non-conformant
 * 4. No solver has special authority to "break ties"
 */
export interface CanonicalIntentBundle {
  // Intent metadata
  intent_type: IntentType;
  domain: DomainType;
  intent_id: string; // uuid
  version: string; // 1.0.0
  created_at: string; // ISO 8601

  // Intent payload
  inputs: {
    facts: Record<string, unknown>; // Structured facts (no free text)
    evidence_refs: EvidenceRef[]; // All facts MUST have evidence
    requested_action: string; // "classify_income", "approve_change_proposal", etc.
  };

  // Governing rules
  governing_rules: GoverningRules;

  // Authority
  authority: AuthorityContext;

  // Determinism contract (enforces hard constraints)
  determinism_contract: DeterminismContract;

  // Governance binding (proves this intent is under governance)
  governance_binding: {
    genesis_hash: string; // sha256:45162862...
    authority_role: string; // solver-authority
    policy_version: string; // 1.0.0
  };
}

/**
 * Intent Validation Result
 * 
 * Before solvers can process an intent, it MUST pass validation.
 * Invalid intents produce INVALID_INPUT outcome (not INDETERMINATE).
 */
export interface IntentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate Canonical Intent Bundle
 * 
 * Hard enforcement of schema requirements.
 * Any deviation = INVALID_INPUT.
 */
export function validateIntentBundle(bundle: unknown): IntentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type guard
  if (!bundle || typeof bundle !== 'object') {
    return { valid: false, errors: ['Bundle is not an object'], warnings: [] };
  }

  const b = bundle as Partial<CanonicalIntentBundle>;

  // Required fields
  if (!b.intent_type || !['DOMAIN_EVALUATION', 'GOVERNANCE_OPERATION'].includes(b.intent_type)) {
    errors.push('intent_type must be DOMAIN_EVALUATION or GOVERNANCE_OPERATION');
  }

  if (!b.domain || !['tax', 'regulatory', 'monetary', 'judicial', 'infra', 'governance'].includes(b.domain)) {
    errors.push('domain must be one of: tax, regulatory, monetary, judicial, infra, governance');
  }

  if (!b.intent_id || typeof b.intent_id !== 'string') {
    errors.push('intent_id is required (string)');
  }

  if (!b.version || typeof b.version !== 'string') {
    errors.push('version is required (string)');
  }

  if (!b.created_at || typeof b.created_at !== 'string') {
    errors.push('created_at is required (ISO 8601 string)');
  }

  // Inputs validation
  if (!b.inputs || typeof b.inputs !== 'object') {
    errors.push('inputs is required (object)');
  } else {
    if (!b.inputs.facts || typeof b.inputs.facts !== 'object') {
      errors.push('inputs.facts is required (object)');
    }

    if (!Array.isArray(b.inputs.evidence_refs)) {
      errors.push('inputs.evidence_refs is required (array)');
    } else if (b.inputs.evidence_refs.length === 0) {
      warnings.push('inputs.evidence_refs is empty (no evidence provided)');
    }

    if (!b.inputs.requested_action || typeof b.inputs.requested_action !== 'string') {
      errors.push('inputs.requested_action is required (string)');
    }
  }

  // Governing rules validation
  if (!b.governing_rules || typeof b.governing_rules !== 'object') {
    errors.push('governing_rules is required (object)');
  } else {
    if (!b.governing_rules.rulebook_id) {
      errors.push('governing_rules.rulebook_id is required');
    }
    if (!b.governing_rules.rulebook_version) {
      errors.push('governing_rules.rulebook_version is required');
    }
    if (!b.governing_rules.rule_hash || !b.governing_rules.rule_hash.startsWith('sha256:')) {
      errors.push('governing_rules.rule_hash is required (must start with sha256:)');
    }
  }

  // Authority validation
  if (!b.authority || typeof b.authority !== 'object') {
    errors.push('authority is required (object)');
  } else {
    if (!b.authority.actor_id) {
      errors.push('authority.actor_id is required');
    }
    if (!b.authority.proof_ref || !b.authority.proof_ref.startsWith('sha256:')) {
      errors.push('authority.proof_ref is required (must start with sha256:)');
    }
  }

  // Determinism contract validation
  if (!b.determinism_contract || typeof b.determinism_contract !== 'object') {
    errors.push('determinism_contract is required (object)');
  } else {
    if (!Array.isArray(b.determinism_contract.allowed_outputs)) {
      errors.push('determinism_contract.allowed_outputs is required (array)');
    } else {
      const validOutputs: AllowedOutput[] = ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'];
      for (const output of b.determinism_contract.allowed_outputs) {
        if (!validOutputs.includes(output as AllowedOutput)) {
          errors.push(`Invalid allowed_output: ${output}. Must be one of: ${validOutputs.join(', ')}`);
        }
      }
    }

    if (typeof b.determinism_contract.no_defaults !== 'boolean') {
      errors.push('determinism_contract.no_defaults is required (boolean)');
    }

    if (typeof b.determinism_contract.require_evidence !== 'boolean') {
      errors.push('determinism_contract.require_evidence is required (boolean)');
    }

    if (typeof b.determinism_contract.byte_identical_replay !== 'boolean') {
      errors.push('determinism_contract.byte_identical_replay is required (boolean)');
    }
  }

  // Governance binding validation
  if (!b.governance_binding || typeof b.governance_binding !== 'object') {
    errors.push('governance_binding is required (object)');
  } else {
    if (!b.governance_binding.genesis_hash || !b.governance_binding.genesis_hash.startsWith('sha256:')) {
      errors.push('governance_binding.genesis_hash is required (must start with sha256:)');
    }
    if (!b.governance_binding.authority_role) {
      errors.push('governance_binding.authority_role is required');
    }
    if (!b.governance_binding.policy_version) {
      errors.push('governance_binding.policy_version is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
