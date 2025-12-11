# Security Policy

## Overview

The No Fate ecosystem uses cryptographic hashing and GPG signatures to ensure document integrity and authenticity. This security policy describes verification procedures and vulnerability reporting.

## Document Integrity Verification

### SHA-256 Hash Verification

All canonical documents include SHA-256 checksums stored in the /checksums folder.

**On Windows (PowerShell):**

Get-FileHash -Algorithm SHA256 canonical/Document_Name_vX_Y_Z.md | Select-Object -ExpandProperty Hash

**On Linux/Mac:**

sha256sum canonical/Document_Name_vX_Y_Z.md

Compare the output to the corresponding entry in checksums/HASHES.txt.

**If hashes match:** The document is authentic and unmodified.

**If hashes differ:** The document has been corrupted, modified, or tampered with. Do not use it. Retrieve a clean copy from the official repository.

### GPG Signature Verification

All canonical documents include detached GPG signatures stored in the /signatures folder.

**Step 1: Import the public key**

gpg --import NO_FATE_CANONICAL_PUBLIC_KEY.asc

**Step 2: Verify the signature**

gpg --verify signatures/Document_Name_vX_Y_Z.md.asc canonical/Document_Name_vX_Y_Z.md

**Expected output:**

gpg: Good signature from "No Fate Canonical Authority <canonical@no-fate.org>"

**If verification fails:** The document may have been tampered with. Do not use it. Retrieve a clean copy from the official repository.

## Public Key Fingerprint

The canonical public key fingerprint is:

<FINGERPRINT_PLACEHOLDER>

Always verify this fingerprint before trusting signatures.

## Threat Model

### Protected Against

- Document modification or tampering
- Unauthorized version publication
- Content corruption during transmission
- Impersonation of canonical documents

### Not Protected Against

- Compromise of the signing key (requires key revocation and reissue)
- Social engineering attacks
- Misuse of verified documents in downstream applications

## Reporting Security Issues

If you discover a security vulnerability in the No Fate ecosystem:

**Do not open a public Issue.**

Instead:
1. Email security contact (if provided in README.md)
2. Use GitHub Security Advisories for private disclosure
3. Provide detailed information about the vulnerability
4. Include reproduction steps if applicable

We will respond within 72 hours and coordinate disclosure timing.

## Security Best Practices

### For Users

- Always verify checksums before using canonical documents
- Always verify GPG signatures when available
- Download documents only from official repository
- Store private keys securely if signing documents
- Report discrepancies immediately

### For Maintainers

- Generate checksums for every canonical document
- Sign every canonical document with the canonical key
- Store private keys offline in secure hardware
- Use strong passphrases for GPG keys
- Revoke and reissue keys if compromised
- Document key rotation procedures

## Key Revocation

If the canonical signing key is compromised:

1. A revocation certificate will be published immediately
2. All existing signatures will be considered invalid
3. A new keypair will be generated
4. All canonical documents will be re-signed
5. A security advisory will be issued

## Supported Versions

Only the latest semantic version of each canonical document is officially supported. Older versions remain available for reference but are not maintained.

## Acknowledgments

We appreciate responsible disclosure of security issues. Contributors will be acknowledged unless they request anonymity.

Thank you for helping maintain the integrity of the No Fate ecosystem.
