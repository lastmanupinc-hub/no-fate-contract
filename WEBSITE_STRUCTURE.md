# No Fate Ecosystem - Static Website File Structure

Complete directory and file layout for GitHub Pages deployment.

## Root Level

### index-new.html
Landing page with navigation, No Fate explanation, and links to all major sections. Includes principle cards, document grid, and resource sections.

### styles.css  
Global stylesheet providing consistent styling across all pages. Includes responsive design, navigation, cards, grids, and footer styles.

## /pages Directory

All content pages with consistent navigation and structure:

### mission.html
Mission statement page - core purpose and objectives of No Fate framework.

### boundary-manifesto.html
Manifesto detailing boundary framework principles and foundational vision.

### problem-statement.html
Description of the problem No Fate solves - AI overreach in interpretive/discretionary zones.

### what-no-fate-is-not.html
Clarifications on scope and limitations - what No Fate does not do or claim.

### governance.html
Governance model, stewardship principles, and decision-making processes.

### integrity.html
Cryptographic verification procedures - SHA-256 hashing and GPG signature verification.

### versioning.html
Semantic versioning strategy (MAJOR.MINOR.PATCH) for canonical documents.

### roadmap.html
5-phase ecosystem roadmap from Foundation through Long-term Purpose.

### faq.html
Frequently asked questions about boundaries, refusal, implementation, and governance.

### glossary.html
Alphabetized definitions of key terms (deterministic outcome, refusal, boundaries, etc.).

### developer-integration.html
Implementation guide with patterns, pseudocode, and best practices for developers.

### reference-implementations.html
Catalog of reference implementations in various languages and frameworks (placeholder for Phase 4).

### playbooks.html
Domain-specific implementation playbooks and case studies (placeholder for Phase 4).

### contact.html
Contact information, stewardship inquiries, and community channels.

## /docs Directory

HTML versions of canonical documents (placeholders linking to authoritative Markdown sources):

### no-fate-contract_v1_0_0.html
HTML version of No Fate Contract v1.0.0 canonical document.

### deterministic-map-of-law_v1_0_0.html
HTML version of Deterministic Map of Law v1.0.0 canonical document.

### ai-refusal-spec_v1_0_0.html
HTML version of AI Refusal Specification v1.0.0.

### compliance-guide_v1_0_0.html
HTML version of Compliance Guide v1.0.0.

### deterministic-boundary-test-suite_v1_0.html
HTML version of Test Suite v1.0.

## /assets Directory

Static assets for website:

### /assets/img
Images, logos, diagrams, and visual assets (currently empty, ready for content).

### /assets/downloads
Downloadable files - PDFs of canonical documents, verification tools, etc. (currently empty, ready for content).

## Deployment

This structure is ready for GitHub Pages deployment:

1. Set GitHub Pages source to root directory
2. All pages use relative paths for navigation
3. Consistent styling via styles.css
4. No build step required (pure HTML/CSS static site)

## File Naming Conventions

- Root files: lowercase with hyphens (index-new.html, styles.css)
- Pages: lowercase with hyphens (boundary-manifesto.html, developer-integration.html)
- Docs: lowercase with underscores matching canonical document naming (no-fate-contract_v1_0_0.html)
- Directories: lowercase (pages, docs, assets)

## Next Steps

1. Replace index.html with index-new.html as primary landing page
2. Populate page stubs with full content from canonical documents
3. Generate HTML versions of canonical Markdown documents
4. Add images/logos to /assets/img
5. Add PDF downloads to /assets/downloads
6. Enable GitHub Pages in repository settings
