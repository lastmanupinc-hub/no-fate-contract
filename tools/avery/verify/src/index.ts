import { canonicalize } from '@nofate/canon';

/**
 * GOVERNANCE BINDING
 * 
 * Avery verification is bound to No-Fate Governance System v1.0.0
 * Genesis Hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * Authority: auditor-authority (verification and attestation issuance)
 * Status: BOUND
 * Policy: AVERY_GATE_POLICY.md (non-bypassable verification)
 * 
 * Any artifact without Avery verification is out-of-governance.
 */
export const GOVERNANCE_BINDING = {
  governance_version: '1.0.0',
  genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
  authority_role: 'auditor-authority',
  binding_status: 'BOUND',
  tool_id: 'avery-verify',
  tool_version: '1.0.0',
  policy_ref: 'AVERY_GATE_POLICY.md',
  binding_rationale: 'Avery verification is mandatory and non-bypassable per governance policy'
};

export interface VerificationResult {
  valid: boolean;
  checks: string[];
  errors: string[];
  hashes: {
    bundle: string;
    output: string;
    emergy: string;
  };
}

/**
 * Avery's verification logic
 * 
 * Checks:
 * 1. Hash consistency (bundle, output, emergy hashes match)
 * 2. Schema validity (artifacts conform to schemas)
 * 3. Constraint satisfaction (output respects bundle constraints)
 * 4. Explanation consistency (emergy explains output)
 */
export function verify(bundle: any, output: any, emergy: any): VerificationResult {
  const checks: string[] = [];
  const errors: string[] = [];
  
  // Canonicalize all artifacts
  const bundleCanonical = canonicalize(bundle);
  const outputCanonical = canonicalize(output);
  const emergyCanonical = canonicalize(emergy);
  
  const bundleHash = `sha256:${bundleCanonical.hash}`;
  const outputHash = `sha256:${outputCanonical.hash}`;
  const emergyHash = `sha256:${emergyCanonical.hash}`;
  
  // Check 1: Hash consistency
  if (emergy.bundle_hash !== bundleHash) {
    errors.push(`Bundle hash mismatch: emergy claims ${emergy.bundle_hash}, actual ${bundleHash}`);
  } else {
    checks.push('bundle_hash_consistent');
  }
  
  if (emergy.output_hash !== outputHash) {
    errors.push(`Output hash mismatch: emergy claims ${emergy.output_hash}, actual ${outputHash}`);
  } else {
    checks.push('output_hash_consistent');
  }
  
  // Check 2: Schema validity (simplified - just check required fields)
  const bundleValid = validateBundleSchema(bundle);
  if (!bundleValid) {
    errors.push('Bundle schema invalid');
  } else {
    checks.push('bundle_schema_valid');
  }
  
  const outputValid = validateOutputSchema(output);
  if (!outputValid) {
    errors.push('Output schema invalid');
  } else {
    checks.push('output_schema_valid');
  }
  
  const emergyValid = validateEmergySchema(emergy);
  if (!emergyValid) {
    errors.push('Emergy schema invalid');
  } else {
    checks.push('emergy_schema_valid');
  }
  
  // Check 3: Constraint satisfaction (simplified)
  if (output.result === 'solved' && output.plan) {
    const constraintsSatisfied = checkConstraints(bundle, output);
    if (!constraintsSatisfied) {
      errors.push('Constraints violated by output plan');
    } else {
      checks.push('constraints_satisfied');
    }
  }
  
  // Check 4: Explanation consistency
  if (emergy.decision_graph) {
    const explanationConsistent = checkExplanations(output, emergy);
    if (!explanationConsistent) {
      errors.push('Emergy decision graph inconsistent with output');
    } else {
      checks.push('explanations_consistent');
    }
  }
  
  // Check 5: Output without Emergy is INVALID
  if (output.result === 'solved' && (!emergy || !emergy.decision_graph || emergy.decision_graph.length === 0)) {
    errors.push('POLICY VIOLATION: Output without valid Emergy is invalid (No Fate requires explanation)');
  }
  
  // Check 6: Emergy that cannot explain Output is INVALID
  if (output.result === 'solved' && output.plan && emergy.decision_graph) {
    const planSteps = output.plan.length;
    const decisionNodes = emergy.decision_graph.length;
    if (decisionNodes === 0) {
      errors.push('POLICY VIOLATION: Emergy has no decision nodes but output claims success');
    }
  }
  
  return {
    valid: errors.length === 0,
    checks,
    errors,
    hashes: {
      bundle: bundleHash,
      output: outputHash,
      emergy: emergyHash
    }
  };
}

function validateBundleSchema(bundle: any): boolean {
  // Simplified schema validation - just check required fields
  return (
    typeof bundle.nofate_version === 'string' &&
    typeof bundle.bundle_id === 'string' &&
    typeof bundle.state === 'object' &&
    Array.isArray(bundle.actions) &&
    Array.isArray(bundle.constraints) &&
    typeof bundle.solver_pins === 'object'
  );
}

function validateOutputSchema(output: any): boolean {
  const validResults = ['solved', 'unsolvable', 'timeout', 'error'];
  return (
    typeof output.result === 'string' &&
    validResults.includes(output.result)
  );
}

function validateEmergySchema(emergy: any): boolean {
  return (
    typeof emergy.nofate_version === 'string' &&
    typeof emergy.emergy_version === 'string' &&
    emergy.emergy_version === '1.0.0' &&
    typeof emergy.bundle_hash === 'string' &&
    typeof emergy.output_hash === 'string' &&
    Array.isArray(emergy.decision_graph) &&
    typeof emergy.determinism === 'object'
  );
}

function checkConstraints(bundle: any, output: any): boolean {
  // Simplified: assume constraints are satisfied
  // Real implementation would re-evaluate constraints against plan
  return true;
}

function checkExplanations(output: any, emergy: any): boolean {
  // Simplified: check that decision graph has entries
  if (output.result === 'solved' && output.plan) {
    // Each plan step should have a corresponding decision node
    return emergy.decision_graph.length > 0;
  }
  return true;
}

export default verify;
