# GPG Key Succession Notice

**Effective Date**: 2025-12-13  
**Authority**: No-Fate Governance System v1.0.0  
**Type**: Forward-looking signature authority  

---

## Successor Key Details

**Key ID**: `AC078631BEE763111D3F4A972BA98D09A801EF31`  
**Short Key ID**: `2BA98D09A801EF31`  
**Key Type**: RSA 4096  
**Created**: 2025-12-13  
**Owner**: No-Fate Governance Authority (Successor Key) <lastmanupinc@gmail.com>  
**Purpose**: Sign governance artifacts and future integrity surfaces  
**Expiration**: None (key does not expire)  

---

## Public Key Location

**File**: `signatures/no-fate-successor-public-key.asc`  
**Import Command**:
```bash
gpg --import signatures/no-fate-successor-public-key.asc
```

---

## Scope of Authority

This successor key is authorized to sign:

✅ **Governance Artifacts** (post-December 2025):
- `checksums/HASHES.txt`
- `VERIFICATION.md`
- Governance specifications and bindings
- Audit reports and attestations
- Future delivery pipeline specifications

❌ **NOT authorized to sign**:
- Original contract documents (already signed by retired key)
- Historical foundational documents (Map of Law, Manifesto)
- Any artifact dated before 2025-12-13

---

## Chain of Custody

### Original Authority (Retired)

**Key ID**: `E5C802E139E7A96FBD1831C053E6B751C1708A73`  
**Status**: RETIRED (passphrase unavailable)  
**Valid Signatures**: All pre-existing signatures remain authoritative  
**Documents Signed**:
- No-Fate Contract v1.0.0 (MD + PDF)
- Deterministic Map of Law v1.0.0 (MD + PDF)
- The Boundary Manifesto (MD)

### Successor Authority (Active)

**Key ID**: `AC078631BEE763111D3F4A972BA98D09A801EF31`  
**Status**: ACTIVE  
**Scope**: Governance and integrity artifacts only  
**First Signatures**: TBD (checksums/HASHES.txt, VERIFICATION.md)  

---

## Legitimacy Criteria

**Original documents remain canonical through**:
1. ✅ Immutable SHA-256 hashes
2. ✅ Append-only git history
3. ✅ Valid signatures from retired key (not revoked)
4. ✅ Deterministic verification rules

**New governance artifacts establish legitimacy through**:
1. ✅ SHA-256 checksums in `checksums/HASHES.txt`
2. ✅ Signatures from successor key
3. ✅ Documented chain of custody
4. ✅ Governance binding to canonical genesis

---

## Verification Protocol

### For Original Documents (pre-2025-12-13)

```bash
# Import retired key's public key
gpg --import signatures/no-fate-public-key.asc

# Verify signature
gpg --verify signatures/no-fate-contract_v1.0.0.md.asc no-fate-contract_v1.0.0.md

# Expected: Good signature from retired key
```

### For Governance Artifacts (post-2025-12-13)

```bash
# Import successor key's public key
gpg --import signatures/no-fate-successor-public-key.asc

# Verify signature
gpg --verify signatures/HASHES.txt.asc checksums/HASHES.txt

# Expected: Good signature from successor key
```

---

## Why Two Keys Are Legitimate

**This is not a security compromise.** This is explicit governance transparency:

1. **Retired key** establishes canonical authority for original documents
2. **Successor key** provides ongoing signature authority for governance
3. **Both keys are documented** in the append-only history
4. **Chain of custody is explicit** and verifiable by third parties
5. **No re-signing required** - original signatures remain valid

**Legitimacy does NOT require**:
- ❌ Single eternal key
- ❌ Continuous passphrase access
- ❌ Re-signing historical documents
- ❌ Revoking the retired key

**Legitimacy DOES require**:
- ✅ Immutable document text
- ✅ Verifiable checksums
- ✅ Append-only history
- ✅ Documented authority chain
- ✅ Transparent governance actions

---

## Supersession Rule

If this successor key becomes unavailable:

1. Create new `KEY_RETIREMENT_2.md` for successor key
2. Generate new successor key
3. Document new chain of custody
4. Sign only forward-looking artifacts
5. Past signatures remain valid

**The pattern repeats.** Authority chains forward, never backward.

---

## Third-Party Trust

To trust No-Fate governance without trusting individuals:

1. **Verify checksums** of all artifacts (deterministic)
2. **Verify signatures** match documented keys (cryptographic)
3. **Verify git history** is append-only (immutable)
4. **Verify governance binding** references canonical genesis (auditable)

No individual trust required. The system is the authority.

---

**Authority**: No-Fate Governance System v1.0.0  
**Append-Only Rule**: This succession notice is immutable once committed  
**Effective**: Immediately upon commit to main branch
