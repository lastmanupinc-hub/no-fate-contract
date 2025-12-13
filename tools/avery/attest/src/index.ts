import { canonicalize } from '@nofate/canon';
import { verify } from '@nofate/avery-verify';
import * as ed25519 from '@noble/ed25519';

/**
 * GOVERNANCE BINDING
 * 
 * Avery attestation issuance is bound to No-Fate Governance System v1.0.0
 * Genesis Hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * Authority: auditor-authority (attestation issuance)
 * Status: BOUND
 * Policy: AVERY_GATE_POLICY.md (non-bypassable verification)
 * 
 * Only auditor-authority keys may issue valid attestations.
 */
export const GOVERNANCE_BINDING = {
  governance_version: '1.0.0',
  genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
  authority_role: 'auditor-authority',
  binding_status: 'BOUND',
  tool_id: 'avery-attest',
  tool_version: '1.0.0',
  policy_ref: 'AVERY_GATE_POLICY.md',
  binding_rationale: 'Only auditor-authority keys may issue attestations per governance policy'
};

export interface Attestation {
  type: 'avery.attestation';
  nofate_version: string;
  issued_at: string;
  issuer: {
    name: string;
    key_id: string;
  };
  claims: {
    bundle_hash: string;
    output_hash: string;
    emergy_hash: string;
    conformance: string[];
    verification: string[];
  };
  signature?: string;
}

/**
 * Attest to a verified computation
 * 
 * Steps:
 * 1. Run verification checks
 * 2. Build attestation claims
 * 3. Sign with Ed25519 private key
 * 4. Return signed attestation
 */
export async function attest(
  bundle: any,
  output: any,
  emergy: any,
  privateKeyHex: string,
  issuerName: string = 'Avery'
): Promise<Attestation> {
  
  // Step 1: Verify
  const verificationResult = verify(bundle, output, emergy);
  
  if (!verificationResult.valid) {
    throw new Error(`Verification failed: ${verificationResult.errors.join(', ')}`);
  }
  
  // Step 2: Build attestation
  const privateKey = hexToBytes(privateKeyHex);
  const publicKey = await ed25519.getPublicKeyAsync(privateKey);
  const publicKeyHex = bytesToHex(publicKey);
  
  const attestation: Attestation = {
    type: 'avery.attestation',
    nofate_version: '1.0.0',
    issued_at: new Date().toISOString(),
    issuer: {
      name: issuerName,
      key_id: `ed25519:${publicKeyHex}`
    },
    claims: {
      bundle_hash: verificationResult.hashes.bundle,
      output_hash: verificationResult.hashes.output,
      emergy_hash: verificationResult.hashes.emergy,
      conformance: ['nofate-1.0.0', 'emergy-1.0.0'],
      verification: verificationResult.checks
    }
  };
  
  // Step 3: Sign
  // Sign the canonical form of the attestation (without signature field)
  const canonical = canonicalize(attestation);
  const message = Buffer.from(canonical.canonical, 'utf8');
  const signature = await ed25519.signAsync(message, privateKey);
  
  // Add signature to attestation
  attestation.signature = bytesToHex(signature);
  
  return attestation;
}

/**
 * Verify an attestation signature
 */
export async function verifyAttestation(attestation: Attestation): Promise<boolean> {
  if (!attestation.signature) {
    throw new Error('Attestation has no signature');
  }
  
  // Extract signature and recreate unsigned attestation
  const { signature, ...unsignedAttestation } = attestation;
  
  // Get public key from key_id
  const keyId = attestation.issuer.key_id;
  if (!keyId.startsWith('ed25519:')) {
    throw new Error('Invalid key_id format');
  }
  const publicKeyHex = keyId.replace('ed25519:', '');
  const publicKey = hexToBytes(publicKeyHex);
  
  // Verify signature over canonical form
  const canonical = canonicalize(unsignedAttestation);
  const message = Buffer.from(canonical.canonical, 'utf8');
  const signatureBytes = hexToBytes(signature);
  
  return await ed25519.verifyAsync(signatureBytes, message, publicKey);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default attest;
