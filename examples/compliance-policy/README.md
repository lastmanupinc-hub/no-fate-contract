# Compliance Policy Enforcement Example

**Use Case**: Deterministic policy evaluation for regulated deployments

## Problem

You need to:
- **Enforce compliance policies** (approvals, scans, backups)
- **Explain decisions** to auditors ("Why was this deployment allowed?")
- **Prove consistency** (same request conditions → same decision)
- **Meet regulatory requirements** (SOC2, HIPAA, GDPR)

## Scenario

A developer requests deploying `payment-processor` to production.

**Policies**:
1. ✅ Dual approval (manager + security)
2. ✅ Security scan (no vulnerabilities)
3. ✅ Backup exists (rollback capability)

## No Fate Solution

### Input: compliance-policy-001.json

Defines:
- User request (deploy payment-processor)
- Available actions (get approvals, run scan, create backup, deploy)
- Hard constraints (MUST satisfy all policies)
- Soft policies (prefer faster paths, security-first)

### Determinism via Solver Pins

```json
{
  "contract_semantics": "nofate-1.0.0",
  "tie_break": "f,g,depth,action_id,state_hash",
  "seed": "compliance-2025"
}
```

**Guarantee**: Same request conditions → same approval/rejection decision

### Output: Decision + Reasoning

**Output**: Plan showing steps to reach deployment (or rejection)

**Emergy**: Decision trace documenting:
- Why each approval was required
- Why security scan was prioritized first
- How tie-breaking chose between equal paths
- Evidence for constraint satisfaction

### Avery's Attestation

Cryptographic proof that:
- ✅ All policies evaluated correctly
- ✅ Decision is deterministic (replay confirmed)
- ✅ Reasoning is documented (emergy trace)
- ✅ Compliant with regulations

## Running This Example

```bash
# Evaluate policy compliance
nofate-solve compliance-policy-001.json --out decision.json --emergy reasoning.json

# Verify correctness
avery-verify compliance-policy-001.json decision.json reasoning.json

# Create attestation (for audit trail)
avery-attest compliance-policy-001.json decision.json reasoning.json <private_key> --out attestation.json
```

## Audit Trail

For regulators/auditors:

1. **Request**: compliance-policy-001.json (input)
2. **Decision**: decision.json (approved/rejected)
3. **Reasoning**: reasoning.json (WHY)
4. **Attestation**: attestation.json (cryptographic proof)

Auditors can:
- Replay the decision (`avery-replay`) → confirms determinism
- Inspect reasoning (emergy trace) → understand trade-offs
- Verify signature (Ed25519) → trust attestation

## Benefits

1. **Regulatory Compliance**: Auditable decision-making
2. **Consistency**: No arbitrary rejections or approvals
3. **Explainability**: "Why was I rejected?" has a documented answer
4. **Trust**: Cryptographic attestation from Avery
5. **Debugging**: If policy changes, compare emergy traces

## Extensions

- **Dynamic policies**: Load policies from database
- **Context-aware rules**: Time of day, user role, risk score
- **Multi-stage approval**: Sequential approvals with timeouts
- **Integration with SIEM**: Automated compliance monitoring

## Regulatory Use Cases

- **SOC2**: Access control decisions
- **HIPAA**: PHI access authorization
- **GDPR**: Data processing consent
- **PCI-DSS**: Cardholder data access
- **ITAR**: Export control compliance

## License

MIT
