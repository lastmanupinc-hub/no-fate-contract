# REFUSAL CASE 001: Divergent Solver Outputs (Demonstration)

**Case ID:** `refusal-001-solver-divergence-demo`  
**Date Filed:** 2025-12-13  
**Status:** PUBLISHED (Demonstration Case)  
**Outcome:** INDETERMINATE (Competing Solvers Diverged)

---

## 1. Case Summary

This is the **first published refusal case** under No-Fate governance.

It demonstrates how the system **correctly refuses** to issue a certificate when competing solvers produce non-identical outputs—even when the semantic outcome is the same.

**Key Point:** This refusal is **correct behavior**, not a system failure.

---

## 2. Intent Submitted

```json
{
  "intent_id": "demo-refusal-001",
  "domain": "tax",
  "requested_action": "ISSUE_EXTERNAL_CERTIFICATE",
  "inputs": {
    "facts": {
      "filing_year": 2024,
      "income_reported": 75000,
      "deductions_claimed": 12000,
      "evidence_quality": "complete"
    }
  },
  "determinism_contract": {
    "require_deterministic_outcome": true,
    "require_replay_verification": true,
    "require_competing_solver_consensus": true
  }
}
```

**Expected Outcome:** PASS (valid tax filing)

---

## 3. Solver Execution Results

### Semantic Agreement (All 4 Solvers)
- **dbgo-reference:** PASS
- **dbgo-independent-A:** PASS
- **dbgo-independent-B:** PASS
- **dbgo-independent-C:** PASS

All solvers agreed that the filing was **semantically correct**.

### Byte-Identity Check (Harness)
```
SHA-256 Comparison:
  dbgo-reference:     a1b2c3d4e5f6... (certificate contains solver_id="dbgo-reference")
  dbgo-independent-A: f6e5d4c3b2a1... (certificate contains solver_id="dbgo-independent-A")
  dbgo-independent-B: b2c3d4e5f6a1... (certificate contains solver_id="dbgo-independent-B")
  dbgo-independent-C: e5f6a1b2c3d4... (certificate contains solver_id="dbgo-independent-C")

Result: 4 DIFFERENT hashes detected
```

**Divergence Detected:** Certificates differed in solver-identifying fields:
- `certificate_id` (included solver name)
- `issued_at` (wall-clock timestamp)
- `issuing_authority` (solver name)

---

## 4. Harness Decision

```
COMPETING_SOLVERS_POLICY Violation Detected

Policy Requirement: "All competing solvers MUST produce byte-identical outputs"
Observed Behavior: 4 solvers produced 4 different byte-sequences
Enforcement Level: HARD (no discretion allowed)

DETERMINATION: INDETERMINATE
REASON: Byte-identity violation (solver-specific fields in output)
```

### Evidence Chain
1. ✅ All solvers executed successfully
2. ✅ All solvers produced PASS outcome
3. ✅ All evidence chains match semantically
4. ❌ Certificate byte-sequences differ (SHA-256 mismatch)
5. 🔒 **Competing Solvers Policy enforces HARD refusal**

---

## 5. Why This Is Correct

### The Problem
Even though all solvers **agreed semantically** (PASS), their outputs weren't **byte-identical**.

This violates COMPETING_SOLVERS_POLICY:
> "Outputs must be byte-for-byte identical. Any divergence forces INDETERMINATE."

### Why Byte-Identity Matters
If solvers can embed their own identities in outputs:
- ❌ Outputs aren't comparable
- ❌ Replay verification is ambiguous
- ❌ Dispute resolution becomes "which solver do you trust?"
- ❌ Single authority can emerge

**Byte-identity ensures:** No solver has special authority. All must agree exactly.

### The Refusal
The harness **correctly refused** to issue a certificate because:
1. Outputs diverged (4 different hashes)
2. Policy requires byte-identity (HARD enforced)
3. No discretion allowed (no "but they all agreed!")

**Result:** `INDETERMINATE` (system cannot determine outcome due to solver divergence)

---

## 6. Resolution Applied

The system was corrected to produce truly byte-identical outputs:

### Changes Made (Representational Only)
- `certificate_id`: Changed to `hash(intent)` (deterministic)
- `issued_at`: Changed to `0` (constant)
- `issuing_authority`: Changed to `COMPETING_SOLVER_CONSENSUS` (no single authority)
- `solver_id` field: **REMOVED** from output (violates byte-identity)

### Re-Execution Results
```
SHA-256 Comparison (After Fix):
  dbgo-reference:     57F60E5A8B04FED7D53C117FF900B413DC12BDC44E8441D010ED5143E597849C
  dbgo-independent-A: 57F60E5A8B04FED7D53C117FF900B413DC12BDC44E8441D010ED5143E597849C
  dbgo-independent-B: 57F60E5A8B04FED7D53C117FF900B413DC12BDC44E8441D010ED5143E597849C
  dbgo-independent-C: 57F60E5A8B04FED7D53C117FF900B413DC12BDC44E8441D010ED5143E597849C

Result: 1 IDENTICAL hash
Status: ✅ PASS (byte-identity verified)
```

**New Outcome:** PASS (all solvers byte-identical)

---

## 7. Lessons Demonstrated

### 1. Refusal Is Correctness
The system **correctly refused** when solvers diverged.
This is not a bug—it's **enforcement of the policy**.

### 2. Semantic Agreement ≠ Byte-Identity
All solvers can agree on the answer (PASS) but still violate byte-identity.
**Policy requires both.**

### 3. No Discretion Allowed
The harness cannot say "close enough" or "they basically agree."
**Hard enforcement means hard enforcement.**

### 4. Fixes Must Preserve Semantics
The correction changed **representation only** (timestamps, IDs).
**Zero semantic changes** (outcomes remain identical).

### 5. Transparency Through Refusal
By publishing this case, anyone can see:
- What caused the refusal
- Why it was correct
- How it was resolved

**No hidden failures. No swept-under-rug errors.**

---

## 8. Verification

This case can be independently verified:

### Before Fix (Divergence)
```bash
git checkout 3f37cca  # Before byte-identity fix
node verification/standalone_verify.js
# Observe: 4 different hashes per fixture
```

### After Fix (Byte-Identity)
```bash
git checkout 886f677  # After byte-identity fix
node verification/standalone_verify.js
# Observe: 1 identical hash per fixture
```

### Audit Trail
- **Genesis Hash:** `sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a`
- **Before Commit:** `3f37cca`
- **After Commit:** `886f677`
- **Policy Enforced:** COMPETING_SOLVERS_POLICY v1.0.0

---

## 9. Public Refusal Record

This case is now part of the **permanent governance record**:

```
Refusal Type: COMPETING_SOLVERS_DIVERGENCE
Policy Violated: COMPETING_SOLVERS_POLICY (v1.0.0)
Enforcement Level: HARD
Outcome: INDETERMINATE (correct refusal)
Resolution: Implementation corrected to guarantee byte-identity
Status: RESOLVED (verified 2025-12-13)
```

### Replay Instructions
Any third party can replay this refusal:
1. Clone: `lastmanupinc-hub/no-fate-contract`
2. Checkout: `3f37cca` (before fix)
3. Run verification
4. Observe: Divergent outputs
5. Checkout: `886f677` (after fix)
6. Run verification
7. Observe: Byte-identical outputs

**No trust required. Math only.**

---

## 10. Significance

This demonstrates:
- ✅ Refusal mechanisms work as designed
- ✅ Policies are HARD enforced (no exceptions)
- ✅ Failures are published (not hidden)
- ✅ Corrections are verifiable (cryptographic proof)
- ✅ System cannot be manipulated (competing solvers enforce each other)

**This is how No-Fate governance operates:**
Refuse when uncertain.
Prove when certain.
Hide nothing.

---

**Case Filed By:** COMPETING_SOLVER_CONSENSUS (no single authority)  
**Verification Status:** ✅ Independently Verifiable  
**Publication Date:** 2025-12-13  
**Certificate Binding:** `sha256:9fb552f308595929c4fa474af8f20273fb33d23cd1c5e5dfc29074fef7684b82`

---

**END OF REFUSAL CASE 001**
