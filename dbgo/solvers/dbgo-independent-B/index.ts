/**
 * DBGO Independent Solver B (dbgo-independent-B)
 * 
 * Third independent implementation - pipeline-style (async-ready)
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
 * Pipeline-style solver (async-ready, though sync for now)
 */
export class IndependentSolverB {
  private readonly SOLVER_NAME = 'dbgo-independent-B';
  private readonly VERSION = '1.0.0';
  
  execute(intent: CanonicalIntentBundle): SolverResult {
    const pipeline = new Pipeline(intent);
    return pipeline.run();
  }
}

class Pipeline {
  private warnings: string[] = [];
  private errors: string[] = [];
  private blueprint?: BlueprintIR;
  private audit?: AuditIR;
  
  constructor(
    private intent: CanonicalIntentBundle
  ) {}
  
  run(): SolverResult {
    // Stage 1: Validation
    if (!this.runValidation()) {
      return this.fail('INVALID_INPUT');
    }
    
    // Stage 2: Blueprint
    if (!this.runBlueprint()) {
      return this.fail();
    }
    
    // Stage 3: Audit
    if (!this.runAudit()) {
      return this.fail();
    }
    
    // Stage 4: Certificate
    return this.runCertificate();
  }
  
  private runValidation(): boolean {
    const result = validateIntentBundle(this.intent);
    if (!result.valid) {
      this.errors.push(...result.errors);
      this.warnings.push(...result.warnings);
      return false;
    }
    this.warnings.push(...result.warnings);
    return true;
  }
  
  private runBlueprint(): boolean {
    const result = generateBlueprint(
      this.intent.intent_id,
      this.intent.inputs.requested_action,
      this.intent.governing_rules.rule_hash
    );
    if (!result.success || !result.blueprint) {
      this.errors.push(...result.errors);
      this.warnings.push(...result.warnings);
      return false;
    }
    this.blueprint = result.blueprint;
    this.warnings.push(...result.warnings);
    return true;
  }
  
  private runAudit(): boolean {
    if (!this.blueprint) return false;
    
    const result = executeBlueprint(this.blueprint, this.intent.inputs.facts);
    if (!result.success || !result.audit) {
      this.errors.push(...result.errors);
      this.warnings.push(...result.warnings);
      return false;
    }
    this.audit = result.audit;
    this.warnings.push(...result.warnings);
    return true;
  }
  
  private runCertificate(): SolverResult {
    if (!this.audit) return this.fail();
    
    const pillarMap: Record<string, 'regulatory' | 'monetary' | 'judicial' | 'infra' | 'governance'> = {
      'tax': 'regulatory',
      'regulatory': 'regulatory',
      'monetary': 'monetary',
      'judicial': 'judicial',
      'infra': 'infra',
      'governance': 'governance'
    };
    
    const result = generateCertificate(
      this.audit,
      this.intent.domain,
      pillarMap[this.intent.domain] || 'regulatory',
      this.intent.inputs.requested_action,
      true,
      this.intent.governing_rules.rulebook_version,
      this.intent.governing_rules.rule_hash
    );
    
    if (!result.success || !result.certificate) {
      this.errors.push(...result.errors);
      this.warnings.push(...result.warnings);
      return this.fail();
    }
    
    return {
      success: true,
      certificate: result.certificate,
      blueprint: this.blueprint,
      audit: this.audit,
      outcome: result.certificate.outcome,
      errors: [],
      warnings: this.warnings
    };
  }
  
  private fail(outcome?: 'INVALID_INPUT'): SolverResult {
    return {
      success: false,
      outcome,
      blueprint: this.blueprint,
      audit: this.audit,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

export function solveWithB(intent: CanonicalIntentBundle): SolverResult {
  const solver = new IndependentSolverB();
  return solver.execute(intent);
}
