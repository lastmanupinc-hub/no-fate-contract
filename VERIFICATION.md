# No-Fate Governance Verification Instructions

**Version**: 1.0.0  
**Purpose**: Verify integrity of No-Fate Governance System artifacts  
**Authority**: Append-only verification, no mutation allowed  

---

## Verification Protocol

### Step 1: Verify SHA-256 Checksums

All governance artifacts MUST match checksums in `checksums/HASHES.txt`.

**Command** (PowerShell):
```powershell
# Verify single file
$expected = "sha256:8fe51cb3723440c104dc78dadb390d16412cadfcd3dd03b3d03d994a759cc97b"
$actual = (Get-FileHash -Algorithm SHA256 governance\governance_genesis.signed.json).Hash.ToLower()
if ("sha256:$actual" -eq $expected) { "✅ HASH VERIFIED" } else { "❌ HASH MISMATCH" }
```

**Command** (Linux/macOS):
```bash
# Verify all files from checksums/HASHES.txt
cd checksums
sha256sum -c HASHES.txt
```

**Expected Output**: All files should show `OK` or `✅ HASH VERIFIED`.

### Step 2: Verify GPG Signatures

All authority-bearing artifacts MUST have detached GPG signatures in `signatures/`.

**Command**:
```bash
# Import public key first
gpg --import signatures/no-fate-public-key.asc

# Verify single signature
gpg --verify signatures/governance_genesis.signed.json.asc governance/governance_genesis.signed.json

# Verify all signatures
for sig in signatures/*.asc; do
  file=$(basename "$sig" .asc)
  gpg --verify "$sig" "$file" || echo "❌ SIGNATURE FAILED: $file"
done
```

**Expected Output**:
```
gpg: Good signature from "No-Fate Governance Authority"
```

### Step 3: Verify Authority Chain

All artifacts MUST reference canonical genesis hash.

**Genesis Hash** (Canonical):
```
sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
```

**Verification**:
```bash
# Check binding registry references canonical genesis
grep "genesis_hash" governance/governance_binding_registry.json
# Expected: "genesis_hash": "sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a"

# Check NFDFQP spec references canonical genesis
grep "genesis_hash" delivery/NFDFQP_SPECIFICATION.md
# Expected: "genesis_hash": "sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a"
```

### Step 4: Verify Governance Audit

Run governance audit to verify all conformance checks pass.

**Command**:
```bash
node scripts/audit-governance.js
```

**Expected Output**:
```
Result: PASSED
Passed Checks: 23
Findings: 0 (0 critical, 0 high)
✅ GOVERNANCE AUDIT PASSED
```

### Step 5: Verify Replay Determinism

Replay governance from genesis and verify state hash matches.

**Command**:
```bash
node scripts/replay-governance.js
```

**Expected State Hash**:
```
sha256:f64436c2bee406672caf1d5868f09b0cec145869198d37dfbbca90dce24267da
```

**Expected Output**:
```
🎉 CLASSIFICATION: GOVERNANCE_VALID (TEXT_ONLY)
🎉 OPERATIONAL STATUS: READY - Governance is authoritative
```

---

## Authoritative Artifacts

The following artifacts are authoritative as of the integrity completion commit:

| Artifact | Hash | Status |
|----------|------|--------|
| `governance/governance_genesis.signed.json` | `sha256:8fe51cb3...` | Canonical root of trust |
| `governance/governance_binding_registry.json` | `sha256:178c6345...` | All artifacts bound |
| `governance/governance_baseline.json` | `sha256:685ea931...` | Frozen baseline |
| `governance/replay_inputs_closed.json` | `sha256:25b7d67f...` | Closed replay inputs |
| `delivery/NFDFQP_SPECIFICATION.md` | `sha256:6ce6bf77...` | Delivery pipeline spec |
| `schemas/bundle.schema.json` | `sha256:eb72caac...` | FROZEN - immutable |
| `schemas/output.schema.json` | `sha256:c5650828...` | FROZEN - immutable |
| `schemas/emergy.schema.json` | `sha256:5a409933...` | FROZEN - immutable |
| `schemas/attestation.schema.json` | `sha256:17d2531d...` | FROZEN - immutable |

---

## Append-Only Rule

**Governance artifacts are append-only**.

- ❌ NEVER modify existing artifacts
- ❌ NEVER delete commits
- ❌ NEVER force-push
- ✅ ALWAYS create new versions with supersession metadata
- ✅ ALWAYS preserve audit trail

### Supersession Rule

When an artifact is superseded:
1. Original artifact marked with `"status": "SUPERSEDED"`
2. New artifact created with new hash
3. Supersession metadata added:
   - `superseded_by`: hash of new artifact
   - `superseded_at`: ISO 8601 timestamp
   - `superseded_reason`: explanation

**Example**: `governance/governance_genesis.json` (superseded) → `governance/governance_genesis.signed.json` (canonical)

---

## Failure Modes

### Hash Mismatch

**Symptom**: Computed hash does not match `checksums/HASHES.txt`

**Cause**: File corruption or unauthorized modification

**Action**: 
- ❌ DO NOT use the artifact
- ✅ Re-download from authoritative source
- ✅ Report integrity violation

### Signature Verification Failed

**Symptom**: `gpg --verify` returns `BAD signature`

**Cause**: File tampering or wrong public key

**Action**:
- ❌ DO NOT trust the artifact
- ✅ Verify public key fingerprint
- ✅ Report signature violation

### Governance Audit Failed

**Symptom**: `scripts/audit-governance.js` reports findings

**Cause**: Governance invariants violated

**Action**:
- Review audit report: `governance/governance_audit_report.json`
- Check for named failure codes
- Investigate root cause before proceeding

### Replay State Mismatch

**Symptom**: Replay produces different state hash

**Cause**: Non-deterministic replay or corrupted inputs

**Action**:
- Verify closed inputs: `governance/replay_inputs_closed.json`
- Check for implicit dependencies
- Report non-determinism

---

## Governance Classification

After successful verification, governance is classified as:

**GOVERNANCE_VALID (TEXT_ONLY)**

Criteria met:
- ✅ Genesis signed with production Ed25519 key
- ✅ Schema hashes match canonical bytes (JCS)
- ✅ Replay is closed and reproducible
- ✅ Audit passed (23 checks, 0 findings)
- ✅ All artifacts bound to governance

**Operational Status**: READY - Governance is authoritative

---

## Verification Checklist

```
[ ] SHA-256 checksums verified for all artifacts
[ ] GPG signatures verified for authority-bearing artifacts
[ ] Genesis hash matches canonical value (sha256:45162862...)
[ ] Replay state hash matches canonical value (sha256:f64436c2...)
[ ] Governance audit passed (0 critical findings)
[ ] All schemas reference canonical genesis
[ ] Binding registry references canonical genesis
[ ] NFDFQP spec has governance binding metadata
```

When all checks pass: **GOVERNANCE VERIFICATION COMPLETE** ✅

---

## Legacy Document Verification (Pre-Governance)

For historical documents (Map of Law, Boundary Manifesto), refer to original hashing procedure:

**Download canonical file**:
```powershell
curl -L -o Deterministic_Map_of_Law_v1_0_0.md https://raw.githubusercontent.com/lastmanupinc-hub/no-fate-contract/main/Deterministic_Map_of_Law_v1_0_0.md
```

**Generate SHA-256 hash**:
```powershell
Get-FileHash -Algorithm SHA256 Deterministic_Map_of_Law_v1_0_0.md | Select-Object -ExpandProperty Hash
```

**Compare to published hash** in repository.

---

**Last Updated**: 2025-12-12  
**Integrity Completion Commit**: TBD (after commit)  
**Authority**: No-Fate Governance System v1.0.0
