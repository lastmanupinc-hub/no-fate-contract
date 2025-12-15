# nofate

## Diamond Clarity (Point Two) — Public Re-implementation Verification

Point Two (Diamond Clarity / DCG-0) is frozen at tag:

`point-two-diamond-clarity-dcg-0`

We invite independent re-implementations **for verification only**.

Scope is fixed and immutable:
- `POINTS/point-two/SPEC/DCG-0-SPEC.md`
- `POINTS/point-two/PROOF/reference_coa0.canonical.json`
- `POINTS/point-two/PROOF/reference_coa0.sha256`

**Task**
Re-implement DCG-0 in any language and demonstrate:
- ACCEPT on the reference canonical input
- Byte-identical canonical output
- Exact match to the reference SHA-256

If the hash differs, the implementation is non-compliant.

No improvements, extensions, or changes are in scope.

## Principles

This repository follows a strict **three-ring structure** to ensure immutability, verifiability, and clear separation of concerns.

### The Three Rings

```
LAW → PROOF → IMPLEMENTATIONS
 ↑      ↑           ↑
 │      │           └─── executable code
 │      └───────────── verification & attestation
 └──────────────────── immutable foundations
```

### Import Rules (CRITICAL)

1. **LAW never imports PROOF** - Law defines principles, not verifications
2. **PROOF never imports IMPLEMENTATIONS** - Proof verifies code without executing it
3. **Only outward references allowed** - implementations may reference proof, proof may reference law

### Directory Structure

- **LAW/**: Immutable reference documents (IF-v0.md, GH-v0.md)
- **POINTS/**: Specific implementation points
  - Each point has SPEC/, PROOF/, and IMPLEMENTATIONS/
- **WORK/**: Experimental/unfrozen work (can be messy)

### Immutability Guarantees

- Files in LAW/ are frozen once published
- PROOF/ artifacts are cryptographically anchored
- Version increments (v0 → v1) for any changes to frozen content

## Working with nofate

1. Start in WORK/ for experiments
2. Formalize specifications in POINTS/*/SPEC/
3. Create proofs in POINTS/*/PROOF/
4. Implement in POINTS/*/IMPLEMENTATIONS/
5. Reference immutable laws in LAW/
