# GPG Signing Instructions

## Purpose

GPG signatures provide cryptographic proof of document authenticity and origin. Each canonical document in the No Fate ecosystem should include a detached GPG signature to ensure integrity and provenance.

---

## 1. Generate a GPG Keypair

If you do not already have a GPG key, generate one:

```bash
gpg --full-generate-key
```

Follow the prompts:
- Key type: RSA and RSA
- Key size: 4096 bits
- Expiration: 0 (does not expire) or set a specific date
- Real name: `No Fate Canonical Authority`
- Email: `canonical@no-fate.org`
- Passphrase: (set a strong passphrase)

List your keys to confirm creation:

```bash
gpg --list-secret-keys --keyid-format LONG
```

Note the key ID (e.g., `ABCD1234EFGH5678`).

---

## 2. Export Your Public Key

Export your public key for distribution:

```bash
gpg --armor --export ABCD1234EFGH5678 > NO_FATE_CANONICAL_PUBLIC_KEY.asc
```

Commit this public key to the repository so users can verify signatures.

---

## 3. Sign Canonical Documents

Create a detached signature for each canonical document:

```bash
gpg --detach-sign --armor no-fate-contract_v1.0.0.md
gpg --detach-sign --armor no-fate-contract_v1.0.0.pdf
gpg --detach-sign --armor Deterministic_Map_of_Law_v1_0_0.md
gpg --detach-sign --armor Deterministic_Map_of_Law_v1_0_0.pdf
```

This generates `.asc` signature files:
- `no-fate-contract_v1.0.0.md.asc`
- `no-fate-contract_v1.0.0.pdf.asc`
- `Deterministic_Map_of_Law_v1_0_0.md.asc`
- `Deterministic_Map_of_Law_v1_0_0.pdf.asc`

---

## 4. Verify Signatures

To verify a signature, users must first import the public key:

```bash
gpg --import NO_FATE_CANONICAL_PUBLIC_KEY.asc
```

Then verify the signature:

```bash
gpg --verify no-fate-contract_v1.0.0.md.asc no-fate-contract_v1.0.0.md
```

Expected output:

```
gpg: Signature made [DATE]
gpg:                using RSA key ABCD1234EFGH5678
gpg: Good signature from "No Fate Canonical Authority <canonical@no-fate.org>"
```

If the output says `Good signature`, the document is authentic and unmodified.

---

## 5. Repository Structure for Signatures

Store signatures alongside canonical documents:

```
no-fate-contract/
├── no-fate-contract_v1.0.0.md
├── no-fate-contract_v1.0.0.md.asc
├── no-fate-contract_v1.0.0.pdf
├── no-fate-contract_v1.0.0.pdf.asc
├── Deterministic_Map_of_Law_v1_0_0.md
├── Deterministic_Map_of_Law_v1_0_0.md.asc
├── Deterministic_Map_of_Law_v1_0_0.pdf
├── Deterministic_Map_of_Law_v1_0_0.pdf.asc
├── NO_FATE_CANONICAL_PUBLIC_KEY.asc
├── HASHES.txt
├── LICENSE.txt
├── README.md
└── VERIFICATION.md
```

---

## 6. Automated Signature Verification

Users can verify all signatures at once:

```bash
for file in *.md *.pdf; do
  if [ -f "$file.asc" ]; then
    gpg --verify "$file.asc" "$file"
  fi
done
```

---

## 7. Trust and Key Management

- Publish the public key fingerprint in README.md
- Store the private key securely offline
- Never commit private keys to the repository
- Revoke and reissue keys if compromised

To display the key fingerprint:

```bash
gpg --fingerprint ABCD1234EFGH5678
```

Include this fingerprint in the README for user verification.

---

## 8. Signature Policy

All canonical documents in the No Fate ecosystem must be signed before publication. Unsigned documents are not canonical.
