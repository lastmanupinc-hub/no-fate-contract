# Emergy as the Canonical "WHY" Interface

**Date**: 2025-12-12  
**Status**: MANDATORY FIRST-CLASS ARTIFACT

## Core Principle

**Emergy is NOT debug output. It is the canonical explanation interface.**

Every No Fate computation MUST produce:
1. **Output** (WHAT was decided)
2. **Emergy** (WHY it was decided)

Without Emergy, Output is meaningless and unverifiable.

## What This Means

### Before: Output-Only
```json
{
  "result": "solved",
  "plan": [
    {"step": 1, "action_id": "deploy_service"},
    {"step": 2, "action_id": "notify_team"}
  ]
}
```

**Questions**:
- Why was `deploy_service` chosen over alternatives?
- What constraints were evaluated?
- How were ties broken?
- Can I trust this decision?

**Answer**: Unknown. No explanation exists.

### With Emergy: Auditable Decision-Making
```json
{
  "result": "solved",
  "plan": [...],
  "emergy": {
    "decision_graph": [
      {
        "node": "node_1",
        "candidates": ["deploy_service", "wait_for_approval"],
        "evaluations": {
          "deploy_service": {
            "type": "hard",
            "passed": true,
            "evidence": "approval_exists=true, security_scan_passed=true"
          },
          "wait_for_approval": {
            "type": "hard",
            "passed": false,
            "evidence": "approval already obtained, waiting unnecessary"
          }
        },
        "chosen": "deploy_service"
      }
    ]
  }
}
```

**Questions answered**:
- ✅ Why `deploy_service`? Security scan passed, approval exists
- ✅ Why not `wait_for_approval`? Already approved
- ✅ What constraints? Both candidates evaluated against hard constraints
- ✅ Can I trust it? Evidence is documented, auditable

## Requirements for Solver Implementations

Every solver MUST:

### 1. Emit Complete Decision Graph

```typescript
interface DecisionNode {
  node: string;              // Unique identifier
  state_hash: string;        // SHA-256 of world state at this node
  candidates: string[];      // ALL actions considered
  evaluations: {...};        // Constraint/policy scores for EACH candidate
  chosen: string;            // Which action was selected
  tie_break?: {...};         // Tie-breaking info (if applicable)
}
```

**NOT ALLOWED**:
- ❌ Emitting only chosen actions
- ❌ Omitting rejected candidates
- ❌ Missing evaluations
- ❌ Skipping "obvious" decisions

**EVERY decision point must be documented.**

### 2. Record All Rejected Candidates with Evidence

```typescript
interface Rejection {
  action_id: string;
  because: Array<{
    constraint_id: string;
    evidence: string;
  }>;
}
```

**Purpose**: Explain why options were NOT chosen.

**Example**:
```json
{
  "rejections": [
    {
      "action_id": "deploy_without_approval",
      "because": [
        {
          "constraint_id": "require_dual_approval",
          "evidence": "manager_approval=false, security_approval=false"
        }
      ]
    }
  ]
}
```

**This is critical for**:
- Compliance audits ("Why wasn't option X chosen?")
- Debugging ("Did the solver consider action Y?")
- Trust ("Show me you evaluated all options")

### 3. Include Determinism Metadata

```typescript
interface Determinism {
  canonicalization: 'JCS';     // MUST be JCS (RFC 8785)
  tie_break: string;           // From solver_pins
  engine_build?: string;       // Solver version/commit
}
```

**Purpose**: Enable replay verification.

**Requirements**:
- ✅ Canonicalization method is explicit
- ✅ Tie-breaking strategy is documented
- ✅ Engine version is recorded (for bug tracking)

### 4. Link to Bundle and Output via Hashes

```typescript
interface Emergy {
  nofate_version: string;
  emergy_version: string;      // MUST be "1.0.0"
  bundle_hash: string;         // sha256:... of canonical bundle
  output_hash: string;         // sha256:... of canonical output
  decision_graph: [...];
  determinism: {...};
}
```

**Purpose**: Cryptographic binding.

**Guarantee**: If bundle_hash or output_hash changes, emergy is invalid.

## Validation Rules

### Output without Emergy = INVALID

```typescript
if (output.result === 'solved' && !emergy) {
  throw new Error('INVALID: Output without Emergy');
}
```

**Rationale**: You can't have a decision without explaining WHY.

### Emergy that Cannot Explain Output = INVALID

```typescript
if (output.result === 'solved' && emergy.decision_graph.length === 0) {
  throw new Error('INVALID: Emergy has no decision nodes');
}
```

**Rationale**: Empty decision graph = no explanation = invalid.

### Emergy with Mismatched Hashes = INVALID

```typescript
if (emergy.bundle_hash !== canonicalize(bundle).hash) {
  throw new Error('INVALID: Emergy bundle_hash does not match actual bundle');
}
```

**Rationale**: Emergy must be cryptographically tied to inputs.

## Verification Checks

`avery-verify` enforces these rules:

```typescript
// Check 1: Emergy exists
if (!emergy) {
  errors.push('Missing Emergy artifact');
}

// Check 2: Emergy has required fields
if (!emergy.emergy_version || emergy.emergy_version !== '1.0.0') {
  errors.push('Invalid emergy_version');
}

// Check 3: Decision graph is non-empty (for solved outputs)
if (output.result === 'solved' && emergy.decision_graph.length === 0) {
  errors.push('Empty decision graph for solved output');
}

// Check 4: Hashes are consistent
if (emergy.bundle_hash !== actual_bundle_hash) {
  errors.push('Bundle hash mismatch');
}

if (emergy.output_hash !== actual_output_hash) {
  errors.push('Output hash mismatch');
}

// Check 5: All plan steps are explained
for (const step of output.plan) {
  const explained = emergy.decision_graph.some(node => 
    node.chosen === step.action_id
  );
  if (!explained) {
    errors.push(`Plan step ${step.step} not explained in Emergy`);
  }
}
```

**If ANY check fails**: Emergy is INVALID, output is INVALID.

## Use Cases Enabled by Emergy

### 1. Regulatory Compliance
**Scenario**: HIPAA audit asks "Why did system grant access to patient record X?"

**Without Emergy**: "Our AI decided it." (Not acceptable)

**With Emergy**:
```json
{
  "decision_graph": [{
    "node": "access_decision",
    "candidates": ["grant_access", "deny_access"],
    "evaluations": {
      "grant_access": {
        "type": "hard",
        "passed": true,
        "evidence": "user_role=doctor, patient_consent=true, emergency=false"
      }
    },
    "chosen": "grant_access"
  }]
}
```

**Audit response**: "Access granted because user has doctor role, patient consent exists, and emergency protocols were not needed. Evidence is in Emergy record ID: XYZ."

### 2. Debugging Non-Determinism
**Scenario**: Same input produces different output on different runs.

**Without Emergy**: Manual code inspection, guesswork.

**With Emergy**:
```bash
# Run 1
nofate-solve bundle.json --out output1.json --emergy emergy1.json

# Run 2
nofate-solve bundle.json --out output2.json --emergy emergy2.json

# Compare decision graphs
diff <(jq '.decision_graph' emergy1.json) <(jq '.decision_graph' emergy2.json)
```

**Result**: Exact node where decisions diverged is visible.

### 3. Explaining Trade-offs
**Scenario**: User asks "Why did you choose plan A over plan B?"

**Without Emergy**: "Plan A is better." (No details)

**With Emergy**:
```json
{
  "evaluations": {
    "plan_a": {
      "type": "soft",
      "penalty": 5.0,
      "evidence": "cost=100, latency=10ms, policy_score=5.0"
    },
    "plan_b": {
      "type": "soft",
      "penalty": 8.0,
      "evidence": "cost=80, latency=20ms, policy_score=8.0"
    }
  },
  "chosen": "plan_a",
  "tie_break": {
    "applied": false,
    "reason": "Plan A had lower penalty (5.0 < 8.0)"
  }
}
```

**Explanation**: "Plan A was chosen because it had lower total penalty (5.0 vs 8.0), favoring latency over cost according to policy weights."

### 4. Trust Verification
**Scenario**: Third party receives attested output and wants to verify.

**Without Emergy**: Trust the signature, hope for the best.

**With Emergy**:
```bash
# 1. Verify attestation signature
avery-verify bundle.json output.json emergy.json

# 2. Replay to confirm determinism
avery-replay bundle.json output.json emergy.json

# 3. Inspect decision graph
jq '.decision_graph' emergy.json

# 4. Confirm evidence makes sense
grep "evidence" emergy.json
```

**Result**: Third party can independently verify:
- Signature is valid (attestation)
- Output is reproducible (replay)
- Decisions are explained (emergy)
- Evidence is reasonable (manual review)

## Integration with Attestation

Avery attestations bind Emergy as first-class:

```json
{
  "type": "avery.attestation",
  "claims": {
    "bundle_hash": "sha256:...",
    "output_hash": "sha256:...",
    "emergy_hash": "sha256:...",  // ← Emergy is cryptographically bound
    "verification": [
      "explanations_consistent"  // ← Avery verified Emergy explains Output
    ]
  },
  "signature": "..."
}
```

**Guarantee**: Attested output ALWAYS has valid Emergy.

## Solver Implementation Guidance

### Minimum Viable Emergy

```typescript
function solve(bundle: Bundle): SolveResult {
  const decisionGraph: DecisionNode[] = [];
  
  // For each decision point:
  for (const state of searchStates) {
    const candidates = getApplicableActions(state);
    const evaluations = evaluateCandidates(candidates, constraints);
    const chosen = selectBest(evaluations, tieBreakStrategy);
    
    decisionGraph.push({
      node: `node_${state.id}`,
      state_hash: hash(state),
      candidates: candidates.map(a => a.id),
      evaluations: evaluations,
      chosen: chosen.id,
      tie_break: {
        applied: evaluations.length > 1 && hasEqualScores(evaluations),
        reason: tieBreakStrategy
      }
    });
  }
  
  const emergy: Emergy = {
    nofate_version: bundle.nofate_version,
    emergy_version: '1.0.0',
    bundle_hash: hash(bundle),
    output_hash: hash(output),
    decision_graph: decisionGraph,
    rejections: getRejectedActions(decisionGraph),
    determinism: {
      canonicalization: 'JCS',
      tie_break: bundle.solver_pins.tie_break,
      engine_build: VERSION
    }
  };
  
  return { output, emergy };
}
```

### Advanced Emergy

For complex solvers:
- Include heuristic values (f, g, h for A*)
- Record pruning decisions
- Document search strategy
- Add timings (for performance analysis)

**But**: Core decision_graph + rejections + determinism are MANDATORY.

## Enforcement

### CI/CD
```yaml
- name: Validate Emergy
  run: |
    # Check that Emergy exists
    test -f emergy.json || (echo "Missing Emergy" && exit 1)
    
    # Check emergy_version
    grep '"emergy_version": "1.0.0"' emergy.json || (echo "Invalid emergy_version" && exit 1)
    
    # Check decision_graph is non-empty
    jq '.decision_graph | length > 0' emergy.json || (echo "Empty decision graph" && exit 1)
```

### Code Review
- PR checklist: "Does solver emit complete Emergy?"
- Review: Inspect decision_graph for completeness
- Test: Verify `avery-verify` passes

### Documentation
- Every solver README must explain Emergy generation
- Examples must include Emergy artifacts
- Tutorials must show how to inspect decision graphs

## Summary

### The Rule
**Output without Emergy is invalid. Emergy is the canonical WHY interface.**

### The Requirements
1. ✅ Complete decision graph (all candidates, all evaluations)
2. ✅ Rejected actions with evidence
3. ✅ Determinism metadata
4. ✅ Cryptographic binding (bundle_hash, output_hash)

### The Benefits
- 📜 Auditable decisions
- 🐛 Debuggable non-determinism
- 🤝 Trust through transparency
- ✅ Regulatory compliance

---

**Emergy is not optional. It is the foundation of trust.**
