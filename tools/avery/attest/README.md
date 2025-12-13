# @nofate/avery-attest

**Avery's attestation tool - cryptographically signs verified computations**

Creates Ed25519-signed attestations binding:
- **Inputs** (bundle hash)
- **Outputs** (output hash)
- **Explanations** (emergy hash)
- **Verification results** (what checks passed)

## Installation

```bash
npm install @nofate/avery-attest
```

## CLI Usage

```bash
# Generate Ed25519 keypair (example)
# In real usage, use a secure key management system
node -e "const ed = require('@noble/ed25519'); ed.utils.randomPrivateKey().then(k => console.log(Buffer.from(k).toString('hex')))"

# Create attestation
avery-attest bundle.json output.json emergy.json <private_key_hex> --out attestation.json
```

## Programmatic Usage

```typescript
import { attest, verifyAttestation } from '@nofate/avery-attest';

// Create attestation
const attestation = await attest(
  bundle,
  output,
  emergy,
  privateKeyHex,
  'Avery'
);

console.log('Attestation:', attestation);
console.log('Signature:', attestation.signature);

// Verify attestation
const isValid = await verifyAttestation(attestation);
console.log('Valid:', isValid);
```

## Attestation Structure

```json
{
  "type": "avery.attestation",
  "nofate_version": "1.0.0",
  "issued_at": "2025-01-28T12:00:00Z",
  "issuer": {
    "name": "Avery",
    "key_id": "ed25519:<public_key_hex>"
  },
  "claims": {
    "bundle_hash": "sha256:...",
    "output_hash": "sha256:...",
    "emergy_hash": "sha256:...",
    "conformance": ["nofate-1.0.0", "emergy-1.0.0"],
    "verification": [
      "bundle_hash_consistent",
      "output_hash_consistent",
      "constraints_satisfied",
      "explanations_consistent"
    ]
  },
  "signature": "<ed25519_signature_hex>"
}
```

## Security Properties

1. **Non-repudiation**: Signature proves Avery attested to this computation
2. **Integrity**: Any change to attestation invalidates signature
3. **Binding**: Hashes cryptographically tie inputs → emergy → outputs
4. **Auditability**: Verification checks list what was validated

## License

MIT
