# Dispute Resolution via Replay Policy

**Version**: 1.0.0  
**Status**: SPEC_COMPLETE  
**Governance Binding**:
```json
{
  "genesis_hash": "sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a",
  "authority_role": "auditor-authority",
  "binding_status": "BOUND",
  "policy_type": "dispute_resolution"
}
```

---

## Objective

**Conflicts resolve by replay, not argument.**

Every disputed output declares inputs, version, and solver. Anyone can replay and verify. Disputes end in PASS / FAIL / INDETERMINATE — never debate.

---

## Core Principle

**Social power eliminated. Subjective judgment eliminated. Disputes become boring and fast.**

When two parties disagree about a No-Fate output:

- ❌ NOT: "Let's discuss what it should have done"
- ❌ NOT: "We need an expert to decide"
- ❌ NOT: "Vote on the correct interpretation"
- ✅ YES: "Replay with declared inputs and verify determinism"

---

## Dispute Declaration

### Required Dispute Artifact

Every dispute MUST be declared with:

```json
{
  "dispute_id": "unique-dispute-identifier",
  "dispute_timestamp": "2025-12-13T00:00:00Z",
  "disputed_output": {
    "output_hash": "sha256:...",
    "emergy_hash": "sha256:...",
    "solver_id": "solver-that-produced-output",
    "solver_version": "x.y.z",
    "contract_version": "1.0.0",
    "bundle_hash": "sha256:..."
  },
  "dispute_claim": "INCORRECT_OUTPUT|NON_DETERMINISTIC|CONTRACT_VIOLATION|BOUNDARY_MISSED",
  "dispute_party": {
    "party_id": "disputing-party-identifier",
    "contact": "email or repository"
  },
  "expected_behavior": {
    "description": "What should have happened (text)",
    "expected_output_hash": "sha256:..." // If known
  },
  "replay_inputs": {
    "bundle": "base64-encoded or URL",
    "bundle_hash": "sha256:...",
    "inputs_closed": true
  }
}
```

---

## Replay Protocol

### Step 1: Verify Dispute is Reproducible

Anyone (governance, third party, other solver maintainer) MAY replay:

1. Obtain bundle from `replay_inputs.bundle`
2. Verify bundle hash matches `replay_inputs.bundle_hash`
3. Run bundle through SAME solver (version X.Y.Z)
4. Compare output hash to `disputed_output.output_hash`

**Result**:
- **REPRODUCIBLE**: Same input → same output (deterministic)
- **NON_REPRODUCIBLE**: Same input → different output (non-deterministic, DISQUALIFYING)

---

### Step 2: Run Conformance Test

Run bundle through conformance test suite (NFCTS):

1. Identify applicable test case (or create new one)
2. Compare solver output to test suite expected output
3. Check for contract violations

**Result**:
- **PASS**: Solver output matches expected behavior
- **FAIL**: Solver output violates contract
- **INDETERMINATE**: Test suite does not cover this case (ambiguous specification)

---

### Step 3: Cross-Validation with Other Solvers

Run bundle through ALL registered conformant solvers:

```json
{
  "cross_validation_results": [
    {
      "solver_id": "solver-a",
      "solver_version": "1.0.0",
      "output_hash": "sha256:abc123...",
      "emergy_hash": "sha256:def456...",
      "matches_disputed_output": true
    },
    {
      "solver_id": "solver-b",
      "solver_version": "2.1.0",
      "output_hash": "sha256:abc123...",
      "emergy_hash": "sha256:def456...",
      "matches_disputed_output": true
    },
    {
      "solver_id": "solver-c",
      "solver_version": "1.5.0",
      "output_hash": "sha256:xyz789...",
      "emergy_hash": "sha256:uvw012...",
      "matches_disputed_output": false
    }
  ],
  "consensus": "2 of 3 solvers agree with disputed output",
  "outlier": "solver-c"
}
```

---

### Step 4: Specification Review

If cross-validation reveals disagreement:

1. Review No-Fate Contract (canonical markdown) for relevant clauses
2. Check for ambiguous language
3. Determine which interpretation is correct per contract text

**Contract is the ultimate authority.**

If contract is ambiguous:
- Issue specification errata
- Add test case to NFCTS
- Do NOT amend contract (supersede if necessary)

---

## Dispute Resolution Outcomes

### PASS (Disputed Output is Correct)

**Condition**: Replay confirms output is deterministic AND matches contract.

**Resolution Artifact**:
```json
{
  "dispute_id": "dispute-001",
  "resolution": "PASS",
  "resolution_date": "2025-12-13T12:00:00Z",
  "justification": [
    "Output is deterministic (replay verified)",
    "Output matches NFCTS expected behavior",
    "Output conforms to No-Fate Contract v1.0.0 clause 3.2",
    "Cross-validation: 3/3 conformant solvers agree"
  ],
  "action": "NONE - disputed output is correct"
}
```

---

### FAIL (Disputed Output is Incorrect)

**Condition**: Replay confirms output violates contract or is non-conformant.

**Resolution Artifact**:
```json
{
  "dispute_id": "dispute-002",
  "resolution": "FAIL",
  "resolution_date": "2025-12-13T12:00:00Z",
  "justification": [
    "Output violates No-Fate Contract v1.0.0 clause 2.4 (boundary detection)",
    "NFCTS test case #47 expects REFUSE, solver produced PASS",
    "Cross-validation: 0/3 conformant solvers agree with disputed output"
  ],
  "action": "SOLVER_NON_CONFORMANT",
  "recommended_action": [
    "Solver maintainer must fix implementation",
    "Re-run conformance tests",
    "Issue corrected version"
  ]
}
```

---

### INDETERMINATE (Specification Ambiguous)

**Condition**: Replay confirms determinism, but contract is ambiguous about correct behavior.

**Resolution Artifact**:
```json
{
  "dispute_id": "dispute-003",
  "resolution": "INDETERMINATE",
  "resolution_date": "2025-12-13T12:00:00Z",
  "justification": [
    "Output is deterministic (replay verified)",
    "No-Fate Contract v1.0.0 does not specify behavior for edge case X",
    "Cross-validation: 2/3 solvers produce output A, 1/3 produces output B",
    "Both interpretations are plausible from contract text"
  ],
  "action": "SPECIFICATION_CLARIFICATION_REQUIRED",
  "governance_action": [
    "Issue specification errata or new version",
    "Add test case to NFCTS with explicit expected behavior",
    "Update contract if ambiguity is structural"
  ]
}
```

---

## No Human Arbitration

### Prohibited Resolution Methods

❌ Expert opinion ("I think it should...")  
❌ Committee vote ("Majority says...")  
❌ Authority decree ("I declare that...")  
❌ Precedent ("We've always done it this way...")  
❌ Social consensus ("Everyone agrees that...")  

### Permitted Resolution Methods

✅ Replay verification (deterministic = reproducible)  
✅ Conformance test (matches expected = conformant)  
✅ Contract text (explicit clause = authoritative)  
✅ Cross-validation (multiple solvers = statistical confidence)  
✅ Specification review (ambiguity = requires clarification)  

---

## Making Disputes Boring

### What "Boring" Means

A dispute is boring when:

1. **Fast**: Resolution takes minutes to hours, not weeks
2. **Deterministic**: Same inputs → same resolution
3. **Self-Proving**: No credentials required to verify
4. **Unambiguous**: Outcome is PASS / FAIL / INDETERMINATE, not "it depends"
5. **Reproducible**: Anyone can replay and verify independently

### Why Boring is Good

- ❌ Exciting disputes = social power, arguments, delays
- ✅ Boring disputes = automation, determinism, trust

**Goal**: Disputes should be so mechanical that they're handled by scripts, not humans.

---

## Success Condition

**All disputes end in PASS / FAIL / INDETERMINATE — never debate.**

### Verification Protocol

When a dispute is filed:

1. Declare inputs (bundle, solver, version)
2. Replay output (verify determinism)
3. Run conformance test (check expected behavior)
4. Cross-validate (check other solvers)
5. Review contract (check text authority)
6. Issue resolution (PASS / FAIL / INDETERMINATE)

**Timeline**: Disputes should resolve within 48 hours (automated) or 7 days (requires governance review).

---

## Governance Responsibilities

### Auditor Authority Role

The `auditor-authority` role is responsible for:

1. Maintaining dispute resolution protocol
2. Verifying replay reproducibility
3. Issuing resolution artifacts
4. Escalating INDETERMINATE disputes to governance-authority
5. Updating NFCTS when ambiguities are discovered

### Non-Determinism Detection

If replay reveals non-determinism:

1. Flag solver as non-conformant
2. Notify solver maintainer
3. Remove solver from registry (if registered)
4. Require re-certification after fix

**Non-determinism is disqualifying.**

---

## Dispute Registry

All disputes MUST be logged in `DISPUTE_REGISTRY.json`:

```json
{
  "registry_version": "1.0.0",
  "governance_binding": {
    "genesis_hash": "sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a",
    "authority_role": "auditor-authority"
  },
  "disputes": [
    {
      "dispute_id": "dispute-001",
      "filed_date": "2025-12-13",
      "resolution": "PASS",
      "resolution_date": "2025-12-14",
      "resolution_hash": "sha256:..."
    }
  ]
}
```

---

## Evolution Path

### Handling New Dispute Types

When a new type of dispute emerges:

1. Add dispute category to `dispute_claim` enum
2. Document resolution protocol for new category
3. Update dispute resolution policy (new version)
4. Add test cases to NFCTS if applicable

### Supersession

This policy may be superseded by:

1. New version with explicit supersession metadata
2. Change proposal approved by governance-authority
3. Append-only history (old policy remains valid)

---

## Appendix: Dispute Classification

### INCORRECT_OUTPUT

**Claim**: Solver produced wrong output for given input.

**Resolution**: Replay + conformance test + cross-validation.

### NON_DETERMINISTIC

**Claim**: Solver produces different outputs for identical inputs.

**Resolution**: Multiple replays with identical bundle. If outputs differ, solver is non-conformant (FAIL).

### CONTRACT_VIOLATION

**Claim**: Solver violated specific clause in No-Fate Contract.

**Resolution**: Review contract text, check clause applicability, verify violation.

### BOUNDARY_MISSED

**Claim**: Solver failed to detect boundary condition (false negative).

**Resolution**: Check NFCTS boundary detection tests, verify refusal correctness.

---

**Status**: SPEC_COMPLETE  
**Authority**: auditor-authority  
**Supersedes**: None (initial version)  
**Next Version**: TBD (requires change proposal)
