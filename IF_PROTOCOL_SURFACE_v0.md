# NoFate Coin Interface Protocol Surface v0.1.0-draft2

**Status:** DRAFT  
**Version:** 0.1.0-draft2  
**Required Revisions:** APPLIED  
**Ratification Status:** PENDING - Final approval required (supply finalized)

---

## Document Control

This specification defines the complete protocol surface for NoFate Coin blockchain. It is **FROZEN upon ratification** and may only be modified through the explicit supersession protocol defined herein.

**Revision History:**
- v0.1.0-draft1: Initial draft
- v0.1.0-draft2: Applied required revisions from review
  - Defined reason_code closed enum
  - Removed ambiguous event_commitment
  - Clarified action ordering rules
  - Closed evidence schema for slashing
  - Specified supersession permission model
  - Clarified MIN_DELAY unit (blocks)
  - Tied ProtocolVersion mutations to explicit actions

---

## Table of Contents

0. [Global Law](#section-0-global-law)
1. [Canonical Serialization & Commitments](#section-1-canonical-serialization--commitments)
2. [State Objects](#section-2-state-objects)
3. [Actions (Closed Set)](#section-3-actions-closed-set)
4. [Finality Boundary](#section-4-finality-boundary)
5. [Privacy Boundary](#section-5-privacy-boundary)
6. [Forbidden Categories](#section-6-forbidden-categories)
7. [Minimum Delay Constant](#section-7-minimum-delay-constant)
8. [Compliance Checklist](#section-8-compliance-checklist)
9. [Ratification Process](#section-9-ratification-process)

---

## Section 0: Global Law

Universal rules governing all protocol operations.

### 0.1 Allowed Outcomes

**Closed Set:**
- `PASS` - Action succeeded
- `FAIL` - Action failed deterministically
- `INDETERMINATE` - Action cannot be determined (e.g., future-dependent)
- `INVALID_INPUT` - Malformed action or forbidden operation

**Enforcement:** All implementations MUST use exhaustive matching. No other outcomes may be added without supersession.

### 0.2 Determinism Invariant

**Statement:**  
For identical `(state_pre, action, block_context)`, the protocol MUST produce identical:
- `outcome`
- `canonical_receipt`
- `state_post_commitment`

**Action Ordering Rule:**  
Independent actions within a block are processed in deterministic canonical order (lexicographic by action_hash). Dependent actions (same account, nonce sequence) are strictly ordered by nonce. Out-of-order execution is refused with `FAIL(NONCE_MISMATCH)`.

**Prohibited:**
- Randomness
- System time (only block timestamp allowed)
- External I/O
- Non-deterministic computation

### 0.3 No Admin Override

**Statement:**  
No privileged key, admin account, or emergency mechanism may bypass protocol rules.

**Enforcement:**  
Any action claiming admin privilege returns `INVALID_INPUT`.

**Immutability:**  
This rule cannot be changed, even via supersession.

### 0.4 Closed Action Space

**Statement:**  
The set of valid actions is closed and enumerated in this specification.

**Unknown Actions:**  
Return `INVALID_INPUT`.

**New Actions:**  
May only be added via formal supersession protocol.

---

## Section 1: Canonical Serialization & Commitments

Rules for deterministic serialization and commitment generation.

### 1.1 Canonical JSON Encoding

**Rules:**
1. UTF-8 encoding
2. No whitespace between tokens
3. Object keys sorted lexicographically
4. No trailing commas
5. Numbers in standard decimal notation (no scientific notation for integers)
6. Strings escaped per RFC 8259
7. No locale-specific formatting

**Purpose:** Prevent hash divergence across implementations.

### 1.2 Hash Function

**Algorithm:** SHA-256  
**Output Encoding:** Lowercase hexadecimal  
**Supersession Note:** Hash function is fixed for v0 and may only be changed via supersession protocol. Any hash function change requires full protocol upgrade.

**Rationale:** SHA-256 provides adequate security for v0 with universal implementation support.

### 1.3 Canonical Receipt

Deterministic proof of action execution.

**Required Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `action_hash` | hex64 | SHA-256 of canonical action encoding |
| `block_height` | integer | Block in which action was executed |
| `outcome` | enum | PASS, FAIL, INDETERMINATE, or INVALID_INPUT |
| `reason_code` | enum | See reason code table below |
| `state_root_post` | hex64 | State commitment after action execution |

**Reason Code Enum (Closed):**

| Code | Description |
|------|-------------|
| `SUCCESS` | Action passed all checks |
| `INSUFFICIENT_BALANCE` | Account balance too low |
| `INVALID_SIGNATURE` | Cryptographic signature verification failed |
| `NONCE_MISMATCH` | Nonce does not match expected value |
| `INVALID_PROOF` | Zero-knowledge proof verification failed |
| `DOUBLE_SPEND_NULLIFIER` | Nullifier already in nullifier set |
| `VALIDATOR_NOT_FOUND` | Referenced validator does not exist |
| `VALIDATOR_ALREADY_SLASHED` | Validator has already been slashed |
| `INSUFFICIENT_STAKE` | Stake amount below minimum |
| `PROPOSAL_NOT_FOUND` | Supersession proposal does not exist |
| `PROPOSAL_ALREADY_ACTIVATED` | Proposal has already been activated |
| `ACTIVATION_CONDITIONS_NOT_MET` | Activation height not reached |
| `EVIDENCE_INVALID` | Slashing evidence failed validation |
| `MALFORMED_ACTION` | Action structure invalid |
| `UNKNOWN_ACTION_TYPE` | Action type not in closed set |

**Note on event_commitment:**  
Removed in v0-draft2 due to ambiguous semantics. May be reintroduced in future version with explicit definition.

---

## Section 2: State Objects

All mutable state accessible to protocol actions.

### 2.1 Ledger Model

**Type:** Hybrid (account-based + shielded pool)

**Design Note:** Account-based model chosen for v0 to simplify state management. Reduces parallelism vs UTXO model but acceptable for initial deployment.

### 2.2 Account

Transparent account state.

**Fields:**

| Field | Type | Immutable | Description |
|-------|------|-----------|-------------|
| `address` | bech32 | Yes | Account identifier |
| `balance` | integer (≥0) | No | Transparent balance in base units |
| `nonce` | integer (≥0) | No | Strictly incrementing transaction counter |
| `code_hash` | hex64 | No | Reserved for future smart contract support (null in v0) |

**Nonce Semantics:** Prevents replay attacks and enforces transaction ordering. Each transaction must have `nonce = current_nonce + 1`.

### 2.3 Shielded Pool

Privacy-preserving value pool using commitment trees.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `commitment_tree_root` | hex64 | Merkle root of all note commitments |
| `total_shielded_supply` | integer | Sum of all shielded values (for auditability) |

### 2.4 Nullifier Set

Set of spent note nullifiers to prevent double-spends.

**Implementation:** Merkle tree or deterministic hash set

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `nullifiers` | array<hex64> | All spent nullifiers |

### 2.5 Validator

Validator state for consensus participation.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `validator_id` | bech32 | Validator identifier |
| `stake` | integer (≥0) | Staked amount |
| `is_active` | boolean | Currently participating in consensus |
| `is_slashed` | boolean | Permanently slashed for misbehavior |

**Note:** No commission_rate field exists in v0. Validators earn zero rewards (fees and slashing are burned).

### 2.6 Protocol Version

Current protocol version and scheduled supersessions.

**Mutation Actions:** `PROPOSE_SUPERSESSION`, `ACTIVATE_SUPERSESSION`

**Critical Note:** This state object is ONLY mutated by supersession actions. No other actions may modify protocol version.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `current_version` | semver | Active protocol version |
| `supersession_schedule` | array | Pending and historical proposals |

**Supersession Schedule Item:**

| Field | Type | Description |
|-------|------|-------------|
| `proposal_hash` | hex64 | Hash of proposal specification |
| `activation_height` | integer | Block height for activation |
| `status` | enum | PROPOSED, ACTIVATED, or REJECTED |
| `proposed_at_height` | integer | Block height of proposal |

---

## Section 3: Actions (Closed Set)

All valid protocol actions.

### 3.1 Transaction Actions

#### TRANSFER_TRANSPARENT

Transfer value between transparent accounts.

**Inputs:**
```json
{
  "from": "address",
  "to": "address",
  "amount": "integer",
  "nonce": "integer",
  "signature": "bytes"
}
```

**PASS Conditions:**
- Valid signature
- `nonce == account.nonce + 1`
- `balance >= amount`

**FAIL Conditions:**
- Invalid signature → `FAIL(INVALID_SIGNATURE)`
- Nonce mismatch → `FAIL(NONCE_MISMATCH)`
- Insufficient balance → `FAIL(INSUFFICIENT_BALANCE)`

**State Mutations:**
- `from.balance -= amount`
- `to.balance += amount`
- `from.nonce += 1`

#### SHIELD

Move value from transparent to shielded pool.

**Inputs:**
```json
{
  "from": "address",
  "amount": "integer",
  "note_commitment": "hex64",
  "nonce": "integer",
  "signature": "bytes"
}
```

**PASS Conditions:**
- Valid signature
- `nonce == account.nonce + 1`
- `balance >= amount`

**State Mutations:**
- `from.balance -= amount`
- `shielded_pool.total_shielded_supply += amount`
- Add `note_commitment` to commitment tree
- `from.nonce += 1`

#### UNSHIELD

Move value from shielded to transparent pool.

**Inputs:**
```json
{
  "to": "address",
  "amount": "integer",
  "nullifier": "hex64",
  "proof": "bytes"
}
```

**PASS Conditions:**
- Valid zero-knowledge proof
- Nullifier not in nullifier_set
- Commitment exists in tree

**FAIL Conditions:**
- Invalid proof → `FAIL(INVALID_PROOF)`
- Nullifier already used → `FAIL(DOUBLE_SPEND_NULLIFIER)`

**State Mutations:**
- `to.balance += amount`
- `shielded_pool.total_shielded_supply -= amount`
- Add nullifier to nullifier_set

#### SHIELDED_TRANSFER

Private transfer within shielded pool.

**Inputs:**
```json
{
  "input_nullifiers": ["hex64", ...],
  "output_commitments": ["hex64", ...],
  "proof": "bytes"
}
```

**PASS Conditions:**
- Valid zero-knowledge proof
- All nullifiers not in nullifier_set
- Value balance preserved (proven in ZKP)

**State Mutations:**
- Add all `input_nullifiers` to nullifier_set
- Add all `output_commitments` to commitment_tree

---

### 3.2 Consensus / Staking Actions

#### STAKE

Lock tokens to become validator.

**Inputs:**
```json
{
  "validator_id": "address",
  "amount": "integer",
  "nonce": "integer",
  "signature": "bytes"
}
```

**Note:** No commission_rate parameter. Validators earn zero block rewards in v0 (fees and slashing are burned).

**PASS Conditions:**
- Valid signature
- `amount >= MIN_VALIDATOR_STAKE`
- `validator_id` not already staked

**State Mutations:**
- Create or update validator record
- `account.balance -= amount`
- `validator.stake += amount`

#### UNSTAKE

Begin unbonding period for staked tokens.

**Inputs:**
```json
{
  "validator_id": "address",
  "nonce": "integer",
  "signature": "bytes"
}
```

**PASS Conditions:**
- Valid signature
- Validator exists
- Validator not slashed

**State Mutations:**
- `validator.is_active = false`
- Schedule stake return after unbonding period

#### SLASH_VALIDATOR

Punish validator for provable misbehavior.

**Evidence Types (Closed Enum):**
- `DOUBLE_SIGN` - Validator signed two conflicting blocks
- `INVALID_BLOCK_PROPOSAL` - Validator proposed invalid block
- `CENSORSHIP_PROOF` - Validator provably censored valid transactions

**Critical Note:** Evidence schema is CLOSED. Future evidence types require protocol supersession.

**Inputs:**
```json
{
  "validator_id": "address",
  "evidence_type": "enum (above)",
  "evidence_data": "bytes",
  "proof": "bytes"
}
```

**PASS Conditions:**
- Evidence type is in allowed enum
- Evidence cryptographically valid
- Validator not already slashed

**FAIL Conditions:**
- Unknown evidence type → `INVALID_INPUT`
- Invalid evidence → `FAIL(EVIDENCE_INVALID)`
- Validator already slashed → `FAIL(VALIDATOR_ALREADY_SLASHED)`

**State Mutations:**
- `validator.is_slashed = true`
- `validator.stake = 0`
- **Slashed amount is burned** (sent to unspendable address 0x0...0)
  - **No redistribution** to reporters or remaining validators
  - Prevents perverse incentives and adversarial bounty dynamics

---

### 3.3 Governance Actions

**Note:** Supersession is the ONLY governance mechanism. No parameter changes without full protocol upgrade.

#### PROPOSE_SUPERSESSION

Propose new protocol version.

**Permission:** **Permissionless** - any account may propose.

**Inputs:**
```json
{
  "new_version": "semver",
  "activation_height": "integer",
  "specification_hash": "hex64",
  "proposer": "address",
  "nonce": "integer",
  "signature": "bytes"
}
```

**PASS Conditions:**
- Valid signature
- `activation_height > current_height + MIN_PROPOSAL_DELAY`
- `new_version > current_version` (semver comparison)

**State Mutations:**
- Add proposal to `protocol_version.supersession_schedule`
- Set status to `PROPOSED`

#### ACTIVATE_SUPERSESSION

Mechanically activate approved supersession.

**Activation Rule:** Purely mechanical - activates when `block_height >= activation_height` AND proposal exists. No voting or discretion.

**Inputs:**
```json
{
  "proposal_hash": "hex64"
}
```

**PASS Conditions:**
- Proposal exists in schedule
- `current_height >= activation_height`
- Status == `PROPOSED`

**FAIL Conditions:**
- Proposal not found → `FAIL(PROPOSAL_NOT_FOUND)`
- Too early → `FAIL(ACTIVATION_CONDITIONS_NOT_MET)`
- Already activated → `FAIL(PROPOSAL_ALREADY_ACTIVATED)`

**State Mutations:**
- `protocol_version.current_version = new_version`
- Update proposal status to `ACTIVATED`

**Note:** Activation is deterministic and automatic when height is reached. No human intervention required.

---

## Section 4: Finality Boundary

Rules defining when state is irreversible.

### 4.1 Finality Rule

**Type:** Threshold-based  
**Threshold:** 2/3 of staked validators  
**Finality Delay:** 2 blocks minimum  
**Stronger Than:** Bitcoin probabilistic finality

**Note:** Once finalized, state is cryptographically committed and cannot be reversed.

### 4.2 Reorg Protection

**Max Reorg Depth:** 0 (after finality)  
**After Finality:** Finalized blocks cannot be reorganized under any circumstance.

---

## Section 4a: Monetary Invariants

Rules governing token supply, issuance, and value sinks.

### 4a.1 Supply Model

**Genesis Supply:** 100,000,000,000,000,000 base units (10^17)  
**Human Readable:** 1,000,000,000 IF (1 billion tokens)  
**Base Unit Exponent:** 8 (1 IF = 10^8 base units)

**Max Supply:** genesis_supply (no inflation)  
**Enforcement:** Protocol CANNOT mint new tokens after genesis. Any action attempting to increase supply beyond genesis_supply returns INVALID_INPUT.

**Issuance Schedule:** None (zero post-genesis issuance)

### 4a.2 Fee Model

**Transaction Fees:** Base fee + computational cost variable fee  
**Sink:** Burn (all fees permanently removed from circulating supply)  
**No Miner Reward:** Validators earn zero block reward

### 4a.3 Slashing Sink

**Disposition:** Burn  
**Enforcement:** Slashed stake is permanently removed from circulating supply  
**No Redistribution:** Slashed funds are NOT redistributed to reporters, remaining validators, or treasury

### 4a.4 Supply Auditability

**Invariant:** `transparent_supply + shielded_supply + burned_supply = genesis_supply` at all times

**Where:**
- `transparent_supply` = Sum of all account.balance values
- `shielded_supply` = shielded_pool.total_shielded_supply
- `burned_supply` = Cumulative fees + slashed stake

---

## Section 5: Privacy Boundary

Explicit scope and limits of privacy guarantees.

### 5.1 Shielded Privacy Guarantees

**Provides:**
- Sender anonymity within shielded pool
- Receiver anonymity within shielded pool
- Amount privacy for shielded transfers

**Does NOT Provide:**
- Privacy for transparent transactions (fully public)
- Privacy for shield/unshield amounts (visible)
- Protection against timing analysis
- Network-layer metadata protection

### 5.2 Honest Disclosure

**Statement:** Protocol provides computational privacy only. Users must take additional measures for network privacy (Tor, VPN, etc.).

**No False Claims:** Protocol does not claim to provide anonymity beyond computational unlinkability.

---

## Section 6: Forbidden Categories

Actions and behaviors explicitly prohibited at protocol level.

**Forbidden:**
- Admin override mechanisms
- Emergency pause functions
- Discretionary token minting
- Backdoors or privileged access
- Time-based logic beyond block timestamps
- External oracle dependencies
- Upgradeable contracts without supersession
- Parameter changes without protocol upgrade
- Non-deterministic computation
- Off-chain governance binding

**Enforcement:** Any action attempting forbidden behavior returns `INVALID_INPUT`.

---

## Section 7: Minimum Delay Constant

### MIN_PROPOSAL_DELAY

**Value:** 100,800  
**Unit:** **Blocks** (explicitly block-based, not epoch-based)  
**Approximate Duration:** 7 days at 6-second block time  
**Purpose:** Minimum delay between supersession proposal and activation  
**Immutable:** No  
**Change Mechanism:** Can only be changed via supersession

---

## Section 8: Compliance Checklist

Self-verification gate for protocol implementations.

- [ ] All actions return only PASS, FAIL, INDETERMINATE, or INVALID_INPUT
- [ ] Identical inputs produce identical outputs (determinism)
- [ ] No admin override exists
- [ ] Action space is closed (unknown actions → INVALID_INPUT)
- [ ] Canonical serialization rules followed
- [ ] reason_code uses only defined enum values
- [ ] Evidence types for slashing are closed enum
- [ ] Supersession proposal is permissionless
- [ ] Supersession activation is mechanical (no discretion)
- [ ] MIN_PROPOSAL_DELAY is block-based
- [ ] protocol_version only mutated by PROPOSE_SUPERSESSION and ACTIVATE_SUPERSESSION
- [ ] Nonce enforcement prevents out-of-order execution

---

## Section 9: Ratification Process

### Path to Frozen Status

This document remains **DRAFT** until the following steps are completed:

#### Step 1: Final Revision

- [x] Apply all required revisions from review
- [x] Increment version (v0.1.0-draft2)

#### Step 2: Explicit Approval

**Required Statement:**

> "I approve IF_PROTOCOL_SURFACE_v0 as written.  
> I believe it contains no ambiguity and no hidden authority."

**Status:** PENDING

#### Step 3: Hash Generation

Compute and record:
```
sha256(IF_PROTOCOL_SURFACE_v0.md)
sha256(IF_PROTOCOL_SURFACE_v0.json)
```

Record in `RATIFICATION.md`.

**Status:** PENDING

#### Step 4: Cryptographic Signature

Sign the hashes with chosen key (PGP, minisign, etc.).

Store signature alongside hashes.

**Status:** PENDING

#### Step 5: Canonical Commit

Commit:
- Final document
- Hash file
- Signature file

Mark repository state as:
```
IF_PROTOCOL_SURFACE_v0 — FROZEN
```

**Status:** PENDING

#### Step 6: Public Declaration (Optional)

Recommended statement:

> "IF protocol surface v0 is frozen.  
> Any change requires explicit supersession."

---

## Revision Summary (draft1 → draft2)

**Applied Revisions:**

1. ✅ Defined `reason_code` as closed enum (Section 1.3)
2. ✅ Removed ambiguous `event_commitment` field (Section 1.3)
3. ✅ Added explicit action ordering rules (Section 0.2)
4. ✅ Closed evidence schema for slashing (Section 3.2)
5. ✅ Clarified supersession permission model as permissionless (Section 3.3)
6. ✅ Specified MIN_PROPOSAL_DELAY unit as blocks (Section 7)
7. ✅ Tied protocol_version mutations to explicit actions (Section 2.6)
8. ✅ Added hash function supersession note (Section 1.2)

**Status:** Ready for approval

---

**END OF SPECIFICATION**

**Status:** DRAFT  
**Version:** 0.1.0-draft2  
**Next Action:** Explicit approval required for ratification
