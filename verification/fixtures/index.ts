/**
 * DBGO Verification Fixtures
 * 
 * Test fixtures for deterministic verification of competing solver harness.
 * Each fixture tests specific scenario with known expected outcomes.
 */

import { CanonicalIntentBundle } from '../../dbgo/core/types/intent-ir';

/**
 * Fixture 1: Valid Tax Income Classification
 * Expected Outcome: PASS
 */
export const FIXTURE_1_VALID_TAX_INCOME: CanonicalIntentBundle = {
  intent_type: 'DOMAIN_EVALUATION',
  domain: 'tax',
  intent_id: 'fixture-1-valid-tax-income',
  version: '1.0.0',
  inputs: {
    facts: {
      document_count: 2,
      tax_year: '2024',
      income_sources: ['W-2', '1099-INT'],
      total_income: 75000
    },
    evidence_refs: ['doc:w2-2024', 'doc:1099int-2024'],
    requested_action: 'CLASSIFY_INCOME_TYPES'
  },
  governing_rules: {
    rulebook_id: 'irs-tax-income-classification-rulebook',
    rulebook_version: '1.0.0',
    rule_hash: 'sha256:income-classification-rules'
  },
  authority: {
    actor_id: 'test-analyst-001',
    actor_role: 'tax-analyst',
    proof_ref: 'test-request:fixture-1'
  },
  determinism_contract: {
    allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
    no_defaults: true,
    require_evidence: true,
    byte_identical_replay: true
  },
  governance_binding: {
    genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
    authority_role: 'adapter-authority',
    policy_version: '1.0.0'
  }
};

/**
 * Fixture 2: Missing Evidence
 * Expected Outcome: INDETERMINATE
 */
export const FIXTURE_2_MISSING_EVIDENCE: CanonicalIntentBundle = {
  intent_type: 'DOMAIN_EVALUATION',
  domain: 'tax',
  intent_id: 'fixture-2-missing-evidence',
  version: '1.0.0',
  inputs: {
    facts: {
      document_count: 0,
      tax_year: '2024',
      income_sources: []
    },
    evidence_refs: [], // MISSING
    requested_action: 'CLASSIFY_INCOME_TYPES'
  },
  governing_rules: {
    rulebook_id: 'irs-tax-income-classification-rulebook',
    rulebook_version: '1.0.0',
    rule_hash: 'sha256:income-classification-rules'
  },
  authority: {
    actor_id: 'test-analyst-002',
    actor_role: 'tax-analyst',
    proof_ref: 'test-request:fixture-2'
  },
  determinism_contract: {
    allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
    no_defaults: true,
    require_evidence: true,
    byte_identical_replay: true
  },
  governance_binding: {
    genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
    authority_role: 'adapter-authority',
    policy_version: '1.0.0'
  }
};

/**
 * Fixture 3: Invalid Input (Malformed)
 * Expected Outcome: INVALID_INPUT
 */
export const FIXTURE_3_INVALID_INPUT: Partial<CanonicalIntentBundle> = {
  intent_type: 'DOMAIN_EVALUATION',
  domain: 'tax',
  intent_id: 'fixture-3-invalid-input',
  version: '1.0.0',
  // Missing required 'inputs' field
  governing_rules: {
    rulebook_id: 'irs-tax-income-classification-rulebook',
    rulebook_version: '1.0.0',
    rule_hash: 'sha256:income-classification-rules'
  },
  authority: {
    actor_id: 'test-analyst-003',
    actor_role: 'tax-analyst',
    proof_ref: 'test-request:fixture-3'
  },
  determinism_contract: {
    allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
    no_defaults: true,
    require_evidence: true,
    byte_identical_replay: true
  },
  governance_binding: {
    genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
    authority_role: 'adapter-authority',
    policy_version: '1.0.0'
  }
};

/**
 * Fixture 4: Governance Operation - Change Proposal
 * Expected Outcome: PASS
 */
export const FIXTURE_4_GOVERNANCE_CHANGE_PROPOSAL: CanonicalIntentBundle = {
  intent_type: 'GOVERNANCE_OPERATION',
  domain: 'governance',
  intent_id: 'fixture-4-change-proposal',
  version: '1.0.0',
  inputs: {
    facts: {
      proposal_id: 'prop-fixture-4',
      proposed_by: 'contributor-test',
      change_type: 'RULEBOOK',
      target_artifact: 'test-rules-v1',
      target_version: '1.0.0',
      proposed_changes: {
        rule_addition: 'new-test-rule'
      },
      justification: 'Test fixture for verification',
      supersedes_version: null
    },
    evidence_refs: ['doc:proposal-fixture-4'],
    requested_action: 'EVALUATE_CHANGE_PROPOSAL'
  },
  governing_rules: {
    rulebook_id: 'governance-operations-rulebook',
    rulebook_version: '1.0.0',
    rule_hash: 'sha256:change-proposal-rules'
  },
  authority: {
    actor_id: 'contributor-test',
    actor_role: 'proposer',
    proof_ref: 'proposal:prop-fixture-4'
  },
  determinism_contract: {
    allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
    no_defaults: true,
    require_evidence: true,
    byte_identical_replay: true
  },
  governance_binding: {
    genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
    authority_role: 'adapter-authority',
    policy_version: '1.0.0'
  }
};

/**
 * Fixture 5: Governance Operation - Supersession Request
 * Expected Outcome: PASS
 */
export const FIXTURE_5_SUPERSESSION_REQUEST: CanonicalIntentBundle = {
  intent_type: 'GOVERNANCE_OPERATION',
  domain: 'governance',
  intent_id: 'fixture-5-supersession',
  version: '1.0.0',
  inputs: {
    facts: {
      request_id: 'supersession-fixture-5',
      requested_by: 'maintainer-test',
      artifact_id: 'test-rulebook',
      current_version: '1.0.0',
      proposed_version: '1.1.0',
      supersession_reason: 'BUG_FIX',
      backward_compatible: true,
      migration_path: null,
      version_locked: true,
      append_only: true,
      no_mutation: true
    },
    evidence_refs: ['doc:supersession-fixture-5'],
    requested_action: 'EVALUATE_SUPERSESSION_REQUEST'
  },
  governing_rules: {
    rulebook_id: 'controlled-supersession-rulebook',
    rulebook_version: '1.0.0',
    rule_hash: 'sha256:supersession-rules'
  },
  authority: {
    actor_id: 'maintainer-test',
    actor_role: 'supersession-requester',
    proof_ref: 'supersession:supersession-fixture-5'
  },
  determinism_contract: {
    allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
    no_defaults: true,
    require_evidence: true,
    byte_identical_replay: true
  },
  governance_binding: {
    genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
    authority_role: 'adapter-authority',
    policy_version: '1.0.0'
  }
};

/**
 * All Fixtures for Testing
 */
export const ALL_FIXTURES = {
  'fixture-1-valid-tax-income': FIXTURE_1_VALID_TAX_INCOME,
  'fixture-2-missing-evidence': FIXTURE_2_MISSING_EVIDENCE,
  'fixture-3-invalid-input': FIXTURE_3_INVALID_INPUT as CanonicalIntentBundle,
  'fixture-4-change-proposal': FIXTURE_4_GOVERNANCE_CHANGE_PROPOSAL,
  'fixture-5-supersession': FIXTURE_5_SUPERSESSION_REQUEST
};

/**
 * Expected Outcomes per Fixture
 */
export const EXPECTED_OUTCOMES = {
  'fixture-1-valid-tax-income': 'PASS',
  'fixture-2-missing-evidence': 'INDETERMINATE',
  'fixture-3-invalid-input': 'INVALID_INPUT',
  'fixture-4-change-proposal': 'PASS',
  'fixture-5-supersession': 'PASS'
};
