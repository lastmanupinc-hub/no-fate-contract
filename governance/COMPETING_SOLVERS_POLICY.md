# Competing Solvers Policy

**Version**: 1.0.0  
**Status**: SPEC_COMPLETE  
**Governance Binding**:
```json
{
  "genesis_hash": "sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a",
  "authority_role": "solver-authority",
  "binding_status": "BOUND",
  "policy_type": "solver_pluralism"
}
```

---

## Objective

**No single implementation defines truth.**

Multiple solvers/engines implement the same No-Fate contract. All must pass the same audits. No solver gets special authority.

---

## Pluralism Without Chaos

### Core Principle

**Diversity in implementation, identity in results.**

Any organization, team, or individual MAY implement a No-Fate solver. No permission required. No blessing needed. No certification gatekeeping.

**BUT**: All solvers claiming conformance MUST pass identical conformance tests.

---

## Solver Registration (Optional)

Solvers MAY register with governance for discoverability, but registration is NOT required for legitimacy.

### Registration Artifact

```json
{
  "solver_id": "unique-solver-identifier",
  "solver_name": "Human-readable name",
  "solver_version": "1.0.0",
  "implementation_language": "Python|Rust|JavaScript|etc",
  "maintainer": "Organization or individual",
  "repository": "https://github.com/org/solver",
  "conformance_test_results": {
    "test_suite_version": "1.0.0",
    "test_suite_hash": "sha256:...",
    "passed": 142,
    "failed": 0,
    "indeterminate": 0,
    "test_run_timestamp": "2025-12-13T00:00:00Z",
    "test_run_reproducible": true
  },
  "audit_attestations": [
    {
      "attestation_id": "avery-001",
      "auditor": "Independent auditor name",
      "audit_date": "2025-12-13",
      "attestation_hash": "sha256:...",
      "result": "CONFORMANT"
    }
  ]
}
```

### Registration Process

1. Implement solver according to No-Fate Contract v1.0.0
2. Run NFCTS (No-Fate Conformance Test Suite)
3. Publish test results with reproducible inputs
4. Submit registration artifact to governance repository
5. Governance verifies test results are reproducible
6. Solver listed in `SOLVER_REGISTRY.json`

**Critical**: Registration is for **discovery only**. An unregistered solver that passes conformance tests is equally legitimate.

---

## Conformance Testing

### Test Suite Authority

The canonical conformance test suite is maintained under `solver-authority` role.

**Test Suite Location**: `tests/conformance/nfcts-v1.0.0/`

**Test Suite Hash**: Published in governance baseline

### Test Categories

1. **Bundle Validation Tests**
   - Schema conformance
   - Constraint satisfaction
   - Input validation

2. **Output Production Tests**
   - Deterministic plan generation
   - Boundary detection
   - Refusal correctness

3. **Emergy Generation Tests**
   - Decision trace completeness
   - WHY interface compliance
   - Replay reproducibility

4. **Attestation Tests**
   - Signature verification
   - Cryptographic binding
   - Avery gate compliance

### Test Result Requirements

All conformance tests MUST produce:

```json
{
  "test_id": "unique-test-identifier",
  "test_version": "1.0.0",
  "solver_id": "solver-being-tested",
  "solver_version": "x.y.z",
  "test_inputs": {
    "bundle_hash": "sha256:...",
    "input_closed": true
  },
  "expected_output": {
    "output_hash": "sha256:...",
    "emergy_hash": "sha256:...",
    "result_type": "PASS|FAIL|REFUSE"
  },
  "actual_output": {
    "output_hash": "sha256:...",
    "emergy_hash": "sha256:...",
    "result_type": "PASS|FAIL|REFUSE"
  },
  "test_result": "PASS|FAIL|INDETERMINATE",
  "reproducible": true,
  "execution_timestamp": "2025-12-13T00:00:00Z"
}
```

**PASS**: Actual output matches expected output (byte-identical)  
**FAIL**: Actual output differs from expected output (deterministic difference)  
**INDETERMINATE**: Non-deterministic behavior detected (DISQUALIFYING)

---

## No Special Authority

### Prohibited Claims

No solver MAY claim:

❌ "Official No-Fate solver"  
❌ "Reference implementation"  
❌ "Canonical solver"  
❌ "Endorsed by governance"  

### Permitted Claims

Any solver MAY claim:

✅ "Conformant to No-Fate Contract v1.0.0"  
✅ "Passed NFCTS v1.0.0 (test results: [hash])"  
✅ "Audited by [auditor] on [date] (attestation: [hash])"  

### Governance Neutrality

Governance MUST NOT:

- Recommend one solver over another
- Prioritize registration of specific implementations
- Grant exclusive certification rights
- Create "tiers" of conformance

Governance MUST:

- Maintain conformance test suite
- Publish test suite updates with versioning
- Verify reproducibility of claimed test results
- Maintain solver registry for discovery only

---

## Ambiguity Resolution

### When Solvers Disagree

If two conformant solvers produce different results on identical inputs:

1. **Immediate Action**: Flag test case as ambiguous
2. **Specification Review**: Examine No-Fate Contract for ambiguity
3. **Test Suite Update**: Add test case to NFCTS with explicit expected behavior
4. **Specification Clarification**: Issue errata or new version if specification is ambiguous

### Specification Precedence

The **No-Fate Contract** (canonical markdown) is the ultimate authority.

If a test suite contradicts the contract:
- Test suite is wrong
- Test suite is updated
- Contract is never amended (only superseded)

---

## Success Condition

**Different implementations produce identical results or deterministically fail.**

### Verification Protocol

1. Run identical bundle through Solver A and Solver B
2. Compare output hashes (byte-level)
3. Compare emergy hashes (byte-level)
4. Compare decision traces (structural equivalence)

**PASS**: All hashes match, all traces equivalent  
**FAIL**: Deterministic difference (one solver is non-conformant)  
**INDETERMINATE**: Non-deterministic behavior (both solvers disqualified)

---

## Prevents De-Facto Centralization

### Anti-Monopoly Rules

1. **No reference implementation**: First solver has no special status
2. **No exclusive auditing**: Any auditor may audit any solver
3. **No certification monopoly**: Conformance is self-provable via test results
4. **No required registration**: Legitimacy flows from conformance, not registration

### Forces Clarity in Specs

When multiple teams implement the same specification independently:

- Ambiguities surface immediately
- Implicit assumptions become explicit
- Edge cases are discovered organically
- Specification must be sufficient for interoperability

**This is the test of specification quality.**

---

## Surfaces Ambiguity Early

### Ambiguity Detection Pattern

1. Solver A interprets spec as X
2. Solver B interprets spec as Y
3. Both pass internal tests
4. Cross-validation reveals disagreement
5. Governance issues clarification

**Without competing solvers**: Ambiguity remains hidden until production failure.  
**With competing solvers**: Ambiguity exposed during development.

---

## Evolution Path

### Adding New Solvers

New solvers MAY be added at any time by:

1. Implementing No-Fate Contract vX.Y.Z
2. Running NFCTS vX.Y.Z
3. Publishing reproducible test results
4. (Optional) Registering with governance

No approval required. No gatekeeping.

### Test Suite Versioning

When NFCTS is updated:

- New version number issued
- Old version remains available
- Solvers choose which version to target
- Conformance claims must specify test suite version

**Example Claims**:
- "Conformant to NFCTS v1.0.0"
- "Conformant to NFCTS v1.1.0 (backward compatible with v1.0.0)"

---

## Dispute Resolution

When users dispute which solver is "correct":

1. **Reproduce the dispute**: Provide bundle, expected output, actual outputs
2. **Run conformance tests**: Check both solvers against NFCTS
3. **Replay decision traces**: Verify emergy reproducibility
4. **Compare to specification**: Determine which interpretation is correct

**Resolution is deterministic**: Contract + test suite = truth.

No voting. No committees. No subjective judgment.

---

## Governance Responsibilities

### Solver Authority Role

The `solver-authority` role is responsible for:

1. Maintaining NFCTS (conformance test suite)
2. Publishing test suite updates with versioning
3. Verifying reproducibility of solver test claims
4. Maintaining `SOLVER_REGISTRY.json` (optional registry)
5. Issuing specification clarifications when ambiguity detected

### Prohibited Actions

Solver authority MUST NOT:

- Endorse specific implementations
- Reject conformant solvers from registry
- Create "official" or "reference" implementations
- Grant exclusive certification rights

---

## Supersession Path

This policy may be superseded by:

1. New version with explicit supersession metadata
2. Change proposal approved by governance-authority
3. Append-only history (old policy remains valid historically)

**Supersession example**:
```json
{
  "policy_id": "competing-solvers-policy",
  "version": "2.0.0",
  "supersedes": {
    "policy_version": "1.0.0",
    "policy_hash": "sha256:...",
    "superseded_at": "2026-06-01T00:00:00Z",
    "reason": "Clarify cross-version conformance testing"
  }
}
```

---

## Appendix: Solver Registry Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "registry_version": { "type": "string" },
    "last_updated": { "type": "string", "format": "date-time" },
    "governance_binding": {
      "type": "object",
      "properties": {
        "genesis_hash": { "type": "string" },
        "authority_role": { "type": "string", "const": "solver-authority" }
      }
    },
    "registered_solvers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "solver_id": { "type": "string" },
          "solver_name": { "type": "string" },
          "solver_version": { "type": "string" },
          "conformance_test_version": { "type": "string" },
          "test_results_hash": { "type": "string" },
          "registration_date": { "type": "string", "format": "date" }
        },
        "required": ["solver_id", "solver_version", "conformance_test_version", "test_results_hash"]
      }
    }
  }
}
```

---

**Status**: SPEC_COMPLETE  
**Authority**: solver-authority  
**Supersedes**: None (initial version)  
**Next Version**: TBD (requires change proposal)
