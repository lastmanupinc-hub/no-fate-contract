# No Fate Compliance Specification (NFCS) v1.0.0

**Status:** Canonical  
**License:** CC BY-ND 4.0  
**Effective:** 2025-12-12  
**SHA-256:** [To be computed upon publication]

---

## 0. Purpose

This specification defines conformance requirements for systems claiming adherence to the No Fate deterministic boundary doctrine:

- **Operate only in provably deterministic zones.**
- **Refuse everywhere else.**

NFCS defines what a conforming system **MUST** do, **MUST NOT** do, and **SHOULD** do. It does not provide legal advice, adjudication, prediction, or interpretation.

---

## 1. Definitions

- **System**: The software component(s) making or mediating decisions.
- **Deterministic Zone**: A domain where, given the same declared inputs, the system produces the same declared outputs under the same declared rules.
- **Nondeterministic Zone**: Any domain requiring interpretation, intent inference, value judgment, or external context not captured in declared inputs.
- **Refusal**: A declared outcome indicating the system will not proceed due to nondeterminism, ambiguity, missing inputs, or authority limits.
- **Boundary Decision**: A classification that the requested operation is Allowed (Deterministic) or Refused (Nondeterministic/Out-of-Scope).
- **Authority Boundary**: A rule preventing the system from substituting for human or institutional authority (e.g., adjudication, sentencing, eligibility determinations where law/policy requires human judgment).

---

## 2. Conformance Levels

NFCS defines two conformance levels:

### 2.1 Level A (Boundary-Conformant)

A System conforms to NFCS Level A if it satisfies all requirements labeled **[A-MUST]** and none labeled **[A-MUST-NOT]**.

### 2.2 Level B (Audit-Conformant)

A System conforms to NFCS Level B if it satisfies all Level A requirements plus all requirements labeled **[B-MUST]** and none labeled **[B-MUST-NOT]**.

---

## 3. Normative Requirements

### 3.1 Deterministic Operation

- **NFCS-DO-001 [A-MUST]** The System MUST define its deterministic scope as an explicit, versioned statement (Scope Declaration).
- **NFCS-DO-002 [A-MUST]** For any Allowed operation, the System MUST be repeatable: identical declared inputs under identical declared rules MUST produce identical declared outputs.
- **NFCS-DO-003 [A-MUST-NOT]** The System MUST NOT require undisclosed external context to produce an Allowed output.
- **NFCS-DO-004 [A-SHOULD]** The System SHOULD expose deterministic parameters explicitly (e.g., thresholds, permitted enumerations) when doing so does not enable overreach.

### 3.2 Refusal Semantics

- **NFCS-RF-001 [A-MUST]** The System MUST implement Refusal as a first-class output state (not an error, not a crash).
- **NFCS-RF-002 [A-MUST]** Refusal MUST be produced when:
  - required inputs are missing, or
  - ambiguity prevents deterministic classification, or
  - the request is out of declared scope, or
  - the request crosses an Authority Boundary.
- **NFCS-RF-003 [A-MUST]** Refusal outputs MUST include:
  - a machine-readable refusal code,
  - a human-readable refusal reason (non-advisory),
  - the minimal list of missing/ambiguous inputs (if applicable).
- **NFCS-RF-004 [A-MUST-NOT]** The System MUST NOT "best guess," "most likely," or probabilistically select an Allowed outcome in lieu of Refusal.

### 3.3 Non-Interpretation / Non-Adjudication

- **NFCS-NI-001 [A-MUST]** The System MUST NOT present outputs as legal advice, adjudication, prediction, or authoritative interpretation.
- **NFCS-NI-002 [A-MUST-NOT]** The System MUST NOT infer intent, motive, credibility, or moral judgment as a basis for Allowed outputs.
- **NFCS-NI-003 [A-MUST]** If user prompts request interpretation/adjudication, the System MUST Refuse with an authority/interpretation refusal code.

### 3.4 Input/Output Declaration

- **NFCS-IO-001 [A-MUST]** The System MUST declare the inputs it uses for any boundary decision (Input Declaration).
- **NFCS-IO-002 [A-MUST]** The System MUST declare the output schema (Output Declaration), including Allowed and Refusal forms.
- **NFCS-IO-003 [A-MUST]** The System MUST NOT emit unstated output fields that could be construed as advice or outcome prediction.

### 3.5 Auditability (Level B)

- **NFCS-AU-001 [B-MUST]** The System MUST produce an append-only decision log for all boundary decisions (Allowed/Refused).
- **NFCS-AU-002 [B-MUST]** Each log entry MUST include:
  - timestamp,
  - system version,
  - policy/spec version(s),
  - input hash (or reference),
  - output (Allowed/Refused),
  - refusal code (if refused).
- **NFCS-AU-003 [B-MUST]** Logs MUST be tamper-evident (hash chaining or equivalent) OR externally persisted to a write-once store.
- **NFCS-AU-004 [B-MUST-NOT]** Logs MUST NOT include sensitive raw content unless explicitly configured and permitted by the operator.

### 3.6 Versioning

- **NFCS-VR-001 [A-MUST]** The System MUST declare the NFCS version it conforms to (e.g., NFCS v1.0.0).
- **NFCS-VR-002 [A-MUST]** A "No Fate Compliant" claim MUST reference a specific NFCS version and conformance level (A or B).

---

## 4. Required Declarations

A conforming System MUST publish the following artifacts:

1. **Scope Declaration** (what is in scope; what is out)
2. **Input Declaration** (what inputs are used)
3. **Output Declaration** (Allowed + Refusal schemas)
4. **Conformance Claim** (NFCS version + level)
5. **Test Evidence** (NFCTS results; see NFCTS)

---

## 5. Compliance Claims

### 5.1 Permitted Claims

- "Uses the No Fate Contract" (non-conformance claim)
- "NFCS v1.0.0 Level A Conformant" (requires passing NFCTS Level A)
- "NFCS v1.0.0 Level B Conformant" (requires passing NFCTS Level B)

### 5.2 Prohibited Claims

- "No Fate Certified" (unless a certification authority exists)
- "Legally compliant" (this spec is not legal compliance)
- "Bias-free" (outside scope)
- "Deterministic law outcomes" (outside scope)

---

## 6. Change Control

NFCS uses semantic versioning:

- **MAJOR**: breaking requirement changes
- **MINOR**: additive requirements (backward compatible)
- **PATCH**: clarifications, typos, non-normative edits

**Version History:**
- v1.0.0 (2025-12-12): Initial canonical release

---

## 7. Non-Authority Statement

This specification does not constitute legal advice. Conformance to NFCS does not guarantee legal compliance, regulatory approval, or absence of bias. Systems claiming NFCS conformance are making technical claims about boundary behavior and refusal semantics only.

---

**Document Hash:** [SHA-256 to be computed]  
**GPG Signature:** [To be signed upon publication]  
**Canonical Repository:** https://github.com/lastmanupinc-hub/no-fate-contract  

---

© 2025 No Fate Project. Licensed under CC BY-ND 4.0.
