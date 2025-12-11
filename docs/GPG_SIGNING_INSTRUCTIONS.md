# GPG Signing Instructions

## Overview

All canonical documents in the No Fate ecosystem must be cryptographically signed using GPG to ensure authenticity and integrity. This document provides complete instructions for generating keys, signing documents, and verifying signatures.

---

## Step 1: Generate a GPG Keypair

If you do not already have a GPG key for signing canonical documents, generate one:

```bash
gpg --full-generate-key
```

Select the following options when prompted:

- **Key type:** RSA and RSA (default)
- **Key size:** 4096 bits
- **Expiration:** 0 (does not expire) or set an appropriate expiration date
- **Real name:** `<SIGNER_NAME>`
- **Email address:** `<SIGNER_EMAIL>`
- **Comment:** `No Fate Canonical Authority` (optional)
- **Passphrase:** Enter a strong passphrase and store it securely

Confirm key creation. GPG will generate the keypair.

---

## Step 2: Verify Key Creation

List your keys to confirm successful generation:

```bash
gpg --list-secret-keys --keyid-format LONG
```

Example output:

```
sec   rsa4096/<KEYID> 2025-12-11 [SC]
      <FINGERPRINT>
uid           [ultimate] <SIGNER_NAME> <<SIGNER_EMAIL>>
ssb   rsa4096/<SUBKEYID> 2025-12-11 [E]
```

Record the `<KEYID>` and `<FINGERPRINT>` for future use.

---

## Step 3: Export the Public Key

Export your public key for distribution:

```bash
gpg --armor --export <KEYID> > NO_FATE_CANONICAL_PUBLIC_KEY.asc
```

This file must be committed to the repository root so users can verify signatures.

---

## Step 4: Display the Key Fingerprint

Generate the fingerprint for publication in README.md:

```bash
gpg --fingerprint <KEYID>
```

Example output:

```
pub   rsa4096/<KEYID> 2025-12-11 [SC]
      Key fingerprint = <FINGERPRINT>
uid           [ultimate] <SIGNER_NAME> <<SIGNER_EMAIL>>
sub   rsa4096/<SUBKEYID> 2025-12-11 [E]
```

Publish the `<FINGERPRINT>` in the repository README.md.

---

## Step 5: Sign Canonical Documents

Create detached signatures for all canonical documents using the `.sig` extension:

```bash
gpg --detach-sign --armor --output signatures/<DOCUMENT_NAME>.md.sig canonical/<DOCUMENT_NAME>.md
```

For PDF documents:

```bash
gpg --detach-sign --armor --output signatures/<DOCUMENT_NAME>.pdf.sig canonical/<DOCUMENT_NAME>.pdf
```

Example for specific documents:

```bash
gpg --detach-sign --armor --output signatures/no-fate-contract_v1.0.0.md.sig canonical/no-fate-contract_v1.0.0.md
gpg --detach-sign --armor --output signatures/no-fate-contract_v1.0.0.pdf.sig canonical/no-fate-contract_v1.0.0.pdf
gpg --detach-sign --armor --output signatures/Deterministic_Map_of_Law_v1_0_0.md.sig canonical/Deterministic_Map_of_Law_v1_0_0.md
gpg --detach-sign --armor --output signatures/Deterministic_Map_of_Law_v1_0_0.pdf.sig canonical/Deterministic_Map_of_Law_v1_0_0.pdf
```

---

## Step 6: Verify Signatures

To verify a signature, users must first import the public key:

```bash
gpg --import NO_FATE_CANONICAL_PUBLIC_KEY.asc
```

Then verify the signature against the original document:

```bash
gpg --verify signatures/<DOCUMENT_NAME>.md.sig canonical/<DOCUMENT_NAME>.md
```

Expected output for a valid signature:

```
gpg: Signature made <DATE>
gpg:                using RSA key <KEYID>
gpg: Good signature from "<SIGNER_NAME> <<SIGNER_EMAIL>>" [ultimate]
```

If the output displays `Good signature`, the document is authentic and unmodified.

If the output displays `BAD signature`, the document has been tampered with and must not be used.

---

## Step 7: Batch Signing Script

To sign all canonical documents at once, use this script:

```bash
#!/bin/bash
for file in canonical/*.md canonical/*.pdf; do
  if [ -f "$file" ]; then
    basename=$(basename "$file")
    gpg --detach-sign --armor --output "signatures/${basename}.sig" "$file"
    echo "Signed: $file"
  fi
done
```

Save this script as `sign_all_canonical.sh`, make it executable, and run:

```bash
chmod +x sign_all_canonical.sh
./sign_all_canonical.sh
```

---

## Step 8: Batch Verification Script

To verify all signatures at once:

```bash
#!/bin/bash
for file in canonical/*.md canonical/*.pdf; do
  if [ -f "$file" ]; then
    basename=$(basename "$file")
    if [ -f "signatures/${basename}.sig" ]; then
      gpg --verify "signatures/${basename}.sig" "$file"
    else
      echo "WARNING: No signature found for $file"
    fi
  fi
done
```

Save this script as `verify_all_canonical.sh`, make it executable, and run:

```bash
chmod +x verify_all_canonical.sh
./verify_all_canonical.sh
```

---

## Recommended Repository Structure

Store all signatures in the `/signatures` folder with the following naming convention:

```
no-fate-contract/
├── canonical/
│   ├── no-fate-contract_v1.0.0.md
│   ├── no-fate-contract_v1.0.0.pdf
│   ├── Deterministic_Map_of_Law_v1_0_0.md
│   └── Deterministic_Map_of_Law_v1_0_0.pdf
├── signatures/
│   ├── no-fate-contract_v1.0.0.md.sig
│   ├── no-fate-contract_v1.0.0.pdf.sig
│   ├── Deterministic_Map_of_Law_v1_0_0.md.sig
│   └── Deterministic_Map_of_Law_v1_0_0.pdf.sig
├── checksums/
│   └── HASHES.txt
├── NO_FATE_CANONICAL_PUBLIC_KEY.asc
├── README.md
└── LICENSE.txt
```

---

## Key Management Best Practices

### Private Key Security

- Store the private key on secure offline hardware (e.g., encrypted USB drive, hardware security module)
- Never commit private keys to version control
- Use a strong passphrase
- Create a revocation certificate immediately after key generation
- Store the revocation certificate separately from the private key

To generate a revocation certificate:

```bash
gpg --output revoke_<KEYID>.asc --gen-revoke <KEYID>
```

### Public Key Distribution

- Commit the public key to the repository root
- Publish the key fingerprint in README.md
- Upload the public key to keyservers (optional):

```bash
gpg --keyserver keys.openpgp.org --send-keys <KEYID>
```

### Key Rotation

If the signing key must be rotated:

1. Generate a new keypair following Step 1
2. Sign all canonical documents with the new key
3. Publish the new public key
4. Update the fingerprint in README.md
5. Issue a revocation certificate for the old key
6. Publish a security advisory documenting the rotation

---

## Signature Verification Policy

All canonical documents must include detached GPG signatures before publication. Unsigned documents are not considered canonical.

Users must verify signatures before relying on canonical documents for any purpose.

Signatures provide cryptographic proof of:
- Document authenticity (signed by the canonical authority)
- Document integrity (unmodified since signing)
- Document provenance (origin from official repository)

---

## Troubleshooting

### "No public key" error during verification

Import the public key:

```bash
gpg --import NO_FATE_CANONICAL_PUBLIC_KEY.asc
```

### "BAD signature" error

The document has been modified or corrupted. Do not use it. Download a clean copy from the official repository.

### "Can't check signature: No public key"

The signature was created with a different key. Verify you have imported the correct public key and that the key ID matches.

### Signature verification shows "unknown" trust level

This is normal if you have not explicitly trusted the key. Verify the key fingerprint manually against the published fingerprint in README.md.

To mark the key as trusted:

```bash
gpg --edit-key <KEYID>
trust
5 (ultimate trust)
quit
```

---

**End of GPG Signing Instructions**