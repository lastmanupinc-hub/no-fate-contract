# @nofate/canon

**Deterministic JSON canonicalization for No Fate ecosystem**

Implements JCS (RFC 8785) canonicalization with SHA-256 hashing to ensure:
- **Byte-identical output** for identical inputs
- **Collision-resistant hashing** for tamper detection
- **Reproducibility** across platforms and implementations

## Installation

```bash
npm install @nofate/canon
```

## CLI Usage

```bash
# Canonicalize a JSON file
nofate-canon input.json > canonical.json 2> hash.txt

# Canonical output goes to stdout, hash goes to stderr
nofate-canon bundle.json
```

## Programmatic Usage

```typescript
import { canonicalize, verify } from '@nofate/canon';

const bundle = {
  nofate_version: "1.0.0",
  bundle_id: "test-001",
  state: { x: 1 },
  actions: [],
  constraints: [],
  solver_pins: {
    contract_semantics: "nofate-1.0.0",
    tie_break: "f,g,depth"
  }
};

// Canonicalize and hash
const result = canonicalize(bundle);
console.log(result.canonical); // JCS canonical form
console.log(result.hash);      // SHA-256 hex

// Verify hash
const isValid = verify(bundle, result.hash);
console.log(isValid); // true
```

## Guarantees

1. **Determinism**: Identical objects → identical canonical strings
2. **JCS Compliance**: Keys sorted, no whitespace, IEEE 754 numbers
3. **Hash Stability**: SHA-256 over UTF-8 bytes of canonical form
4. **Cross-Platform**: Works on Windows, macOS, Linux, Node.js, browsers

## Why JCS?

JCS (RFC 8785) provides a standard for canonical JSON that:
- Sorts object keys lexicographically (Unicode codepoint order)
- Removes all insignificant whitespace
- Uses consistent number representation (IEEE 754)
- Normalizes Unicode escape sequences

This ensures that semantically identical JSON produces byte-identical output.

## License

MIT
