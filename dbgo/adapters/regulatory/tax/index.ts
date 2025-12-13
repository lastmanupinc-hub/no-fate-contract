/**
 * DBGO Tax Domain Adapter
 * 
 * Wraps existing IRS tax suite engines as DBGO domain adapter.
 * Converts tax analysis requests into CanonicalIntentBundle format
 * and routes through competing solver harness.
 * 
 * HARD ENFORCEMENT:
 * - All tax operations MUST flow through competing solver harness
 * - NO special authority for tax operations
 * - Deterministic outcomes only (PASS/FAIL/INDETERMINATE/INVALID_INPUT)
 * - Evidence-bound classifications preserved
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * - authority_role: adapter-authority
 * - domain: tax (regulatory pillar)
 */

import { CanonicalIntentBundle } from '../../../core/types/intent-ir';
import { runCompetingSolvers, HarnessResult } from '../../../harness';
import type { DocumentSet } from '../../../../src/types/core';

/**
 * Tax Operation Types
 */
export type TaxOperationType =
  | 'COMPLETENESS_ANALYSIS'
  | 'INCOME_CLASSIFICATION'
  | 'DEDUCTION_VERIFICATION'
  | 'FILING_ROUTING'
  | 'NOTICE_ANALYSIS';

/**
 * Tax Analysis Request
 */
export interface TaxAnalysisRequest {
  request_id: string;
  operation: TaxOperationType;
  documents: DocumentSet;
  tax_year: string;
  taxpayer_id?: string;
  requested_by: string;
}

/**
 * Tax Domain Adapter
 * 
 * Converts IRS tax suite operations into CanonicalIntentBundle format
 * and enforces DBGO governance through competing solver harness.
 */
export class TaxDomainAdapter {
  private readonly DOMAIN = 'tax';
  private readonly PILLAR = 'regulatory';
  private readonly GENESIS_HASH = 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a';
  
  /**
   * Process Completeness Analysis
   * 
   * Wraps existing completeness engine with DBGO governance.
   */
  processCompletenessAnalysis(request: TaxAnalysisRequest): HarnessResult {
    if (request.operation !== 'COMPLETENESS_ANALYSIS') {
      throw new Error(`Invalid operation: expected COMPLETENESS_ANALYSIS, got ${request.operation}`);
    }
    
    const intent = this.buildTaxIntent(
      request,
      'ANALYZE_DOCUMENT_COMPLETENESS',
      'completeness-rules'
    );
    
    return runCompetingSolvers(intent);
  }
  
  /**
   * Process Income Classification
   * 
   * Wraps existing income classification engine with DBGO governance.
   */
  processIncomeClassification(request: TaxAnalysisRequest): HarnessResult {
    if (request.operation !== 'INCOME_CLASSIFICATION') {
      throw new Error(`Invalid operation: expected INCOME_CLASSIFICATION, got ${request.operation}`);
    }
    
    const intent = this.buildTaxIntent(
      request,
      'CLASSIFY_INCOME_TYPES',
      'income-classification-rules'
    );
    
    return runCompetingSolvers(intent);
  }
  
  /**
   * Process Deduction Verification
   * 
   * Wraps existing deduction verification engine with DBGO governance.
   */
  processDeductionVerification(request: TaxAnalysisRequest): HarnessResult {
    if (request.operation !== 'DEDUCTION_VERIFICATION') {
      throw new Error(`Invalid operation: expected DEDUCTION_VERIFICATION, got ${request.operation}`);
    }
    
    const intent = this.buildTaxIntent(
      request,
      'VERIFY_DEDUCTION_DOCUMENTATION',
      'deduction-verification-rules'
    );
    
    return runCompetingSolvers(intent);
  }
  
  /**
   * Process Filing Routing
   * 
   * Wraps existing filing routing engine with DBGO governance.
   */
  processFilingRouting(request: TaxAnalysisRequest): HarnessResult {
    if (request.operation !== 'FILING_ROUTING') {
      throw new Error(`Invalid operation: expected FILING_ROUTING, got ${request.operation}`);
    }
    
    const intent = this.buildTaxIntent(
      request,
      'ROUTE_BUSINESS_FILING',
      'filing-routing-rules'
    );
    
    return runCompetingSolvers(intent);
  }
  
  /**
   * Process Notice Analysis
   * 
   * Wraps existing notice analysis engine with DBGO governance.
   */
  processNoticeAnalysis(request: TaxAnalysisRequest): HarnessResult {
    if (request.operation !== 'NOTICE_ANALYSIS') {
      throw new Error(`Invalid operation: expected NOTICE_ANALYSIS, got ${request.operation}`);
    }
    
    const intent = this.buildTaxIntent(
      request,
      'ANALYZE_IRS_NOTICE',
      'notice-analysis-rules'
    );
    
    return runCompetingSolvers(intent);
  }
  
  /**
   * Build CanonicalIntentBundle for Tax Operations
   * 
   * Converts tax-specific request into domain-agnostic canonical intent.
   */
  private buildTaxIntent(
    request: TaxAnalysisRequest,
    action: string,
    ruleHash: string
  ): CanonicalIntentBundle {
    // Extract document IDs and text for facts
    const documentFacts = request.documents.documents.reduce((acc, doc) => {
      acc[`document_${doc.document_id}`] = {
        document_id: doc.document_id,
        document_type: doc.document_type,
        text_length: doc.raw_text.length,
        // NOTE: Not including full raw_text in facts to keep intent size manageable
        // Full text referenced via evidence_refs
      };
      return acc;
    }, {} as Record<string, unknown>);
    
    // Build evidence references for all documents
    const evidenceRefs = request.documents.documents.map(doc => 
      `document:${doc.document_id}:${doc.document_type}`
    );
    
    return {
      intent_type: 'DOMAIN_EVALUATION',
      domain: this.DOMAIN,
      intent_id: `tax-${request.operation.toLowerCase()}-${request.request_id}`,
      version: '1.0.0',
      inputs: {
        facts: {
          request_id: request.request_id,
          operation: request.operation,
          tax_year: request.tax_year,
          taxpayer_id: request.taxpayer_id || 'anonymous',
          document_count: request.documents.documents.length,
          documents: documentFacts,
          // HARD ENFORCEMENT: Preserve evidence-bound requirement
          evidence_required: true,
          no_inference: true,
          textual_evidence_only: true
        },
        evidence_refs: evidenceRefs,
        requested_action: action
      },
      governing_rules: {
        rulebook_id: `irs-tax-${request.operation.toLowerCase()}-rulebook`,
        rulebook_version: '1.0.0',
        rule_hash: `sha256:${ruleHash}`
      },
      authority: {
        actor_id: request.requested_by,
        actor_role: 'tax-analyst',
        proof_ref: `tax-request:${request.request_id}`
      },
      determinism_contract: {
        allowed_outputs: ['PASS', 'FAIL', 'INDETERMINATE', 'INVALID_INPUT'],
        no_defaults: true,
        require_evidence: true,
        byte_identical_replay: true
      },
      governance_binding: {
        genesis_hash: this.GENESIS_HASH,
        authority_role: 'adapter-authority',
        policy_version: '1.0.0'
      }
    };
  }
  
  /**
   * Generic Tax Analysis
   * 
   * Routes any tax operation through appropriate handler.
   */
  processTaxAnalysis(request: TaxAnalysisRequest): HarnessResult {
    switch (request.operation) {
      case 'COMPLETENESS_ANALYSIS':
        return this.processCompletenessAnalysis(request);
      case 'INCOME_CLASSIFICATION':
        return this.processIncomeClassification(request);
      case 'DEDUCTION_VERIFICATION':
        return this.processDeductionVerification(request);
      case 'FILING_ROUTING':
        return this.processFilingRouting(request);
      case 'NOTICE_ANALYSIS':
        return this.processNoticeAnalysis(request);
      default:
        throw new Error(`Unknown tax operation: ${request.operation}`);
    }
  }
}

/**
 * Convenience functions
 */
export function processTaxAnalysis(request: TaxAnalysisRequest): HarnessResult {
  const adapter = new TaxDomainAdapter();
  return adapter.processTaxAnalysis(request);
}

export function processCompletenessAnalysis(request: TaxAnalysisRequest): HarnessResult {
  const adapter = new TaxDomainAdapter();
  return adapter.processCompletenessAnalysis(request);
}

export function processIncomeClassification(request: TaxAnalysisRequest): HarnessResult {
  const adapter = new TaxDomainAdapter();
  return adapter.processIncomeClassification(request);
}

export function processDeductionVerification(request: TaxAnalysisRequest): HarnessResult {
  const adapter = new TaxDomainAdapter();
  return adapter.processDeductionVerification(request);
}

export function processFilingRouting(request: TaxAnalysisRequest): HarnessResult {
  const adapter = new TaxDomainAdapter();
  return adapter.processFilingRouting(request);
}

export function processNoticeAnalysis(request: TaxAnalysisRequest): HarnessResult {
  const adapter = new TaxDomainAdapter();
  return adapter.processNoticeAnalysis(request);
}
