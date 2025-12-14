# RATIFICATION_MANIFEST.md

**IF v0 — PENDING RATIFICATION**  
**Status:** DRAFT - Supply finalized, awaiting final approval  
**Date:** December 13, 2025

---

## Current Status

**⚠️ NOT YET RATIFIED**

Supply has been finalized, but formal ratification is PENDING:
- ⏳ Final review of all 4 artifacts
- ⏳ Explicit approval statement
- ⏳ Hash generation
- ⏳ Cryptographic signature
- ⏳ Canonical commit

---

## Supply Finalization (Completed)

**Unit System:** Bitcoin-style (1 IF = 10^8 base units)

```
TOTAL_SUPPLY_IF = 1,000,000,000 (1 billion tokens)
BASE_UNIT_EXPONENT = 8
BASE_UNITS_PER_IF = 100,000,000
TOTAL_SUPPLY_BASE_UNITS = 100,000,000,000,000,000 (10^17)
```

---

## Artifacts Ready for Ratification

1. ✅ IF_PROTOCOL_SURFACE_v0.md - Protocol specification (human)
2. ✅ IF_PROTOCOL_SURFACE_v0.json - Protocol specification (machine)
3. ✅ GENESIS_SPEC_v0.md - Genesis state definition
4. ✅ PROCUREMENT_TERMS.md - No founder privilege

**All artifacts now have concrete supply values (no TBD or placeholders).**

---

## Next Steps for Ratification

### Step 1: Final Review
Review all 4 artifacts for any final corrections.

### Step 2: Approval Statement
Issue explicit approval:

> "I approve IF_PROTOCOL_SURFACE_v0.md, IF_PROTOCOL_SURFACE_v0.json, GENESIS_SPEC_v0.md, and PROCUREMENT_TERMS.md as complete, ambiguity-free, and representative of IF v0. Any future change requires explicit supersession."

### Step 3: Hash Lock
Generate SHA-256 hashes for each artifact.

### Step 4: Cryptographic Signature
Sign the bundle hash with your private key.

### Step 5: Canonical Commit
```bash
git add .
git commit -m "IF v0 - Supply finalized, awaiting ratification"
```

---

## Ratification Checklist

- [x] Supply finalized (1,000,000,000 IF = 10^17 base units)
- [x] Unit system resolved (BASE_UNIT_EXPONENT = 8)
- [x] All TBD placeholders replaced
- [x] Supply math is consistent across all artifacts
- [x] commission_rate removed (no validator rewards in v0)
- [ ] Final review of all 4 artifacts (PENDING)
- [ ] Explicit approval statement (PENDING)
- [ ] SHA-256 hash generation (PENDING)
- [ ] Cryptographic signature (PENDING)
- [ ] Mark as FROZEN (PENDING)
- [ ] Canonical commit with tag (PENDING)

---

## Critical Note

**Supply is now finalized and internally consistent:**

- GENESIS_SPEC_v0.md: ✅ Concrete values (no "S" placeholder)
- IF_PROTOCOL_SURFACE_v0.json: ✅ Concrete genesis_supply (no "TBD")
- Unit math: ✅ 1,000,000,000 IF × 10^8 = 10^17 base units

**Deterministic replay is now possible.**

**Ready for final approval and ratification when you are.**
