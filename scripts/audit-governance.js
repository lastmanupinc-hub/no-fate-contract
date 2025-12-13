#!/usr/bin/env node

/**
 * Governance-Aware Audit Engine
 * 
 * Executes structured audits against governance artifacts, binding registry, and replay reports.
 * Produces audit artifacts with named failure codes (NEVER implicit failures).
 * 
 * Audit Scope:
 * 1. Governance Baseline Integrity
 * 2. Binding Registry Completeness
 * 3. Schema Hash Consistency
 * 4. Authority Chain Validity
 * 5. Replay Determinism
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Named failure codes
const FAILURE_CODES = {
  // Governance baseline failures
  'BASELINE_MISSING': 'Governance baseline file not found',
  'BASELINE_INVALID_JSON': 'Governance baseline is not valid JSON',
  'BASELINE_NOT_FROZEN': 'Governance baseline status is not FROZEN',
  'GENESIS_HASH_MISMATCH': 'Genesis hash does not match canonical baseline',
  'REPLAY_HASH_MISMATCH': 'Replay state hash does not match canonical baseline',
  
  // Binding registry failures
  'BINDING_REGISTRY_MISSING': 'Binding registry file not found',
  'BINDING_REGISTRY_INVALID_JSON': 'Binding registry is not valid JSON',
  'BINDING_INCOMPLETE': 'Binding registry marked incomplete',
  'UNBOUND_ARTIFACT': 'Artifact exists without governance binding',
  
  // Schema failures
  'SCHEMA_HASH_MISMATCH': 'Schema canonical hash does not match binding registry',
  'SCHEMA_MISSING_BINDING': 'Schema missing governance_binding block',
  'SCHEMA_GENESIS_MISMATCH': 'Schema genesis_hash does not match canonical baseline',
  
  // Authority failures
  'AUTHORITY_UNDEFINED': 'Referenced authority role not defined in genesis',
  'AUTHORITY_CHAIN_BROKEN': 'Authority chain cannot be traced to genesis',
  
  // Replay failures
  'REPLAY_REPORT_MISSING': 'Replay report file not found',
  'REPLAY_NOT_DETERMINISTIC': 'Replay did not produce deterministic results',
  'REPLAY_INPUTS_NOT_CLOSED': 'Replay inputs are not explicitly closed'
};

class GovernanceAuditor {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.findings = [];
    this.passed = [];
  }

  // Load and validate JSON file
  loadJSON(filePath, failureCode) {
    const fullPath = path.join(this.workspaceRoot, filePath);
    
    if (!fs.existsSync(fullPath)) {
      this.addFinding('CRITICAL', failureCode || 'FILE_MISSING', `File not found: ${filePath}`);
      return null;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.addFinding('CRITICAL', failureCode + '_INVALID_JSON', `Invalid JSON in ${filePath}: ${error.message}`);
      return null;
    }
  }

  addFinding(severity, code, message, evidence = null) {
    this.findings.push({
      severity,
      code,
      message,
      evidence,
      description: FAILURE_CODES[code] || 'Unknown failure code'
    });
  }

  addPass(check, evidence = null) {
    this.passed.push({
      check,
      evidence
    });
  }

  // Audit 1: Governance Baseline Integrity
  auditGovernanceBaseline() {
    console.log('\\n=== Audit 1: Governance Baseline Integrity ===\\n');
    
    const baseline = this.loadJSON('governance/governance_baseline.json', 'BASELINE_MISSING');
    if (!baseline) return;

    // Check baseline is frozen
    if (baseline.baseline_status !== 'FROZEN') {
      this.addFinding('CRITICAL', 'BASELINE_NOT_FROZEN', 
        `Baseline status is ${baseline.baseline_status}, expected FROZEN`);
    } else {
      this.addPass('baseline_frozen', { status: baseline.baseline_status });
    }

    // Check canonical genesis hash
    const expectedGenesisHash = 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a';
    if (baseline.canonical_genesis?.genesis_hash !== expectedGenesisHash) {
      this.addFinding('CRITICAL', 'GENESIS_HASH_MISMATCH',
        `Genesis hash is ${baseline.canonical_genesis?.genesis_hash}, expected ${expectedGenesisHash}`);
    } else {
      this.addPass('genesis_hash_canonical', { hash: expectedGenesisHash });
    }

    // Check canonical replay hash
    const expectedReplayHash = 'sha256:f64436c2bee406672caf1d5868f09b0cec145869198d37dfbbca90dce24267da';
    if (baseline.canonical_replay_state?.replay_state_hash !== expectedReplayHash) {
      this.addFinding('CRITICAL', 'REPLAY_HASH_MISMATCH',
        `Replay hash is ${baseline.canonical_replay_state?.replay_state_hash}, expected ${expectedReplayHash}`);
    } else {
      this.addPass('replay_hash_canonical', { hash: expectedReplayHash });
    }

    // Check fork prevention
    if (baseline.fork_prevention?.re_genesis_allowed !== false) {
      this.addFinding('HIGH', 'FORK_PREVENTION_WEAK', 
        'Fork prevention does not prohibit re-genesis');
    } else {
      this.addPass('fork_prevention_active', { policy: baseline.fork_prevention.baseline_freeze_policy });
    }

    return baseline;
  }

  // Audit 2: Binding Registry Completeness
  auditBindingRegistry(baseline) {
    console.log('\\n=== Audit 2: Binding Registry Completeness ===\\n');
    
    const registry = this.loadJSON('governance/governance_binding_registry.json', 'BINDING_REGISTRY_MISSING');
    if (!registry) return;

    // Check all schemas are bound
    const schemas = ['bundle.schema.json', 'output.schema.json', 'emergy.schema.json', 'attestation.schema.json'];
    for (const schemaId of schemas) {
      const binding = registry.bound_schemas?.find(s => s.schema_id === schemaId);
      if (!binding) {
        this.addFinding('CRITICAL', 'UNBOUND_ARTIFACT', `Schema ${schemaId} not found in binding registry`);
      } else if (binding.governance_binding_status !== 'BOUND') {
        this.addFinding('CRITICAL', 'UNBOUND_ARTIFACT', 
          `Schema ${schemaId} has status ${binding.governance_binding_status}, expected BOUND`);
      } else {
        this.addPass(`schema_bound_${schemaId}`, { schema_hash: binding.schema_hash });
      }
    }

    // Check genesis reference
    if (registry.genesis_ref !== 'governance/governance_genesis.json' && 
        !registry.genesis_hash) {
      this.addFinding('HIGH', 'BINDING_REGISTRY_OUTDATED', 
        'Binding registry missing genesis_hash reference to signed genesis');
    }

    return registry;
  }

  // Audit 3: Schema Hash Consistency
  auditSchemaHashes(baseline, registry) {
    console.log('\\n=== Audit 3: Schema Hash Consistency ===\\n');
    
    const schemas = [
      { file: 'schemas/bundle.schema.json', expected: 'sha256:acebe894af4983360cfef52a440faac6875a6b13028f703074d0e89d731e0f43' },
      { file: 'schemas/output.schema.json', expected: 'sha256:c7c9b6521a7b35c19c9de1cf0f3dadd70f4b8887e554adff1df62acefa7d8073' },
      { file: 'schemas/emergy.schema.json', expected: 'sha256:5ea0be19e07f6b823b3703ea048ba6f5b1256d73b477c3251150bea48c46f9e1' },
      { file: 'schemas/attestation.schema.json', expected: 'sha256:d908445287b929b2544c8bdb1f17ff410ffbd26e6520e513ca59dcd31acef310' }
    ];

    for (const { file, expected } of schemas) {
      const schema = this.loadJSON(file, 'SCHEMA_MISSING');
      if (!schema) continue;

      // Check governance_binding exists
      if (!schema.governance_binding) {
        this.addFinding('CRITICAL', 'SCHEMA_MISSING_BINDING', `Schema ${file} missing governance_binding block`);
        continue;
      }

      // Check schema_hash matches expected
      if (schema.governance_binding.schema_hash !== expected) {
        this.addFinding('CRITICAL', 'SCHEMA_HASH_MISMATCH',
          `Schema ${file} hash is ${schema.governance_binding.schema_hash}, expected ${expected}`);
      } else {
        this.addPass(`schema_hash_${path.basename(file)}`, { hash: expected });
      }

      // Check genesis_hash matches canonical
      if (schema.governance_binding.genesis_hash !== baseline?.canonical_genesis?.genesis_hash) {
        this.addFinding('CRITICAL', 'SCHEMA_GENESIS_MISMATCH',
          `Schema ${file} genesis_hash is ${schema.governance_binding.genesis_hash}, expected ${baseline?.canonical_genesis?.genesis_hash}`);
      } else {
        this.addPass(`schema_genesis_${path.basename(file)}`, { genesis_hash: schema.governance_binding.genesis_hash });
      }

      // Check binding_status is BOUND
      if (schema.governance_binding.binding_status !== 'BOUND') {
        this.addFinding('HIGH', 'UNBOUND_ARTIFACT', 
          `Schema ${file} has binding_status ${schema.governance_binding.binding_status}, expected BOUND`);
      }
    }
  }

  // Audit 4: Authority Chain Validity
  auditAuthorityChains(baseline) {
    console.log('\\n=== Audit 4: Authority Chain Validity ===\\n');
    
    const genesis = this.loadJSON('governance/governance_genesis.signed.json', 'GENESIS_MISSING');
    if (!genesis) return;

    // Load all authority roles from genesis
    const definedRoles = new Set(genesis.initial_roles?.map(r => r.role_id) || []);
    
    // Check schemas reference valid authority roles
    const schemas = ['schemas/bundle.schema.json', 'schemas/output.schema.json', 
                     'schemas/emergy.schema.json', 'schemas/attestation.schema.json'];
    
    for (const schemaFile of schemas) {
      const schema = this.loadJSON(schemaFile, 'SCHEMA_MISSING');
      if (!schema?.governance_binding) continue;

      const governedBy = schema.governance_binding.governed_by;
      if (!definedRoles.has(governedBy)) {
        this.addFinding('CRITICAL', 'AUTHORITY_UNDEFINED',
          `Schema ${schemaFile} governed by ${governedBy}, which is not defined in genesis`);
      } else {
        this.addPass(`authority_valid_${path.basename(schemaFile)}`, { authority: governedBy });
      }
    }

    // Check binding registry authorities
    const registry = this.loadJSON('governance/governance_binding_registry.json', 'BINDING_REGISTRY_MISSING');
    if (registry) {
      for (const schema of registry.bound_schemas || []) {
        if (!definedRoles.has(schema.governed_by)) {
          this.addFinding('CRITICAL', 'AUTHORITY_UNDEFINED',
            `Registry schema ${schema.schema_id} governed by ${schema.governed_by}, not in genesis`);
        }
      }
    }
  }

  // Audit 5: Replay Determinism
  auditReplayDeterminism(baseline) {
    console.log('\\n=== Audit 5: Replay Determinism ===\\n');
    
    const report = this.loadJSON('governance/governance_replay_report.json', 'REPLAY_REPORT_MISSING');
    if (!report) return;

    // Check determinism test passed (v2.0.0 format uses test_results.determinism_test)
    const determinismResult = report.test_results?.determinism_test;
    if (determinismResult !== true) {
      this.addFinding('CRITICAL', 'REPLAY_NOT_DETERMINISTIC',
        `Replay determinism test result is ${determinismResult}, expected true`);
    } else {
      // Verify checkpoints have identical hashes
      const checkpointHashes = report.checkpoints?.map(c => c.stateHash) || [];
      const allIdentical = checkpointHashes.every(h => h === checkpointHashes[0]);
      
      if (!allIdentical) {
        this.addFinding('CRITICAL', 'REPLAY_NOT_DETERMINISTIC',
          `Checkpoint hashes are not identical: ${checkpointHashes.join(', ')}`);
      } else {
        this.addPass('replay_deterministic', { 
          checkpoint_count: checkpointHashes.length,
          state_hash: checkpointHashes[0]
        });
      }
    }

    // Check closed inputs
    const closedInputs = this.loadJSON('governance/replay_inputs_closed.json', 'CLOSED_INPUTS_MISSING');
    if (!closedInputs) {
      this.addFinding('HIGH', 'REPLAY_INPUTS_NOT_CLOSED', 'Closed inputs specification missing');
    } else {
      if (closedInputs.proof_of_closure?.all_inputs_listed !== true) {
        this.addFinding('HIGH', 'REPLAY_INPUTS_NOT_CLOSED', 
          'Closed inputs proof_of_closure.all_inputs_listed is not true');
      } else {
        this.addPass('replay_inputs_closed', { 
          input_count: closedInputs.input_artifacts?.length 
        });
      }
    }

    // Check replay state hash matches baseline (v2.0.0 uses final_state.stateHash)
    const reportStateHash = `sha256:${report.final_state?.stateHash}`;
    if (reportStateHash !== baseline?.canonical_replay_state?.replay_state_hash) {
      this.addFinding('CRITICAL', 'REPLAY_HASH_MISMATCH',
        `Replay report hash is ${reportStateHash}, baseline expects ${baseline?.canonical_replay_state?.replay_state_hash}`);
    } else {
      this.addPass('replay_state_hash_matches_baseline', { state_hash: reportStateHash });
    }
  }

  // Generate audit report
  generateReport() {
    const criticalCount = this.findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = this.findings.filter(f => f.severity === 'HIGH').length;
    const mediumCount = this.findings.filter(f => f.severity === 'MEDIUM').length;

    const report = {
      type: 'nfgs.audit_report',
      audit_version: '1.0.0',
      audit_timestamp: new Date().toISOString(),
      audit_scope: [
        'governance_baseline_integrity',
        'binding_registry_completeness',
        'schema_hash_consistency',
        'authority_chain_validity',
        'replay_determinism'
      ],
      audit_result: criticalCount === 0 && highCount === 0 ? 'PASSED' : 'FAILED',
      findings_summary: {
        total: this.findings.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: this.findings.filter(f => f.severity === 'LOW').length
      },
      checks_passed: this.passed.length,
      findings: this.findings,
      passed_checks: this.passed,
      governance_binding: {
        governance_version: '1.0.0',
        genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
        authority_role: 'auditor-authority',
        audit_engine: 'governance-audit-engine',
        audit_engine_version: '1.0.0'
      }
    };

    return report;
  }

  // Execute all audits
  async execute() {
    console.log('=== Governance-Aware Audit Engine v1.0.0 ===\\n');
    console.log('Executing structured audits with named failure codes...\\n');

    const baseline = this.auditGovernanceBaseline();
    const registry = this.auditBindingRegistry(baseline);
    this.auditSchemaHashes(baseline, registry);
    this.auditAuthorityChains(baseline);
    this.auditReplayDeterminism(baseline);

    const report = this.generateReport();

    // Save report
    const reportPath = path.join(this.workspaceRoot, 'governance', 'governance_audit_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\\n=== Audit Complete ===\\n');
    console.log(`Result: ${report.audit_result}`);
    console.log(`Passed Checks: ${report.checks_passed}`);
    console.log(`Findings: ${report.findings_summary.total} (${report.findings_summary.critical} critical, ${report.findings_summary.high} high)`);
    console.log(`\\nReport saved: ${reportPath}`);

    if (report.findings_summary.critical > 0) {
      console.log('\\n⚠️  CRITICAL FINDINGS:\\n');
      report.findings
        .filter(f => f.severity === 'CRITICAL')
        .forEach(f => console.log(`  - [${f.code}] ${f.message}`));
    }

    if (report.audit_result === 'PASSED') {
      console.log('\\n✅ GOVERNANCE AUDIT PASSED\\n');
      return 0;
    } else {
      console.log('\\n❌ GOVERNANCE AUDIT FAILED\\n');
      return 1;
    }
  }
}

// Run audit
const workspaceRoot = path.resolve(__dirname, '..');
const auditor = new GovernanceAuditor(workspaceRoot);
auditor.execute().then(exitCode => process.exit(exitCode));
