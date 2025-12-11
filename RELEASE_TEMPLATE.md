# No Fate Ecosystem — Version <VERSION>

**Release Date:** <DATE>  
**Status:** Canonical  
**License:** Creative Commons Attribution–NoDerivatives 4.0 International (CC BY-ND 4.0)

---

## Release Summary

This release contains the canonical versions of the No Fate ecosystem documents. These documents are immutable and hash-verified for integrity. All documents included in this release are considered authoritative and final for version <VERSION>.

This release establishes deterministic boundaries for AI systems interacting with legal, regulatory, and enforcement contexts. The documents do not interpret law, advise on law, or replace judicial authority. They identify where determinism is possible, where it is not, and where refusal is required.

---

## Included Canonical Documents

### 1. The No Fate Contract v<VERSION>

**Files:**
- `canonical/no-fate-contract_v<VERSION>.md`
- `canonical/no-fate-contract_v<VERSION>.pdf`

**Description:** A boundary specification defining the allowed and disallowed behavior for deterministic systems interacting with law, policy, or enforcement.

**SHA-256 Checksums:**
```
<SHA256_CONTRACT_MD>  canonical/no-fate-contract_v<VERSION>.md
<SHA256_CONTRACT_PDF>  canonical/no-fate-contract_v<VERSION>.pdf
```

**GPG Signatures:**
```
signatures/no-fate-contract_v<VERSION>.md.sig
signatures/no-fate-contract_v<VERSION>.pdf.sig
```

---

### 2. The Deterministic Map of Law v<VERSION>

**Files:**
- `canonical/Deterministic_Map_of_Law_v<VERSION>.md`
- `canonical/Deterministic_Map_of_Law_v<VERSION>.pdf`

**Description:** A complete and stable classification of where U.S. legal questions are deterministic, interpretive, discretionary, or procedural in nature.

**SHA-256 Checksums:**
```
<SHA256_MAP_MD>  canonical/Deterministic_Map_of_Law_v<VERSION>.md
<SHA256_MAP_PDF>  canonical/Deterministic_Map_of_Law_v<VERSION>.pdf
```

**GPG Signatures:**
```
signatures/Deterministic_Map_of_Law_v<VERSION>.md.sig
signatures/Deterministic_Map_of_Law_v<VERSION>.pdf.sig
```

---

## Integrity Verification

### SHA-256 Hash Verification

**On Windows (PowerShell):**
```powershell
Get-FileHash -Algorithm SHA256 canonical/<FILENAME> | Select-Object -ExpandProperty Hash
```

**On Linux/Mac:**
```bash
sha256sum canonical/<FILENAME>
```

Compare the output to the checksums listed above or in `checksums/HASHES.txt`.

**If hashes match:** The document is authentic and unmodified.  
**If hashes differ:** The document has been corrupted or tampered with. Do not use it.

---

### GPG Signature Verification

**Step 1: Import the public key**
```bash
gpg --import NO_FATE_CANONICAL_PUBLIC_KEY.asc
```

**Step 2: Verify the signature**
```bash
gpg --verify signatures/<FILENAME>.sig canonical/<FILENAME>
```

**Expected output:**
```
gpg: Good signature from "<SIGNER_NAME> <<SIGNER_EMAIL>>"
```

**If verification fails:** The document may have been tampered with. Do not use it.

---

### Public Key Information

**Key ID:** `<KEYID>`  
**Fingerprint:** `<FINGERPRINT>`

The public key is included in this release:
```
NO_FATE_CANONICAL_PUBLIC_KEY.asc
```

Always verify the fingerprint against the published value in the repository README.md before trusting signatures.

---

## Canonical Notice

This release constitutes the complete and authoritative statement of the No Fate ecosystem for version <VERSION>.

All documents in this release are:
- **Immutable once published** — No modifications permitted
- **Hash-verified for integrity** — SHA-256 checksums provided
- **Cryptographically signed** — GPG signatures included
- **Licensed under CC BY-ND 4.0** — Redistribution permitted, modification prohibited

No modifications, interpretations, or derivative works are permitted without explicit versioning and re-release under a new version number.

All interpretations must defer to this canonical version.

---

## Files Included in This Release

**Canonical Documents:**
- `canonical/no-fate-contract_v<VERSION>.md`
- `canonical/no-fate-contract_v<VERSION>.pdf`
- `canonical/Deterministic_Map_of_Law_v<VERSION>.md`
- `canonical/Deterministic_Map_of_Law_v<VERSION>.pdf`

**Signatures:**
- `signatures/no-fate-contract_v<VERSION>.md.sig`
- `signatures/no-fate-contract_v<VERSION>.pdf.sig`
- `signatures/Deterministic_Map_of_Law_v<VERSION>.md.sig`
- `signatures/Deterministic_Map_of_Law_v<VERSION>.pdf.sig`

**Checksums:**
- `checksums/HASHES.txt`

**Supporting Files:**
- `NO_FATE_CANONICAL_PUBLIC_KEY.asc`
- `LICENSE.txt`
- `README.md`

---

## License

**Creative Commons Attribution–NoDerivatives 4.0 International (CC BY-ND 4.0)**

https://creativecommons.org/licenses/by-nd/4.0/

### You are free to:

- **Share** — Copy and redistribute the material in any medium or format for any purpose, even commercially

### Under the following terms:

- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

- **NoDerivatives** — If you remix, transform, or build upon the material, you may not distribute the modified material.

- **No additional restrictions** — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

---

## How to Use These Documents

These documents are meant to be:

- **Referenced** in technical specifications
- **Cited** in compliance frameworks
- **Embedded** in deterministic classification systems
- **Used** for pre-adjudicative boundary detection
- **Included** in AI safety frameworks

These documents are **not** meant to be:

- Edited or modified
- Extended or interpreted
- Used to replace judicial authority
- Treated as legal advice
- Applied without understanding their limitations

---

## Contact and Support

**For questions about this release:**
- Open an Issue labeled `clarification-request` in the repository
- Review the documentation in `/docs` folder

**For security issues:**
- See SECURITY.md for vulnerability reporting procedures
- Do not open public issues for security vulnerabilities

**Pull requests for canonical documents will not be accepted.**

---

## Version History

This is version <VERSION> of the No Fate ecosystem.

Previous versions (if any) remain available in the repository for reference but are superseded by this release.

---

## Acknowledgments

The No Fate ecosystem is designed to support institutional legitimacy by preserving human discretion in contexts where determinism is inappropriate.

Thank you to all who have contributed to the clarity and integrity of these boundary specifications.

---

**End of Release Notes**
