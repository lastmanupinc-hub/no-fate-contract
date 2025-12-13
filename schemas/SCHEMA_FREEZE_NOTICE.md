# Schema Freeze Notice

**Date**: 2025-12-12  
**Status**: FROZEN - IMMUTABLE EXECUTION LAW

## Frozen Schemas

The following schemas are **FROZEN** and considered **immutable execution law**:

1. **bundle.schema.json** v1.0.0
2. **output.schema.json** v1.0.0
3. **emergy.schema.json** v1.0.0
4. **attestation.schema.json** v1.0.0

## What "FROZEN" Means

### Immutable Contract
These schemas define the **execution contract** between:
- Solvers that produce outputs
- Avery that verifies and attests
- Consumers that rely on deterministic guarantees

**Any change to these schemas breaks cryptographic attestations and invalidates all prior emergy traces.**

### Version Lock
- `nofate_version: "1.0.0"` - LOCKED
- `emergy_version: "1.0.0"` - LOCKED
- `contract_semantics` in solver_pins - LOCKED to interpretation rules

### Change Policy

**NO CHANGES ALLOWED** to v1.0.0 schemas except:
- ❌ Adding required fields
- ❌ Removing fields
- ❌ Changing types
- ❌ Modifying enums
- ❌ Changing semantics
- ✅ Clarifying documentation (non-normative)

**To make changes:**
1. Create **new version** (v2.0.0)
2. Document **breaking changes** explicitly
3. Provide **migration guide**
4. Add **conformance tests** proving:
   - v2.0.0 behavior is deterministic
   - v1.0.0 attestations remain valid (if backward compatible)
   - Replay still works for v1.0.0 bundles
5. Update **contract_semantics** to `nofate-2.0.0`

## Why This Is Critical

### Avery's Guarantees Depend on Stability

1. **Attestation Validity**: Avery signs `bundle_hash`, `output_hash`, `emergy_hash`
   - If schemas change, hashes break
   - Old attestations become unverifiable

2. **Replay Determinism**: `avery-replay` re-runs solver with same bundle
   - If schemas change, replay fails
   - Determinism guarantee is violated

3. **Conformance Testing**: Test vectors validate ecosystem implementations
   - If schemas change, all test vectors must be regenerated
   - Ecosystem interoperability breaks

4. **Audit Trails**: Emergy traces are permanent records
   - If schemas change, old traces become unreadable
   - Regulatory compliance is compromised

### Trust Model

**Schema stability = Trust foundation**

Organizations adopting No Fate must trust that:
- Today's attestations remain valid tomorrow
- Emergy traces are readable in 5 years
- Replay verification works indefinitely

**Schema changes undermine this trust.**

## Version History

### v1.0.0 (2025-12-12) - FROZEN
- Initial release
- 4 schemas: bundle, output, emergy, attestation
- Explicit version fields added
- Freeze notice committed

### Future Versions

**IF** breaking changes are needed:
- v2.0.0: New major version with migration guide
- v1.1.0: NOT ALLOWED (no minor versions for frozen schemas)
- v1.0.1: NOT ALLOWED (no patches except documentation)

## Verification

### Schema Integrity Check

```bash
# Compute schema hashes (these MUST NOT change)
sha256sum bundle.schema.json
sha256sum output.schema.json
sha256sum emergy.schema.json
sha256sum attestation.schema.json
```

**Reference Hashes (v1.0.0):**
```
bundle.schema.json:      [to be computed on first build]
output.schema.json:      [to be computed on first build]
emergy.schema.json:      [to be computed on first build]
attestation.schema.json: [to be computed on first build]
```

Any deviation = schema has been tampered with.

### Conformance Requirement

All No Fate implementations MUST:
1. Validate inputs against frozen schemas
2. Reject artifacts with wrong `nofate_version`
3. Reject emergy without `emergy_version: "1.0.0"`
4. Preserve `contract_semantics` in solver_pins

## Enforcement

### CI/CD Gates
- Schema hash validation on every commit
- Reject any PR modifying frozen schemas
- Automated conformance tests on schema files

### Governance
- Schema changes require RFC process
- Community review period (minimum 90 days)
- Unanimous approval from core maintainers
- Formal breaking change announcement

## Contact

Questions about schema freeze policy:
- GitHub Issues: `lastmanupinc-hub/no-fate-contract`
- Email: Jonathan@jonathanarvay.com

---

**Remember**: Schemas are execution law. Treat with the same rigor as cryptographic protocols.
