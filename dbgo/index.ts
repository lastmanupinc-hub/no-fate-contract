/**
 * DBGO Core Exports
 * 
 * Centralized export point for all DBGO components.
 * 
 * Architecture:
 * - Core IR Types: Intent, Blueprint, Audit, Certificate
 * - Competing Solvers: Reference + 3 Independent implementations
 * - Harness: Byte-identical comparison enforcement
 * - Adapters: Domain-specific intent conversion (governance, tax)
 * - Enforcement: Hard policy enforcement mechanisms
 * 
 * Governance Binding:
 * - genesis_hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 */

// Core IR Types
export * from './core/types/intent-ir';
export * from './core/types/blueprint-audit-ir';
export * from './core/types/certificate-ir';

// Competing Solvers
export * from './solvers/dbgo-reference';
export * from './solvers/dbgo-independent-A';
export * from './solvers/dbgo-independent-B';
export * from './solvers/dbgo-independent-C';

// Competing Solver Harness (PRIMARY ENFORCEMENT MECHANISM)
export * from './harness';

// Domain Adapters
export * from './adapters/governance';
export * from './adapters/regulatory/tax';

// Policy Enforcement
export * from './enforcement';

// Action Space (EXHAUSTIVE - EXACTLY 8 VALID MOVES)
export * from './actions';
