# Output Declaration

**System Name:** [Your System Name]  
**System Version:** [x.y.z]  
**NFCS Target:** v1.0.0 Level A  
**Declaration Version:** [x.y.z]  
**Effective Date:** [YYYY-MM-DD]

---

## Purpose

This document declares ALL output schemas that the system produces for boundary decisions. This includes both Allowed outputs and Refusal outputs.

This satisfies **NFCS-IO-002** (A-MUST requirement for output declaration).

---

## Output Schema: Allowed Decision

When a boundary decision is Allowed (deterministic classification succeeds), the system outputs:

### JSON Schema

```json
{
  "decision": "ALLOWED",
  "decision_code": "ALLOW_DETERMINISTIC",
  "boundary_classification": {
    "domain": "string (domain name from Scope Declaration)",
    "rule_applied": "string (which deterministic rule was applied)",
    "classification": "string (the deterministic boundary classification)"
  },
  "scope_version": "x.y.z (Scope Declaration version)",
  "nfcs_version": "1.0.0",
  "timestamp": "ISO 8601 timestamp",
  "system_version": "x.y.z"
}
```

### Field Descriptions

- **decision**: Always `"ALLOWED"` for allowed outputs
- **decision_code**: Machine-readable code indicating deterministic classification
- **boundary_classification**: Object containing classification details
  - **domain**: Which deterministic domain (from Scope Declaration) this operates within
  - **rule_applied**: The specific deterministic rule that produced this classification
  - **classification**: The actual boundary classification result
- **scope_version**: Version of Scope Declaration used
- **nfcs_version**: NFCS specification version
- **timestamp**: When decision was made (ISO 8601 format)
- **system_version**: Version of the system that made this decision

### Example Allowed Output

```json
{
  "decision": "ALLOWED",
  "decision_code": "ALLOW_DETERMINISTIC",
  "boundary_classification": {
    "domain": "statutory_deadline_calculation",
    "rule_applied": "calendar_days_rule_45_b_3",
    "classification": "deadline_is_2025-03-15"
  },
  "scope_version": "1.0.0",
  "nfcs_version": "1.0.0",
  "timestamp": "2025-12-12T10:30:00Z",
  "system_version": "1.2.3"
}
```

---

## Output Schema: Refusal Decision

When a boundary decision is Refused (nondeterministic, out of scope, or authority boundary), the system outputs:

### JSON Schema

```json
{
  "decision": "REFUSED",
  "refusal_code": "string (machine-readable refusal reason)",
  "refusal_reason": "string (human-readable explanation)",
  "missing_inputs": ["array of missing input field names"] | null,
  "authority_boundary": "string (description of authority limit)" | null,
  "scope_version": "x.y.z",
  "nfcs_version": "1.0.0",
  "timestamp": "ISO 8601 timestamp",
  "system_version": "x.y.z"
}
```

### Refusal Codes (Enumeration)

The system uses the following machine-readable refusal codes:

- `REFUSE_MISSING_INPUT`: Required inputs are missing
- `REFUSE_AMBIGUOUS_INPUT`: Input is ambiguous, preventing deterministic classification
- `REFUSE_OUT_OF_SCOPE`: Request is outside declared deterministic scope
- `REFUSE_AUTHORITY_BOUNDARY`: Request crosses authority boundary (requires human judgment)
- `REFUSE_INTERPRETATION_REQUIRED`: Request requires legal/policy interpretation
- `REFUSE_NONDETERMINISTIC`: Request is inherently nondeterministic
- `REFUSE_INVALID_INPUT`: Input validation failed

### Field Descriptions

- **decision**: Always `"REFUSED"` for refusal outputs
- **refusal_code**: Machine-readable enum from list above
- **refusal_reason**: Human-readable explanation (non-advisory, factual statement of why refusal occurred)
- **missing_inputs**: Array of input field names that are missing (null if not applicable)
- **authority_boundary**: Description of which authority boundary was crossed (null if not applicable)
- **scope_version**: Version of Scope Declaration used
- **nfcs_version**: NFCS specification version
- **timestamp**: When refusal was made
- **system_version**: Version of the system

### Example Refusal Outputs

**Missing Input:**
```json
{
  "decision": "REFUSED",
  "refusal_code": "REFUSE_MISSING_INPUT",
  "refusal_reason": "Required input 'jurisdiction' is missing. Cannot determine applicable deadline calculation rule without jurisdiction.",
  "missing_inputs": ["jurisdiction"],
  "authority_boundary": null,
  "scope_version": "1.0.0",
  "nfcs_version": "1.0.0",
  "timestamp": "2025-12-12T10:30:00Z",
  "system_version": "1.2.3"
}
```

**Authority Boundary:**
```json
{
  "decision": "REFUSED",
  "refusal_code": "REFUSE_AUTHORITY_BOUNDARY",
  "refusal_reason": "This request requires judicial discretion to determine eligibility. The system cannot substitute for judicial authority.",
  "missing_inputs": null,
  "authority_boundary": "Judicial discretion for eligibility determination",
  "scope_version": "1.0.0",
  "nfcs_version": "1.0.0",
  "timestamp": "2025-12-12T10:30:00Z",
  "system_version": "1.2.3"
}
```

**Interpretation Required:**
```json
{
  "decision": "REFUSED",
  "refusal_code": "REFUSE_INTERPRETATION_REQUIRED",
  "refusal_reason": "This request requires interpretation of ambiguous statutory language. Human legal professional must interpret.",
  "missing_inputs": null,
  "authority_boundary": "Legal interpretation of ambiguous statute",
  "scope_version": "1.0.0",
  "nfcs_version": "1.0.0",
  "timestamp": "2025-12-12T10:30:00Z",
  "system_version": "1.2.3"
}
```

---

## Prohibited Output Fields

The system MUST NOT include the following in outputs:

- **Legal advice** ("You should..." or "I recommend...")
- **Outcome predictions** ("You will likely win..." or "This will probably...")
- **Probability scores** ("This is 85% likely to...")
- **Credibility assessments** ("This person is credible...")
- **Intent inferences** ("They probably meant...")
- **Value judgments** ("This is fair/unfair...")

Any output field not listed in this declaration is prohibited (**NFCS-IO-003**).

---

## Output Consistency

All outputs conform to the declared schemas. There are NO undocumented output fields.

Systems claiming Level B conformance also log these outputs in decision logs with tamper-evidence.

---

## Versioning

**Version History:**
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | [Date] | Initial output declaration |

**Update Policy:**
- MAJOR version: Breaking changes to output schema
- MINOR version: New optional output fields added
- PATCH version: Clarifications, example updates

---

## Conformance

This Output Declaration satisfies **NFCS-IO-002** and **NFCS-IO-003** (A-MUST requirements).

---

**Document Hash:** [SHA-256 to be computed]  
**Published:** [URL or repository location]

---

© 2025 [Your Organization]. Licensed under CC BY-ND 4.0.
