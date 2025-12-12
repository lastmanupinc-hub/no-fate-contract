# No Fate Compliance Infrastructure

This directory contains templates, examples, and tools for claiming NFCS (No Fate Compliance Specification) conformance.

---

## What's Here

### Canonical Specifications (../canonical/)
- **NFCS_v1.0.0.md**: Normative requirements for conformance (MUST/MUST NOT/SHOULD)
- **NFCTS_v1.0.0.md**: Test suite defining PASS/FAIL criteria

### Templates (this directory)
- **SELF_ATTESTATION_TEMPLATE_v1.0.0.md**: Fill this out to claim conformance
- **scope-declaration.example.md**: Template for defining deterministic scope
- **input-declaration.example.md**: Template for declaring inputs used
- **output-declaration.example.md**: Template for declaring output schemas

### Test Cases (../tests/nfcts/)
- JSON test cases for validating conformance
- Sample implementations of NFCTS tests
- Evidence artifact examples

---

## How to Claim Conformance

### Step 1: Implement Requirements

Build your system to satisfy NFCS requirements:

**Level A (Boundary-Conformant):**
- Define deterministic scope explicitly
- Implement refusal as first-class output
- Ensure repeatability (same inputs → same outputs)
- No hidden context or probabilistic guessing
- Refuse on ambiguity, missing inputs, authority boundaries
- No legal advice, adjudication, or intent inference

**Level B (Audit-Conformant):**
- All Level A requirements PLUS:
- Append-only decision logging
- Tamper-evident logs (hash chaining or write-once storage)
- Sensitive data minimization in logs

---

### Step 2: Create Declarations

Using the templates in this directory, create:

1. **Scope Declaration**: What's in scope (deterministic) and out of scope (nondeterministic)
2. **Input Declaration**: ALL inputs your system uses for boundary decisions
3. **Output Declaration**: Schemas for Allowed and Refusal outputs

Publish these declarations publicly (in your repo or documentation).

---

### Step 3: Run NFCTS Tests

Execute all applicable tests from `../tests/nfcts/`:

- **Level A**: Tests A1-A10 (all must PASS)
- **Level B**: Tests A1-A10 + B1-B3 (all must PASS)

Record evidence artifacts:
- Test outputs (JSON)
- Execution logs
- Comparison results

---

### Step 4: Complete Self-Attestation

Fill out `SELF_ATTESTATION_TEMPLATE_v1.0.0.md`:

- System name and version
- Conformance level (A or B)
- Links to declarations
- Test results (PASS/FAIL table)
- Evidence artifacts
- Signature

---

### Step 5: Publish

Publish your completed self-attestation:

- In your repository (e.g., `/compliance/self-attestation.md`)
- On your website or documentation site
- Linked from your product pages

---

## Permitted Conformance Claims

✅ **Allowed claims:**
- "Uses the No Fate Contract" (non-conformance claim)
- "NFCS v1.0.0 Level A Conformant"
- "NFCS v1.0.0 Level B Conformant"

❌ **Prohibited claims:**
- "No Fate Certified" (no certification authority exists yet)
- "Legally compliant" (NFCS is not legal compliance)
- "Bias-free" (outside scope of NFCS)

---

## Third-Party Audits (Optional)

Self-attestation is the default model. Third-party audits are optional.

**If seeking third-party audit:**
1. Complete self-attestation first
2. Provide auditor access to:
   - System for testing
   - Declarations
   - Source code (if agreed)
   - Execution logs (Level B)
3. Auditor runs NFCTS independently
4. Auditor signs attestation document

---

## Versioning and Updates

When your system changes:

- **MAJOR version change**: Re-run full NFCTS
- **MINOR version change**: Re-run full NFCTS
- **PATCH version change**: Re-run A2 (repeatability) minimum
- **NFCS spec update**: Re-run full NFCTS against new spec

---

## Questions?

- **Specification questions**: See `/canonical/NFCS_v1.0.0.md`
- **Test questions**: See `/canonical/NFCTS_v1.0.0.md`
- **Template questions**: See examples in this directory
- **Implementation help**: See `/docs/` for integration guides

---

## Example: Filling Out Scope Declaration

```markdown
# Scope Declaration

**System Name:** My Legal Deadline Calculator
**Version:** 1.0.0
**NFCS Target:** v1.0.0 Level A

## IN SCOPE
- Federal civil procedure deadline calculations (FRCP Rules 6, 12, 56)
- Deterministic date arithmetic (business days, calendar days)
- Holiday exclusions per explicit holiday list

## OUT OF SCOPE
- Legal advice on whether to file motions
- Interpretation of "excusable neglect"
- Prediction of court decisions on extension requests
- State-specific procedure rules
```

---

## Example: Filling Out Self-Attestation

```markdown
# No Fate Self-Attestation of Conformance

**NFCS Version:** v1.0.0
**Conformance Level:** [x] A  [ ] B
**System Name:** My Legal Deadline Calculator
**System Version:** 1.0.0
**Date:** 2025-12-12

## Test Results
| Test | Status | Evidence |
|------|--------|----------|
| A1   | PASS   | /compliance/scope-declaration.md |
| A2   | PASS   | /tests/results/A2-evidence.json |
...

## Signature
Name: John Smith
Role: Lead Developer
Signature: [signed electronically]
```

---

© 2025 No Fate Project. Licensed under CC BY-ND 4.0.
