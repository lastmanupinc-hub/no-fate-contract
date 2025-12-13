# DBGO Action Space - Complete Implementation

## Action Space Status: COMPLETE

**EXACTLY 8 VALID MOVES - NO MORE, NO LESS**

All actions produce deterministic outcomes with explicit fail states.

---

## System State (Read-Only)

```typescript
{
  system_state: 'OPERATIONAL',
  governance_state: 'CLOSED_UNDER_CONSTITUTION',
  authority_state: 'DISTRIBUTED',
  mutation_allowed: false,
  supersession_required_for_change: 'ALL_MUTATIONS'
}
```

---

## Valid Actions (EXHAUSTIVE)

### 1. ISSUE_EXTERNAL_CERTIFICATE

**Purpose**: Issue certificate for external domain evaluation

**Preconditions**:
- Intent must be valid CanonicalIntentBundle
- Facts must exist in intent
- Evidence references must exist

**Deterministic Fail States**:
- Intent malformed → `INVALID_INPUT`
- Missing facts → `INDETERMINATE`
- Missing evidence → `INDETERMINATE`
- Solver divergence → `INDETERMINATE`
- Rule violation proven → `FAIL`

**Success Condition**: All solvers agree, policies compliant → `PASS`

**Route**: Intent → Harness → 4 Solvers → Policy Enforcement → Certificate

---

### 2. PUBLISH_REFUSAL_CASE

**Purpose**: Publish refusal case for replay verification (no narrative)

**Preconditions**:
- Certificate must exist
- Outcome must be unmodified (PASS/FAIL/INDETERMINATE/INVALID_INPUT)
- No narrative argument permitted

**Deterministic Fail States**:
- Outcome modified → `INVALID`
- Narrative added → `INVALID`
- Replay artifact missing → `INVALID`

**Success Condition**: Certificate valid, no narrative, replay artifacts present → `PASS`

**Enforcement**: DISPUTE_RESOLUTION_POLICY - replay-based only

---

### 3. INDEPENDENT_REPLAY_VERIFICATION

**Purpose**: Verify determinism via independent replay

**Preconditions**:
- Original intent must exist
- Expected hash must exist

**Deterministic Fail States**:
- Hash mismatch → `FAIL` (SYSTEM INVALIDATION)
- Missing artifacts → `INDETERMINATE`
- Solver divergence → `INDETERMINATE`

**Success Condition**: Replay hash matches expected hash → `PASS`

**Critical**: Hash mismatch indicates non-determinism or tampering

---

### 4. PROPOSE_RULEBOOK

**Purpose**: Propose new rulebook (append-only, no mutation)

**Preconditions**:
- Proposal must be well-formed
- Rulebook content must exist
- Must NOT be mutation attempt

**Deterministic Fail States**:
- Mutation attempt → `FAIL`
- Internal inconsistency → `FAIL`
- Ambiguous semantics → `INDETERMINATE`
- Malformed proposal → `INVALID_INPUT`

**Success Condition**: Proposal valid, no mutation, no inconsistency → `PASS`

**Enforcement**: CONTROLLED_SUPERSESSION_POLICY - append-only

---

### 5. SUPERSEDE_RULEBOOK

**Purpose**: Supersede existing rulebook (version progression, no retroactive change)

**Preconditions**:
- Supersession request must exist
- Prior version lineage must exist
- Effective date must not be in past

**Deterministic Fail States**:
- Missing lineage → `FAIL`
- Retroactive change → `FAIL`
- Ambiguous supersession → `INDETERMINATE`

**Success Condition**: Lineage valid, no retroactive change, clear reason → `PASS`

**Enforcement**: CONTROLLED_SUPERSESSION_POLICY - append-only lineage

---

### 6. DISPUTE_REPLAY

**Purpose**: Resolve dispute via deterministic replay (no narrative)

**Preconditions**:
- Dispute must exist
- Original intent must exist
- NO narrative argument permitted

**Deterministic Fail States**:
- Replay mismatch → `FAIL` (dispute upheld)
- Missing evidence → `INDETERMINATE`
- Narrative argument introduced → `INVALID`

**Success Condition**: Replay matches disputed outcome → `PASS` (dispute rejected)

**Enforcement**: DISPUTE_RESOLUTION_POLICY - replay-based only

---

### 7. REGISTER_SOLVER

**Purpose**: Register new competing solver (no special authority)

**Preconditions**:
- Solver metadata must exist
- Test cases must exist for verification
- NO privileged authority requested

**Deterministic Fail States**:
- Output divergence → `INDETERMINATE`
- Non-determinism detected → `INDETERMINATE`
- Privileged authority requested → `FAIL`

**Success Condition**: Deterministic, equivalent to existing solvers, no privilege → `PASS`

**Enforcement**: COMPETING_SOLVERS_POLICY - no special authority

---

### 8. ATTEST_SOLVER_EQUIVALENCE

**Purpose**: Attest byte-identical equivalence across all solvers

**Preconditions**:
- Test suite must exist

**Deterministic Fail States**:
- Any byte mismatch → `INDETERMINATE`
- Partial equivalence → `INDETERMINATE`

**Success Condition**: Byte-identical outputs across entire test suite → `PASS`

**Enforcement**: COMPETING_SOLVERS_POLICY - byte-identical outputs required

---

## Allowed Outcomes (EXHAUSTIVE)

Every action produces exactly one of:
- `PASS`: Success, deterministic, compliant
- `FAIL`: Explicit failure condition met
- `INDETERMINATE`: Ambiguity, divergence, or incomplete evidence
- `INVALID_INPUT`: Malformed input or schema violation
- `INVALID`: Forbidden operation attempted

NO other outcomes possible.

---

## Forbidden Operations (ALWAYS INVALID)

1. **ADD_NINTH_MOVE**: Adding any action beyond the 8 defined
2. **REFACTOR_INTERFACE**: Modifying action signatures without supersession
3. **INTRODUCE_HEURISTIC**: Adding non-deterministic logic
4. **COLLAPSE_AMBIGUITY**: Resolving ambiguity without evidence
5. **OVERRIDE_REFUSAL**: Bypassing fail states
6. **GRANT_SOLVER_PRIVILEGE**: Giving special authority to any solver
7. **SILENT_RULE_CHANGE**: Mutating rules without supersession workflow

Attempting any forbidden operation returns `INVALID` and halts.

---

## Global Enforcement Rules

### Competing Solver Harness (PRIMARY)
- All moves route through competing solver harness (where applicable)
- Byte-identical outputs REQUIRED
- ANY divergence forces INDETERMINATE
- NO solver bypass possible

### Policy Enforcement (SECONDARY)
- All four governance policies checked on every certificate
- CRITICAL violations force INDETERMINATE outcome override
- Policy compliance tracked in every certificate

### Replay Determinism (TERTIARY)
- All state transitions replayable from genesis
- Replay hash verification enforced
- Hash mismatch = SYSTEM INVALIDATION

---

## Usage Examples

### Example 1: Issue External Certificate
```typescript
import { executeAction } from './dbgo/actions';

const result = executeAction('ISSUE_EXTERNAL_CERTIFICATE', {
  intent: {
    intent_type: 'DOMAIN_EVALUATION',
    domain: 'tax',
    intent_id: 'intent-001',
    version: '1.0.0',
    inputs: {
      facts: { /* ... */ },
      evidence_refs: ['doc:1', 'doc:2'],
      requested_action: 'CLASSIFY_INCOME'
    },
    // ... rest of CanonicalIntentBundle
  }
});

// result.outcome: PASS | FAIL | INDETERMINATE | INVALID_INPUT
// result.certificate: CertificateIR (if successful)
// result.deterministic: true (always)
// result.replayable: true (always)
```

### Example 2: Dispute Replay (No Narrative)
```typescript
const result = executeAction('DISPUTE_REPLAY', {
  dispute: {
    original_intent: { /* CanonicalIntentBundle */ },
    disputed_outcome: 'FAIL',
    disputed_certificate_id: 'cert-123',
    // NO narrative_justification allowed
  }
});

// If replay matches: outcome = PASS (dispute rejected)
// If replay differs: outcome = FAIL (dispute upheld, original cert INVALID)
// If narrative added: outcome = INVALID
```

### Example 3: Register Solver (No Privilege)
```typescript
const result = executeAction('REGISTER_SOLVER', {
  solver_metadata: {
    solver_id: 'dbgo-independent-D',
    solver_version: '1.0.0',
    privileged: false, // MUST be false
    special_authority: false // MUST be false
  },
  test_cases: [
    { intent: {/*...*/}, expected_outcome: 'PASS' },
    { intent: {/*...*/}, expected_outcome: 'FAIL' }
  ]
});

// Tests run twice to verify determinism
// Tests run through harness to verify equivalence
// outcome = PASS only if deterministic AND equivalent
```

---

## Verification Checklist

✅ **Exactly 8 valid actions exist** - Verified via `verifyActionSpaceCompleteness()`  
✅ **Every action has deterministic fail states** - Documented and implemented  
✅ **No discretionary pathways exist** - All outcomes determined by preconditions  
✅ **Competing solver enforcement is primary** - All domain evaluations route through harness  
✅ **Replay determinism is preserved** - All actions produce replayable results  
✅ **No authority expansion occurred** - No action grants special authority  

---

## Conformance

This action space conforms to:
- **COMPETING_SOLVERS_POLICY** v1.0.0: All domain evaluations through harness
- **DISPUTE_RESOLUTION_POLICY** v1.0.0: Replay-based only, no narrative
- **CONTROLLED_SUPERSESSION_POLICY** v1.0.0: Append-only, lineage preserved
- **DECENTRALIZED_OPERATIONS_POLICY** v1.0.0: Distributed authority, no single point

---

## Genesis Binding

All actions bound to genesis hash:
```
sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
```

---

**Implementation Date**: 2025-12-13  
**Status**: COMPLETE  
**Action Count**: 8 (EXHAUSTIVE)  
**Forbidden Operations**: 7 (enforced)  
**Determinism**: GUARANTEED  
**Authority**: DISTRIBUTED
