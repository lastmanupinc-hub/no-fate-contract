# Controlled Supersession Policy

**Version**: 1.0.0  
**Status**: SPEC_COMPLETE  
**Governance Binding**:
```json
{
  "genesis_hash": "sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a",
  "authority_role": "governance-authority",
  "binding_status": "BOUND",
  "policy_type": "version_evolution"
}
```

---

## Objective

**Change without breaking legitimacy. Evolution without mutation.**

New versions never overwrite old ones, explicitly supersede, declare incompatibilities. Old law remains valid historically.

---

## Core Principle

**Trust is preserved across time.**

When systems evolve:

- ❌ NOT: Replace v1.0.0 with v1.1.0 (breaks historical reference)
- ❌ NOT: Amend existing artifacts (destroys audit trail)
- ❌ NOT: Silently change behavior (erodes trust)
- ✅ YES: Create v1.1.0 that explicitly supersedes v1.0.0
- ✅ YES: Preserve v1.0.0 forever (immutable historical record)
- ✅ YES: Document what changed and why (transparent evolution)

---

## Supersession Metadata (Required)

Every new version MUST include supersession metadata:

```json
{
  "artifact_id": "no-fate-contract",
  "artifact_version": "1.1.0",
  "artifact_type": "canonical_law",
  "created_at": "2026-01-15T00:00:00Z",
  "supersedes": {
    "artifact_version": "1.0.0",
    "artifact_hash": "sha256:...",
    "superseded_at": "2026-01-15T00:00:00Z",
    "supersession_reason": "Clarify boundary detection for multi-jurisdictional cases",
    "backward_compatible": false,
    "incompatibilities": [
      {
        "clause": "3.2 (Boundary Detection)",
        "change_type": "CLARIFICATION",
        "description": "Added explicit handling for conflicting jurisdiction rules",
        "breaking": true,
        "migration_path": "Solvers must implement new boundary precedence rules"
      }
    ]
  },
  "governance_approval": {
    "proposal_id": "change-proposal-042",
    "approved_by": "governance-authority",
    "approval_date": "2026-01-10",
    "approval_hash": "sha256:..."
  }
}
```

---

## Versioning Rules

### Semantic Versioning (Modified)

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (incompatible with previous version)
  - Contract clauses changed substantially
  - Schemas incompatible
  - Solvers must re-implement
  - Example: 1.0.0 → 2.0.0

- **MINOR**: Additive changes (backward compatible)
  - New optional features
  - Clarifications that don't change behavior
  - Solvers can continue using old behavior
  - Example: 1.0.0 → 1.1.0

- **PATCH**: Error corrections (no behavior change)
  - Typo fixes
  - Documentation improvements
  - Clarifications that don't affect implementation
  - Example: 1.0.0 → 1.0.1

---

## Append-Only Rule

### Old Versions Never Deleted

When v1.1.0 supersedes v1.0.0:

- ✅ Keep `no-fate-contract_v1.0.0.md` (immutable)
- ✅ Add `no-fate-contract_v1.1.0.md` (new version)
- ✅ Update `no-fate-contract_v1.0.0.md` metadata to add `"superseded_by": "v1.1.0"`
- ❌ NEVER delete v1.0.0
- ❌ NEVER modify v1.0.0 content (except supersession metadata)

### Historical Validity

**Old versions remain valid for historical reference:**

- Audits performed under v1.0.0 remain legitimate
- Attestations issued under v1.0.0 remain valid
- Solver conformance to v1.0.0 remains meaningful

**But**: New work SHOULD target latest version (v1.1.0).

---

## Supersession Types

### Type 1: Clarification (Non-Breaking)

**When**: Contract is ambiguous, solvers disagree on interpretation.

**Action**: Issue clarified version that makes implicit behavior explicit.

**Compatibility**: Backward compatible if clarification aligns with majority solver behavior.

**Example**:
```json
{
  "change_type": "CLARIFICATION",
  "clause": "2.4 (Refusal Semantics)",
  "change_description": "Explicitly state that REFUSE must include reason code",
  "breaking": false,
  "migration_path": "No migration required - conformant solvers already do this"
}
```

---

### Type 2: Extension (Additive)

**When**: New feature needed, doesn't change existing behavior.

**Action**: Add new clauses, schemas, or optional features.

**Compatibility**: Backward compatible (old solvers ignore new features).

**Example**:
```json
{
  "change_type": "EXTENSION",
  "clause": "4.5 (Optional Probabilistic Annotations)",
  "change_description": "Add optional confidence scores to emergy traces",
  "breaking": false,
  "migration_path": "Optional - old solvers can omit this field"
}
```

---

### Type 3: Correction (Breaking)

**When**: Contract has an error that cannot be fixed without breaking compatibility.

**Action**: Issue new major version with corrected behavior.

**Compatibility**: NOT backward compatible.

**Example**:
```json
{
  "change_type": "CORRECTION",
  "clause": "3.2 (Boundary Detection)",
  "change_description": "Fix incorrect precedence rule for nested boundaries",
  "breaking": true,
  "migration_path": "Solvers must re-implement boundary detection logic per v2.0.0"
}
```

---

### Type 4: Deprecation (Phased Removal)

**When**: Feature is no longer needed or creates problems.

**Action**: Mark as deprecated in vX.Y.0, remove in v(X+1).0.0.

**Compatibility**: Deprecated feature still works, but with warning.

**Example**:
```json
{
  "change_type": "DEPRECATION",
  "clause": "5.3 (Legacy Output Format)",
  "change_description": "Deprecated in v1.2.0, will be removed in v2.0.0",
  "breaking": false,
  "migration_path": "Switch to new output format before v2.0.0 release",
  "deprecation_timeline": {
    "deprecated_in": "1.2.0",
    "deprecated_date": "2026-06-01",
    "removal_planned": "2.0.0",
    "removal_date": "2027-01-01"
  }
}
```

---

## Change Proposal Process

### Step 1: Submit Change Proposal

Anyone MAY submit a change proposal:

```json
{
  "proposal_id": "change-proposal-042",
  "proposal_type": "CONTRACT_CHANGE|SCHEMA_CHANGE|POLICY_CHANGE",
  "proposed_by": "Individual or organization",
  "proposal_date": "2026-01-01",
  "target_artifact": "no-fate-contract",
  "target_version": "1.0.0",
  "proposed_new_version": "1.1.0",
  "change_rationale": "Ambiguity discovered in multi-jurisdictional boundary cases",
  "change_description": "Add explicit precedence rules for conflicting jurisdictions",
  "change_type": "CLARIFICATION",
  "breaking": false,
  "affected_clauses": ["3.2", "3.3"],
  "test_cases_affected": ["NFCTS-042", "NFCTS-043"],
  "implementation_impact": "Solvers must add jurisdiction precedence logic"
}
```

### Step 2: Public Review Period

1. Proposal published to governance repository
2. Minimum 30-day review period
3. Community feedback collected
4. Solver maintainers notified
5. Test cases prepared

### Step 3: Governance Vote

**Voting Authority**: `governance-authority` role holders

**Vote Requirements**:
- Simple majority for MINOR changes (backward compatible)
- 2/3 supermajority for MAJOR changes (breaking)
- Unanimous for CONTRACT changes (canonical law)

**Vote Artifact**:
```json
{
  "vote_id": "vote-042",
  "proposal_id": "change-proposal-042",
  "vote_date": "2026-01-10",
  "vote_type": "APPROVAL|REJECTION|DEFER",
  "votes": [
    {
      "voter_id": "governance-key-001",
      "vote": "APPROVE",
      "justification": "Clarification needed, change is non-breaking"
    }
  ],
  "result": "APPROVED",
  "approval_threshold": "simple_majority",
  "votes_for": 3,
  "votes_against": 1,
  "votes_abstain": 0
}
```

### Step 4: Implementation

1. Create new version artifact
2. Add supersession metadata to old version
3. Update test suite (NFCTS)
4. Notify solver maintainers
5. Update documentation

### Step 5: Announcement

```json
{
  "announcement_id": "announce-042",
  "announcement_type": "VERSION_RELEASE",
  "artifact": "no-fate-contract",
  "old_version": "1.0.0",
  "new_version": "1.1.0",
  "release_date": "2026-01-15",
  "supersession_effective": "immediate",
  "grace_period": "6 months for solver migration",
  "announcement_channels": [
    "governance repository",
    "solver maintainer notifications",
    "public website"
  ]
}
```

---

## Migration Paths

### For Conformant Solvers

When a new version is released:

1. **Assess Impact**: Review incompatibilities list
2. **Plan Migration**: Determine implementation changes needed
3. **Implement Changes**: Update solver to conform to new version
4. **Re-Test**: Run NFCTS for new version
5. **Re-Certify**: Publish new conformance test results
6. **Update Claims**: Declare conformance to new version

### Grace Period

For MAJOR version changes (breaking):

- Minimum 6-month grace period before old version is marked "obsolete"
- Old version remains valid during grace period
- Solvers MAY continue using old version until grace period expires
- After grace period: old version is "LEGACY" (valid but not recommended)

---

## Prevents Fragmentation

### Single Canonical Line

**One authoritative version at any time.**

When v1.1.0 is released:

- v1.0.0 becomes "SUPERSEDED"
- v1.1.0 becomes "CANONICAL"
- No competing "branches" or "forks"

### Competing Forks Prohibited

If a party disagrees with governance decision:

- ❌ NOT: Fork the contract and create competing version
- ✅ YES: Submit alternative change proposal
- ✅ YES: Continue using older version (clearly labeled)
- ✅ YES: Exit the ecosystem (but don't claim No-Fate conformance)

**No-Fate is a standard, not a product.** Standards require consensus, not competition.

---

## Preserves Trust Across Time

### Immutable Historical Record

Anyone MAY verify historical state:

1. Check git tag for version (e.g., `no-fate-contract-v1.0.0-law`)
2. Verify artifact hash matches published hash
3. Replay governance from that version
4. Audit attestations issued under that version

**Trust is time-indexed**: "This was true under v1.0.0 on 2025-12-13."

---

## Long-Lived Systems

### Handling Multi-Year Deployments

System deployed in 2025 under v1.0.0:

- System continues working (v1.0.0 is immutable)
- System MAY upgrade to v1.1.0 (migration path provided)
- System attestations remain valid (time-stamped to v1.0.0)
- System audit trail preserved (no retroactive changes)

**No forced obsolescence.**

---

## Success Condition

**You can point to when and why something changed, forever.**

### Traceability Requirements

For any change:

1. **When**: Exact date of supersession
2. **Why**: Explicit rationale in proposal
3. **What**: Precise description of change
4. **Who**: Governance approval with vote record
5. **How**: Migration path documented

**Example Query**:
- "Why did clause 3.2 change between v1.0.0 and v1.1.0?"
- **Answer**: See change-proposal-042, approved 2026-01-10, reason: ambiguity in multi-jurisdictional cases.

---

## Governance Responsibilities

### Governance Authority Role

The `governance-authority` role is responsible for:

1. Reviewing change proposals
2. Conducting public review periods
3. Voting on proposals
4. Issuing supersession metadata
5. Maintaining version registry
6. Enforcing append-only rule

### Version Registry

`VERSION_REGISTRY.json`:

```json
{
  "registry_version": "1.0.0",
  "artifact_id": "no-fate-contract",
  "versions": [
    {
      "version": "1.0.0",
      "status": "SUPERSEDED",
      "release_date": "2025-03-08",
      "artifact_hash": "sha256:...",
      "superseded_by": "1.1.0",
      "superseded_at": "2026-01-15"
    },
    {
      "version": "1.1.0",
      "status": "CANONICAL",
      "release_date": "2026-01-15",
      "artifact_hash": "sha256:...",
      "supersedes": "1.0.0"
    }
  ]
}
```

---

## Evolution Path

This policy itself may be superseded following its own rules:

1. Submit change proposal for supersession policy
2. Public review (30 days minimum)
3. Governance vote (2/3 supermajority for governance policy changes)
4. Issue new version with supersession metadata
5. Preserve old version

---

**Status**: SPEC_COMPLETE  
**Authority**: governance-authority  
**Supersedes**: None (initial version)  
**Next Version**: TBD (requires change proposal)
