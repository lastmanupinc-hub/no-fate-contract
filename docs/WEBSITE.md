# No Fate Ecosystem Website

This directory contains the static website for the No Fate ecosystem, deployed via GitHub Pages.

## Structure

- `index.html` - Main landing page
- `canonical/` - Canonical documents (Markdown and PDF)
- `signatures/` - GPG signatures
- `checksums/` - SHA-256 hashes
- `docs/` - Supporting documentation

## Deployment

The site is automatically deployed to GitHub Pages from the main branch using the root directory.

Site URL: https://lastmanupinc-hub.github.io/no-fate-contract/

## Local Testing

To test locally, open `index.html` in a web browser or use a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
```

Then visit: http://localhost:8000

## Updates

Any changes to `index.html` or document files will be automatically reflected on GitHub Pages after push to main branch.
