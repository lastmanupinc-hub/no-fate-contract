# GPG Signatures for No Fate Canonical Documents

This directory contains detached GPG signatures for all canonical documents in the No Fate ecosystem.

---

## Contents

Each canonical document has a corresponding `.asc` signature file:

### v1.0.0 Signatures
- `no-fate-contract_v1.0.0.md.asc` - Contract Markdown signature
- `no-fate-contract_v1.0.0.pdf.asc` - Contract PDF signature
- `Deterministic_Map_of_Law_v1_0_0.md.asc` - Map Markdown signature
- `Deterministic_Map_of_Law_v1_0_0.pdf.asc` - Map PDF signature
- `The_Boundary_Manifesto.md.asc` - Manifesto signature

### Public Key
- `no-fate-public-key.asc` - GPG public key for verification

---

## How to Verify Signatures

### Step 1: Import the Public Key
```bash
gpg --import signatures/no-fate-public-key.asc
```

### Step 2: Verify a Document
```bash
gpg --verify signatures/no-fate-contract_v1.0.0.md.asc no-fate-contract_v1.0.0.md
```

### Step 3: Confirm Good Signature
You should see:
```
gpg: Good signature from "Steward Name (No Fate Ecosystem) <email@example.com>"
```

---

## PowerShell Verification (Windows)

```powershell
# Import public key
gpg --import signatures/no-fate-public-key.asc

# Verify a document
gpg --verify signatures/no-fate-contract_v1.0.0.md.asc no-fate-contract_v1.0.0.md
```

---

## Trust Model

- All signatures are generated using the No Fate Ecosystem steward's GPG key
- The public key fingerprint is published on the website for independent verification
- Signatures ensure both **integrity** (document unchanged) and **authenticity** (signed by steward)

---

## Key Fingerprint

The public key fingerprint will be published here after key generation.

To verify the fingerprint:
```bash
gpg --fingerprint <KEYID>
```

---

## Additional Resources

- Full verification guide: `/pages/integrity-verification.html`
- GPG setup instructions: `/GPG_SETUP_GUIDE.md`
- Checksums: `/checksums/checksums.txt`

---

**Status:** Ready for v1.0.0 signatures after GPG key generation
