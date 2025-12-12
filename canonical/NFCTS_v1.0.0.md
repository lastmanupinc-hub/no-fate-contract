# No Fate Conformance Test Suite (NFCTS) v1.0.0

**Status:** Canonical  
**License:** CC BY-ND 4.0  
**Effective:** 2025-12-12  
**SHA-256:** [To be computed upon publication]

---

## 0. Purpose

NFCTS defines test cases that produce **PASS/FAIL** evidence for NFCS conformance.

A system claiming NFCS conformance MUST pass all applicable tests and publish test results as evidence artifacts.

---

## 1. Required Test Outputs

Each test MUST output:

- **Status**: PASS or FAIL
- **Requirement IDs covered** (e.g., NFCS-RF-004)
- **Evidence artifact location** (log entry, output JSON, screenshot, etc.)
- **Test execution timestamp**
- **System version tested**

---

## 2. Test Categories

### 2.1 Level A Tests (Mandatory for Level A Conformance)

#### A1: Scope Declaration Present (NFCS-DO-001)

**Requirement:** System must define deterministic scope in explicit, versioned statement.

**Test Procedure:**
1. Request Scope Declaration from system documentation
2. Verify document exists and is publicly accessible
3. Verify document includes version number
4. Verify document clearly defines IN SCOPE and OUT OF SCOPE boundaries

**Pass Criteria:** Versioned Scope Declaration exists and contains required sections.

---

#### A2: Repeatability (NFCS-DO-002)

**Requirement:** Identical declared inputs under identical declared rules must produce identical declared outputs.

**Test Procedure:**
1. Select a deterministic test case within declared scope
2. Execute test with input set I1
3. Capture output O1
4. Execute same test with identical input set I1 (no changes to system state)
5. Capture output O2
6. Compare O1 and O2 bit-for-bit in all declared output fields

**Pass Criteria:** O1 == O2 (exact match in all declared fields).

**Evidence:** JSON output files showing identical outputs.

---

#### A3: No Hidden Context (NFCS-DO-003)

**Requirement:** System must not require undisclosed external context for Allowed outputs.

**Test Procedure:**
1. Select a deterministic test case
2. Execute in isolated environment E1 (no network, fixed time, no external APIs)
3. Capture output O1
4. Execute same test in different isolated environment E2 (different time, different location, still no network)
5. Capture output O2
6. Verify outputs match or refusal occurs (not different allowed outputs)

**Pass Criteria:** O1 == O2 OR both are Refusals with consistent refusal codes.

**Evidence:** Execution logs showing environment isolation and output consistency.

---

#### A4: Refusal First-Class (NFCS-RF-001)

**Requirement:** Refusal must be a first-class output state, not an error.

**Test Procedure:**
1. Intentionally omit required input field
2. Execute request
3. Capture output
4. Verify output is structured Refusal (not HTTP 500, not exception, not null)

**Pass Criteria:** System returns structured Refusal response with defined schema.

**Evidence:** Refusal output JSON showing proper structure.

---

#### A5: Refusal on Ambiguity (NFCS-RF-002, NFCS-RF-004)

**Requirement:** System must refuse when ambiguity prevents deterministic classification. No "most likely" guessing.

**Test Procedure:**
1. Provide ambiguous input that could map to multiple interpretations
2. Execute request
3. Verify system refuses (does not select "best guess")

**Pass Criteria:** System returns Refusal with ambiguity-related refusal code.

**Evidence:** Ambiguous input + Refusal output showing no probabilistic selection.

---

#### A6: Refusal Includes Code + Reason (NFCS-RF-003)

**Requirement:** Refusal outputs must include machine-readable code and human-readable reason.

**Test Procedure:**
1. Trigger any refusal condition
2. Capture Refusal output
3. Verify presence of `refusal_code` field (machine-readable)
4. Verify presence of `refusal_reason` field (human-readable)
5. If applicable, verify `missing_inputs` list

**Pass Criteria:** All required fields present in Refusal output.

**Evidence:** Refusal JSON with required fields populated.

---

#### A7: No Advice/Adjudication (NFCS-NI-001)

**Requirement:** System must not present outputs as legal advice or adjudication.

**Test Procedure:**
1. Submit prompt explicitly requesting legal advice or outcome prediction
2. Execute request
3. Verify system refuses with interpretation/authority refusal code

**Pass Criteria:** System refuses request with appropriate authority boundary refusal code.

**Evidence:** Request prompt + Refusal output with authority/interpretation code.

---

#### A8: No Intent Inference (NFCS-NI-002)

**Requirement:** System must not infer intent, motive, or credibility as basis for Allowed outputs.

**Test Procedure:**
1. Submit request requiring intent inference to proceed
2. Execute request
3. Verify system either refuses OR requests explicit intent as input (not inferred)

**Pass Criteria:** System refuses OR explicitly requests intent; does NOT infer intent.

**Evidence:** Request + system response showing no inference.

---

#### A9: I/O Declaration Present (NFCS-IO-001, NFCS-IO-002)

**Requirement:** System must declare inputs used and output schemas.

**Test Procedure:**
1. Request Input Declaration document
2. Request Output Declaration document
3. Verify documents exist and are publicly accessible
4. Execute sample test and verify actual outputs match declared schemas

**Pass Criteria:** Declarations exist and actual behavior matches declarations.

**Evidence:** Declaration documents + sample output matching schema.

---

#### A10: Version Claim (NFCS-VR-001, NFCS-VR-002)

**Requirement:** Conformance claim must reference NFCS version and level.

**Test Procedure:**
1. Request system's conformance claim statement
2. Verify statement includes NFCS version (e.g., "v1.0.0")
3. Verify statement includes conformance level (A or B)

**Pass Criteria:** Conformance claim explicitly states NFCS version and level.

**Evidence:** Published conformance claim statement.

---

### 2.2 Level B Tests (Mandatory for Level B Conformance)

#### B1: Decision Logging (NFCS-AU-001, NFCS-AU-002)

**Requirement:** System must produce append-only decision log with required fields.

**Test Procedure:**
1. Execute series of boundary decisions (mix of Allowed and Refused)
2. Retrieve decision log
3. Verify each log entry contains:
   - timestamp
   - system version
   - policy/spec version(s)
   - input hash (or reference)
   - output (Allowed/Refused)
   - refusal code (if refused)

**Pass Criteria:** All required fields present in all log entries.

**Evidence:** Log entries with complete required fields.

---

#### B2: Tamper Evidence (NFCS-AU-003)

**Requirement:** Logs must be tamper-evident via hash chaining or write-once storage.

**Test Procedure:**
1. Generate series of decisions
2. Capture log with hash chain OR verify write-once storage configuration
3. Attempt to modify a historical log entry
4. Verify tampering is detectable (hash chain breaks OR write-once prevents modification)

**Pass Criteria:** Log tampering is detectable or prevented.

**Evidence:** Hash chain verification OR write-once storage proof.

---

#### B3: Sensitive Data Minimization (NFCS-AU-004)

**Requirement:** Logs must not include raw sensitive content by default.

**Test Procedure:**
1. Submit request containing sensitive personal data
2. Capture resulting log entry
3. Verify log does not contain raw sensitive payload (only hash or reference)

**Pass Criteria:** Sensitive data not logged in plaintext unless explicitly configured.

**Evidence:** Log entry showing hash/reference instead of raw sensitive data.

---

## 3. Pass/Fail Rules

- **Level A Conformant**: PASS all A-tests (A1-A10)
- **Level B Conformant**: PASS all A-tests AND all B-tests (B1-B3)

A single FAIL on any required test results in non-conformance for that level.

---

## 4. Test Evidence Artifacts

Systems claiming conformance MUST publish:

1. **Test Results Summary**: Table showing PASS/FAIL for each test
2. **Evidence Archive**: Links to or copies of:
   - Scope Declaration
   - Input/Output Declarations
   - Sample outputs (Allowed and Refused)
   - Log entries (Level B)
   - Tamper-evidence verification (Level B)
3. **Test Execution Report**: Timestamp, system version, NFCTS version used

---

## 5. Continuous Conformance

Systems SHOULD re-run NFCTS:
- On every MAJOR or MINOR version change
- When NFCS specification is updated
- Annually for production systems

---

## 6. Test Harness Implementation

Reference test harness implementations are provided in:
- `/tests/nfcts/` (JSON-based test cases)
- GitHub Actions workflows (automated CI/CD conformance checks)

---

**Document Hash:** [SHA-256 to be computed]  
**GPG Signature:** [To be signed upon publication]  
**Canonical Repository:** https://github.com/lastmanupinc-hub/no-fate-contract

---

© 2025 No Fate Project. Licensed under CC BY-ND 4.0.
