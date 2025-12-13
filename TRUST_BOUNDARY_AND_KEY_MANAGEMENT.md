# Trust Boundary and Key Management Policy

**Date**: 2025-12-12  
**Status**: EXPLICIT TRUST MODEL

## The Trust Question

**Who is allowed to sign attestations?**

This is not a technical question. It's a trust and governance question.

## Trust Model

### Centralized Trust (Default for v1.0.0)

**Model**: Avery is operated by a single trusted authority.

**Who can attest**:
- Only the holder of Avery's private key
- Typically: Organization deploying No Fate

**Who trusts attestations**:
- Users who trust the signing organization
- Regulators who recognize the authority
- Third parties with established trust relationships

**Example**:
```
Organization: ACME Corp
Avery operator: ACME Security Team
Key holder: Chief Security Officer (CSO)
Attestations trusted by: ACME employees, partners, regulators
```

**Advantages**:
- Simple key management
- Clear accountability
- Single point of trust

**Disadvantages**:
- Single point of failure
- Trust bottleneck
- No decentralization

### Federated Trust (Future v2.0.0+)

**Model**: Multiple Avery operators, each with their own keys.

**Who can attest**:
- Multiple organizations, each holding private keys
- Consortium members
- Federated authorities

**Who trusts attestations**:
- Users who trust ANY member of the federation
- Cross-organizational workflows

**Example**:
```
Organization: Healthcare Consortium
Avery operators:
  - Hospital A (key_id: ed25519:abc123...)
  - Hospital B (key_id: ed25519:def456...)
  - Insurance Co (key_id: ed25519:ghi789...)

Attestations trusted by: Patients, doctors, insurers (if signed by any member)
```

**Advantages**:
- Distributed trust
- Resilience (no single point of failure)
- Cross-organizational interoperability

**Disadvantages**:
- Complex key management
- Trust revocation challenges
- Coordination overhead

### Decentralized Trust (Future v3.0.0+)

**Model**: Public blockchain-anchored attestations.

**Who can attest**:
- Anyone with a registered key on blockchain
- Smart contract governance

**Who trusts attestations**:
- Anyone who trusts blockchain consensus
- Publicly verifiable

**Advantages**:
- Maximum transparency
- Public auditability
- No central authority

**Disadvantages**:
- Blockchain dependency
- Gas costs
- Privacy concerns (public attestations)

## Key Management for v1.0.0 (Centralized Trust)

### Key Generation

```bash
# Generate Ed25519 keypair
node -e "
const ed = require('@noble/ed25519');
ed.utils.randomPrivateKey().then(privKey => {
  ed.getPublicKeyAsync(privKey).then(pubKey => {
    console.log('Private Key:', Buffer.from(privKey).toString('hex'));
    console.log('Public Key:', Buffer.from(pubKey).toString('hex'));
  });
});
"
```

**Save**:
- Private key → Hardware Security Module (HSM) or secure vault
- Public key → `key_id: "ed25519:<public_key_hex>"` in attestations

### Key Storage

**MUST NOT**:
- ❌ Store private key in code repository
- ❌ Store private key in plaintext on disk
- ❌ Share private key via email/Slack
- ❌ Embed private key in Docker images

**MUST**:
- ✅ Store in HSM (AWS KMS, Azure Key Vault, YubiKey)
- ✅ Encrypt at rest
- ✅ Require multi-factor authentication for access
- ✅ Log all key usage

### Key Usage

**Who can use the key**:
- Designated Avery operator(s)
- Automated systems with HSM integration
- Emergency responders (with audit trail)

**Access control**:
```yaml
# Example: AWS IAM policy for KMS key
{
  "Effect": "Allow",
  "Principal": {
    "AWS": "arn:aws:iam::123456789:role/AveryOperator"
  },
  "Action": "kms:Sign",
  "Resource": "arn:aws:kms:us-east-1:123456789:key/avery-signing-key"
}
```

### Key Rotation

**When to rotate**:
- Every 12 months (scheduled)
- Immediately if compromise suspected
- After operator departure
- Compliance requirements

**How to rotate**:
```bash
# 1. Generate new keypair
new_key_id="ed25519:<new_public_key_hex>"

# 2. Update attestations to include both keys (transition period)
{
  "issuer": {
    "name": "Avery",
    "key_id": "ed25519:<new_public_key_hex>",
    "previous_key_id": "ed25519:<old_public_key_hex>"
  }
}

# 3. Sign with new key, announce deprecation of old key
# 4. After 90 days, remove old key from trust store
```

**Key rotation MUST**:
- ✅ Be announced publicly (if public attestations)
- ✅ Maintain backward compatibility (grace period)
- ✅ Document reason for rotation
- ✅ Update all trust stores

### Key Revocation

**When to revoke**:
- Private key compromised
- Operator malicious behavior detected
- Organizational policy change

**How to revoke**:
```bash
# 1. Publish revocation notice
{
  "type": "key_revocation",
  "key_id": "ed25519:<revoked_key_hex>",
  "revoked_at": "2025-12-12T12:00:00Z",
  "reason": "Private key compromised",
  "replaced_by": "ed25519:<new_key_hex>"
}

# 2. Distribute revocation notice to all verifiers
# 3. Update trust stores to reject old key
# 4. Re-attest all active outputs with new key
```

**Revocation MUST be irreversible**: Once revoked, key can NEVER be trusted again.

## Attestation Distribution Modes

### 1. Private Attestations

**Model**: Attestations shared only with authorized parties.

**Use case**:
- Internal compliance
- Sensitive data
- Competitive advantage

**Distribution**:
- Store in secure database
- Share via encrypted channels
- Access control via authentication

**Trust boundary**: Organization internal

**Example**:
```
Solver: ACME planning system
Avery: ACME internal Avery instance
Attestation: Shared only with ACME employees
Trust: Employees trust ACME's Avery
```

### 2. Shared Attestations

**Model**: Attestations shared with partners/clients.

**Use case**:
- B2B workflows
- Supply chain
- Consortium operations

**Distribution**:
- API endpoints (authenticated)
- Encrypted file sharing
- Dedicated portal

**Trust boundary**: Organizational + partners

**Example**:
```
Solver: Hospital scheduling system
Avery: Hospital's Avery instance
Attestation: Shared with insurance company
Trust: Insurance company trusts hospital's Avery
```

### 3. Publicly Anchored Attestations

**Model**: Attestations published to public ledger (blockchain).

**Use case**:
- Public transparency
- Regulatory compliance
- Open ecosystems

**Distribution**:
- Ethereum/Polygon smart contract
- IPFS with blockchain pointer
- Public API

**Trust boundary**: Anyone

**Example**:
```
Solver: Open-source climate model
Avery: Public Avery instance
Attestation: Anchored on blockchain (Ethereum)
Trust: Anyone can verify attestation
```

## Verification Policy

### Who Can Verify Attestations

**Anyone with**:
1. Attestation artifact (JSON file)
2. Public key (key_id from attestation)
3. `avery-verify` tool

**No secrets required**: Verification is public operation.

```bash
# Extract public key from attestation
jq '.issuer.key_id' attestation.json
# ed25519:abc123...

# Verify signature
avery-verify bundle.json output.json emergy.json
# Also verifies attestation signature
```

### Trust Store

**Definition**: List of trusted public keys.

**Example**:
```json
{
  "trusted_keys": [
    {
      "key_id": "ed25519:abc123...",
      "owner": "ACME Corp",
      "valid_from": "2025-01-01T00:00:00Z",
      "valid_until": "2026-01-01T00:00:00Z",
      "revoked": false
    },
    {
      "key_id": "ed25519:def456...",
      "owner": "Beta Inc",
      "valid_from": "2025-06-01T00:00:00Z",
      "valid_until": "2026-06-01T00:00:00Z",
      "revoked": false
    }
  ]
}
```

**Usage**:
```bash
# Verify attestation is signed by trusted key
avery-verify --trust-store trust-store.json attestation.json
```

**Trust store MUST**:
- Be maintained by each organization
- Be updated on key rotation
- Respect revocations
- Document trust decisions

## Key ID Versioning

**Format**: `ed25519:<public_key_hex>`

**Example**: `ed25519:a1b2c3d4e5f6...`

**Version tracking**:
```json
{
  "issuer": {
    "name": "Avery",
    "key_id": "ed25519:abc123...",
    "key_version": "2",
    "previous_keys": [
      {
        "key_id": "ed25519:old123...",
        "key_version": "1",
        "rotated_at": "2025-06-01T00:00:00Z"
      }
    ]
  }
}
```

**Benefits**:
- Old attestations remain valid (historical verification)
- Key rotation is transparent
- Auditors can track key lineage

## Governance

### Decision Authority

**Who decides**:
- **Key generation**: Security team + executive approval
- **Key rotation**: Security team (scheduled) or incident response (emergency)
- **Key revocation**: Executive decision + legal review
- **Trust store updates**: Each organization independently

### Audit Requirements

**Quarterly audit**:
- ✅ Are private keys stored securely?
- ✅ Are access logs reviewed?
- ✅ Are rotation schedules followed?
- ✅ Are revoked keys properly blocked?

**Annual audit**:
- ✅ Key management policy review
- ✅ Incident response testing
- ✅ Trust model validation

### Incident Response

**If private key compromised**:
1. **Immediate**: Revoke key (within 1 hour)
2. **Within 24 hours**: Generate new key, announce publicly
3. **Within 1 week**: Re-attest all active outputs
4. **Within 1 month**: Complete forensic analysis, update policy

## Implementation Checklist

- [ ] Generate Ed25519 keypair
- [ ] Store private key in HSM
- [ ] Document key owner/operator
- [ ] Define trust boundary (private/shared/public)
- [ ] Create trust store (if federated)
- [ ] Implement key rotation procedure
- [ ] Document revocation process
- [ ] Set up access controls
- [ ] Enable audit logging
- [ ] Train operators

## Summary

### The Decisions

1. **Trust model**: Centralized (v1.0.0) → Federated (v2.0.0) → Decentralized (v3.0.0)
2. **Key holder**: Designated operator(s) with HSM access
3. **Attestation distribution**: Private | Shared | Public (choose based on use case)
4. **Verification**: Anyone can verify (public operation)
5. **Rotation**: Every 12 months or on compromise
6. **Revocation**: Irreversible, publicly announced

### The Guarantees

✅ **Non-repudiation**: Only key holder can sign  
✅ **Integrity**: Attestation tampering is detectable  
✅ **Auditability**: Key lineage is tracked  
✅ **Revocability**: Compromised keys can be revoked  

---

**Trust is explicit, not assumed.**
