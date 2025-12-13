# Conformance Vector Expansion Plan

**Date**: 2025-12-12  
**Status**: REQUIRED BEFORE NEW FEATURES

## Purpose

Before adding ZKPs, MPC, blockchain, WASM, or any new features:
**Expand the conformance test suite to prove interoperability.**

## Current State

**Existing**:
- ✅ `test-001-simple-blocks` - Basic blocks world

**Insufficient because**:
- Only 1 test vector
- No edge cases
- No failure modes
- No tie-breaking tests
- No multi-solver validation

## Required Conformance Vectors

### Category 1: Multiple Solvers (Same Output)

**Purpose**: Prove different solver implementations produce byte-identical results.

**Vectors Needed**:

1. **test-002-multiple-solvers-basic**
   - Simple problem
   - 3 reference solvers run it
   - ALL must produce identical output_hash and emergy_hash
   - Validates: Determinism across implementations

2. **test-003-multiple-solvers-complex**
   - Complex problem (10+ actions, 5+ constraints)
   - Same 3 solvers
   - Validates: Determinism holds for non-trivial problems

**Acceptance Criteria**:
```bash
# All three solvers produce identical hashes
solver-a bundle.json → output_hash: sha256:abc123...
solver-b bundle.json → output_hash: sha256:abc123...  # ✅ MUST MATCH
solver-c bundle.json → output_hash: sha256:abc123...  # ✅ MUST MATCH
```

### Category 2: Failure Modes

**Purpose**: Prove solvers correctly handle unsatisfiable problems.

**Vectors Needed**:

3. **test-004-unsatisfiable-constraints**
   - Constraints that cannot all be satisfied
   - Expected output: `{"result": "unsolvable", "reason": "..."}`
   - Validates: Solver detects impossibility

4. **test-005-timeout-scenario**
   - Problem with exponential search space
   - Timeout configured
   - Expected output: `{"result": "timeout", "reason": "..."}`
   - Validates: Solver respects time limits

5. **test-006-error-handling**
   - Malformed bundle (invalid preconditions)
   - Expected output: `{"result": "error", "reason": "..."}`
   - Validates: Solver validates inputs

**Acceptance Criteria**:
```bash
avery-verify bundle.json output.json emergy.json
# ✅ MUST pass even for unsolvable/timeout/error results
# Emergy MUST explain WHY it failed
```

### Category 3: Tie-Breaking Edge Cases

**Purpose**: Prove tie-breaking is deterministic and consistent.

**Vectors Needed**:

7. **test-007-exact-tie-simple**
   - Two actions with identical cost, identical heuristics
   - tie_break: "action_id" → lexicographic order
   - Expected: Action "a" chosen over action "b"
   - Validates: Tie-breaking is applied correctly

8. **test-008-exact-tie-complex**
   - Multiple actions with equal scores at different depths
   - tie_break: "f,g,depth,action_id"
   - Expected: Deterministic choice based on hierarchy
   - Validates: Multi-level tie-breaking works

9. **test-009-no-tie-breaking-needed**
   - Actions have clearly different costs
   - Expected: Best action chosen without tie-breaking
   - Emergy: `tie_break.applied = false`
   - Validates: Tie-breaking only when needed

**Acceptance Criteria**:
```bash
# Run twice, hashes MUST match
nofate-solve bundle.json --out output1.json
nofate-solve bundle.json --out output2.json
sha256sum output1.json output2.json
# ✅ Identical hashes
```

### Category 4: Constraint Satisfaction

**Purpose**: Prove constraints are correctly evaluated.

**Vectors Needed**:

10. **test-010-hard-constraint-violation**
    - Action violates hard constraint
    - Expected: Action rejected, documented in emergy.rejections
    - Validates: Hard constraints are enforced

11. **test-011-soft-policy-trade-offs**
    - Multiple soft policies with weights
    - Expected: Weighted scoring determines choice
    - Emergy: Shows policy evaluations
    - Validates: Soft policies influence decisions correctly

12. **test-012-constraint-propagation**
    - Chained constraints (A requires B, B requires C)
    - Expected: Solver respects dependencies
    - Validates: Constraint reasoning is sound

**Acceptance Criteria**:
```bash
# Emergy MUST document constraint evaluations
jq '.decision_graph[].evaluations' emergy.json
# ✅ Every candidate has constraint evaluation
```

### Category 5: Determinism Stress Tests

**Purpose**: Prove determinism under adverse conditions.

**Vectors Needed**:

13. **test-013-large-state-space**
    - 100+ actions, 50+ state variables
    - Expected: Deterministic output (may take longer)
    - Validates: Determinism scales

14. **test-014-floating-point-arithmetic**
    - Costs with floating-point values (e.g., 1.0001, 1.0002)
    - Expected: Deterministic tie-breaking despite floating-point
    - Validates: JCS canonicalization handles numbers correctly

15. **test-015-unicode-strings**
    - Action IDs with Unicode characters (emoji, Chinese, Arabic)
    - Expected: Deterministic lexicographic ordering
    - Validates: UTF-8 ordering is consistent

**Acceptance Criteria**:
```bash
# Replay MUST pass for all stress tests
avery-replay bundle.json output.json emergy.json
# ✅ deterministic: true
```

## Implementation Plan

### Phase 1: Create Vectors (Week 1)
```bash
cd conformance/vectors

# Create 15 test bundles
create-test-002-multiple-solvers-basic.json
create-test-003-multiple-solvers-complex.json
create-test-004-unsatisfiable-constraints.json
# ... etc
```

### Phase 2: Generate Expected Outputs (Week 1)
```bash
cd conformance

# For each vector, run reference solver
for test in vectors/test-*.json; do
  nofate-solve "$test" --out "expected/$(basename $test .json)-output.json" \
                       --emergy "expected/$(basename $test .json)-emergy.json"
done

# Verify all outputs
for test in vectors/test-*.json; do
  avery-verify "$test" \
               "expected/$(basename $test .json)-output.json" \
               "expected/$(basename $test .json)-emergy.json"
done
```

### Phase 3: Update Test Runner (Week 2)
```javascript
// conformance/runner/runner.js

// Add multi-solver support
const SOLVERS = [
  'nofate-solve',
  'nofate-solve-v2',
  'third-party-solver'
];

for (const solver of SOLVERS) {
  console.log(`Testing ${solver}...`);
  // Run solver, compare hashes
}

// Add failure mode validation
if (output.result === 'unsolvable') {
  // Verify emergy explains WHY unsolvable
  validateUnsolvableExplanation(emergy);
}

// Add tie-breaking validation
if (emergy.decision_graph.some(n => n.tie_break.applied)) {
  // Verify tie-breaking strategy was applied correctly
  validateTieBreaking(emergy, bundle);
}
```

### Phase 4: CI/CD Integration (Week 2)
```yaml
# .github/workflows/conformance-tests.yml

name: Conformance Test Suite

on: [push, pull_request]

jobs:
  conformance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install tools
        run: |
          cd tools/canon && npm install && npm run build
          cd ../solve && npm install && npm run build
          cd ../avery/verify && npm install && npm run build
      
      - name: Run conformance tests
        run: cd conformance/runner && npm test
      
      - name: Fail if any test fails
        if: failure()
        run: echo "CONFORMANCE FAILURE" && exit 1
```

### Phase 5: Documentation (Week 2)
- Update `conformance/README.md` with all 15 tests
- Add test descriptions, expected outputs, rationale
- Document how to add new test vectors

## Acceptance Criteria for This Plan

Before declaring "conformance suite complete":

✅ **All 15 test vectors exist**  
✅ **Expected outputs generated and verified**  
✅ **Test runner validates all categories**  
✅ **CI/CD enforces conformance on every commit**  
✅ **Documentation is complete**  

## Blockers for New Features

**CANNOT proceed with** until conformance suite is complete:
- ❌ Zero-knowledge proofs (ZKP)
- ❌ Multi-party computation (MPC)
- ❌ Blockchain integration
- ❌ WASM builds
- ❌ Language bindings (Python, Rust, Go)

**Rationale**: If we can't prove interoperability with 1 solver (via 15 tests), we can't claim it for N solvers.

## Success Metrics

**After completion**:
- Any new solver can run conformance suite
- Passing all 15 tests = No Fate conformant
- Ecosystem interoperability is proven (not assumed)
- Regression detection is automated

## Timeline

**Week 1**: Create vectors + expected outputs  
**Week 2**: Update runner + CI/CD + docs  
**Week 3**: Buffer for debugging failures  

**Total**: 3 weeks to complete conformance suite.

**No feature work starts until this is done.**

---

**Conformance first. Features second.**
