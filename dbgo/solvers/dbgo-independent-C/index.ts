/**
 * DBGO Independent Solver C (dbgo-independent-C)
 * 
 * Fourth independent implementation - functional style
 * 
 * HARD ENFORCEMENT:
 * - MUST produce byte-identical outputs as other solvers
 * - NO special authority
 * - Divergence → INDETERMINATE
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: solver-authority
 */

import {
  CanonicalIntentBundle,
  validateIntentBundle
} from '../../core/types/intent-ir';
import {
  generateBlueprint,
  executeBlueprint,
  BlueprintIR,
  AuditIR
} from '../../core/types/blueprint-audit-ir';
import {
  generateCertificate,
  CertificateIR
} from '../../core/types/certificate-ir';
import { SolverResult } from '../dbgo-reference';

/**
 * Functional composition-based solver
 */
export class IndependentSolverC {
  private readonly ID = 'dbgo-independent-C';
  private readonly VER = '1.0.0';
  
  compute(intentBundle: CanonicalIntentBundle): SolverResult {
    return functionalSolve(intentBundle);
  }
}

/**
 * Functional pipeline: validate → blueprint → audit → certify
 */
function functionalSolve(
  bundle: CanonicalIntentBundle
): SolverResult {
  const ctx: Context = { warnings: [], errors: [] };
  
  const validationResult = performValidation(bundle, ctx);
  if (!validationResult.valid) {
    return buildFailureResult(ctx, 'INVALID_INPUT');
  }
  
  const blueprintResult = performBlueprintGeneration(bundle, ctx);
  if (!blueprintResult.valid || !blueprintResult.blueprint) {
    return buildFailureResult(ctx);
  }
  
  const auditResult = performAuditExecution(blueprintResult.blueprint, bundle.inputs.facts, ctx);
  if (!auditResult.valid || !auditResult.audit) {
    return buildFailureResult(ctx, undefined, blueprintResult.blueprint);
  }
  
  const certResult = performCertification(auditResult.audit, bundle, ctx);
  if (!certResult.valid || !certResult.certificate) {
    return buildFailureResult(ctx, undefined, blueprintResult.blueprint, auditResult.audit);
  }
  
  return buildSuccessResult(
    certResult.certificate,
    blueprintResult.blueprint,
    auditResult.audit,
    ctx
  );
}

interface Context {
  warnings: string[];
  errors: string[];
}

interface ValidationResult {
  valid: boolean;
}

interface BlueprintResult {
  valid: boolean;
  blueprint?: BlueprintIR;
}

interface AuditResult {
  valid: boolean;
  audit?: AuditIR;
}

interface CertificationResult {
  valid: boolean;
  certificate?: CertificateIR;
}

function performValidation(bundle: CanonicalIntentBundle, ctx: Context): ValidationResult {
  const result = validateIntentBundle(bundle);
  ctx.warnings.push(...result.warnings);
  if (!result.valid) {
    ctx.errors.push(...result.errors);
    return { valid: false };
  }
  return { valid: true };
}

function performBlueprintGeneration(bundle: CanonicalIntentBundle, ctx: Context): BlueprintResult {
  const result = generateBlueprint(
    bundle.intent_id,
    bundle.inputs.requested_action,
    bundle.governing_rules.rule_hash
  );
  ctx.warnings.push(...result.warnings);
  if (!result.success || !result.blueprint) {
    ctx.errors.push(...result.errors);
    return { valid: false };
  }
  return { valid: true, blueprint: result.blueprint };
}

function performAuditExecution(
  blueprint: BlueprintIR,
  facts: Record<string, unknown>,
  ctx: Context
): AuditResult {
  const result = executeBlueprint(blueprint, facts);
  ctx.warnings.push(...result.warnings);
  if (!result.success || !result.audit) {
    ctx.errors.push(...result.errors);
    return { valid: false };
  }
  return { valid: true, audit: result.audit };
}

function performCertification(
  audit: AuditIR,
  bundle: CanonicalIntentBundle,
  ctx: Context
): CertificationResult {
  const pillarMap: Record<string, 'regulatory' | 'monetary' | 'judicial' | 'infra' | 'governance'> = {
    'tax': 'regulatory',
    'regulatory': 'regulatory',
    'monetary': 'monetary',
    'judicial': 'judicial',
    'infra': 'infra',
    'governance': 'governance'
  };
  
  const result = generateCertificate(
    audit,
    bundle.domain,
    pillarMap[bundle.domain] || 'regulatory',
    bundle.inputs.requested_action,
    true,
    bundle.governing_rules.rulebook_version,
    bundle.governing_rules.rule_hash
  );
  
  ctx.warnings.push(...result.warnings);
  if (!result.success || !result.certificate) {
    ctx.errors.push(...result.errors);
    return { valid: false };
  }
  return { valid: true, certificate: result.certificate };
}

function buildSuccessResult(
  cert: CertificateIR,
  bp: BlueprintIR,
  aud: AuditIR,
  ctx: Context
): SolverResult {
  return {
    success: true,
    certificate: cert,
    blueprint: bp,
    audit: aud,
    outcome: cert.outcome,
    errors: [],
    warnings: ctx.warnings
  };
}

function buildFailureResult(
  ctx: Context,
  outcome?: 'INVALID_INPUT',
  bp?: BlueprintIR,
  aud?: AuditIR
): SolverResult {
  return {
    success: false,
    outcome,
    blueprint: bp,
    audit: aud,
    errors: ctx.errors,
    warnings: ctx.warnings
  };
}

export function solveWithC(intentBundle: CanonicalIntentBundle): SolverResult {
  const solver = new IndependentSolverC();
  return solver.compute(intentBundle);
}
