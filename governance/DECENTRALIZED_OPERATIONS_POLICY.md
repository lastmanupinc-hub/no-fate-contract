# Decentralized Governance Operations Policy

**Version**: 1.0.0  
**Status**: SPEC_COMPLETE  
**Governance Binding**:
```json
{
  "genesis_hash": "sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a",
  "authority_role": "governance-authority",
  "binding_status": "BOUND",
  "policy_type": "operational_independence"
}
```

---

## Objective

**The system survives your absence. Remove you from the critical path.**

Others can propose changes, run audits, issue attestations, verify governance. You are no longer required for correctness.

---

## Core Principle

**Self-sustaining systems don't depend on individuals.**

If the system freezes when the founder disappears:
- ❌ It's a project (not a system)
- ❌ It's a product (not a standard)
- ❌ It's a service (not infrastructure)

If the system continues when the founder disappears:
- ✅ It's self-sustaining
- ✅ It's decentralized
- ✅ It's legitimate without personalities

---

## Critical Path Analysis

### What "Critical Path" Means

You are on the critical path if:

- ❌ Only you can approve changes
- ❌ Only you can run audits
- ❌ Only you can issue attestations
- ❌ Only you can interpret specifications
- ❌ Only you can resolve disputes

You are OFF the critical path if:

- ✅ Anyone can propose changes (following process)
- ✅ Anyone can run audits (using deterministic tools)
- ✅ Anyone can issue attestations (using verifiable signatures)
- ✅ Anyone can verify governance (replay from genesis)
- ✅ Anyone can resolve disputes (replay protocol)

---

## Operational Independence Requirements

### 1. Change Proposals (Anyone)

**Current State**: Anyone MAY submit change proposals.

**Process**:
1. Fork governance repository
2. Create change proposal artifact (JSON)
3. Submit pull request
4. Governance authority reviews (NOT just founder)

**No Gatekeeping**: Proposal submission requires no permission.

---

### 2. Audit Execution (Anyone with Tools)

**Current State**: Audit tools are deterministic scripts.

**Process**:
1. Clone repository
2. Run `node scripts/audit-governance.js`
3. Verify output matches published audit report
4. Submit findings if discrepancies found

**No Special Access**: Audit tools run locally, no credentials required.

---

### 3. Attestation Issuance (Anyone with Auditor Role)

**Current State**: Auditor authority role can issue attestations.

**Process**:
1. Perform conformance audit
2. Generate attestation artifact
3. Sign with auditor authority key
4. Publish to governance repository

**Distributed Authority**: Multiple parties can hold auditor-authority role.

---

### 4. Governance Verification (Anyone with Replay Tool)

**Current State**: Replay script is deterministic.

**Process**:
1. Clone repository
2. Run `node scripts/replay-governance.js`
3. Verify state hash matches published hash
4. Verify determinism independently

**No Trust Required**: Verification is mathematical, not social.

---

### 5. Dispute Resolution (Anyone Following Protocol)

**Current State**: Dispute resolution is replay-based.

**Process**:
1. Submit dispute artifact with inputs
2. Anyone replays with same inputs
3. Compare outputs deterministically
4. Resolution is PASS/FAIL/INDETERMINATE (no debate)

**No Arbitrator**: Disputes resolve mechanically.

---

## Authority Distribution

### Current Authority Holders

From `governance_genesis.signed.json`:

```json
{
  "initial_roles": [
    {"role_id": "schema-authority"},
    {"role_id": "rule-authority"},
    {"role_id": "solver-authority"},
    {"role_id": "auditor-authority"},
    {"role_id": "governance-authority"}
  ]
}
```

### Single Point of Failure Risk

**Problem**: If only one person holds all keys:
- System freezes if that person is unavailable
- Social trust required (not deterministic trust)
- Critical path remains centralized

**Solution**: Distribute authority keys to multiple parties.

---

## Key Distribution Strategy

### Multi-Party Key Custody

**Approach**: Distribute authority keys across multiple independent parties.

**Example**:

```json
{
  "role_id": "governance-authority",
  "key_holders": [
    {
      "key_id": "gov-key-001",
      "holder": "Party A (individual)",
      "public_key": "ed25519:...",
      "added_date": "2025-12-13"
    },
    {
      "key_id": "gov-key-002",
      "holder": "Party B (organization)",
      "public_key": "ed25519:...",
      "added_date": "2026-02-01"
    },
    {
      "key_id": "gov-key-003",
      "holder": "Party C (foundation)",
      "public_key": "ed25519:...",
      "added_date": "2026-06-15"
    }
  ],
  "approval_threshold": "2-of-3 multisig"
}
```

**Benefit**: System continues operating if one key holder is unavailable.

---

### Threshold Signatures

**Requirement**: Critical actions require M-of-N signatures.

**Example**: Approving MAJOR version change requires 2-of-3 governance authority signatures.

**Implementation**:

```json
{
  "action": "approve_major_version_change",
  "proposal_id": "change-proposal-042",
  "required_signatures": 2,
  "received_signatures": [
    {
      "signer": "gov-key-001",
      "signature": "ed25519:...",
      "timestamp": "2026-01-10T12:00:00Z"
    },
    {
      "signer": "gov-key-002",
      "signature": "ed25519:...",
      "timestamp": "2026-01-10T14:30:00Z"
    }
  ],
  "threshold_met": true,
  "action_approved": true
}
```

---

## Succession Planning

### Key Holder Unavailability

**Scenario**: Key holder becomes unavailable (lost key, left project, deceased).

**Process**:

1. **Detect Absence**: Key holder fails to respond for 90 days
2. **Invoke Succession**: Remaining key holders vote to add new key holder
3. **Add New Key**: New key holder issues public key
4. **Revoke Old Key**: Old key marked as "RETIRED" (not revoked, to preserve signatures)
5. **Update Registry**: Key holder list updated with new party

**Example**:

```json
{
  "succession_event": {
    "event_id": "succession-001",
    "event_date": "2026-06-01",
    "role_id": "governance-authority",
    "retired_key": "gov-key-001",
    "retirement_reason": "Key holder unavailable for 90 days",
    "successor_key": "gov-key-004",
    "successor_holder": "Party D",
    "approved_by": ["gov-key-002", "gov-key-003"],
    "approval_threshold": "2-of-3"
  }
}
```

---

## Operational Procedures (No Founder Required)

### Procedure 1: Proposing a Change

**Who Can Do This**: Anyone

**Steps**:
1. Clone governance repository
2. Draft change proposal (JSON artifact)
3. Submit pull request to `proposals/` directory
4. Governance authority reviews (automated checks first, then human review)
5. Public review period (30 days minimum)
6. Vote (threshold signatures required)

**Founder Role**: Optional reviewer, not required for approval.

---

### Procedure 2: Running an Audit

**Who Can Do This**: Anyone with audit tools

**Steps**:
1. Clone governance repository
2. Run `node scripts/audit-governance.js`
3. Compare output to published `governance_audit_report.json`
4. If discrepancies found:
   - File issue in repository
   - Submit audit finding artifact
   - Governance authority investigates

**Founder Role**: Not involved (audit is deterministic).

---

### Procedure 3: Issuing an Attestation

**Who Can Do This**: Anyone with `auditor-authority` key

**Steps**:
1. Perform conformance audit on solver/artifact
2. Generate attestation artifact (JSON)
3. Sign with auditor-authority key
4. Submit to governance repository
5. Attestation becomes part of public record

**Founder Role**: Not required (multiple auditors can hold keys).

---

### Procedure 4: Verifying Governance

**Who Can Do This**: Anyone

**Steps**:
1. Clone governance repository
2. Run `node scripts/replay-governance.js`
3. Verify state hash: `sha256:f64436c2bee406672caf1d5868f09b0cec145869198d37dfbbca90dce24267da`
4. Verify determinism (replay multiple times, same hash)
5. Trust is established mathematically

**Founder Role**: Not involved (verification is replay-based).

---

### Procedure 5: Resolving a Dispute

**Who Can Do This**: Anyone following dispute resolution protocol

**Steps**:
1. Disputant submits dispute artifact
2. Anyone replays with declared inputs
3. Compare outputs deterministically
4. Auditor authority issues resolution (PASS/FAIL/INDETERMINATE)
5. Resolution is published to dispute registry

**Founder Role**: Not involved (resolution is mechanical).

---

## Success Condition

**If you disappear, the system continues without forking or freezing.**

### Verification Tests

**Test 1: Can changes be proposed without founder?**
- ✅ YES: Anyone can submit change proposals

**Test 2: Can audits be run without founder?**
- ✅ YES: Audit scripts are deterministic, run locally

**Test 3: Can attestations be issued without founder?**
- ⚠️ PARTIAL: Requires multiple auditor-authority key holders (currently single key)

**Test 4: Can governance be verified without founder?**
- ✅ YES: Replay is deterministic, no credentials required

**Test 5: Can disputes be resolved without founder?**
- ✅ YES: Dispute resolution is replay-based

**Test 6: Can the system evolve without founder?**
- ⚠️ PARTIAL: Requires distributed governance-authority keys (currently single key)

---

## Current Gaps (Must Be Addressed)

### Gap 1: Single Governance Key Holder

**Problem**: Only founder holds `governance-authority` key.

**Risk**: System freezes if founder unavailable.

**Solution**: Add 2-3 additional governance key holders with 2-of-3 threshold.

---

### Gap 2: Single Auditor Key Holder

**Problem**: Only founder holds `auditor-authority` key.

**Risk**: No attestations can be issued if founder unavailable.

**Solution**: Add 2-3 additional auditor key holders.

---

### Gap 3: No Documented Succession Process

**Problem**: No formal process for key holder succession.

**Risk**: Ambiguity if key holder becomes unavailable.

**Solution**: This policy (document succession protocol).

---

## Roadmap to Full Independence

### Phase 1: Distribute Auditor Keys (Month 1-3)

1. Identify 2-3 independent auditors
2. Generate auditor-authority keys for each
3. Update governance registry
4. Test: Issue attestations with different auditor keys

**Success Metric**: Attestations issued by non-founder parties.

---

### Phase 2: Distribute Governance Keys (Month 3-6)

1. Identify 2-3 governance co-stewards
2. Generate governance-authority keys for each
3. Implement 2-of-3 threshold signatures
4. Update governance registry
5. Test: Approve change proposal with non-founder signatures

**Success Metric**: Change approved without founder involvement.

---

### Phase 3: Stress Test Absence (Month 6-12)

1. Founder withdraws from active governance (simulated absence)
2. Community submits change proposal
3. Non-founder governance keys approve
4. Change implemented and deployed
5. System continues operating normally

**Success Metric**: System evolves without founder for 6 months.

---

### Phase 4: Permanent Decentralization (Month 12+)

1. Founder key revoked or retired
2. System governance fully distributed
3. No single point of failure remains

**Success Metric**: Founder can disappear permanently, system survives.

---

## Governance Authority Distribution

### Recommended Structure

**Governance Co-Stewards (3-5 parties)**:
- Academic institution (e.g., university research group)
- Open-source foundation (e.g., Linux Foundation, Apache Foundation)
- Independent expert (e.g., legal tech researcher)
- Commercial user (e.g., company deploying No-Fate systems)
- Civil society organization (e.g., digital rights group)

**Approval Thresholds**:
- MINOR changes: 2-of-5
- MAJOR changes: 3-of-5
- CANONICAL LAW changes: 4-of-5 (near-consensus)

---

## Evolution Path

This policy may be superseded by:

1. New version with updated key distribution requirements
2. Change proposal approved by governance-authority
3. Append-only history (old policy remains valid)

---

## Appendix: Self-Test Checklist

### Operational Independence Checklist

- [ ] Anyone can submit change proposals (no gatekeeping)
- [ ] Anyone can run audits (deterministic tools)
- [ ] Multiple parties hold auditor-authority keys
- [ ] Multiple parties hold governance-authority keys
- [ ] Threshold signatures implemented (M-of-N)
- [ ] Succession process documented
- [ ] Replay verification is deterministic (no trust required)
- [ ] Dispute resolution is mechanical (no arbitration)
- [ ] Founder has tested absence (system continues without them)

**When all items checked**: System is self-sustaining.

---

**Status**: SPEC_COMPLETE  
**Authority**: governance-authority  
**Supersedes**: None (initial version)  
**Next Version**: TBD (requires change proposal)  

**Critical Note**: This policy defines the goal. Current state does NOT meet full decentralization (single key holder). Roadmap above outlines path to full independence.
