# Avery + Emergy: Deterministic Planning & Attestation

**Cryptographically verifiable, deterministic decision-making for the No Fate ecosystem**

---

## ⚠️ IMPORTANT: Read This First

**Before using this system, you MUST read these governance documents:**

1. **[SCHEMA_FREEZE_NOTICE](schemas/SCHEMA_FREEZE_NOTICE.md)** - Schemas are FROZEN (immutable execution law)
2. **[BASELINE_DETERMINISM_VECTOR](conformance/baseline/BASELINE_DETERMINISM_VECTOR.md)** - Prove determinism works
3. **[AVERY_GATE_POLICY](AVERY_GATE_POLICY.md)** - Avery is non-bypassable
4. **[EMERGY_WHY_INTERFACE_POLICY](EMERGY_WHY_INTERFACE_POLICY.md)** - Emergy is mandatory
5. **[CONFORMANCE_EXPANSION_PLAN](conformance/CONFORMANCE_EXPANSION_PLAN.md)** - Test vectors required
6. **[TRUST_BOUNDARY_AND_KEY_MANAGEMENT](TRUST_BOUNDARY_AND_KEY_MANAGEMENT.md)** - Trust model + keys
7. **[EXPANSION_GOVERNANCE](EXPANSION_GOVERNANCE.md)** - Rules for new features

**These documents establish the foundation of trust. Skipping them = missing critical context.**

---

## Overview

**Avery** is the verification and attestation agent for No Fate.  
**Emergy** is the decision trace format that makes reasoning auditable and replayable.

Together, they enable:
- 🔒 **Deterministic outputs**: Same inputs → same results (byte-for-byte)
- 📜 **Auditable reasoning**: WHY decisions were made
- ✅ **Cryptographic proof**: Ed25519-signed attestations
- 🔁 **Reproducibility**: Anyone can replay and verify

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         No Fate Ecosystem                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT: Bundle.json                                             │
│  ├─ Initial state                                               │
│  ├─ Actions (with preconditions, effects, costs)               │
│  ├─ Constraints (MUST satisfy)                                  │
│  ├─ Policies (weighted preferences)                             │
│  └─ Solver pins (determinism guarantees)                        │
│                                                                 │
│         ↓                                                       │
│                                                                 │
│  SOLVER: nofate-solve                                           │
│  └─ Deterministic planning/search                               │
│                                                                 │
│         ↓                                                       │
│                                                                 │
│  OUTPUTS:                                                       │
│  ├─ Output.json (plan/schedule/decision)                        │
│  └─ Emergy.json (decision trace with WHY)                       │
│                                                                 │
│         ↓                                                       │
│                                                                 │
│  AVERY: Verification + Attestation                              │
│  ├─ avery-verify: Check constraints, hashes, explanations       │
│  ├─ avery-attest: Sign with Ed25519                             │
│  └─ avery-replay: Re-run solver, confirm byte-identical         │
│                                                                 │
│         ↓                                                       │
│                                                                 │
│  ATTESTATION: Cryptographic proof                               │
│  └─ Signed claim: "These outputs are valid for these inputs"    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Concepts

### 1. Bundles (Inputs)

A **bundle** defines a deterministic planning problem:

```json
{
  "nofate_version": "1.0.0",
  "bundle_id": "unique-id",
  "state": { "initial": "world state" },
  "actions": [
    {
      "id": "action_1",
      "pre": ["preconditions"],
      "eff": ["effects"],
      "cost": 1.0
    }
  ],
  "constraints": [
    { "id": "c1", "type": "hard", "expr": "MUST satisfy" }
  ],
  "policies": [
    { "id": "p1", "type": "soft", "weight": 2.0, "expr": "prefer this" }
  ],
  "solver_pins": {
    "contract_semantics": "nofate-1.0.0",
    "tie_break": "f,g,depth,action_id,state_hash",
    "seed": "42"
  }
}
```

**Solver pins** guarantee determinism:
- `contract_semantics`: Version of interpretation rules
- `tie_break`: How to choose between equal-score actions
- `seed`: Optional random seed

### 2. Outputs (Plans)

The solver produces an **output**:

```json
{
  "result": "solved",
  "plan": [
    { "step": 1, "action_id": "action_1" },
    { "step": 2, "action_id": "action_2" }
  ],
  "objective": {
    "cost": 5.0,
    "policy_score": 10.0
  }
}
```

Or: `unsolvable`, `timeout`, `error` with reasons.

### 3. Emergy (Decision Traces)

**Emergy** records WHY the solver made each decision:

```json
{
  "nofate_version": "1.0.0",
  "bundle_hash": "sha256:...",
  "output_hash": "sha256:...",
  "decision_graph": [
    {
      "node": "node_1",
      "state_hash": "sha256:...",
      "candidates": ["action_1", "action_2"],
      "evaluations": {
        "action_1": { "type": "hard", "passed": true, "evidence": "..." },
        "action_2": { "type": "hard", "passed": false, "evidence": "violated c1" }
      },
      "chosen": "action_1",
      "tie_break": { "applied": false }
    }
  ],
  "rejections": [
    {
      "action_id": "action_2",
      "because": [
        { "constraint_id": "c1", "evidence": "..." }
      ]
    }
  ],
  "determinism": {
    "canonicalization": "JCS",
    "tie_break": "f,g,depth,action_id,state_hash",
    "engine_build": "nofate-solve-1.0.0"
  }
}
```

**Key properties**:
- **Decision graph**: Every choice point documented
- **Evaluations**: Constraint/policy scores for each candidate
- **Rejections**: Actions that were considered but rejected (with evidence)
- **Determinism**: Replay information

### 4. Avery's Verification

**avery-verify** checks:

1. ✅ **Hash consistency**: Bundle/output/emergy hashes match
2. ✅ **Schema validity**: Artifacts conform to specifications
3. ✅ **Constraint satisfaction**: Output respects constraints
4. ✅ **Explanation consistency**: Emergy explains output

### 5. Avery's Attestation

**avery-attest** creates a signed attestation:

```json
{
  "type": "avery.attestation",
  "nofate_version": "1.0.0",
  "issued_at": "2025-01-28T12:00:00Z",
  "issuer": {
    "name": "Avery",
    "key_id": "ed25519:<public_key_hex>"
  },
  "claims": {
    "bundle_hash": "sha256:...",
    "output_hash": "sha256:...",
    "emergy_hash": "sha256:...",
    "conformance": ["nofate-1.0.0", "emergy-1.0.0"],
    "verification": [
      "bundle_hash_consistent",
      "output_hash_consistent",
      "constraints_satisfied",
      "explanations_consistent"
    ]
  },
  "signature": "<ed25519_signature_hex>"
}
```

**Properties**:
- **Non-repudiation**: Signature proves Avery attested
- **Integrity**: Any change invalidates signature
- **Binding**: Hashes tie inputs → emergy → outputs
- **Auditability**: Verification checks are documented

### 6. Replay Verification

**avery-replay** re-runs the solver and confirms byte-identical outputs:

```bash
avery-replay bundle.json output.json emergy.json
# ✓ Replay confirmed: outputs are byte-identical
```

**Why this matters**:
- Proves determinism in practice
- Detects non-deterministic bugs
- Enables trust without trusting solver implementation

## Tools

### 1. nofate-canon

**Canonicalization + hashing**

```bash
nofate-canon bundle.json > canonical.json 2> hash.txt
```

- Uses JCS (RFC 8785) for canonical JSON
- Computes SHA-256 hash
- Deterministic across platforms

### 2. nofate-solve

**Solver engine**

```bash
nofate-solve bundle.json --out output.json --emergy emergy.json
```

- Reference implementation (can be replaced)
- MUST respect solver_pins for determinism
- Produces output + emergy

### 3. avery-verify

**Verification checks**

```bash
avery-verify bundle.json output.json emergy.json
```

- Hash consistency
- Schema validation
- Constraint satisfaction
- Explanation consistency

### 4. avery-attest

**Cryptographic attestation**

```bash
avery-attest bundle.json output.json emergy.json <private_key_hex> --out attestation.json
```

- Runs verification first
- Signs with Ed25519
- Produces attestation artifact

### 5. avery-replay

**Determinism verification**

```bash
avery-replay bundle.json output.json emergy.json
```

- Re-runs solver
- Compares hashes byte-for-byte
- Reports differences (if any)

## Installation

```bash
# Install all tools
cd tools/canon && npm install && npm run build
cd ../solve && npm install && npm run build
cd ../avery/verify && npm install && npm run build
cd ../avery/attest && npm install && npm run build
cd ../avery/replay && npm install && npm run build
```

## Quick Start

### 1. Create a Bundle

```json
{
  "nofate_version": "1.0.0",
  "bundle_id": "quickstart-001",
  "state": { "x": 0 },
  "actions": [
    { "id": "increment", "pre": [], "eff": ["x++"], "cost": 1 }
  ],
  "constraints": [],
  "solver_pins": {
    "contract_semantics": "nofate-1.0.0",
    "tie_break": "action_id",
    "seed": "0"
  }
}
```

### 2. Solve

```bash
nofate-solve quickstart.json --out output.json --emergy emergy.json
```

### 3. Verify

```bash
avery-verify quickstart.json output.json emergy.json
```

### 4. Attest

```bash
# Generate Ed25519 keypair (one-time)
node -e "const ed = require('@noble/ed25519'); ed.utils.randomPrivateKey().then(k => console.log(Buffer.from(k).toString('hex')))"

# Sign attestation
avery-attest quickstart.json output.json emergy.json <private_key_hex> --out attestation.json
```

### 5. Replay

```bash
avery-replay quickstart.json output.json emergy.json
```

## Use Cases

### Operations Scheduling

- Schedule tasks across servers
- Respect resource limits (CPU, memory)
- Minimize cost, balance load
- **Example**: `examples/ops-scheduling/`

### Compliance Policy Enforcement

- Evaluate approval workflows
- Enforce regulatory requirements (SOC2, HIPAA)
- Explain decisions to auditors
- **Example**: `examples/compliance-policy/`

### Supply Chain Optimization

- Route shipments through network
- Satisfy delivery deadlines
- Minimize fuel cost, CO2 emissions

### Healthcare Resource Allocation

- Assign patients to beds
- Respect capacity, priority, medical constraints
- Document fairness for compliance

### Financial Trade Execution

- Order routing decisions
- Respect risk limits, regulations
- Auditable for SEC/FINRA

## Conformance Testing

```bash
cd conformance/runner
npm install
npm test
```

Test vectors ensure:
- Different solvers produce identical outputs
- Ecosystem interoperability
- Regression detection

## Schemas

JSON Schema definitions in `schemas/`:
- `bundle.schema.json`
- `output.schema.json`
- `emergy.schema.json`
- `attestation.schema.json`

## Security

### Ed25519 Keys

- **Generate**: Use `@noble/ed25519` or similar
- **Store**: Use hardware security modules (HSMs) for production
- **Rotate**: Support multiple keys with key_id versioning

### Threat Model

- **Tampered inputs**: Detected by hash mismatch
- **Tampered outputs**: Detected by replay verification
- **Forged attestations**: Detected by signature verification
- **Non-deterministic solvers**: Detected by replay

## Roadmap

**Current Status**: v1.0.0 Foundation

**Immediate Priorities (Blockers)**:
1. 🟡 Build tools and run baseline test
2. 🟡 Integrate Avery gates into CI/CD
3. 🟡 Implement 15 conformance test vectors
4. 🟡 Generate production Ed25519 keys

**See [EXPANSION_GOVERNANCE.md](EXPANSION_GOVERNANCE.md) for detailed status.**

**Future (After Steps 1-6 Complete)**:
- [ ] Zero-knowledge proofs (ZKP) for private inputs
- [ ] Distributed solver (multi-party computation)
- [ ] Blockchain integration for public attestations
- [ ] WASM build for browser-based verification
- [ ] Language bindings (Python, Rust, Go)

**NO NEW FEATURES until foundation is complete. See governance documents.**

---

## Governance & Policy

This system is governed by explicit policies:

- **Schema Freeze**: [schemas/SCHEMA_FREEZE_NOTICE.md](schemas/SCHEMA_FREEZE_NOTICE.md)
- **Baseline Testing**: [conformance/baseline/BASELINE_DETERMINISM_VECTOR.md](conformance/baseline/BASELINE_DETERMINISM_VECTOR.md)
- **Avery Gates**: [AVERY_GATE_POLICY.md](AVERY_GATE_POLICY.md)
- **Emergy Policy**: [EMERGY_WHY_INTERFACE_POLICY.md](EMERGY_WHY_INTERFACE_POLICY.md)
- **Conformance**: [conformance/CONFORMANCE_EXPANSION_PLAN.md](conformance/CONFORMANCE_EXPANSION_PLAN.md)
- **Trust Model**: [TRUST_BOUNDARY_AND_KEY_MANAGEMENT.md](TRUST_BOUNDARY_AND_KEY_MANAGEMENT.md)
- **Expansion Rules**: [EXPANSION_GOVERNANCE.md](EXPANSION_GOVERNANCE.md)

**These policies are non-negotiable. They ensure trust and determinism.**

---

MIT

## Contributing

Contributions welcome! See examples of:
- New test vectors
- Additional solvers
- Language bindings
- Integration guides

## References

- **JCS (RFC 8785)**: Canonical JSON
- **Ed25519**: High-security signatures
- **No Fate Contract**: Deterministic AI specification
- **NFCS**: No Fate Conformance Specification
- **NFCTS**: No Fate Conformance Test Suite
