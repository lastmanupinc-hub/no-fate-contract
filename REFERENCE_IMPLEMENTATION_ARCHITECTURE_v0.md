# REFERENCE_IMPLEMENTATION_ARCHITECTURE_v0.md

**Status:** DRAFT (Implementation Guidance)  
**Type:** Advisory Only (Not Specification)  
**Binding Spec:** IF_PROTOCOL_SURFACE_v0 (currently DRAFT)

---

## Purpose

This document provides **minimal reference architecture** for implementing IF v0.

**⚠️ CRITICAL: This is NOT a specification and is NOT ratified.**

The authoritative specifications are:
- IF_PROTOCOL_SURFACE_v0.md (DRAFT)
- IF_PROTOCOL_SURFACE_v0.json (DRAFT)
- GENESIS_SPEC_v0.md (DRAFT)
- PROCUREMENT_TERMS.md (DRAFT)

**All specs are currently DRAFT pending supply finalization and ratification.**

This document shows ONE possible correct way to implement those specs.

Other implementations are valid if they produce **identical outputs** for all inputs.

---

## 0. Repository / Module Layout

```
if_v0/
├── README.md
├── artifacts/
│   ├── IF_PROTOCOL_SURFACE_v0.md
│   ├── IF_PROTOCOL_SURFACE_v0.json
│   ├── GENESIS_SPEC_v0.md
│   ├── PROCUREMENT_TERMS.md
│   └── RATIFICATION_MANIFEST.md
├── src/
│   ├── constants.py
│   ├── enums.py
│   ├── serialization.py
│   ├── hashing.py
│   ├── models/
│   │   ├── state.py
│   │   ├── account.py
│   │   ├── shielded_pool.py
│   │   ├── validator.py
│   │   ├── protocol_version.py
│   │   └── finality.py
│   ├── actions/
│   │   ├── base.py
│   │   ├── transaction.py
│   │   ├── staking.py
│   │   └── governance.py
│   ├── engine/
│   │   ├── ordering.py
│   │   ├── validation.py
│   │   ├── transition.py
│   │   └── receipts.py
│   └── genesis.py
├── tests/
│   ├── vectors/
│   │   ├── genesis.json
│   │   ├── actions_pass.json
│   │   ├── actions_fail.json
│   │   ├── actions_invalid.json
│   │   └── actions_indeterminate.json
│   ├── test_determinism.py
│   ├── test_replay.py
│   ├── test_ordering.py
│   └── test_hash_commitments.py
└── tools/
    └── replay_from_genesis.py
```

---

## 1. Canonical Constants and Enums

### constants.py

```python
"""Canonical constants from ratified artifacts."""

# From GENESIS_SPEC_v0.md
BASE_UNIT_EXPONENT = 8  # 1 IF = 10^8 base units (like Bitcoin satoshis)
BASE_UNITS_PER_IF = 100_000_000  # 10^8
TOTAL_SUPPLY_IF = 1_000_000_000  # 1 billion IF tokens
TOTAL_SUPPLY_BASE_UNITS = 100_000_000_000_000_000  # 10^17 base units

# From IF_PROTOCOL_SURFACE_v0
INITIAL_PROTOCOL_VERSION = "IF_PROTOCOL_SURFACE_v0"
MIN_PROPOSAL_DELAY = 100_800  # blocks

# From Section 1
HASH_FUNCTION = "SHA-256"

# From GENESIS_SPEC_v0.md
BURN_ADDRESS = "burn:IF:0000000000000000000000000000000000000000"
```

**Rules:**
- Values are taken directly from the specification
- TOTAL_SUPPLY_BASE_UNITS = TOTAL_SUPPLY_IF × BASE_UNITS_PER_IF
- No derived or inferred supply math beyond this identity
- These values are **immutable once ratified**

### enums.py

```python
"""Closed enums from protocol surface."""

from enum import Enum

class Outcome(Enum):
    """Section 0.1 - Closed set of action outcomes."""
    PASS = "PASS"
    FAIL = "FAIL"
    INDETERMINATE = "INDETERMINATE"
    INVALID_INPUT = "INVALID_INPUT"

class ReasonCode(Enum):
    """Section 1 - Canonical receipt reason codes."""
    SUCCESS = "SUCCESS"
    INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE"
    INVALID_SIGNATURE = "INVALID_SIGNATURE"
    NONCE_MISMATCH = "NONCE_MISMATCH"
    INVALID_PROOF = "INVALID_PROOF"
    DOUBLE_SPEND_NULLIFIER = "DOUBLE_SPEND_NULLIFIER"
    VALIDATOR_NOT_FOUND = "VALIDATOR_NOT_FOUND"
    VALIDATOR_ALREADY_SLASHED = "VALIDATOR_ALREADY_SLASHED"
    INSUFFICIENT_STAKE = "INSUFFICIENT_STAKE"
    PROPOSAL_NOT_FOUND = "PROPOSAL_NOT_FOUND"
    PROPOSAL_ALREADY_ACTIVATED = "PROPOSAL_ALREADY_ACTIVATED"
    ACTIVATION_CONDITIONS_NOT_MET = "ACTIVATION_CONDITIONS_NOT_MET"
    EVIDENCE_INVALID = "EVIDENCE_INVALID"
    MALFORMED_ACTION = "MALFORMED_ACTION"
    UNKNOWN_ACTION_TYPE = "UNKNOWN_ACTION_TYPE"

class EvidenceType(Enum):
    """Section 3.2 - Closed set of slashing evidence types."""
    DOUBLE_SIGN = "DOUBLE_SIGN"
    INVALID_BLOCK_PROPOSAL = "INVALID_BLOCK_PROPOSAL"
    CENSORSHIP_PROOF = "CENSORSHIP_PROOF"

class SupersessionStatus(Enum):
    """Section 2 - Supersession proposal states."""
    PROPOSED = "PROPOSED"
    ACTIVATED = "ACTIVATED"
    REJECTED = "REJECTED"
```

**Rules:**
- No extension points
- Unknown enum value → INVALID_INPUT
- Exhaustive matching required

---

## 2. Canonical Serialization and Hashing

### serialization.py

```python
"""Canonical JSON encoding per Section 1."""

import json
from typing import Any

def canonical_json(obj: Any) -> str:
    """
    Produce canonical JSON encoding per IF_PROTOCOL_SURFACE_v0.
    
    Rules:
    - UTF-8 encoding
    - Lexicographically sorted keys
    - No whitespace between tokens
    - Decimal integers only (no scientific notation)
    - RFC 8159 string escaping
    """
    return json.dumps(
        obj,
        ensure_ascii=False,
        sort_keys=True,
        separators=(',', ':'),
        allow_nan=False
    )

def canonical_bytes(obj: Any) -> bytes:
    """Convert object to canonical bytes."""
    return canonical_json(obj).encode('utf-8')
```

**Used for:**
- Action encoding
- Receipt encoding
- Full state encoding

### hashing.py

```python
"""SHA-256 hashing per Section 1."""

import hashlib
from typing import Any

def hash_bytes(data: bytes) -> str:
    """Hash bytes, return lowercase hex."""
    return hashlib.sha256(data).hexdigest()

def hash_json(obj: Any) -> str:
    """Hash JSON object canonically."""
    from .serialization import canonical_bytes
    return hash_bytes(canonical_bytes(obj))
```

**Rules:**
- All hashes use SHA-256
- Output is lowercase hexadecimal
- 64 hex characters (32 bytes)

---

## 3. State Model (Authoritative)

### models/state.py

```python
"""Root state container."""

from dataclasses import dataclass
from typing import Dict, List

@dataclass
class State:
    """Complete ledger state."""
    accounts: Dict[str, 'Account']
    shielded_pool: 'ShieldedPool'
    nullifier_set: 'NullifierSet'
    validators: Dict[str, 'Validator']
    protocol_version: 'ProtocolVersion'
    finality_checkpoint_history: List['FinalityCheckpoint']
    burned_supply: int
```

**Requirements:**
- State must be fully serializable
- State must be replayable from genesis

### models/account.py

```python
"""Section 2 - Account state."""

from dataclasses import dataclass

@dataclass
class Account:
    """Transparent account state."""
    address: str  # immutable
    balance: int  # min 0
    nonce: int    # min 0
    code_hash: str = None  # Reserved for future, null for v0
```

### models/shielded_pool.py

```python
"""Section 2 - Shielded pool state."""

from dataclasses import dataclass

@dataclass
class ShieldedPool:
    """Privacy-preserving value pool."""
    commitment_tree_root: str  # hex64
    total_shielded_supply: int

@dataclass
class NullifierSet:
    """Spent note nullifiers."""
    nullifiers: set[str]  # hex64
```

### models/validator.py

```python
"""Section 2 - Validator state."""

from dataclasses import dataclass

@dataclass
class Validator:
    """Validator state for consensus participation."""
    validator_id: str
    stake: int  # min 0
    is_active: bool
    is_slashed: bool
    # No commission_rate - not used in v0
```

### models/protocol_version.py

```python
"""Section 2 - Protocol version state."""

from dataclasses import dataclass
from typing import List

@dataclass
class SupersessionProposal:
    """Pending protocol upgrade."""
    proposal_hash: str
    activation_height: int
    status: str  # SupersessionStatus enum
    proposed_at_height: int

@dataclass
class ProtocolVersion:
    """Current protocol version and scheduled supersessions."""
    current_version: str
    supersession_schedule: List[SupersessionProposal]
```

### models/finality.py

```python
"""Section 4 - Finality checkpoint."""

from dataclasses import dataclass
from typing import List

@dataclass
class ValidatorSignature:
    """Single validator signature contribution."""
    validator_id: str
    signature: bytes
    stake_weight: int

@dataclass
class FinalityCheckpoint:
    """Cryptographic proof of irreversible finality."""
    block_height: int
    block_hash: str  # hex64
    state_root: str  # hex64
    validator_signatures: List[ValidatorSignature]
    cumulative_stake: int
```

---

## 4. Genesis Initialization

### genesis.py

```python
"""Genesis state construction per GENESIS_SPEC_v0.md"""

from .models.state import State
from .models.account import Account
from .models.shielded_pool import ShieldedPool, NullifierSet
from .models.protocol_version import ProtocolVersion
from .constants import (
    BURN_ADDRESS,
    TOTAL_SUPPLY_BASE_UNITS,
    INITIAL_PROTOCOL_VERSION
)
from .hashing import hash_json

def create_genesis_state() -> State:
    """
    Create genesis state per GENESIS_SPEC_v0.md
    
    - Entire supply allocated to burn address
    - No other accounts
    - Empty validator set
    - Empty supersession schedule
    """
    
    # Burn address holds entire supply
    burn_account = Account(
        address=BURN_ADDRESS,
        balance=TOTAL_SUPPLY_BASE_UNITS,
        nonce=0,
        code_hash=None
    )
    
    return State(
        accounts={BURN_ADDRESS: burn_account},
        shielded_pool=ShieldedPool(
            commitment_tree_root="0" * 64,  # Empty tree
            total_shielded_supply=0
        ),
        nullifier_set=NullifierSet(nullifiers=set()),
        validators={},
        protocol_version=ProtocolVersion(
            current_version=INITIAL_PROTOCOL_VERSION,
            supersession_schedule=[]
        ),
        finality_checkpoint_history=[],
        burned_supply=0
    )

def compute_genesis_state_root() -> str:
    """Compute GENESIS_STATE_ROOT deterministically."""
    genesis = create_genesis_state()
    return hash_json(genesis)
```

**Principle:** Genesis establishes existence without ownership.

---

## 5. Action Definitions

### actions/base.py

```python
"""Base action interface."""

from abc import ABC, abstractmethod
from typing import Tuple
from ..enums import Outcome, ReasonCode

class Action(ABC):
    """Abstract action base class."""
    
    @abstractmethod
    def action_type(self) -> str:
        """Return action type string."""
        pass
    
    @abstractmethod
    def validate(self, state, block_context) -> Tuple[Outcome, ReasonCode]:
        """Validate action against state."""
        pass
    
    @abstractmethod
    def apply(self, state):
        """Apply state mutations (only if PASS)."""
        pass
```

**Rule:** Unknown action type → INVALID_INPUT

### actions/transaction.py

```python
"""Section 3.1 - Transaction actions."""

# TRANSFER_TRANSPARENT
# SHIELD
# UNSHIELD
# SHIELDED_TRANSFER

# Each implements:
# - exact pass conditions
# - exact fail conditions with reason codes
# - exact state mutations
```

### actions/staking.py

```python
"""Section 3.2 - Consensus staking actions."""

# STAKE
# UNSTAKE
# SLASH_VALIDATOR (burn-only sink)

# Slashing logic:
# - validator.is_slashed = True
# - validator.stake = 0
# - Amount is BURNED (added to burned_supply)
# - NO redistribution
```

### actions/governance.py

```python
"""Section 3.3 - Governance actions."""

# PROPOSE_SUPERSESSION (permissionless)
# ACTIVATE_SUPERSESSION (mechanical, deterministic)

# Activation rule:
# - current_height >= activation_height
# - proposal exists in schedule
# - status == PROPOSED
```

---

## 6. Deterministic Ordering

### engine/ordering.py

```python
"""Section 0.2 - Deterministic action ordering."""

from typing import List
from ..actions.base import Action
from ..hashing import hash_json

def order_actions(actions: List[Action]) -> List[Action]:
    """
    Order actions deterministically per Section 0.2:
    
    1. Compute action_hash for each action
    2. Partition: dependent (same account nonce) vs independent
    3. Sort independent actions lexicographically by action_hash
    4. Enforce nonce sequencing for dependent actions
    """
    
    # Compute hashes
    action_hashes = [(hash_json(a), a) for a in actions]
    
    # Partition by account dependency
    by_account = {}
    independent = []
    
    for hash_val, action in action_hashes:
        if has_nonce(action):
            account = get_account(action)
            if account not in by_account:
                by_account[account] = []
            by_account[account].append((hash_val, action))
        else:
            independent.append((hash_val, action))
    
    # Sort independent lexicographically by hash
    independent.sort(key=lambda x: x[0])
    
    # Sort dependent by nonce
    dependent = []
    for account, actions in by_account.items():
        actions.sort(key=lambda x: get_nonce(x[1]))
        dependent.extend(actions)
    
    # Combine
    ordered = [a for _, a in independent] + [a for _, a in dependent]
    
    return ordered
```

**Rule:** Out-of-order execution → FAIL(NONCE_MISMATCH)

---

## 7. Validation and Transition Engine

### engine/validation.py

```python
"""Action validation per protocol surface."""

def validate_block_context(block_context: dict) -> bool:
    """
    Enforce Section 0 - block_context whitelist.
    
    Required fields:
    - height
    - timestamp
    - validator_set_hash
    - protocol_version
    - parent_block_hash
    
    Forbidden fields:
    - randomness
    - external_data
    - oracle_inputs
    """
    required = {
        'height', 'timestamp', 'validator_set_hash',
        'protocol_version', 'parent_block_hash'
    }
    forbidden = {'randomness', 'external_data', 'oracle_inputs'}
    
    if not required.issubset(block_context.keys()):
        return False
    
    if forbidden.intersection(block_context.keys()):
        return False
    
    return True
```

### engine/transition.py

```python
"""State transition engine."""

from typing import Tuple
from ..enums import Outcome, ReasonCode

def execute_action(action, state, block_context) -> Tuple[Outcome, ReasonCode, State]:
    """
    Execute single action:
    
    1. Validate block_context
    2. Call action.validate(state, block_context)
    3. If PASS: call action.apply(state)
    4. Return (outcome, reason, new_state)
    """
    
    # Validate block context
    if not validate_block_context(block_context):
        return (Outcome.INVALID_INPUT, ReasonCode.MALFORMED_ACTION, state)
    
    # Validate action
    outcome, reason = action.validate(state, block_context)
    
    # Apply if PASS
    if outcome == Outcome.PASS:
        new_state = action.apply(state)
        return (outcome, reason, new_state)
    else:
        return (outcome, reason, state)  # No state change
```

### engine/receipts.py

```python
"""Section 1 - Canonical receipt generation."""

from dataclasses import dataclass
from ..hashing import hash_json

@dataclass
class CanonicalReceipt:
    """Canonical action receipt per Section 1."""
    action_hash: str      # hex64
    block_height: int
    outcome: str          # Outcome enum
    reason_code: str      # ReasonCode enum
    state_root_post: str  # hex64

def generate_receipt(action, block_height, outcome, reason, state_post) -> CanonicalReceipt:
    """Generate byte-for-byte reproducible receipt."""
    return CanonicalReceipt(
        action_hash=hash_json(action),
        block_height=block_height,
        outcome=outcome.value,
        reason_code=reason.value,
        state_root_post=hash_json(state_post)
    )
```

**Rule:** Receipts must be byte-for-byte reproducible.

---

## 8. Finality Boundary

### Finality Checkpoint (Data Only)

```python
"""Section 4 - Finality verification."""

def verify_finality_checkpoint(checkpoint, total_stake) -> bool:
    """
    Verify finality checkpoint per Section 4:
    
    1. Message = SHA-256(height || block_hash || state_root)
    2. Validate each signature
    3. Sum stake weights
    4. Check cumulative_stake >= (2/3 * total_stake)
    """
    
    # Construct message
    message = hash_bytes(
        checkpoint.block_height.to_bytes(8, 'big') +
        bytes.fromhex(checkpoint.block_hash) +
        bytes.fromhex(checkpoint.state_root)
    )
    
    # Verify signatures (deterministic black box)
    valid_stake = 0
    for sig in checkpoint.validator_signatures:
        if verify_signature(sig.validator_id, message, sig.signature):
            valid_stake += sig.stake_weight
    
    # Check 2/3 threshold
    return valid_stake >= (2 * total_stake // 3)
```

**Rules:**
- No networking logic
- No consensus protocol
- Data structure only

---

## 9. Tests and Verification

### Required Test Vectors

```
tests/vectors/
├── genesis.json              # Expected genesis state root
├── actions_pass.json         # Actions that should PASS
├── actions_fail.json         # Actions that should FAIL
├── actions_invalid.json      # Actions that should → INVALID_INPUT
└── actions_indeterminate.json # Actions that should → INDETERMINATE
```

### test_determinism.py

```python
"""Dual-execution determinism proof."""

def test_determinism():
    """
    Execute same action sequence twice independently.
    
    Assert:
    - Identical outcomes
    - Identical receipts
    - Identical state_roots
    """
    
    state1 = create_genesis_state()
    state2 = create_genesis_state()
    
    for action in test_actions:
        outcome1, receipt1, state1 = execute_action(action, state1, block_context)
        outcome2, receipt2, state2 = execute_action(action, state2, block_context)
        
        assert outcome1 == outcome2
        assert receipt1 == receipt2
        assert hash_json(state1) == hash_json(state2)
```

### test_replay.py

```python
"""Replay from genesis test."""

def test_replay_from_genesis():
    """
    Start from genesis state.
    Replay all historical actions.
    Verify final state root matches current chain state.
    """
    state = create_genesis_state()
    
    for action in historical_actions:
        _, _, state = execute_action(action, state, block_context)
    
    assert hash_json(state) == current_state_root
```

### test_ordering.py

```python
"""Test canonical ordering rules."""

def test_action_ordering():
    """Verify lexicographic ordering by action_hash."""
    actions = generate_random_actions()
    ordered = order_actions(actions)
    
    # Verify independent actions are sorted by hash
    for i in range(len(ordered) - 1):
        if is_independent(ordered[i]) and is_independent(ordered[i+1]):
            assert hash_json(ordered[i]) < hash_json(ordered[i+1])
```

---

## 10. Explicit Gaps (Non-Decidable)

The following are **NOT decided by IF_PROTOCOL_SURFACE_v0**:

### Cryptographic Primitives

- **Signature schemes** (Ed25519, ECDSA, BLS, etc.)
- **Zero-knowledge proof systems** (Groth16, PLONK, etc.)
- **Merkle tree implementations** (sparse vs dense, hashing strategy)

**Treatment:** These are deterministic black boxes.

```python
# Example: Signature verification stub
def verify_signature(pubkey, message, signature) -> bool:
    """
    Deterministic signature verification.
    
    Implementation must:
    - Be deterministic
    - Return boolean
    - Match chosen cryptographic standard
    
    Choice of scheme is NOT specified by protocol surface.
    """
    # Implementation depends on chosen signature scheme
    pass
```

### Networking and Consensus

- Block propagation
- Peer discovery
- Mempool management
- Leader election

**Treatment:** Out of scope. Implementation-specific.

### Storage Layer

- Database choice
- Indexing strategy
- State pruning
- Archive nodes

**Treatment:** Out of scope. Must preserve determinism.

---

## 11. Implementation Principles

### ✅ MUST Do

1. **Produce identical outputs** for identical inputs
2. **Use closed enums** exactly as specified
3. **Enforce block_context whitelist**
4. **Generate canonical receipts**
5. **Follow ordering rules** (lexicographic + nonce)
6. **Burn slashed stake** (no redistribution)
7. **Support replay from genesis**

### ❌ MUST NOT Do

1. **Add new outcomes** beyond 4-outcome set
2. **Add new reason codes** without supersession
3. **Add new evidence types** without supersession
4. **Allow admin override** (forbidden forever)
5. **Use randomness** in state transitions
6. **Use system time** (only block timestamp)
7. **Redistribute slashed stake** (burn only)

### ⚠️ Implementation Freedom

You MAY choose:
- Programming language
- Database technology
- Cryptographic libraries
- Networking stack
- Consensus algorithm details

**As long as:** State transitions remain deterministic and identical to spec.

---

## 12. Compliance Verification

To verify your implementation is compliant:

1. ✅ Run all test vectors (PASS/FAIL/INVALID/INDETERMINATE)
2. ✅ Execute dual-execution determinism test
3. ✅ Replay from genesis and verify state root
4. ✅ Verify canonical receipt generation
5. ✅ Verify action ordering logic
6. ✅ Verify block_context enforcement
7. ✅ Verify closed enum enforcement
8. ✅ Verify no admin override exists

**If all pass:** Your implementation is IF v0 compliant.

---

## Status

**This document is DRAFT (not ratified).**

It represents one possible correct implementation approach for IF v0.

Other approaches are valid if they produce identical outputs.

**⚠️ The specifications themselves are DRAFT pending supply finalization.**

**The only binding authority (once ratified) will be:**
- IF_PROTOCOL_SURFACE_v0.md
- IF_PROTOCOL_SURFACE_v0.json
- GENESIS_SPEC_v0.md
- PROCUREMENT_TERMS.md

**Do not implement until specifications are ratified.**

---

**End of Reference Implementation Architecture v0 (DRAFT)**
