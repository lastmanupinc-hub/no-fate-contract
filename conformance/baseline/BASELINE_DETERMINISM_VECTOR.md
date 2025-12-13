# Baseline Determinism Vector

**Date**: 2025-12-12  
**Purpose**: Golden reference proving end-to-end determinism

## What This Is

This is the **canonical proof** that No Fate determinism works.

Every claim about:
- Byte-identical outputs
- Deterministic replay
- Cryptographic attestation
- Hash consistency

...must first pass this baseline test.

## The Minimal Bundle

**File**: `baseline-minimal.json`

**Properties**:
- Simplest possible problem
- Minimal actions (2)
- Minimal constraints (1)
- Explicit solver_pins
- Frozen semantics

**Why Minimal**: Surface area for non-determinism is minimized. If this fails, everything fails.

## The Golden Artifacts

### 1. Canonical Bundle
```bash
nofate-canon baseline-minimal.json > baseline-minimal.canonical.json 2> baseline-minimal.hash.txt
```

**Output**: JCS canonical form + SHA-256 hash

**Golden Hash**: `[to be recorded on first run]`

### 2. Solver Output
```bash
nofate-solve baseline-minimal.json --out baseline-output.json --emergy baseline-emergy.json
```

**Output**: Plan + decision trace

**Golden Hashes**:
- Output: `[to be recorded]`
- Emergy: `[to be recorded]`

### 3. Verification
```bash
avery-verify baseline-minimal.json baseline-output.json baseline-emergy.json
```

**Expected**:
```json
{
  "valid": true,
  "checks": [
    "bundle_hash_consistent",
    "output_hash_consistent",
    "bundle_schema_valid",
    "output_schema_valid",
    "emergy_schema_valid",
    "constraints_satisfied",
    "explanations_consistent"
  ],
  "errors": []
}
```

### 4. Replay Confirmation
```bash
avery-replay baseline-minimal.json baseline-output.json baseline-emergy.json
```

**Expected**:
```json
{
  "deterministic": true,
  "differences": []
}
```

### 5. Attestation
```bash
avery-attest baseline-minimal.json baseline-output.json baseline-emergy.json <key> --out baseline-attestation.json
```

**Output**: Ed25519-signed attestation

**Signature**: `[to be recorded]`

## Baseline Requirements

### MUST Pass All 5 Steps

If any step fails:
- ❌ Determinism is NOT proven
- ❌ System is NOT ready for production
- ❌ No further work should proceed

### Golden Artifacts Are Reference

Once recorded, these artifacts become **immutable reference**:
- All future runs MUST produce identical hashes
- Any deviation = regression or schema violation
- CI/CD MUST validate against these artifacts

## Testing Against Baseline

### Daily Regression Test
```bash
cd conformance/baseline
./run-baseline-test.sh
```

**Pass criteria**: All hashes match golden values

### After Code Changes
```bash
# Re-run baseline
nofate-solve baseline-minimal.json --out new-output.json --emergy new-emergy.json

# Compare hashes
diff <(nofate-canon baseline-output.json 2>&1 | grep sha256) \
     <(nofate-canon new-output.json 2>&1 | grep sha256)

# MUST be identical
```

### After Schema Changes
**NOT ALLOWED** - schemas are frozen. If you changed a schema, you violated the freeze policy.

### After Solver Changes
```bash
# Replay MUST still pass
avery-replay baseline-minimal.json baseline-output.json baseline-emergy.json

# If replay fails:
# - New solver is non-deterministic OR
# - New solver uses different semantics OR
# - contract_semantics version must be bumped
```

## Baseline Bundle Definition

**File**: `baseline-minimal.json`

```json
{
  "nofate_version": "1.0.0",
  "bundle_id": "baseline-minimal-001",
  "state": {
    "x": 0,
    "goal_reached": false
  },
  "actions": [
    {
      "id": "increment_x",
      "pre": ["x_is_zero"],
      "eff": ["x_is_one", "!x_is_zero"],
      "cost": 1.0
    },
    {
      "id": "reach_goal",
      "pre": ["x_is_one"],
      "eff": ["goal_reached"],
      "cost": 1.0
    }
  ],
  "constraints": [
    {
      "id": "must_reach_goal",
      "type": "hard",
      "expr": "final state must have goal_reached = true"
    }
  ],
  "solver_pins": {
    "contract_semantics": "nofate-1.0.0",
    "tie_break": "action_id",
    "seed": "baseline-2025-12-12"
  }
}
```

## Expected Output

**File**: `baseline-output.json`

```json
{
  "result": "solved",
  "plan": [
    {
      "step": 1,
      "action_id": "increment_x",
      "start": 0,
      "end": 1
    },
    {
      "step": 2,
      "action_id": "reach_goal",
      "start": 1,
      "end": 2
    }
  ],
  "objective": {
    "cost": 2.0
  }
}
```

## Expected Emergy Structure

**File**: `baseline-emergy.json`

Must contain:
- `nofate_version: "1.0.0"`
- `emergy_version: "1.0.0"`
- `bundle_hash` matching canonical bundle
- `output_hash` matching canonical output
- `decision_graph` with at least 2 nodes
- `determinism.canonicalization: "JCS"`
- `determinism.tie_break: "action_id"`

## Baseline Guarantees

### If Baseline Passes

✅ **JCS canonicalization works**: Hashes are consistent  
✅ **Solver is deterministic**: Replay succeeds  
✅ **Emergy explains output**: Verification passes  
✅ **Attestation is valid**: Signature verifies  

### If Baseline Fails

❌ **Blocker**: Fix before any other work  
❌ **No new features**: Determinism is broken  
❌ **No production deployment**: Trust is compromised  

## Maintenance

### Monthly Audit
- Re-run baseline test
- Verify golden hashes
- Confirm CI/CD enforcement

### Annual Review
- Evaluate if baseline remains minimal
- Consider adding edge cases
- Document any lessons learned

## Integration with CI/CD

```yaml
# .github/workflows/baseline-test.yml
name: Baseline Determinism Test

on: [push, pull_request]

jobs:
  baseline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd conformance/baseline && ./run-baseline-test.sh
      - name: Fail on hash mismatch
        if: failure()
        run: echo "CRITICAL: Baseline determinism is broken!" && exit 1
```

---

**This baseline is the foundation of trust. Protect it.**
