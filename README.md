# No Fate Ecosystem  
## Deterministic Boundary Framework for Legal and Institutional Systems

This repository contains the canonical documents that define the No Fate boundary architecture for deterministic classification systems. These documents do not interpret law, advise on law, or attempt to replace judicial or institutional authority. They identify where determinism is possible, where it is not, and where refusal is the correct and safe behavior.

---

# Repository Structure

This repository is organized into the following folders:

## /canonical
Contains all immutable canonical versions of No Fate ecosystem documents in both Markdown and PDF formats. No modifications are permitted to files in this folder.

## /signatures
Contains detached GPG signatures (.asc files) for all canonical documents. Used for cryptographic verification of document authenticity.

## /checksums
Contains SHA-256 checksums for all canonical documents. Used for integrity verification.

## /docs
Contains supporting documentation including verification guides, signing instructions, and release templates.

## /infrastructure
Contains repository configuration files including .gitattributes, .editorconfig, and GitHub Actions workflows.

---

# Included Canonical Documents

### 1. The No Fate Contract  
A boundary specification defining the allowed and disallowed behavior for deterministic systems interacting with law, policy, or enforcement.

### 2. The Deterministic Map of Law  
A complete and stable classification of where U.S. legal questions are deterministic, interpretive, discretionary, or procedural in nature.

---

# Purpose

The purpose of the No Fate ecosystem is to:

- Provide deterministic boundaries, not deterministic outcomes  
- Separate mechanical logic from human judgment  
- Ensure AI systems remain within safe interpretive limits  
- Support pre-adjudicative classification without adjudication  
- Increase transparency by mapping nondeterministic zones  

No Fate aligns with institutional legitimacy by respecting and preserving human discretion.

---

# Canonical Structure

All canonical documents follow these rules:

1. Immutable once published  
2. Stored in plain Markdown and PDF  
3. Versioned semantically (vX.Y.Z)  
4. Hash-verified for integrity  
5. Cryptographically signed with GPG  
6. No interpretation or extension allowed  
7. No derivative modifications in this repository  

---

# Integrity Verification

Each canonical document includes:

- SHA-256 checksum (in /checksums folder)  
- Detached GPG signature (in /signatures folder)  
- Version notice  
- Canonical notice  

**Quick Verification:**

On Windows (PowerShell):

Get-FileHash -Algorithm SHA256 canonical/Document_Name_vX_Y_Z.md

On Linux/Mac:

sha256sum canonical/Document_Name_vX_Y_Z.md

Compare output to checksums/HASHES.txt.

Full instructions: docs/VERIFICATION.md

---

# GPG Public Key

**Fingerprint:** <FINGERPRINT_PLACEHOLDER>

The public key is stored in the root directory:

NO_FATE_CANONICAL_PUBLIC_KEY.asc

To verify signatures:

gpg --import NO_FATE_CANONICAL_PUBLIC_KEY.asc
gpg --verify signatures/Document_Name_vX_Y_Z.md.asc canonical/Document_Name_vX_Y_Z.md

---

# How to Use These Documents

These documents are meant to be:

- Referenced  
- Cited  
- Embedded in compliance systems  
- Used for deterministic boundary detection  
- Included in safety frameworks  

They are **not** meant to be edited, extended, updated, or interpreted without explicit versioning.

---

# Contributing

Canonical documents cannot be modified. See CONTRIBUTING.md for details on:
- Reporting issues
- Improving documentation
- Proposing new documents

---

# Security

See SECURITY.md for:
- Hash verification procedures
- GPG signature verification
- Vulnerability reporting
- Key revocation policy

---

# License

Creative Commons Attribution–NoDerivatives 4.0 (CC BY-ND 4.0)  
This license permits redistribution but prohibits modification.

Full text: LICENSE.txt

---

# Contact

For questions about the No Fate ecosystem, open an Issue labeled `clarification-request`.  
For security issues, see SECURITY.md.  
No pull requests for canonical documents will be accepted.
