# Expansion Governance: After Steps 1-6

**Date**: 2025-12-12  
**Status**: MANDATORY CHECKLIST FOR NEW FEATURES

## The Rule

**NO new features until Steps 1-6 are complete.**

This document defines what "complete" means and how to proceed afterward.

## Steps 1-6: Completion Checklist

### ✅ Step 1: Lock the Contracts (Freeze the Law)

**Required**:
- [x] All 4 schemas marked FROZEN with `$comment` field
- [x] `SCHEMA_FREEZE_NOTICE.md` created and committed
- [x] `emergy_version` field added to emergy.schema.json
- [x] All schemas explicitly version nofate_version, emergy_version, contract_semantics

**Verification**:
```bash
# Check freeze notices exist
grep -r "FROZEN" schemas/*.json
grep "emergy_version" schemas/emergy.schema.json

# Verify reference hashes (after first build)
sha256sum schemas/*.json > schemas/FROZEN_HASHES.txt
```

**Status**: ✅ COMPLETE

---

### ✅ Step 2: Establish Reference Determinism Baseline

**Required**:
- [x] `conformance/baseline/baseline-minimal.json` created
- [x] `BASELINE_DETERMINISM_VECTOR.md` documentation written
- [x] `run-baseline-test.sh` script created
- [ ] Baseline test executed successfully (5 steps pass)
- [ ] Golden hashes recorded in `golden-hashes.txt`

**Verification**:
```bash
cd conformance/baseline
./run-baseline-test.sh
# MUST output: "✓ BASELINE DETERMINISM TEST PASSED"

# Golden hashes recorded
cat golden-hashes.txt
# bundle: sha256:...
# output: sha256:...
# emergy: sha256:...
```

**Status**: 🟡 PARTIAL (baseline created, needs execution)

**Blocker**: Tools must be built first.

---

### ✅ Step 3: Wire Avery as a Hard Gate

**Required**:
- [x] `AVERY_GATE_POLICY.md` created
- [x] Policy explicitly states "non-bypassable"
- [x] Enforcement points documented (CI/CD, solver swaps, optimizations, production)
- [ ] CI/CD workflows updated with Avery gates
- [ ] Baseline test integrated into CI

**Verification**:
```bash
# Check CI/CD workflow exists
cat .github/workflows/avery-gate.yml

# Verify gates are enforced
grep "avery-verify" .github/workflows/*.yml
grep "avery-replay" .github/workflows/*.yml
```

**Status**: 🟡 PARTIAL (policy created, CI integration pending)

**Blocker**: CI/CD files need to be created.

---

### ✅ Step 4: Formalize Emergy as Canonical "WHY" Interface

**Required**:
- [x] `EMERGY_WHY_INTERFACE_POLICY.md` created
- [x] Policy states "Emergy is NOT optional"
- [x] Validation rules documented (Output without Emergy = INVALID)
- [x] `avery-verify` updated to enforce Emergy validation
- [x] `nofate-solve` updated to emit `emergy_version: "1.0.0"`

**Verification**:
```bash
# Check solver emits emergy_version
grep "emergy_version" tools/solve/src/index.ts

# Check avery-verify validates Emergy
grep "POLICY VIOLATION" tools/avery/verify/src/index.ts
```

**Status**: ✅ COMPLETE

---

### 🟡 Step 5: Add Conformance Vectors Before New Features

**Required**:
- [x] `CONFORMANCE_EXPANSION_PLAN.md` created
- [x] 15 test vectors defined (multiple solvers, failures, tie-breaking, etc.)
- [ ] Test vectors implemented (15 bundle.json files)
- [ ] Expected outputs generated for all vectors
- [ ] Test runner updated to validate all categories
- [ ] CI/CD runs conformance suite on every commit

**Verification**:
```bash
# Check test vectors exist
ls conformance/vectors/test-*.json | wc -l
# MUST output: 15

# Run conformance suite
cd conformance/runner && npm test
# MUST output: "15 passed, 0 failed"
```

**Status**: 🟡 PARTIAL (plan created, vectors not implemented)

**Blocker**: 3-week implementation timeline required.

---

### ✅ Step 6: Decide the Trust Boundary

**Required**:
- [x] `TRUST_BOUNDARY_AND_KEY_MANAGEMENT.md` created
- [x] Trust model documented (centralized/federated/decentralized)
- [x] Key management policy defined (generation, storage, rotation, revocation)
- [x] Attestation distribution modes explained (private/shared/public)
- [ ] Ed25519 keypair generated for production
- [ ] Private key stored in HSM
- [ ] Trust store created (if applicable)

**Verification**:
```bash
# Check trust policy exists
cat TRUST_BOUNDARY_AND_KEY_MANAGEMENT.md

# Verify key management (production only)
# Private key MUST be in HSM, not in repo
! grep -r "BEGIN PRIVATE KEY" .
```

**Status**: 🟡 PARTIAL (policy created, key generation pending)

**Blocker**: Production deployment decision required.

---

## Overall Status

| Step | Status | Blocker |
|------|--------|---------|
| 1. Lock Contracts | ✅ COMPLETE | None |
| 2. Baseline Vector | 🟡 PARTIAL | Tools must be built |
| 3. Avery as Gate | 🟡 PARTIAL | CI/CD integration |
| 4. Emergy Interface | ✅ COMPLETE | None |
| 5. Conformance Vectors | 🟡 PARTIAL | 3-week implementation |
| 6. Trust Boundary | 🟡 PARTIAL | Key generation |

**Ready for expansion?**: ❌ NO (4/6 steps partial)

---

## Expansion Readiness Criteria

### Before ANY New Features

**MUST be TRUE**:
- ✅ All schemas are frozen
- ✅ Emergy is mandatory
- 🟡 Baseline test passes
- 🟡 Avery gates are enforced in CI
- 🟡 15 conformance vectors pass
- 🟡 Trust model is documented + keys exist

**Current**: 2/6 complete, 4/6 partial

**Estimated time to complete**: 4-5 weeks
- Week 1: Build tools, run baseline, generate keys
- Weeks 2-4: Implement 15 conformance vectors
- Week 5: CI/CD integration, final validation

---

## Permitted Expansion Categories

### Once Steps 1-6 Are Complete

**Category A: New Solvers**

Allowed:
- ✅ Implement alternative solver (A*, constraint propagation, etc.)
- ✅ Optimize existing solver (performance improvements)
- ✅ Port solver to different language (Rust, Go, Python)

**Requirements**:
1. MUST produce `emergy_version: "1.0.0"`
2. MUST pass all 15 conformance vectors
3. MUST pass Avery gates (verify + replay)
4. MUST respect `solver_pins` for determinism

**Validation**:
```bash
# Run conformance suite with new solver
cd conformance/runner
SOLVER=new-solver npm test
# MUST pass 15/15 tests
```

---

**Category B: Distributed Solving**

Allowed:
- ✅ Multi-party computation (MPC)
- ✅ Distributed search (partitioned state space)
- ✅ Parallel solving (multiple workers)

**Requirements**:
1. MUST preserve determinism (same inputs → same outputs)
2. MUST produce valid Emergy (explain distributed decisions)
3. MUST pass baseline + conformance tests
4. MUST NOT introduce non-determinism (network timing, etc.)

**Validation**:
```bash
# Distributed solver MUST produce identical outputs
nofate-solve-distributed bundle.json --out output.json
avery-replay bundle.json output.json emergy.json
# MUST confirm determinism
```

---

**Category C: Privacy Features**

Allowed:
- ✅ Zero-knowledge proofs (ZKP) for private inputs
- ✅ Encrypted bundles (homomorphic encryption)
- ✅ Private attestations (selective disclosure)

**Requirements**:
1. MUST maintain Emergy explanations (even if encrypted)
2. MUST allow verification (ZKP verification)
3. MUST NOT break replay (determinism still holds)
4. MUST update schemas if artifact formats change (new version)

**Validation**:
```bash
# ZKP MUST still allow verification
avery-verify-zkp bundle-encrypted.json output.json emergy.json zkp-proof.json
# MUST verify constraints without revealing inputs
```

---

**Category D: Public Anchoring**

Allowed:
- ✅ Blockchain integration (Ethereum, Polygon)
- ✅ IPFS storage for attestations
- ✅ Public attestation registries

**Requirements**:
1. MUST preserve attestation format (or version bump)
2. MUST NOT change trust model (public is additive, not replacement)
3. MUST document gas costs, latency, availability
4. MUST maintain off-chain verification (blockchain optional)

**Validation**:
```bash
# Attestation MUST verify off-chain
avery-verify bundle.json output.json emergy.json
# MUST pass without blockchain access

# Blockchain anchoring is ADDITIVE
anchor-to-blockchain attestation.json --chain ethereum
```

---

**Category E: Tooling Enhancements**

Allowed:
- ✅ WASM builds (browser verification)
- ✅ Language bindings (Python, Rust, Go)
- ✅ UI/dashboards for inspecting Emergy
- ✅ IDE plugins for bundle authoring

**Requirements**:
1. MUST NOT change schemas (frozen)
2. MUST maintain compatibility (can read v1.0.0 artifacts)
3. MUST pass conformance tests (if implementing solver)
4. MUST document API surfaces

**Validation**:
```bash
# WASM verification MUST match native
wasm-avery-verify bundle.json output.json emergy.json
native-avery-verify bundle.json output.json emergy.json
# MUST produce identical results
```

---

## Forbidden Changes

### NEVER ALLOWED (Even After Steps 1-6)

❌ **Modifying frozen schemas without version bump**
- Rationale: Breaks cryptographic attestations

❌ **Making Avery optional**
- Rationale: Eliminates trust guarantees

❌ **Removing Emergy from outputs**
- Rationale: Destroys auditability

❌ **Introducing non-determinism**
- Rationale: Violates No Fate contract

❌ **Bypassing conformance tests**
- Rationale: Breaks ecosystem interoperability

---

## Expansion Workflow

### For Each New Feature

1. **Proposal**:
   - Write RFC describing feature
   - Document impact on determinism, Emergy, attestations
   - Identify schema changes (if any → version bump)

2. **Implementation**:
   - Build feature
   - Ensure Avery gates pass
   - Add conformance tests (if applicable)

3. **Validation**:
   - Run baseline test: `./conformance/baseline/run-baseline-test.sh`
   - Run conformance suite: `cd conformance/runner && npm test`
   - Run Avery replay: `avery-replay ...`

4. **Review**:
   - Code review (technical correctness)
   - Architecture review (preserves determinism?)
   - Security review (keys, attestations, trust model)

5. **Merge**:
   - ONLY if all gates pass
   - ONLY if conformance tests pass
   - ONLY if baseline remains valid

---

## Monitoring Post-Expansion

### Continuous Validation

**Daily**:
- Run baseline test
- Verify golden hashes unchanged
- Check Avery gate pass rate

**Weekly**:
- Run full conformance suite
- Review Avery gate failures
- Audit key usage logs

**Monthly**:
- Review new features for determinism regressions
- Update conformance vectors (if new edge cases discovered)
- Rotate keys (if scheduled)

**Annually**:
- Full schema audit (ensure still frozen)
- Trust model review
- Key management policy update

---

## Emergency Stop

### If Determinism Breaks

**Symptoms**:
- Baseline test fails
- Avery replay detects non-determinism
- Conformance vectors produce different outputs

**Response**:
1. 🚨 **STOP all deployments**
2. Identify regression (git bisect)
3. Rollback offending change
4. Fix root cause
5. Re-run all tests
6. Document incident (for learning)

**Resume work ONLY after**:
- Baseline test passes
- Conformance suite passes
- Root cause is understood and documented

---

## Summary

### The Checklist

**Before expansion**:
- [x] Step 1: Schemas frozen ✅
- [ ] Step 2: Baseline passes 🟡
- [ ] Step 3: Avery gates enforced 🟡
- [x] Step 4: Emergy mandatory ✅
- [ ] Step 5: 15 conformance vectors pass 🟡
- [ ] Step 6: Trust model + keys 🟡

**Expansion is blocked until**: All 6 steps are ✅

**Estimated completion**: 4-5 weeks

### The Commitment

**After Steps 1-6**:
- Any expansion MUST preserve determinism
- Any expansion MUST pass Avery gates
- Any expansion MUST maintain Emergy
- Any expansion MUST respect frozen schemas

**There are no exceptions.**

---

**Foundation first. Expansion second. Always.**
