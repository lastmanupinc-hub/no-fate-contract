# Contributing to the No Fate Ecosystem

## Canonical Document Policy

Canonical documents in this repository are **immutable once published**. They cannot be modified, updated, or extended without creating a new semantic version.

## What You Cannot Do

- Modify existing canonical documents
- Create derivative works from canonical documents
- Submit pull requests that alter canonical document content
- Change version numbers or metadata in canonical documents
- Rename or move canonical documents

## What You Can Do

### 1. Report Issues

If you find an error or ambiguity in a canonical document:
- Open an Issue labeled `clarification-request`
- Describe the issue clearly with section references
- Suggest clarification language if applicable

The maintainers will evaluate whether the issue requires a new version.

### 2. Improve Documentation

You may submit pull requests for:
- README files
- Verification instructions
- Signing guides
- Release templates
- Infrastructure configuration

### 3. Suggest New Documents

If you believe the ecosystem needs additional canonical documents:
- Open an Issue labeled `new-document-proposal`
- Provide a clear purpose statement
- Explain how it fits the ecosystem

## Version Creation Process

Only maintainers can create new canonical versions. The process is:

1. Draft the new version in a private branch
2. Generate SHA-256 checksums
3. Create GPG signatures
4. Update HASHES.txt
5. Create a GitHub Release
6. Tag the release with semantic version
7. Lock the version permanently

## Pull Request Guidelines

If submitting a pull request for non-canonical content:
- Clearly state what you are changing
- Do not touch files in /canonical folder
- Ensure your changes do not affect canonical document integrity
- Follow existing formatting conventions

## Code of Conduct

- Respect the immutability of canonical documents
- Provide constructive feedback in Issues
- Do not attempt to circumvent version control
- Acknowledge that canonical documents are authoritative and final

## Contact

For questions about contributing:
- Open an Issue labeled `contribution-question`
- Do not email maintainers directly unless required

Thank you for respecting the integrity of the No Fate ecosystem.
