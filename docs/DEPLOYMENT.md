# No Fate Ecosystem - Deployment & Versioning Guide

## GitHub Pages Deployment

### Setup Instructions

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
   - Save

2. **Site URL:**
   ```
   https://lastmanupinc-hub.github.io/no-fate-contract/
   ```

3. **Automatic Deployment:**
   - Every push to `main` automatically updates the site
   - GitHub Actions workflow handles deployment
   - No build step required (static HTML)

### Alternative: Netlify Deployment

1. Create Netlify account
2. New site from Git → Select repository
3. Build settings:
   - Build command: `(leave blank)`
   - Publish directory: `/`
4. Deploy

### Alternative: Cloudflare Pages

1. Cloudflare → Pages → Create project
2. Select GitHub repository
3. Configuration:
   - Framework preset: None
   - Build command: `(blank)`
   - Output directory: `/`
4. Deploy

---

## Semantic Versioning Strategy

### Version Format: MAJOR.MINOR.PATCH

### MAJOR (X.0.0)

**Trigger when:**
- New foundational document added
- Structural shift in boundary architecture
- Breaking change to ecosystem

**Examples:**
- v1.0.0 → v2.0.0 (New foundational contract)

**Action:**
- Create new canonical document
- Update all hashes
- Generate new signatures
- Create GitHub Release with full changelog

---

### MINOR (1.X.0)

**Trigger when:**
- New documents extend boundaries (non-breaking)
- Supplements or clarifications added
- New test suites, compliance guides, or specifications
- Additional deterministic domains identified

**Examples:**
- v1.0.0 → v1.1.0 (Boundary Extensions supplement)
- v1.1.0 → v1.2.0 (Compliance Guide added)

**Action:**
- Add new document to `canonical/` or `docs/`
- Update HASHES.txt
- Create signatures
- Tag release: `git tag v1.1.0`
- Create GitHub Release

**Canonical Integrity:**
- v1.0.0 documents remain unchanged
- New documents reference but do not modify v1.0.0

---

### PATCH (1.0.X)

**Trigger when:**
- Non-substantive typo corrections
- Formatting fixes (whitespace, line breaks)
- Hash metadata updates
- Link corrections
- Repository infrastructure changes

**Examples:**
- v1.0.0 → v1.0.1 (Typo fix)

**Critical Rule:**
- PATCH changes NEVER modify canonical meaning
- Document content remains semantically identical

**Action:**
- Make correction
- Regenerate hashes
- Update signatures
- Tag release: `git tag v1.0.1`

---

## Version Tagging Workflow

### Create a New Version

```powershell
# 1. Make changes (new document, fix, etc.)

# 2. Generate hashes
Get-FileHash -Algorithm SHA256 canonical/*.md > checksums/HASHES_v1_1_0.txt
Get-FileHash -Algorithm SHA256 canonical/*.pdf >> checksums/HASHES_v1_1_0.txt

# 3. Create signatures (if using GPG)
# See docs/GPG_SIGNING_INSTRUCTIONS.md

# 4. Commit changes
git add .
git commit -m "Add [feature/fix] for v1.1.0"

# 5. Create tag
git tag -a v1.1.0 -m "Release v1.1.0: [description]"

# 6. Push tag
git push origin v1.1.0

# 7. Create GitHub Release
# Go to Releases → Create new release → Select tag → Publish
```

---

## File Naming Convention

### Canonical Documents

```
canonical/Document_Name_vX_Y_Z.md
canonical/Document_Name_vX_Y_Z.pdf
```

**Examples:**
```
canonical/no-fate-contract_v1.0.0.md
canonical/Deterministic_Map_of_Law_v1_0_0.md
canonical/No_Fate_Supplement_Deterministic_Boundary_Extensions_v1_1_0.md
```

### Signatures

```
signatures/Document_Name_vX_Y_Z.md.sig
signatures/Document_Name_vX_Y_Z.pdf.sig
```

### Checksums

```
checksums/HASHES.txt (current release)
checksums/HASHES_vX_Y_Z.txt (version-specific archive)
```

---

## Release Checklist

### For MINOR or MAJOR Releases

- [ ] Create/update canonical document(s)
- [ ] Generate SHA-256 hashes
- [ ] Create GPG signatures (if applicable)
- [ ] Update `checksums/HASHES.txt`
- [ ] Update `index.html` if needed
- [ ] Update README.md with new version
- [ ] Commit all changes
- [ ] Create git tag: `git tag -a vX.Y.Z -m "Description"`
- [ ] Push tag: `git push origin vX.Y.Z`
- [ ] Create GitHub Release from tag
- [ ] Fill release notes using RELEASE_TEMPLATE.md
- [ ] Upload artifacts (PDFs, signatures, checksums)
- [ ] Verify GitHub Pages deployment

### For PATCH Releases

- [ ] Make non-substantive correction
- [ ] Regenerate hashes if document modified
- [ ] Update signatures if needed
- [ ] Commit changes
- [ ] Create tag: `git tag -a vX.Y.Z -m "Fix: description"`
- [ ] Push tag
- [ ] Create GitHub Release with fix notes

---

## Version Manifest

### Current Ecosystem Versions

| Document | Version | Date | Status |
|----------|---------|------|--------|
| No Fate Contract | v1.0.0 | 2025-03-08 | Canonical |
| Deterministic Map of Law | v1.0.0 | 2025-03-08 | Canonical |
| Boundary Extensions | v1.1.0 | 2025-12-11 | Canonical |
| Compliance Guide | v1.0.0 | 2025-12-11 | Implementation Guide |
| Refusal Specification | v1.0.0 | 2025-12-11 | Technical Spec |
| Test Suite | v1.0.0 | 2025-12-11 | Test Framework |

---

## Roadmap

### PHASE 1 — FOUNDATION ✅ Completed
- ✅ No Fate Contract v1.0.0
- ✅ Deterministic Map of Law v1.0.0
- ✅ Canonical infrastructure (hashes, signatures, workflows)

### PHASE 2 — COMPANION ARTIFACTS ✅ In Progress
- ✅ Boundary Extensions v1.1.0
- ✅ Compliance Guide v1.0.0
- ✅ Refusal Specification v1.0.0
- ✅ Deterministic Boundary Test Suite v1.0.0

### PHASE 3 — ECOSYSTEM INFRASTRUCTURE 🔄 Current
- ✅ Static website (GitHub Pages)
- ⏳ Canonical API (read-only, structured access)
- ⏳ Version manifest (machine-readable index)

### PHASE 4 — INSTITUTIONAL ALIGNMENT 📅 Future
- ⏳ Policy papers (informative, non-normative)
- ⏳ Governance integration guides
- ⏳ Audit tools for compliance verification
- ⏳ Multi-domain deterministic maps (beyond U.S. law)

### PHASE 5 — LONG-TERM PURPOSE 🎯 Ultimate Goal

**Vision:**
A permanent, immutable, globally referenceable boundary specification for deterministic AI systems interacting with law, policy, or institutional judgment.

**End State:**
- Safety framework preventing automation overreach
- Governance scaffold for institutional legitimacy
- Refusal doctrine as constitutional layer
- Boundary architecture by design

**Purpose:**
Not to decide anything — but to define what must never be automated.

---

## Contributing to Versions

### Proposing New Documents (MINOR version)

1. Open Issue labeled `new-document-proposal`
2. Describe purpose and scope
3. Explain alignment with existing ecosystem
4. Draft document following canonical format
5. Maintainers review and approve
6. Document added to `canonical/` with version bump

### Reporting Errors (PATCH version)

1. Open Issue labeled `clarification-request`
2. Identify specific error with section reference
3. Propose correction
4. Maintainers validate and apply
5. Version bumped to X.Y.Z+1

### Proposing Breaking Changes (MAJOR version)

1. Open Issue labeled `major-change-proposal`
2. Justify necessity of breaking change
3. Community discussion required
4. Maintainer approval required
5. New MAJOR version created

---

## Automation

### GitHub Actions Workflow

The repository includes automated hash generation on tag push:

`.github/workflows/canonical-hash-check.yml`

Automatically:
- Generates SHA-256 hashes for all canonical documents
- Creates `checksums.txt` artifact
- Uploads to GitHub Actions artifacts
- Runs on every `v*` tag push

---

## Contact

For questions about versioning or deployment:
- Open Issue labeled `infrastructure-question`
- See CONTRIBUTING.md for contribution guidelines

---

**End of Document**
