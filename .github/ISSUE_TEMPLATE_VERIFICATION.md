Title: Verification Request: Independent DCG-0 Re-implementation (Point Two)

Body:
---

## Public Re-implementation Verification: DCG-0 (Diamond Clarity, Point Two)

Point Two (Diamond Clarity / DCG-0) is frozen at tag:

`point-two-diamond-clarity-dcg-0`

This issue invites **independent re-implementations for verification only**.

### Scope (immutable)
- Spec: `POINTS/point-two/SPEC/DCG-0-SPEC.md`
- Reference canonical artifact: `POINTS/point-two/PROOF/reference_coa0.canonical.json`
- Reference hash: `POINTS/point-two/PROOF/reference_coa0.sha256`

### Task
Re-implement DCG-0 in any language and demonstrate:

1. Given the reference canonical input:
   - Outcome is `ACCEPT`
   - Canonical output bytes are identical
   - SHA-256 matches the reference exactly
2. Given invalid inputs:
   - Outcome is `REFUSE` with an enumerated reason
3. Re-running with the same input yields identical output.

### Rules
- Do not modify the spec.
- Do not modify the reference artifact.
- Do not add behavior.
- Do not relax constraints.
- If the hash differs, the implementation is non-compliant.

### Submission
Please include:
- Language and runtime
- Command used
- Output JSON
- SHA-256 result

Matching hash = compliant.  
Non-matching hash = non-compliant.

No improvements, extensions, or changes are in scope.
