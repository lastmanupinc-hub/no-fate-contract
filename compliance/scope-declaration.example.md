# Scope Declaration

**System Name:** [Your System Name]  
**System Version:** [x.y.z]  
**NFCS Target:** v1.0.0 Level A  
**Declaration Version:** [x.y.z]  
**Effective Date:** [YYYY-MM-DD]

---

## Purpose

This document defines the deterministic scope of [System Name]. It explicitly states what domains the system operates within deterministically and what domains are out of scope.

---

## IN SCOPE: Deterministic Operations

The system operates deterministically within the following domains:

### 1. [Domain Name]
**Description:** [Brief description of deterministic capability]

**Deterministic Inputs:**
- [Input field 1]: [Description and constraints]
- [Input field 2]: [Description and constraints]
- [Input field 3]: [Description and constraints]

**Deterministic Outputs:**
- [Output type 1]: [Description]
- [Output type 2]: [Description]

**Boundary Rules:**
- [Rule 1]: [Deterministic classification rule]
- [Rule 2]: [Deterministic classification rule]

**Example:** [Concrete example of deterministic operation]

---

### 2. [Another Domain Name]
[Repeat structure above for each in-scope domain]

---

## OUT OF SCOPE: Nondeterministic Domains

The system explicitly REFUSES operations in the following domains:

### 1. Legal Advice
**Reason:** Requires interpretation of statutes, case law, and application of legal judgment to specific facts. This is inherently nondeterministic and requires human legal professional authority.

**Refusal Trigger:** Any request framed as "What should I do?" or "Is this legal?" or "Will I win this case?"

---

### 2. Intent Inference
**Reason:** Determining motive, intent, or credibility from incomplete information requires subjective judgment that cannot be reduced to deterministic rules.

**Refusal Trigger:** Requests requiring assessment of "Why did they..." or "What were they thinking..." without explicit intent statements.

---

### 3. Outcome Prediction
**Reason:** Predicting how courts, regulators, or other human decision-makers will rule requires speculation about nondeterministic processes.

**Refusal Trigger:** Requests for predictions like "Will the court approve..." or "What will happen if..."

---

### 4. Value Judgments
**Reason:** Determining "fairness," "reasonableness," or "appropriateness" in contexts requiring human value assessment.

**Refusal Trigger:** Requests requiring normative judgments outside of explicitly codified rules.

---

### 5. [Additional Out-of-Scope Domain]
[Add any system-specific out-of-scope domains]

---

## Boundary Conditions

### Ambiguity
When inputs are ambiguous or incomplete, the system will:
- REFUSE operation
- State required inputs explicitly
- NOT guess or infer missing information

### Authority Boundaries
The system will refuse operations that would substitute for:
- Judicial decision-making
- Prosecutorial discretion
- Administrative adjudication
- Professional licensure determinations
- Any human authority role defined by law or policy

---

## Versioning and Updates

**Version History:**
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | [Date] | Initial scope declaration |

**Update Policy:**
- MAJOR version: Scope boundaries change (domains added/removed)
- MINOR version: Clarifications or expansions within existing scope
- PATCH version: Typos, formatting, non-substantive edits

---

## Conformance

This Scope Declaration satisfies **NFCS-DO-001** (A-MUST requirement for deterministic scope definition).

---

**Document Hash:** [SHA-256 to be computed]  
**Published:** [URL or repository location]

---

© 2025 [Your Organization]. Licensed under CC BY-ND 4.0.
