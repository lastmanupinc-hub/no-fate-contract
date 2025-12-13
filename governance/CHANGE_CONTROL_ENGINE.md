# Change Control Engine (CCE)

**Version**: 1.0.0  
**Status**: SPECIFICATION  
**Governance Binding**: Bound to NFGS v1.0.0  
**Authority**: governance-authority  

---

## Purpose

The Change Control Engine (CCE) enforces that **all future changes** to governance artifacts, schemas, or policies go through:

1. **Impact Classification** - Assess change scope and risk
2. **Authority Approval** - Require cryptographic signature from appropriate authority role
3. **Conformance Verification** - Ensure changes don't break existing conformance tests
4. **Audit Trail** - Record all changes in append-only log

**Result**: Prevents regression into implicit or informal governance. Governance remains authoritative, not aspirational.

---

## Change Surface (What CCE Governs)

### 1. Governance Artifacts
- `governance/governance_genesis.signed.json` - **IMMUTABLE** (fork prevention)
- `governance/governance_baseline.json` - **IMMUTABLE** (frozen)
- `governance/governance_binding_registry.json` - **APPEND-ONLY** (new bindings allowed)
- `governance/policies/*.md` - **VERSIONED** (changes require new major version)
- `governance/specifications/*.md` - **VERSIONED** (changes require rule-authority approval)

### 2. Schema Artifacts
- `schemas/bundle.schema.json` - **FROZEN** (immutable execution law)
- `schemas/output.schema.json` - **FROZEN** (immutable execution law)
- `schemas/emergy.schema.json` - **FROZEN** (immutable execution law)
- `schemas/attestation.schema.json` - **FROZEN** (immutable execution law)

**Change Policy**: Schema changes require:
- New major version (e.g., v2.0.0)
- schema-authority approval
- Conformance tests proving backward compatibility OR explicit breaking change documentation
- Impact assessment on all downstream artifacts

### 3. Policy Artifacts
- `SCHEMA_FREEZE_NOTICE.md`
- `EMERGY_WHY_INTERFACE_POLICY.md`
- `AVERY_GATE_POLICY.md`
- `CONFORMANCE_EXPANSION_PLAN.md`
- `TRUST_BOUNDARY_AND_KEY_MANAGEMENT.md`
- `EXPANSION_GOVERNANCE.md`

**Change Policy**: Policy changes require:
- governance-authority or rule-authority approval (depending on policy type)
- Impact classification (breaking vs. non-breaking)
- Audit trail entry
- New version number

### 4. Tool Implementations
- `tools/canon/` - Canonicalization engine
- `tools/solve/` - Reference solver
- `tools/avery/verify/` - Verification engine
- `tools/avery/attest/` - Attestation issuer
- `tools/avery/replay/` - Replay engine

**Change Policy**: Tool changes require:
- Conformance testing (NFSCS baseline + 15 vectors)
- solver-authority certification (for solvers)
- auditor-authority approval (for Avery tools)
- No changes to governance_binding block without approval

---

## Change Classification

### Impact Levels

| Level | Description | Examples | Authority Required |
|-------|-------------|----------|-------------------|
| **CRITICAL** | Changes root of trust or governance foundation | Genesis re-signing, baseline modification | governance-authority + multi-signature |
| **HIGH** | Changes enforcement rules or schemas | Schema v2.0.0, policy breaking change | Depends on artifact (schema-authority, rule-authority, etc.) |
| **MEDIUM** | Changes non-breaking features | New policy, tool enhancement | Single authority approval |
| **LOW** | Documentation or clarification | Typo fixes, comment updates | No signature required (but audit trail entry) |

### Breaking vs. Non-Breaking

**Breaking Change**: Any change that:
- Makes previously valid artifacts invalid
- Changes hash computation (canonicalization)
- Modifies schema required fields
- Changes authority roles or permissions
- Alters conformance test expectations

**Non-Breaking Change**: Changes that:
- Add optional fields to schemas
- Add new policies (without removing old ones)
- Enhance error messages
- Add documentation
- Fix bugs that don't change behavior

---

## Change Approval Workflow

### Step 1: Propose Change

Create a Change Request (CR) artifact:

```json
{
  "type": "nfgs.change_request",
  "cr_id": "CR-2025-001",
  "proposed_at": "2025-12-13T00:00:00Z",
  "proposer": "github:username",
  "change_type": "schema_modification",
  "target_artifact": "schemas/bundle.schema.json",
  "change_summary": "Add optional 'metadata' field to Bundle",
  "impact_classification": "MEDIUM",
  "breaking_change": false,
  "authority_required": "schema-authority",
  "rationale": "Enable user-defined metadata without breaking existing bundles",
  "affected_artifacts": [
    "schemas/bundle.schema.json",
    "tools/canon/src/index.ts"
  ],
  "conformance_impact": "No impact - optional field"
}
```

### Step 2: Impact Assessment

CCE executes:
1. **Schema validation** - Ensure change doesn't break existing artifacts
2. **Hash consistency check** - Recompute hashes, verify no accidental changes
3. **Conformance test execution** - Run baseline + 15 vectors
4. **Authority chain verification** - Confirm proposer has authority role or approval

Output: Impact Assessment Report

```json
{
  "type": "nfgs.impact_assessment",
  "cr_id": "CR-2025-001",
  "assessed_at": "2025-12-13T01:00:00Z",
  "impact_level": "MEDIUM",
  "breaking_change": false,
  "conformance_tests_passed": true,
  "affected_artifact_count": 2,
  "recommendation": "APPROVE - Non-breaking change with conformance verification",
  "required_approvals": ["schema-authority"]
}
```

### Step 3: Authority Approval

Authority holder signs the CR:

```json
{
  "type": "nfgs.change_approval",
  "cr_id": "CR-2025-001",
  "approved_at": "2025-12-13T02:00:00Z",
  "approved_by": {
    "authority_role": "schema-authority",
    "key_id": "ed25519:SCHEMA_AUTHORITY_PUBLIC_KEY"
  },
  "signature": "SIGNATURE_HEX",
  "approval_conditions": [
    "Conformance tests must pass before merge",
    "Documentation must be updated"
  ]
}
```

### Step 4: Conformance Verification

Before applying the change:
1. Run all conformance tests
2. Verify governance replay still deterministic
3. Check no schema hash mismatches
4. Ensure audit passes

Output: Conformance Verification Report

### Step 5: Apply Change

CCE applies the change:
1. Update target artifact(s)
2. Recompute hashes
3. Update binding registry
4. Generate audit trail entry
5. Create new version tag

### Step 6: Audit Trail Entry

Append to `governance/change_audit_trail.jsonl`:

```jsonl
{"event":"change_applied","cr_id":"CR-2025-001","applied_at":"2025-12-13T03:00:00Z","applied_by":"schema-authority","change_type":"schema_modification","target":"schemas/bundle.schema.json","old_hash":"sha256:acebe894...","new_hash":"sha256:NEW_HASH","impact":"MEDIUM","breaking":false,"approvals":["schema-authority"],"conformance_verified":true}
```

---

## Enforcement Mechanisms

### 1. CI/CD Integration

GitHub Actions workflow (`.github/workflows/governance-check.yml`):

```yaml
name: Governance Change Control

on: [pull_request]

jobs:
  governance-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Detect Changes
        id: changes
        run: |
          # Detect if governance, schema, or policy files changed
          git diff --name-only ${{ github.event.pull_request.base.sha }} ${{ github.sha }} > changed_files.txt
      
      - name: Require Change Request
        run: |
          # If governance artifacts changed, require CR in PR description
          if grep -E 'governance/|schemas/|policies/' changed_files.txt; then
            node scripts/check-change-request.js
          fi
      
      - name: Verify Authority Approval
        run: |
          # Check CR has required authority signature
          node scripts/verify-authority-approval.js
      
      - name: Run Conformance Tests
        run: |
          npm install
          npm run build
          npm test
      
      - name: Run Governance Audit
        run: |
          node scripts/audit-governance.js
      
      - name: Block Merge if Failed
        if: failure()
        run: |
          echo "❌ Governance change control failed. PR blocked."
          exit 1
```

### 2. Pre-commit Hooks

`.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check if governance artifacts are being modified
if git diff --cached --name-only | grep -E 'governance/|schemas/'; then
  echo "⚠️  WARNING: Modifying governance artifacts"
  echo "   You MUST have a Change Request (CR) and authority approval"
  echo "   Proceeding will create audit trail entry"
  
  # Run quick governance check
  node scripts/audit-governance.js || {
    echo "❌ Governance audit failed. Commit blocked."
    exit 1
  }
fi
```

### 3. Protected Branches

GitHub repository settings:
- **Branch**: `main`
- **Protections**:
  - Require pull request reviews (1+ approvals)
  - Require status checks to pass (governance-check workflow)
  - Restrict who can push (only governance-authority key holders)
  - Require linear history (no force pushes)

---

## CCE Implementation Phases

### Phase 1: Specification (Current)
- ✅ Document change control requirements
- ✅ Define impact classification
- ✅ Specify approval workflow

### Phase 2: Tooling (Next 30 days)
- [ ] Build `scripts/check-change-request.js`
- [ ] Build `scripts/verify-authority-approval.js`
- [ ] Create audit trail format (`governance/change_audit_trail.jsonl`)
- [ ] Implement GitHub Actions workflow

### Phase 3: Enforcement (60 days)
- [ ] Enable protected branches
- [ ] Require CR for all governance changes
- [ ] Generate audit trail for historical changes
- [ ] Document change request template

### Phase 4: Continuous Operation (90+ days)
- [ ] Review audit trail quarterly
- [ ] Assess impact classifications for accuracy
- [ ] Refine approval workflows based on experience
- [ ] Train new authority key holders on CCE

---

## Change Control Engine Guarantees

When CCE is fully operational, it guarantees:

1. **No Informal Changes** - All governance changes have explicit CR and approval
2. **Authority Accountability** - Every change traced to cryptographic signature
3. **Conformance Preservation** - Changes can't break existing conformance tests
4. **Audit Trail Completeness** - All changes recorded in append-only log
5. **Fork Prevention** - Baseline and genesis remain immutable
6. **Impact Transparency** - Change classification visible before approval
7. **Non-Bypassability** - CI/CD blocks unapproved changes

---

## Governance Binding

```json
{
  "governance_version": "1.0.0",
  "genesis_hash": "sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a",
  "authority_role": "governance-authority",
  "binding_status": "BOUND",
  "specification_type": "change_control_engine",
  "enforcement_status": "SPECIFICATION (tooling in development)"
}
```

---

## Next Actions

1. **Immediate**: Document CCE specification ✅
2. **Week 1**: Build `check-change-request.js` and `verify-authority-approval.js`
3. **Week 2**: Create GitHub Actions workflow
4. **Week 3**: Enable protected branches on `main`
5. **Week 4**: Generate audit trail for all historical governance changes
6. **Month 2**: Issue governance-authority and schema-authority keys
7. **Month 3**: Require CR for all PRs touching governance artifacts

---

**Status**: Change surface is now LOCKED to CCE requirements. All future changes require explicit approval workflow.
