# Avery as a Hard Gate (Non-Bypassable)

**Date**: 2025-12-12  
**Status**: MANDATORY ENFORCEMENT POLICY

## Core Principle

**Avery verification + replay is NOT optional.**

No output is considered valid unless:
1. ✅ `avery-verify` passes all checks
2. ✅ `avery-replay` confirms byte-identical determinism

This is **non-bypassable** by design.

## What "Hard Gate" Means

### Before Avery: Trust Is Assumed
- Solver produces output
- User accepts it
- No proof of correctness
- No proof of determinism
- No auditability

### With Avery as Hard Gate: Trust Is Proven
- Solver produces output + emergy
- **Avery verifies** constraints, hashes, explanations
- **Avery replays** to confirm determinism
- Only then: output is considered valid
- Cryptographic attestation provides proof

### No Bypass Routes

The following are **NOT ALLOWED**:
- ❌ Using solver output without verification
- ❌ Skipping replay "because it's too slow"
- ❌ Manual overrides or exceptions
- ❌ "Trust me" deployments
- ❌ Disabling Avery in production

**If Avery fails, output is INVALID. Period.**

## Enforcement Points

### 1. CI/CD Pipeline

**MUST** include Avery gates:

```yaml
# .github/workflows/validate-outputs.yml
name: Validate Outputs

on: [push, pull_request]

jobs:
  avery-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Run solver
        run: nofate-solve bundle.json --out output.json --emergy emergy.json
      
      - name: Avery Verify (HARD GATE)
        run: |
          avery-verify bundle.json output.json emergy.json || \
          (echo "GATE FAILURE: Avery verification failed" && exit 1)
      
      - name: Avery Replay (HARD GATE)
        run: |
          avery-replay bundle.json output.json emergy.json || \
          (echo "GATE FAILURE: Avery replay failed (non-deterministic)" && exit 1)
      
      - name: Only if gates pass
        run: echo "Output is valid and attested"
```

**If Avery fails**: Build fails, PR is blocked, deployment is prevented.

### 2. Solver Swaps

When replacing or upgrading a solver:

```bash
# Old solver
nofate-solve-v1 bundle.json --out output-v1.json --emergy emergy-v1.json
avery-verify bundle.json output-v1.json emergy-v1.json
avery-replay bundle.json output-v1.json emergy-v1.json

# New solver (MUST pass same gates)
nofate-solve-v2 bundle.json --out output-v2.json --emergy emergy-v2.json
avery-verify bundle.json output-v2.json emergy-v2.json
avery-replay bundle.json output-v2.json emergy-v2.json

# If v2 fails: DO NOT SHIP IT
```

**No solver change is acceptable if Avery gates fail.**

### 3. Optimization Work

When optimizing solver performance:

```bash
# Baseline (before optimization)
nofate-solve bundle.json --out baseline-output.json --emergy baseline-emergy.json
avery-replay bundle.json baseline-output.json baseline-emergy.json
# Record baseline hashes

# Optimized solver
nofate-solve-optimized bundle.json --out optimized-output.json --emergy optimized-emergy.json
avery-replay bundle.json optimized-output.json optimized-emergy.json

# Compare hashes: MUST be byte-identical
diff <(nofate-canon baseline-output.json) <(nofate-canon optimized-output.json)
# If different: optimization broke determinism → REJECT
```

**Optimization that breaks determinism is NOT optimization.**

### 4. Production Deployments

**Pre-deployment checklist**:
```bash
# 1. Verify
avery-verify bundle.json output.json emergy.json
[ $? -eq 0 ] || exit 1

# 2. Replay
avery-replay bundle.json output.json emergy.json
[ $? -eq 0 ] || exit 1

# 3. Attest (optional but recommended)
avery-attest bundle.json output.json emergy.json $PRIVATE_KEY --out attestation.json

# 4. Deploy
deploy-to-production output.json attestation.json
```

**If step 1 or 2 fails: ABORT DEPLOYMENT.**

### 5. Manual Interventions

**Policy**: There are NO manual interventions that bypass Avery.

Even if:
- "It's an emergency"
- "We trust the solver"
- "Verification is taking too long"
- "Just this once"

**Answer**: NO. If Avery fails, fix the root cause.

## Why This Is Critical

### Without Hard Gates
- Non-deterministic bugs slip through
- Attestations become meaningless (no proof they were validated)
- Trust degrades over time
- Regulatory compliance breaks
- Emergy traces are unreliable

### With Hard Gates
- Non-deterministic behavior is caught immediately
- Every output is proven correct
- Attestations are trustworthy (verified before signing)
- Compliance is enforceable
- Emergy traces are canonical record

## Failure Modes and Responses

### Scenario 1: Avery-Verify Fails

**Possible Causes**:
- Constraints violated by output
- Hash mismatch (bundle/output/emergy tampered)
- Schema validation failed
- Explanation inconsistency

**Response**:
1. ❌ Output is INVALID
2. Investigate root cause
3. Fix solver or bundle
4. Re-run Avery gates
5. Only deploy if gates pass

**DO NOT**: Ship output anyway "for now"

### Scenario 2: Avery-Replay Fails

**Possible Causes**:
- Solver is non-deterministic (uses randomness, timestamps)
- solver_pins insufficient
- Implementation bug

**Response**:
1. ❌ Solver is NON-DETERMINISTIC
2. Identify source of non-determinism
3. Fix solver (remove randomness, add pins)
4. Re-run baseline test
5. Only deploy if replay confirms byte-identity

**DO NOT**: Disable replay "because outputs look correct"

### Scenario 3: Gates Are "Too Slow"

**Response**:
- Optimize Avery tools (but preserve correctness)
- Run gates in parallel (verify + replay can run concurrently)
- Cache results for unchanged bundles
- Accept the cost: **correctness > speed**

**DO NOT**: Skip gates or reduce rigor

### Scenario 4: "We Need to Ship Now"

**Response**:
- If Avery passes: Ship
- If Avery fails: DO NOT SHIP

**There is no middle ground.**

Shipping invalid outputs is:
- Violation of No Fate contract
- Breach of trust with users
- Potential regulatory violation
- Technical debt that compounds

## Integration with Attestation

Avery gates ensure attestations are meaningful:

```bash
# BAD: Attesting without verification
avery-attest bundle.json output.json emergy.json $KEY  # ❌ WRONG

# GOOD: Verification is baked into attestation
avery-attest bundle.json output.json emergy.json $KEY  # ✅ (internally runs verify)
```

`avery-attest` **MUST**:
1. Run `avery-verify` first
2. Only sign if verification passes
3. Fail hard if verification fails

**No attestation without verification.**

## Monitoring and Alerts

### Metrics to Track
- **Gate pass rate**: % of outputs passing Avery gates
- **Replay failure rate**: % of replays detecting non-determinism
- **Verification failure reasons**: Which checks fail most often

### Alerts
- 🚨 **Critical**: Avery gate bypassed (should be impossible)
- ⚠️ **Warning**: Replay failed (non-determinism detected)
- ⚠️ **Warning**: Verification failed (constraints violated)

### Dashboards
- Real-time Avery gate status
- Historical pass/fail trends
- Root cause analysis for failures

## Governance

### Policy Enforcement
- **Technical**: CI/CD enforces gates automatically
- **Process**: Code review checks for bypass attempts
- **Cultural**: Team training on importance of gates

### Exception Process
**There are NO exceptions.**

If someone requests an exception:
1. Explain why Avery is non-bypassable
2. Help them fix the root cause
3. Document the incident (for learning)

### Audit
- Quarterly review: Are gates being enforced?
- Annual audit: Have any bypasses occurred?
- Incident response: If bypass detected, rollback immediately

## Summary

### The Rule
**No output is valid without Avery verification + replay.**

### The Rationale
- Prevents non-deterministic regressions
- Ensures cryptographic attestations are trustworthy
- Maintains compliance with No Fate contract
- Protects users from silent corruption

### The Enforcement
- CI/CD hard gates
- No manual bypasses
- Failed gates = blocked deployment
- Cultural commitment to rigor

---

**Avery is the gatekeeper. Respect the gate.**
