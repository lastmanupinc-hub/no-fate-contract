# Infrastructure

This folder contains repository configuration and automation files.

## Contents

### .gitattributes
Git attributes for canonical document handling and line-ending normalization.

### .editorconfig
Editor configuration to prevent auto-formatting of canonical documents.

### .github/workflows/
GitHub Actions workflows for automated checksum generation and verification.

## Purpose

These files ensure:
- Canonical documents remain unmodified by editors or formatters
- Line endings are consistent across platforms
- Hashes are automatically generated on release
- Repository structure is maintained

## Modification Policy

Infrastructure files may be updated to improve automation or maintain compatibility with new tools. Changes should be tested before merging.

All infrastructure changes should be documented in commit messages.
