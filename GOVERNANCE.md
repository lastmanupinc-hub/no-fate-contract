# No-Fate Contract Governance Rules

**Version**: 1.0.0  
**Authority**: No Fate Contract (Binding)  
**Effective Date**: December 19, 2025  
**Enforcement**: CI/CD pipeline required

---

## Purpose

This document establishes permanent governance constraints for the No-Fate Contract repository to maintain DETERMINISTIC_COMPLIANCE state.

---

## RULE 1: Verification Singularity

### Statement
**Verification artifacts MUST be singular or explicitly superseded. Multiple active verification reports cause DETERMINISTIC_VIOLATION.**

### Definition
A "verification artifact" is any file in the VERIFICATION zone that:
- Asserts deterministic outcomes
- Claims to verify implementation against specification
- Contains verification results or compliance determinations

### Constraint
At any given time:
1. Exactly ONE verification artifact may be authoritative for a given scope, OR
2. All non-authoritative verification artifacts MUST be explicitly marked as SUPERSEDED with reference to `verification/VERIFICATION_SUPERSESSION_*.json`

### Violation Condition
The repository enters **DETERMINISTIC_VIOLATION** state if:
- Two or more verification artifacts assert outcomes for identical scope
- Neither artifact contains supersession metadata
- No `VERIFICATION_SUPERSESSION` artifact exists to resolve authority

### Required Actions
1. All superseded verification reports MUST have header line:
   ```
   STATUS: SUPERSEDED — see verification/VERIFICATION_SUPERSESSION_v1_0_0.json
   ```

2. All supersession artifacts MUST include:
   - Path and SHA256 of authoritative verification
   - Path and SHA256 of all superseded verifications
   - Authority basis (canonical artifact reference)
   - Decision statement clarifying non-modification of truth
   - Effective date

3. Superseded artifacts MUST be preserved (never deleted, renamed, or content-modified)

### Enforcement
This rule is permanent and enforced by CI. Pipeline MUST fail if verification ambiguity is detected.

---

## RULE 2: Canonical Immutability

### Statement
**Canonical artifacts marked as FROZEN may not be modified without explicit version increment and supersession protocol.**

### Affected Artifacts
- `no-fate-contract_v1.0.0.md` (FROZEN)
- `Deterministic_Map_of_Law_v1_0_0.md` (FROZEN)
- `The_Boundary_Manifesto.md` (FROZEN)
- All schema files in `schemas/` (FROZEN per SCHEMA_FREEZE_NOTICE.md)

### Permitted Actions
- Read-only access
- Reference in derivative documents
- SHA256 verification

### Prohibited Actions
- In-place editing
- Content addition without version increment
- Deletion or renaming

### Exception Protocol
If canonical artifact must be updated:
1. Create new version (e.g., v1.1.0 or v2.0.0 per semver)
2. Update supersession metadata
3. Re-verify all dependent artifacts
4. Mark previous version as superseded
5. Record reason for canonical change (must be substantive, not editorial)

### Violation Response
Unauthorized modification triggers **DETERMINISTIC_VIOLATION** for entire repository.

---

## RULE 3: Prohibited Condition Hygiene

### Statement
**Repository artifacts may not introduce prohibited conditions per No Fate Contract.**

### Prohibited Conditions
1. **Anthropomorphization:** Describing AI systems with human attributes
2. **Guarantees:** Asserting future behavior or outcomes
3. **Advisory Language:** Providing legal, medical, or financial advice
4. **Ambiguity Without Explicit Refusal:** Unclear outcomes without NO_DETERMINISTIC_OUTCOME classification
5. **Authority Without Basis:** Claims of authority without reference to canonical artifacts
6. **Multiple Versions Without Supersession:** Competing artifacts without explicit authority ordering

### Verification Method
All new or modified artifacts MUST be checked for prohibited conditions before merge.

### Violation Response
Pull requests introducing prohibited conditions must be rejected with **DETERMINISTIC_VIOLATION** classification.

---

## RULE 4: Signature Chain Integrity

### Statement
**All authority-bearing artifacts MUST have valid GPG signatures in signatures/ directory.**

### Signature Requirements
1. Detached signature files (`.asc`) for all canonical artifacts
2. Signature verification instructions in VERIFICATION.md
3. Public key availability in `signatures/` directory
4. Key succession protocol documented in KEY_SUCCESSION.md

### Key Authority Chain
- Original Authority (RETIRED): `E5C802E139E7A96FBD1831C053E6B751C1708A73`
- Successor Authority (ACTIVE): `AC078631BEE763111D3F4A972BA98D09A801EF31`

### Verification Command
```powershell
gpg --verify signatures/<artifact>.asc <artifact>
```

### Violation Response
Missing or invalid signatures on authority-bearing artifacts trigger **DETERMINISTIC_VIOLATION**.

---

## RULE 5: CI/CD Enforcement Requirement

### Statement
**All governance rules MUST have automated CI enforcement. Manual compliance checks are insufficient.**

### Required CI Checks
1. **Verification Singularity Check:** Scan for multiple active verification artifacts
2. **Canonical Hash Verification:** Verify frozen artifacts unchanged (SHA256 comparison)
3. **Signature Validation:** Verify GPG signatures on authority-bearing artifacts
4. **Prohibited Condition Scan:** Pattern matching for prohibited language
5. **Supersession Validation:** Verify all superseded artifacts have STATUS header

### Failure Response
If any CI check fails:
- Block merge/deployment
- Report **DETERMINISTIC_VIOLATION** with specific rule violated
- Require manual remediation before retry

### CI Configuration
See `.github/workflows/` for implementation.

---

## Governance Compliance State

**Current State:** DETERMINISTIC_COMPLIANCE (pending CI verification)  
**Enforcement Status:** Active as of December 19, 2025  
**Supersession Reference:** `verification/VERIFICATION_SUPERSESSION_v1_0_0.json`

**Non-Normative Statement:** These governance rules do not change implementation requirements or canonical truth. They establish process constraints to maintain deterministic compliance state and prevent ambiguity.

---

## Amendment Protocol

This governance document may be amended only through:
1. Proposal via pull request
2. Review by governance authority
3. Approval with explicit justification
4. Version increment (v1.0.0 → v1.1.0 or v2.0.0)
5. Supersession of previous version with metadata

Amendments violating No Fate Contract axioms are prohibited.

---

**END OF GOVERNANCE RULES**
