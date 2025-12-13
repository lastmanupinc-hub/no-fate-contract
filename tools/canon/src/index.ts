import * as canonicalizeLib from 'canonicalize';
import * as crypto from 'crypto';

/**
 * GOVERNANCE BINDING
 * 
 * This tool is bound to No-Fate Governance System v1.0.0
 * Genesis Hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * Authority: schema-authority (canonicalization is foundational to schema validation)
 * Status: BOUND
 * 
 * Any artifact without governance_binding reference is out-of-governance.
 */
export const GOVERNANCE_BINDING = {
  governance_version: '1.0.0',
  genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
  authority_role: 'schema-authority',
  binding_status: 'BOUND',
  tool_id: 'canon',
  tool_version: '1.0.0',
  binding_rationale: 'Canonicalization is foundational to hash verification and schema validation'
};

export interface CanonicalResult {
  canonical: string;
  hash: string;
}

/**
 * Canonicalize JSON using JCS (RFC 8785) and compute SHA-256 hash
 * 
 * @param input - Any JSON-serializable object
 * @returns Canonical JSON string and SHA-256 hash (hex)
 */
export function canonicalize(input: any): CanonicalResult {
  // Use JCS canonicalization (RFC 8785)
  // This ensures:
  // - Keys sorted lexicographically
  // - No whitespace
  // - Numbers in IEEE 754 representation
  // - Unicode escape sequences normalized
  const canonical = canonicalizeLib(input);
  
  if (!canonical) {
    throw new Error('Failed to canonicalize input');
  }
  
  // Compute SHA-256 hash
  const hash = crypto.createHash('sha256')
    .update(canonical, 'utf8')
    .digest('hex');
  
  return {
    canonical,
    hash
  };
}

/**
 * Verify that a hash matches the expected value
 */
export function verify(input: any, expectedHash: string): boolean {
  const result = canonicalize(input);
  return result.hash === expectedHash.replace('sha256:', '');
}

export default canonicalize;
