# Point Two

## Human Explanation

This point implements DCG-0, a foundational component of the system.

## Structure

- **SPEC/**: Contains the formal specification (DCG-0-SPEC.md)
- **PROOF/**: Contains cryptographic proofs and verification artifacts
  - Never imports from IMPLEMENTATIONS
  - Provides verification that implementations conform to SPEC
- **IMPLEMENTATIONS/**: Contains executable implementations
  - Python: `dcg-0.py`
  - JavaScript: `dcg-0.js`

## Three-Ring Principle

1. **LAW** (../../LAW/): Immutable foundations - never imports proof or implementations
2. **PROOF** (PROOF/): Verification layer - never imports implementations
3. **IMPLEMENTATIONS** (IMPLEMENTATIONS/): Executable code - verified by proof

Each ring only references inward (implementations → proof → law), never outward.
