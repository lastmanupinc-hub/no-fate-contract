# Input Declaration

**System Name:** [Your System Name]  
**System Version:** [x.y.z]  
**NFCS Target:** v1.0.0 Level A  
**Declaration Version:** [x.y.z]  
**Effective Date:** [YYYY-MM-DD]

---

## Purpose

This document declares ALL inputs that the system uses for boundary decisions. Any input not listed here is NOT used by the system when determining Allowed vs. Refused outcomes.

This satisfies **NFCS-IO-001** (A-MUST requirement for input declaration).

---

## Declared Inputs

Boundary decisions consider ONLY the following inputs:

### 1. [Input Field Name]
- **Type:** [string | integer | boolean | enum | object]
- **Required:** [Yes | No]
- **Description:** [What this input represents]
- **Constraints:** [Value ranges, formats, allowed enums]
- **Example:** `"example_value"`

---

### 2. [Another Input Field]
- **Type:** [data type]
- **Required:** [Yes | No]
- **Description:** [Description]
- **Constraints:** [Constraints]
- **Example:** `"example"`

---

### 3. [Input Schema Object]
If using structured input objects, define schema:

```json
{
  "field_name": {
    "type": "string",
    "required": true,
    "description": "Description",
    "constraints": "max 256 characters"
  },
  "nested_object": {
    "type": "object",
    "properties": {
      "sub_field_1": {
        "type": "integer",
        "required": false
      }
    }
  }
}
```

---

## Explicitly EXCLUDED Inputs

The system does NOT use the following for boundary decisions:

### 1. External Web Lookups
The system does not fetch external data from APIs, websites, or databases during boundary classification.

### 2. Hidden Context
The system does not use:
- User IP address
- User identity or profile information
- Geolocation data
- Browser fingerprints
- Session history beyond declared inputs

### 3. Temporal Context
The system does not use:
- Current date/time (unless explicitly declared as input)
- Historical trends
- Statistical predictions based on external data

### 4. Probabilistic Signals
The system does not use:
- "Confidence scores" to override refusal
- "Likely outcomes" as deterministic classifications
- Machine learning inference for boundary decisions

---

## Input Validation

Before processing, all inputs are validated:

1. **Type checking:** Input types must match declared types
2. **Constraint validation:** Values must satisfy declared constraints
3. **Required field checking:** All required inputs must be present
4. **Sanitization:** Inputs are sanitized to prevent injection attacks

**If validation fails:** System returns Refusal with `REFUSE_INVALID_INPUT` code and lists validation errors.

---

## Missing or Ambiguous Inputs

When required inputs are missing or ambiguous:

1. System immediately returns Refusal
2. Refusal includes `missing_inputs` list
3. Refusal reason explains what is needed
4. System does NOT guess or infer missing values

**Example Refusal:**
```json
{
  "decision": "REFUSED",
  "refusal_code": "REFUSE_MISSING_INPUT",
  "refusal_reason": "Required input 'jurisdiction' is missing.",
  "missing_inputs": ["jurisdiction"],
  "nfcs_version": "1.0.0"
}
```

---

## Input Transparency

All inputs used for a decision are logged (Level B systems) or can be audited. There are NO hidden inputs.

---

## Versioning

**Version History:**
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | [Date] | Initial input declaration |

**Update Policy:**
- MAJOR version: Breaking changes to input schema
- MINOR version: New optional inputs added
- PATCH version: Clarifications, constraint adjustments

---

## Conformance

This Input Declaration satisfies **NFCS-IO-001** (A-MUST requirement).

---

**Document Hash:** [SHA-256 to be computed]  
**Published:** [URL or repository location]

---

© 2025 [Your Organization]. Licensed under CC BY-ND 4.0.
