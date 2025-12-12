# No Fate Self-Attestation of Conformance

**NFCS Version:** v1.0.0  
**Conformance Level:** [ ] A  [ ] B  
**System Name:** _____________________  
**System Version:** _____________________  
**Operator / Publisher:** _____________________  
**Date:** _____________________  
**Repository / Deployment URL:** _____________________

---

## 1. Conformance Claim

I attest that the System named above conforms to **NFCS v1.0.0** at the stated conformance level, as evidenced by the NFCTS results linked below.

This attestation is made in accordance with the No Fate Compliance Specification and represents a technical claim about boundary behavior and refusal semantics.

---

## 2. Required Declarations

Provide links to published declarations:

- **Scope Declaration:** _____________________
- **Input Declaration:** _____________________
- **Output Declaration:** _____________________
- **Conformance Claim Statement:** _____________________
- **NFCTS Results Evidence:** _____________________

---

## 3. Test Results Summary

### Level A Tests (Required for all conformance claims)

| Test ID | Test Name | Status | Evidence Location |
|---------|-----------|--------|-------------------|
| A1 | Scope Declaration Present | [ ] PASS [ ] FAIL | _____ |
| A2 | Repeatability | [ ] PASS [ ] FAIL | _____ |
| A3 | No Hidden Context | [ ] PASS [ ] FAIL | _____ |
| A4 | Refusal First-Class | [ ] PASS [ ] FAIL | _____ |
| A5 | Refusal on Ambiguity | [ ] PASS [ ] FAIL | _____ |
| A6 | Refusal Includes Code + Reason | [ ] PASS [ ] FAIL | _____ |
| A7 | No Advice/Adjudication | [ ] PASS [ ] FAIL | _____ |
| A8 | No Intent Inference | [ ] PASS [ ] FAIL | _____ |
| A9 | I/O Declaration Present | [ ] PASS [ ] FAIL | _____ |
| A10 | Version Claim | [ ] PASS [ ] FAIL | _____ |

**Level A Result:** [ ] ALL PASS (Conformant) [ ] ANY FAIL (Non-Conformant)

### Level B Tests (Required only for Level B claims)

| Test ID | Test Name | Status | Evidence Location |
|---------|-----------|--------|-------------------|
| B1 | Decision Logging | [ ] PASS [ ] FAIL [ ] N/A | _____ |
| B2 | Tamper Evidence | [ ] PASS [ ] FAIL [ ] N/A | _____ |
| B3 | Sensitive Data Minimization | [ ] PASS [ ] FAIL [ ] N/A | _____ |

**Level B Result:** [ ] ALL PASS (Conformant) [ ] ANY FAIL (Non-Conformant) [ ] N/A

---

## 4. Evidence Artifacts

Attach or link to the following evidence:

### Level A Evidence
- [ ] Scope Declaration document
- [ ] Input Declaration document
- [ ] Output Declaration document
- [ ] Sample Allowed output (JSON or equivalent)
- [ ] Sample Refusal output (JSON or equivalent)
- [ ] Repeatability test outputs (A2)
- [ ] Ambiguity refusal test output (A5)
- [ ] Authority boundary refusal test output (A7)

### Level B Evidence (if claiming Level B)
- [ ] Sample decision log entries
- [ ] Tamper-evidence verification (hash chain or write-once proof)
- [ ] Sensitive data minimization demonstration

---

## 5. System Description

**Brief Description of System:**  
(Describe what the system does, its deterministic scope, and its refusal behavior)

_____________________  
_____________________  
_____________________

**Deterministic Domains Covered:**  
(List specific domains where system operates deterministically)

_____________________  
_____________________

**Out-of-Scope Domains:**  
(List domains explicitly excluded from system's deterministic operations)

_____________________  
_____________________

---

## 6. Continuous Conformance Commitment

The operator commits to:

- [ ] Re-run NFCTS on MAJOR/MINOR version changes
- [ ] Maintain public access to declarations
- [ ] Update conformance claim if conformance status changes
- [ ] Notify users if conformance is lost

---

## 7. Non-Authority Statement

This conformance claim is **not** legal advice, adjudication, or certification. It is a technical claim about boundary behavior and refusal semantics as defined in NFCS v1.0.0.

Conformance to NFCS does not guarantee:
- Legal compliance
- Regulatory approval
- Absence of bias
- Fitness for any particular purpose

Users must independently evaluate suitability for their use cases.

---

## 8. Signature

**Name:** _____________________  
**Role/Title:** _____________________  
**Organization:** _____________________  
**Email:** _____________________  
**Date:** _____________________

**Signature (typed or cryptographic):**

_____________________

---

## 9. Third-Party Audit (Optional)

If this attestation has been verified by a third-party auditor:

**Auditor Name:** _____________________  
**Audit Date:** _____________________  
**Audit Report:** _____________________  
**Auditor Signature:** _____________________

---

## 10. Change Log

| Date | Version | Change Description | Attestor |
|------|---------|-------------------|----------|
| | | Initial attestation | |
| | | | |

---

**Template Version:** v1.0.0  
**Template Source:** https://github.com/lastmanupinc-hub/no-fate-contract/blob/main/compliance/SELF_ATTESTATION_TEMPLATE_v1.0.0.md

---

© 2025 No Fate Project. Licensed under CC BY-ND 4.0.
