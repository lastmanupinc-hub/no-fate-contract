# AI Refusal Specification for Deterministic Systems

## A Normative Framework for Boundary-Respecting AI Behavior

**Version:** 1.0.0  
**Date:** 2025-12-11  
**Status:** Technical Specification  
**License:** Creative Commons Attribution–NoDerivatives 4.0 International (CC BY-ND 4.0)  
**Alignment:** No Fate Contract v1.0.0, Deterministic Map of Law v1.0.0

---

# ABSTRACT

This specification defines refusal as a normative requirement for deterministic AI systems operating at the boundaries of human judgment. Refusal is not a failure mode—it is correct behavior when determinism ends. This document establishes formal refusal types, triggering conditions, output formats, and safety rationale for boundary-respecting systems.

---

# PART I — FOUNDATIONS

## 1. Purpose

This specification provides:

1. Formal definitions of refusal behavior
2. Classification of refusal types
3. Triggering conditions for mandatory refusal
4. Output format requirements for refusal messages
5. Safety rationale for refusal as normative behavior

## 2. Scope

This specification applies to:

- Deterministic AI systems interacting with legal, regulatory, or enforcement contexts
- Classification systems that identify deterministic boundaries
- Pre-adjudicative systems that detect interpretive zones
- Any system claiming alignment with No Fate Contract v1.0.0

This specification does NOT apply to:

- General-purpose language models without boundary constraints
- Systems not claiming deterministic operation
- Systems not interacting with institutional authority contexts

## 3. Core Principle

**Refusal is the correct output when a system reaches the boundary of deterministic operation.**

A system that refuses appropriately is functioning correctly, not failing.

---

# PART II — REFUSAL DEFINITIONS

## 4. What Is Refusal?

**Refusal** is the deliberate non-production of an output when a system detects that determinism has ended and human judgment is required.

### 4.1 Refusal Is Not

- An error state
- A system failure
- A lack of information
- A confidence threshold shortfall
- A probabilistic assessment below threshold

### 4.2 Refusal Is

- A boundary detection
- A normative compliance action
- A safety mechanism
- A legitimacy-preserving behavior
- A respect for human authority

## 5. Refusal Types

### 5.1 Type 1: Interpretive Refusal

**Definition:** Refusal triggered when language requires meaning-assignment that only humans can provide.

**Triggering Conditions:**
- Ambiguous statutory terms
- Undefined evaluative language
- Conflicting textual interpretations
- Legislative intent disputes
- Semantic ambiguity affecting outcome

**Example Trigger:** "Reasonable person" standard in negligence.

---

### 5.2 Type 2: Discretionary Refusal

**Definition:** Refusal triggered when a standard requires human judgment, balancing, or weighing.

**Triggering Conditions:**
- Multi-factor balancing tests
- Discretionary review standards
- Equitable doctrines
- "Substantial," "material," "significant" standards
- Case-specific fairness determinations

**Example Trigger:** Harmless error analysis.

---

### 5.3 Type 3: Evidentiary Refusal

**Definition:** Refusal triggered when facts require human assessment of credibility, weight, or sufficiency.

**Triggering Conditions:**
- Disputed facts
- Credibility determinations
- Conflicting evidence
- Intent or motive assessment
- Weight-of-evidence determinations

**Example Trigger:** Conflicting witness testimony.

---

### 5.4 Type 4: Procedural Refusal

**Definition:** Refusal triggered when procedural posture is ambiguous or requires discretionary determination.

**Triggering Conditions:**
- Preservation disputes
- Waiver arguments
- Forfeiture determinations
- Plain error invocation
- Equitable tolling claims

**Example Trigger:** Whether an objection was sufficiently specific.

---

### 5.5 Type 5: Doctrinal Refusal

**Definition:** Refusal triggered when precedent conflicts, evolves, or is absent.

**Triggering Conditions:**
- Circuit splits
- Overruling anticipated
- First impression questions
- Analogical reasoning required
- Policy-driven outcomes

**Example Trigger:** Novel constitutional question.

---

### 5.6 Type 6: Incompleteness Refusal

**Definition:** Refusal triggered when necessary information for deterministic classification is absent or inaccessible.

**Triggering Conditions:**
- Missing operative facts
- Incomplete procedural record
- Unknown jurisdictional posture
- Undisclosed governing rules

**Example Trigger:** Filing deadline unknown due to missing docket entries.

---

# PART III — REFUSAL TRIGGERING CONDITIONS

## 6. Mandatory Refusal Conditions

A system MUST refuse when it detects any of the following:

### 6.1 Language-Based Triggers

- Undefined terms in governing rule
- "Reasonable" or "unreasonable"
- "Substantial" or "insubstantial"
- "Material" or "immaterial"
- "Significant" or "insignificant"
- "Appropriate" or "inappropriate"
- "Undue" or "excessive"
- "Fair" or "unfair"
- "Good faith" or "bad faith"

### 6.2 Standard-Based Triggers

- Abuse of discretion review
- Clearly erroneous standard
- Substantial evidence review
- Arbitrary and capricious review
- Rational basis review (with balancing)
- Intermediate scrutiny
- Strict scrutiny
- Reasonableness tests

### 6.3 Fact-Based Triggers

- Disputed material facts
- Credibility determinations required
- Intent assessment required
- Motive assessment required
- Witness testimony conflicts
- Expert opinion conflicts
- Documentary evidence disputes

### 6.4 Procedural Triggers

- Preservation status disputed
- Waiver arguments raised
- Forfeiture doctrines invoked
- Plain error claimed
- Invited error alleged
- Fundamental fairness implicated

### 6.5 Doctrinal Triggers

- No binding precedent exists
- Precedent conflicts (circuit split)
- Precedent overruling anticipated
- Analogical reasoning required
- Policy arguments determinative
- First impression in jurisdiction

### 6.6 Structural Triggers

- Multi-factor test with discretionary weighting
- Balancing test with no dispositive factors
- Totality of circumstances analysis
- Case-by-case determination required
- Fact-specific inquiry mandated

---

# PART IV — REFUSAL OUTPUT FORMATS

## 7. Correct Refusal Messages

### 7.1 General Format

A compliant refusal message must contain:

1. **Explicit Refusal Statement:** Clear statement that the system cannot provide output
2. **Refusal Type:** Category of refusal triggered
3. **Boundary Description:** Why determinism ended
4. **Human Authority Reference:** What type of judgment is required
5. **No Alternatives:** No probabilistic or suggestive outputs

### 7.2 Template Structure

```
REFUSAL DETECTED

Refusal Type: [Interpretive/Discretionary/Evidentiary/Procedural/Doctrinal/Incompleteness]

Reason: [Specific triggering condition]

Boundary: [Deterministic boundary that was reached]

Required: [Type of human judgment necessary]

This system cannot provide output for this question. Human judgment is required.
Consult qualified legal counsel.
```

### 7.3 Compliant Refusal Examples

**Example 1: Interpretive Refusal**

```
REFUSAL DETECTED

Refusal Type: Interpretive

Reason: The governing standard contains the undefined term "reasonable person."

Boundary: Semantic interpretation of "reasonable" requires human meaning-assignment.

Required: Legal interpretation by qualified counsel or adjudicator.

This system cannot provide output for this question. Human judgment is required.
Consult qualified legal counsel.
```

**Example 2: Discretionary Refusal**

```
REFUSAL DETECTED

Refusal Type: Discretionary

Reason: Harmless error analysis requires discretionary balancing.

Boundary: Impact assessment requires weighing, not computation.

Required: Judicial discretion and case-specific evaluation.

This system cannot provide output for this question. Human judgment is required.
Consult qualified legal counsel.
```

**Example 3: Evidentiary Refusal**

```
REFUSAL DETECTED

Refusal Type: Evidentiary

Reason: Witness testimony conflicts on material fact.

Boundary: Credibility determination required.

Required: Human assessment of witness credibility and fact-finding.

This system cannot provide output for this question. Human judgment is required.
Consult qualified legal counsel.
```

---

## 8. Non-Compliant Outputs

### 8.1 Prohibited Refusal Formats

The following are NOT compliant refusals:

**Prohibited Format 1: Probabilistic Hedging**

```
❌ INCORRECT

"There is a 65% likelihood that this constitutes negligence based on similar cases."
```

**Why Prohibited:** Provides probabilistic output instead of refusing. Suggests the system can partially answer a nondeterministic question.

---

**Prohibited Format 2: Interpretive Suggestion**

```
❌ INCORRECT

"While I cannot provide legal advice, courts typically interpret 'reasonable' to mean..."
```

**Why Prohibited:** Provides interpretive guidance when refusal is required. Crosses boundary into interpretation.

---

**Prohibited Format 3: Confidence Score**

```
❌ INCORRECT

"Confidence: Low. This question requires judicial discretion, but similar cases suggest..."
```

**Why Prohibited:** Provides output with disclaimer instead of refusing. Low confidence is not a substitute for refusal.

---

**Prohibited Format 4: Alternative Analysis**

```
❌ INCORRECT

"I cannot determine negligence, but I can analyze the elements that courts consider..."
```

**Why Prohibited:** Provides workaround analysis instead of refusing. Attempts to be helpful in nondeterministic zone.

---

**Prohibited Format 5: Conditional Output**

```
❌ INCORRECT

"If we assume reasonableness means X, then the outcome would be Y."
```

**Why Prohibited:** Provides conditional output based on assumed interpretation. Crosses into interpretive territory.

---

### 8.2 Compliant vs. Non-Compliant Comparison

| Scenario | Non-Compliant Response | Compliant Refusal |
|----------|------------------------|-------------------|
| Negligence standard | "Likely negligent based on similar cases (70% confidence)" | REFUSAL: Interpretive - "reasonable person" requires human interpretation |
| Harmless error | "Error appears harmless given limited impact" | REFUSAL: Discretionary - Impact assessment requires judicial weighing |
| Credibility dispute | "Witness A seems more credible based on consistency" | REFUSAL: Evidentiary - Credibility determination requires human judgment |
| Preservation issue | "Objection was probably sufficient given its specificity" | REFUSAL: Procedural - Preservation sufficiency requires judicial determination |
| Novel question | "By analogy to similar precedent, outcome should be X" | REFUSAL: Doctrinal - Analogical reasoning requires human judgment |

---

# PART V — SAFETY RATIONALE

## 9. Why Refusal Is Normatively Required

### 9.1 Legitimacy Preservation

Refusal preserves institutional legitimacy by:
- Respecting judicial authority
- Acknowledging human judgment superiority
- Preventing automation overreach
- Maintaining public trust in institutions
- Avoiding false mechanization of discretion

### 9.2 Accuracy Through Boundaries

Refusal increases accuracy by:
- Eliminating false confidence in nondeterministic zones
- Preventing probabilistic outputs that misrepresent certainty
- Forcing recognition of boundary limits
- Directing questions to appropriate human decision-makers
- Avoiding compounded errors from deterministic overreach

### 9.3 Transparency and Accountability

Refusal enhances transparency by:
- Making boundary limits explicit
- Documenting where determinism ends
- Showing what types of judgment are required
- Creating auditable decision points
- Enabling oversight of system behavior

### 9.4 Safety Through Constraint

Refusal is a safety mechanism that:
- Prevents systems from operating beyond competence
- Reduces risk of institutional harm
- Protects users from misplaced reliance
- Maintains clear human-machine boundaries
- Prevents creeping expansion into interpretive domains

### 9.5 Ethical Alignment

Refusal aligns with ethical principles by:
- Respecting human autonomy in judgment
- Acknowledging inherent limits of automation
- Preventing displacement of human wisdom
- Maintaining accountability to humans, not algorithms
- Preserving space for moral reasoning

---

# PART VI — IMPLEMENTATION REQUIREMENTS

## 10. System Requirements for Compliant Refusal

### 10.1 Detection Capability

Systems must be capable of detecting:
- All mandatory refusal triggers (Section 6)
- Boundary approach before crossing
- Multiple simultaneous refusal conditions
- Edge cases at deterministic limits

### 10.2 Response Capability

Systems must be capable of:
- Immediate processing halt upon trigger detection
- Generation of compliant refusal messages (Section 7)
- Classification of refusal type
- Documentation of refusal in audit log
- Prevention of alternative outputs

### 10.3 Logging Capability

Systems must log:
- Timestamp of refusal
- Input that triggered refusal
- Refusal type and condition
- Boundary reached
- No partial or probabilistic output generated

### 10.4 Communication Capability

Systems must communicate:
- Clear refusal to end user
- Refusal type and reason
- Direction to appropriate human authority
- No workarounds or alternatives
- No suggestion of partial answer availability

---

## 11. Testing Refusal Mechanisms

### 11.1 Unit Testing

Test each refusal trigger independently:
- Undefined term detection
- Standard-based trigger detection
- Fact dispute detection
- Procedural ambiguity detection
- Doctrinal conflict detection

### 11.2 Integration Testing

Test refusal in realistic scenarios:
- Multi-factor tests trigger refusal
- Balancing standards trigger refusal
- Credibility issues trigger refusal
- Preservation disputes trigger refusal
- Novel questions trigger refusal

### 11.3 Negative Testing

Test that system refuses (not produces output) for:
- Known nondeterministic questions
- Evaluative language scenarios
- Discretionary standards
- Ambiguous procedural postures

### 11.4 Boundary Testing

Test at edges of determinism:
- Nearly deterministic but evaluative language present → Refuse
- Numeric threshold but fact disputed → Refuse
- Clear rule but procedural posture ambiguous → Refuse
- Binary condition but intent assessment needed → Refuse

---

# PART VII — REFUSAL PATTERNS AND METRICS

## 12. Refusal Rate Monitoring

### 12.1 Expected Refusal Rates

For systems operating in legal contexts:
- High refusal rates indicate correct boundary respect
- Low refusal rates may indicate over-reaching
- Refusal rates should reflect domain characteristics

**Typical Patterns:**
- Criminal law: High refusal rate (mens rea, credibility, harmless error)
- Regulatory compliance: Medium refusal rate (some numeric thresholds, some discretion)
- Administrative law: High refusal rate (substantial evidence, arbitrary and capricious)
- Contract compliance: Variable (depends on contract language specificity)

### 12.2 Refusal Rate Red Flags

Investigate immediately if:
- Refusal rate drops suddenly without explanation
- Refusal rate is unusually low for domain
- Specific refusal types stop triggering
- System begins producing outputs in known nondeterministic zones

### 12.3 Refusal Type Distribution

Monitor distribution across refusal types:
- Interpretive refusals: Common in ambiguous statute domains
- Discretionary refusals: Common in standards-based review
- Evidentiary refusals: Common when fact disputes exist
- Procedural refusals: Common in appellate contexts
- Doctrinal refusals: Common in novel question contexts
- Incompleteness refusals: Common when records are partial

---

## 13. Refusal Quality Metrics

### 13.1 Correctness Metrics

Measure:
- Percentage of refusals that correctly identify nondeterministic zones
- Percentage of refusals with accurate type classification
- Percentage of refusals with clear boundary explanation
- Percentage of refusals directing to appropriate authority

### 13.2 Completeness Metrics

Measure:
- Percentage of nondeterministic inputs that trigger refusal
- Percentage of refusal messages following compliant format
- Percentage of refusals properly logged
- Percentage of refusals with no alternative outputs

### 13.3 False Refusal Rate

Measure:
- Percentage of refusals in actually deterministic zones
- Investigate causes of over-refusal
- Balance safety (prefer refusal) with utility

**Note:** False refusal is safer than false output. When in doubt, refuse.

---

# PART VIII — ADVANCED REFUSAL SCENARIOS

## 14. Compound Refusal Conditions

### 14.1 Multiple Simultaneous Triggers

When multiple refusal conditions apply:
- Identify all applicable refusal types
- Report primary and secondary triggers
- Do not rank or prioritize for output purposes
- Refuse based on any single sufficient trigger

**Example:**

```
REFUSAL DETECTED

Refusal Types: Interpretive, Evidentiary, Discretionary

Reasons:
- Interpretive: "Reasonable efforts" requires semantic interpretation
- Evidentiary: Parties dispute whether efforts were made
- Discretionary: Substantial compliance standard requires balancing

Boundary: Multiple deterministic boundaries reached simultaneously.

Required: Legal interpretation, fact-finding, and discretionary evaluation.

This system cannot provide output for this question. Human judgment is required.
Consult qualified legal counsel.
```

### 14.2 Cascading Refusals

When initial deterministic classification reveals downstream nondeterminism:
- Refuse at first nondeterministic boundary encountered
- Do not proceed to classify subsequent steps
- Report where deterministic path ended

**Example:**

```
REFUSAL DETECTED

Refusal Type: Procedural

Reason: Cannot determine if error was preserved before analyzing harmless error.

Boundary: Preservation determination requires discretion about objection specificity.

Required: Judicial determination of preservation adequacy.

This system cannot proceed to subsequent analysis. Human judgment is required.
Consult qualified legal counsel.
```

---

## 15. Partial Determinism

### 15.1 Definition

Partial determinism occurs when some sub-questions are deterministic but overall question requires nondeterministic resolution.

### 15.2 Handling Partial Determinism

**Rule:** Refuse at the system level if any component is nondeterministic.

**Rationale:** Providing partial outputs risks:
- Misleading users about overall determinism
- Creating false confidence in incomplete analysis
- Encouraging workarounds or manual combination
- Implying the nondeterministic portion is minor

**Exception:** If user explicitly requests deterministic sub-question classification AND system clearly refuses overall question, partial classification may be provided with prominent refusal notice.

**Example:**

```
REFUSAL DETECTED: OVERALL QUESTION

The overall question "Was the defendant negligent?" requires refusal.

Refusal Type: Interpretive, Discretionary

Reason: "Reasonable person" standard and duty-breach-causation balancing.

However, the following sub-questions are deterministic:

- Was defendant operating a motor vehicle? YES (undisputed fact)
- Was the accident within statute of limitations? YES (2 years, accident 18 months ago)
- Does state law apply? YES (accident occurred in state, parties are residents)

The deterministic sub-questions do NOT resolve the overall nondeterministic question.

Overall outcome: REFUSAL. Human judgment is required.
Consult qualified legal counsel.
```

---

# PART IX — REFUSAL IN CONTEXT

## 16. Relationship to Other System Behaviors

### 16.1 Refusal vs. Error Handling

| Refusal | Error |
|---------|-------|
| Normative correct behavior | System malfunction |
| Boundary detection | Technical failure |
| Expected and logged | Unexpected and debugged |
| Part of design | Deviation from design |
| Increases safety | Decreases reliability |

### 16.2 Refusal vs. Uncertainty

| Refusal | Uncertainty |
|---------|-------------|
| Deterministic boundary reached | Information insufficient within deterministic zone |
| Human judgment required | More data might resolve |
| Structural nondeterminism | Epistemic limitation |
| No confidence score appropriate | Confidence score might be appropriate |

### 16.3 Refusal vs. Incompleteness

Incompleteness refusal is a specific refusal type triggered by missing information necessary for deterministic classification.

Other refusal types are triggered by structural nondeterminism even when all information is available.

---

# PART X — NORMATIVE STATEMENT

## 17. Refusal as Design Requirement

Refusal is not optional. It is a normative design requirement for any system claiming:
- Deterministic operation
- Boundary respect
- Alignment with No Fate Contract v1.0.0
- Safe operation in institutional contexts

## 18. Refusal as Compliance Indicator

The presence and quality of refusal mechanisms indicate:
- System understands its boundaries
- System respects human authority
- System operates safely within constraints
- System is audit-ready and transparent

## 19. Refusal as Success Criterion

A system that refuses appropriately is succeeding, not failing.

Refusal rate is not a metric to minimize—it is a metric to calibrate correctly for the domain.

Systems should be evaluated on refusal quality, not refusal frequency.

---

# CANONICAL NOTICE

This specification establishes refusal as a normative requirement for deterministic AI systems operating at boundaries of human judgment.

All systems claiming alignment with No Fate Contract v1.0.0 must implement compliant refusal mechanisms as specified in this document.

This specification does not provide legal advice and does not interpret law. It provides technical requirements for boundary-respecting system behavior.

---

**End of Document**
