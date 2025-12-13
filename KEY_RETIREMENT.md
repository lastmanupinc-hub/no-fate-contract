# GPG Key Retirement Notice

**Status**: RETIRED  
**Date**: 2025-12-13  
**Reason**: Passphrase unavailable  

---

## Retired Key Details

**Key ID**: `E5C802E139E7A96FBD1831C053E6B751C1708A73`  
**Key Type**: RSA 4096  
**Created**: 2025-12-11  
**Owner**: Jonathan Arvay (Deterministic Boundary Framework) <lastmanupinc@gmail.com>  
**Purpose**: Original signing authority for No-Fate Ecosystem v1.0.0  

---

## Retirement Scope

**Status**: RETIRED (not revoked)  
**Reason**: Passphrase unavailable - key cannot be used for new signatures  
**Future Signatures**: None - this key will not sign any future artifacts  
**Past Signatures**: REMAIN VALID - all existing signatures are legitimate and binding  

---

## Valid Signatures from Retired Key

The following signatures were created with this key and remain authoritative:

- `signatures/no-fate-contract_v1.0.0.md.asc`
- `signatures/no-fate-contract_v1.0.0.pdf.asc`
- `signatures/Deterministic_Map_of_Law_v1_0_0.md.asc`
- `signatures/Deterministic_Map_of_Law_v1_0_0.pdf.asc`
- `signatures/The_Boundary_Manifesto.md.asc`

These signatures establish the canonical integrity of the foundational documents and are not superseded by this retirement.

---

## Successor Authority

A new signing key has been generated to provide forward-looking signature authority:

**Successor Key**: See `KEY_SUCCESSION.md` for new key details  
**Scope**: Integrity verification for governance artifacts and future specifications  
**Chain of Custody**: Documented in `VERIFICATION.md`  

---

## Governance Transparency

This retirement is an explicit governance action, not a security failure:

- ✅ Original signatures remain valid and verifiable
- ✅ Canonical documents are immutable and hash-verified
- ✅ Append-only history preserved
- ✅ Successor authority explicitly documented
- ✅ Chain of custody maintained

**Legitimacy does not depend on continuous key access.**

The No-Fate Contract v1.0.0 remains canonical through:
1. Immutable text (SHA-256 verified)
2. Append-only publication history
3. Original valid signatures (from retired key)
4. Deterministic verification rules

---

## Third-Party Verification

To verify the legitimacy of No-Fate artifacts:

1. **For original documents** (contract, Map of Law, Manifesto):
   - Verify SHA-256 checksums against `checksums/HASHES.txt`
   - Verify signatures using retired key's public key (still valid)
   - Confirm immutable publication in git history

2. **For governance artifacts** (post-December 2025):
   - Verify SHA-256 checksums against `checksums/HASHES.txt`
   - Verify signatures using successor key
   - Confirm chain of custody in `VERIFICATION.md`

---

## Key Retirement vs Key Revocation

**This is retirement, not revocation:**

- **Revocation** = key compromised, past signatures invalidated
- **Retirement** = key inaccessible, past signatures remain valid

The retired key's public key remains in the repository for signature verification of historical documents.

---

**Authority**: No-Fate Governance System v1.0.0  
**Append-Only Rule**: This retirement notice is immutable once committed  
**Supersession**: This notice cannot be revoked or modified, only superseded by new governance actions
