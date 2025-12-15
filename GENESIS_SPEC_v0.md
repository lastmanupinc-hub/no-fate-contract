# GENESIS_SPEC_v0.md

**Status:** DRAFT — AWAITING RATIFICATION  
**Standard:** IF Diamond Standard  
**Scope:** Defines existence without ownership

---

## 0. Purpose

This document defines the genesis state of the IF ledger.

**Genesis establishes:**
- existence of IF
- fixed total supply
- zero initial ownership
- zero initial authority

**Genesis does not establish:**
- entitlement
- distribution
- incentives
- governance power

---

## 1. Genesis Principles (Non-Negotiable)

### Determinism
Genesis must be replayable and identical across all implementations.

### Neutrality
Genesis must not encode identity, merit, contribution, or intent.

### Unowned Existence
IF exists before anyone owns it.

### No Authority at Birth
No validators, keys, or roles exist at genesis.

---

## 2. Fixed Supply Declaration

```
TOTAL_SUPPLY = 1,000,000,000 IF
BASE_UNIT_EXPONENT = 8
BASE_UNITS_PER_IF = 100,000,000 (10^8)
TOTAL_SUPPLY_BASE_UNITS = 100,000,000,000,000,000 (10^17)
```

**Unit System (Bitcoin-style):**
- 1 IF = 100,000,000 base units (like 1 BTC = 100,000,000 satoshis)
- Smallest unit is **0.00000001 IF** (one base unit)
- Total supply in base units: **10^17**

**Immutability:**
- No minting exists beyond genesis.
- No burning of supply exists beyond protocol-defined fee and slashing burns.
- Once ratified, `TOTAL_SUPPLY` is immutable forever.

---

## 3. Genesis Allocation (Unowned)

### 3.1 Burn Allocation

```json
{
  "address": "burn:IF:0000000000000000000000000000000000000000",
  "amount": "100000000000000000"
}
```

- The burn address is provably unreachable.
- No private key exists.
- No redemption path exists.
- This allocation represents **existence, not circulation**.
- Amount expressed in base units: **100,000,000,000,000,000 (10^17)**
- Equivalent to 1,000,000,000 IF tokens.

---

## 4. Initial Validator Set

```
INITIAL_VALIDATOR_SET = []
```

- No validators exist at genesis.
- No special bootstrap authority exists.
- Validators may only appear via explicit post-genesis staking actions.

---

## 5. Initial Protocol Version

```
INITIAL_PROTOCOL_VERSION = IF_PROTOCOL_SURFACE_v0
```

- Genesis binds to the frozen protocol surface.
- Any change requires explicit supersession after genesis.

---

## 6. Genesis State Root

```
GENESIS_STATE_ROOT = sha256(canonical_genesis_state)
```

Computed deterministically from:
- supply declaration
- burn allocation
- empty validator set
- protocol version reference

---

## 7. Explicit Non-Claims

Genesis does not claim:
- fairness
- efficiency
- incentive alignment
- adoption readiness
- value guarantee

**Genesis claims only truth.**

---

## 8. Ratification Requirement

This document becomes authoritative only when:
- Explicitly approved
- Hashed
- Cryptographically signed
- Committed alongside `IF_PROTOCOL_SURFACE_v0`

---

## 9. Diamond Statement

**IF begins unowned so that ownership is always explicit, voluntary, and replayable.**
