# No Fate Conformance Test Suite (NFCTS)

This directory contains test cases and test harness for verifying NFCS conformance.

---

## Directory Structure

```
tests/nfcts/
├── A2-repeatability.json        # Test case for repeatability (NFCS-DO-002)
├── A5-ambiguity.json            # Test case for ambiguity refusal (NFCS-RF-002/004)
├── A7-no-advice.json            # Test case for authority boundary (NFCS-NI-001)
├── [Additional test cases]       # Add more as needed
└── README.md                    # This file
```

---

## Test Case Format

Each test case is a JSON file with the following structure:

```json
{
  "test_id": "A2",
  "test_name": "Test Name",
  "requirement": "NFCS-XX-YYY",
  "description": "What this test validates",
  "test_case": {
    "input": {},
    "expected_behavior": "description"
  },
  "execution": {
    "timestamp": "ISO 8601",
    "output": {}
  },
  "validation": {
    "pass": true/false
  },
  "evidence": "description of evidence artifact"
}
```

---

## Running Tests

### Manual Execution

1. Load test case JSON
2. Execute system with `test_case.input`
3. Capture output
4. Compare output against `expected_behavior`
5. Record PASS/FAIL in `validation.pass`

### Automated Execution

See `.github/workflows/nfcts-compliance.yml` for CI/CD automation.

---

## Test Coverage

### Level A Tests (Required for Level A Conformance)

- [x] A1: Scope Declaration Present
- [x] A2: Repeatability (sample provided)
- [ ] A3: No Hidden Context
- [ ] A4: Refusal First-Class
- [x] A5: Refusal on Ambiguity (sample provided)
- [ ] A6: Refusal Includes Code + Reason
- [x] A7: No Advice/Adjudication (sample provided)
- [ ] A8: No Intent Inference
- [ ] A9: I/O Declaration Present
- [ ] A10: Version Claim

### Level B Tests (Required for Level B Conformance)

- [ ] B1: Decision Logging
- [ ] B2: Tamper Evidence
- [ ] B3: Sensitive Data Minimization

---

## Adding New Test Cases

1. Create new JSON file following format above
2. Name file with test ID prefix (e.g., `A4-refusal-first-class.json`)
3. Document requirement IDs covered
4. Include expected input, output, and validation criteria
5. Run test and record evidence
6. Commit test case to repository

---

## Conformance Claims

Systems claiming NFCS conformance MUST:

1. Run ALL applicable tests (Level A or Level A+B)
2. Achieve PASS on all tests
3. Publish test results with evidence artifacts
4. Link test results in Self-Attestation document

---

## Evidence Artifacts

For each test, preserve:

- Input JSON
- Output JSON
- Execution logs (if Level B)
- Comparison results
- Timestamp of test execution
- System version tested

---

## Continuous Testing

Recommended testing schedule:

- **On every commit**: Run A1-A10 in CI/CD
- **On version change**: Full Level A or Level A+B suite
- **Quarterly**: Re-run full suite for production systems
- **On NFCS update**: Re-run all tests against new NFCS version

---

## Questions?

- Canonical test specification: `/canonical/NFCTS_v1.0.0.md`
- Compliance specification: `/canonical/NFCS_v1.0.0.md`
- Self-attestation template: `/compliance/SELF_ATTESTATION_TEMPLATE_v1.0.0.md`

---

© 2025 No Fate Project. Licensed under CC BY-ND 4.0.
