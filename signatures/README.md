# GPG Signatures

This folder contains detached GPG signatures for all canonical documents.

## Contents

Each canonical document has a corresponding .asc signature file:

Document_Name_vX_Y_Z.md.asc
Document_Name_vX_Y_Z.pdf.asc

## Verification

To verify a signature:

1. Import the public key:

gpg --import NO_FATE_CANONICAL_PUBLIC_KEY.asc

2. Verify the signature:

gpg --verify Document_Name_vX_Y_Z.md.asc ../canonical/Document_Name_vX_Y_Z.md

3. Confirm "Good signature" output

## Public Key

The canonical public key is stored in the root directory:

NO_FATE_CANONICAL_PUBLIC_KEY.asc

## Trust Model

All signatures are generated using the No Fate Canonical Authority key. The public key fingerprint is published in the root README.md for verification.

See GPG_SIGNING.md in the docs folder for complete instructions.
