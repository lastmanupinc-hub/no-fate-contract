import { canonicalize } from '@nofate/canon';
import { solve } from '@nofate/solve';

/**
 * GOVERNANCE BINDING
 * 
 * Avery replay is bound to No-Fate Governance System v1.0.0
 * Genesis Hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * Authority: auditor-authority (determinism verification)
 * Status: BOUND
 * Conformance: NFSCS v1.0.0 (baseline determinism vector required)
 * 
 * Replay is used to verify determinism - any non-deterministic solver fails conformance.
 */
export const GOVERNANCE_BINDING = {
  governance_version: '1.0.0',
  genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
  authority_role: 'auditor-authority',
  binding_status: 'BOUND',
  tool_id: 'avery-replay',
  tool_version: '1.0.0',
  conformance_requirement: 'NFSCS v1.0.0 - Baseline Determinism Vector',
  binding_rationale: 'Replay verification is mandatory for solver conformance testing'
};

export interface ReplayResult {
  deterministic: boolean;
  differences: string[];
  hashes: {
    expected_output: string;
    actual_output: string;
    expected_emergy: string;
    actual_emergy: string;
  };
}

/**
 * Replay a computation to verify determinism
 * 
 * Steps:
 * 1. Re-run solver with same bundle
 * 2. Compare outputs byte-for-byte (via hash)
 * 3. Compare emergy byte-for-byte (via hash)
 * 4. Report any differences
 */
export function replay(
  bundle: any,
  expectedOutput: any,
  expectedEmergy: any
): ReplayResult {
  
  const differences: string[] = [];
  
  // Re-run solver
  const solveResult = solve(bundle);
  const actualOutput = solveResult.output;
  const actualEmergy = solveResult.emergy;
  
  // Canonicalize all artifacts
  const expectedOutputCanonical = canonicalize(expectedOutput);
  const actualOutputCanonical = canonicalize(actualOutput);
  const expectedEmergyCanonical = canonicalize(expectedEmergy);
  const actualEmergyCanonical = canonicalize(actualEmergy);
  
  const expectedOutputHash = `sha256:${expectedOutputCanonical.hash}`;
  const actualOutputHash = `sha256:${actualOutputCanonical.hash}`;
  const expectedEmergyHash = `sha256:${expectedEmergyCanonical.hash}`;
  const actualEmergyHash = `sha256:${actualEmergyCanonical.hash}`;
  
  // Compare hashes
  if (expectedOutputHash !== actualOutputHash) {
    differences.push(`Output hash mismatch: expected ${expectedOutputHash}, got ${actualOutputHash}`);
    
    // Debug: find specific differences
    const outputDiff = findDifferences('output', expectedOutput, actualOutput);
    differences.push(...outputDiff);
  }
  
  if (expectedEmergyHash !== actualEmergyHash) {
    differences.push(`Emergy hash mismatch: expected ${expectedEmergyHash}, got ${actualEmergyHash}`);
    
    // Debug: find specific differences
    const emergyDiff = findDifferences('emergy', expectedEmergy, actualEmergy);
    differences.push(...emergyDiff);
  }
  
  return {
    deterministic: differences.length === 0,
    differences,
    hashes: {
      expected_output: expectedOutputHash,
      actual_output: actualOutputHash,
      expected_emergy: expectedEmergyHash,
      actual_emergy: actualEmergyHash
    }
  };
}

function findDifferences(prefix: string, expected: any, actual: any, path: string = ''): string[] {
  const diffs: string[] = [];
  
  if (typeof expected !== typeof actual) {
    diffs.push(`${prefix}${path}: type mismatch (${typeof expected} vs ${typeof actual})`);
    return diffs;
  }
  
  if (Array.isArray(expected)) {
    if (expected.length !== actual.length) {
      diffs.push(`${prefix}${path}: array length mismatch (${expected.length} vs ${actual.length})`);
    }
    for (let i = 0; i < Math.min(expected.length, actual.length); i++) {
      diffs.push(...findDifferences(prefix, expected[i], actual[i], `${path}[${i}]`));
    }
  } else if (typeof expected === 'object' && expected !== null) {
    const expectedKeys = Object.keys(expected).sort();
    const actualKeys = Object.keys(actual).sort();
    
    const missingKeys = expectedKeys.filter(k => !actualKeys.includes(k));
    const extraKeys = actualKeys.filter(k => !expectedKeys.includes(k));
    
    if (missingKeys.length > 0) {
      diffs.push(`${prefix}${path}: missing keys [${missingKeys.join(', ')}]`);
    }
    if (extraKeys.length > 0) {
      diffs.push(`${prefix}${path}: extra keys [${extraKeys.join(', ')}]`);
    }
    
    for (const key of expectedKeys) {
      if (actualKeys.includes(key)) {
        diffs.push(...findDifferences(prefix, expected[key], actual[key], `${path}.${key}`));
      }
    }
  } else if (expected !== actual) {
    diffs.push(`${prefix}${path}: value mismatch ("${expected}" vs "${actual}")`);
  }
  
  return diffs;
}

export default replay;
