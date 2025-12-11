# Checksums

This folder contains SHA-256 checksums for all canonical documents.

## Contents

HASHES.txt - Master checksum file for current release
checksums_vX_Y_Z.txt - Version-specific checksum files

## Verification

To verify document integrity:

On Windows (PowerShell):

Get-FileHash -Algorithm SHA256 Document_Name_vX_Y_Z.md | Select-Object -ExpandProperty Hash

On Linux/Mac:

sha256sum Document_Name_vX_Y_Z.md

Compare the output to the corresponding entry in HASHES.txt.

## Automated Verification

The repository includes a GitHub Actions workflow that automatically generates checksums when new tags are pushed.

See .github/workflows/canonical-hash-check.yml for implementation details.

## Checksum Format

Each line in the checksum files follows this format:

<SHA256_HASH>  <FILENAME>

## Policy

All canonical documents must have corresponding SHA-256 checksums published in this folder before release.
