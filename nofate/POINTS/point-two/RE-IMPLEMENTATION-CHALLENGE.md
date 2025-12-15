# Public Re-implementation Challenge: DCG-0 (Diamond Clarity, Point Two)

## Goal
Independently re-implement the DCG-0 acceptance/refusal gateway and verify reproducibility.

## Scope (fixed and frozen)

- **Spec**: DCG-0-SPEC.md
- **Reference canonical artifact**: reference_coa0.canonical.json
- **Reference hash**: reference_coa0.sha256
- **Tag**: point-two-diamond-clarity-dcg-0

## Task
Implement DCG-0 in any language and demonstrate that:

**Given the reference canonical input, your implementation:**
- returns ACCEPT
- produces byte-identical canonical output
- produces the exact reference SHA-256

**Given invalid inputs, your implementation:**
- returns REFUSE with an enumerated reason

**Re-running with the same input yields identical output.**

## Rules

- Do not modify the spec.
- Do not modify the reference artifact.
- Do not add behavior.
- Do not relax constraints.

**If your output hash differs, the implementation is non-compliant.**

## Submission

- Language + runtime
- Command used
- Output JSON
- SHA-256 result

## Outcome

- **Matching hash = compliant**
- **Non-matching hash = non-compliant**

No discussion required.
