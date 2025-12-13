import { canonicalize } from '@nofate/canon';

/**
 * GOVERNANCE BINDING
 * 
 * This solver is bound to No-Fate Governance System v1.0.0
 * Genesis Hash: sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a
 * Authority: solver-authority (solver certification and conformance)
 * Status: BOUND
 * Conformance: NFSCS v1.0.0 required for certification
 * 
 * Any solver without governance_binding reference is out-of-governance and cannot be certified.
 */
export const GOVERNANCE_BINDING = {
  governance_version: '1.0.0',
  genesis_hash: 'sha256:45162862f5360bfd2dfebd5646caa97cc3a400c38e9563e4bea142e43ae70f1a',
  authority_role: 'solver-authority',
  binding_status: 'BOUND',
  tool_id: 'solve',
  tool_version: '1.0.0',
  conformance_requirement: 'NFSCS v1.0.0',
  binding_rationale: 'Solver must pass conformance testing before issuance of certification attestation'
};

export interface Bundle {
  nofate_version: string;
  bundle_id: string;
  state: Record<string, any>;
  actions: Action[];
  constraints: Constraint[];
  policies?: Policy[];
  solver_pins: SolverPins;
}

export interface Action {
  id: string;
  pre: string[];
  eff: string[];
  cost?: number;
  duration?: number;
  resources?: Record<string, number>;
}

export interface Constraint {
  id: string;
  type: 'hard';
  expr: string;
}

export interface Policy {
  id: string;
  type: 'soft';
  weight: number;
  expr: string;
}

export interface SolverPins {
  contract_semantics: string;
  tie_break: string;
  seed?: string;
}

export interface Output {
  result: 'solved' | 'unsolvable' | 'timeout' | 'error';
  plan?: PlanStep[];
  objective?: {
    cost?: number;
    policy_score?: number;
  };
  reason?: string;
}

export interface PlanStep {
  step: number;
  action_id: string;
  start?: number;
  end?: number;
  resources?: Record<string, number>;
}

export interface Emergy {
  nofate_version: string;
  emergy_version: string;
  bundle_hash: string;
  output_hash: string;
  decision_graph: DecisionNode[];
  rejections?: Rejection[];
  determinism: {
    canonicalization: 'JCS';
    tie_break: string;
    engine_build?: string;
  };
}

export interface DecisionNode {
  node: string;
  state_hash: string;
  candidates: string[];
  evaluations: Record<string, Evaluation>;
  chosen: string;
  tie_break?: {
    applied: boolean;
    reason?: string;
  };
}

export interface Evaluation {
  type: 'hard' | 'soft';
  passed?: boolean;
  penalty?: number;
  evidence: string;
}

export interface Rejection {
  action_id: string;
  because: Array<{
    constraint_id: string;
    evidence: string;
  }>;
}

export interface SolveResult {
  output: Output;
  emergy: Emergy;
}

/**
 * Simple deterministic forward search planner
 * This is a REFERENCE IMPLEMENTATION - real solvers can be more sophisticated
 * but MUST produce identical outputs for identical inputs+solver_pins
 */
export function solve(bundle: Bundle): SolveResult {
  // Canonicalize bundle and compute hash
  const bundleCanonical = canonicalize(bundle);
  const bundleHash = `sha256:${bundleCanonical.hash}`;
  
  // Initialize decision graph
  const decisionGraph: DecisionNode[] = [];
  const rejections: Rejection[] = [];
  
  // Current state (copy to avoid mutation)
  let currentState = { ...bundle.state };
  const plan: PlanStep[] = [];
  let step = 1;
  
  // Simple goal: apply actions until no more are applicable
  // This is a STUB - real implementation would use A*, constraint solving, etc.
  let iterations = 0;
  const maxIterations = 100;
  
  while (iterations < maxIterations) {
    iterations++;
    
    // Compute state hash
    const stateCanonical = canonicalize(currentState);
    const stateHash = `sha256:${stateCanonical.hash}`;
    
    // Find applicable actions (preconditions satisfied)
    const candidates = bundle.actions.filter(action => 
      checkPreconditions(action, currentState)
    );
    
    if (candidates.length === 0) {
      // No more actions applicable - done
      break;
    }
    
    // Evaluate candidates against constraints
    const evaluations: Record<string, Evaluation> = {};
    const viableCandidates: Action[] = [];
    
    for (const action of candidates) {
      const eval_result = evaluateAction(action, bundle.constraints, currentState);
      evaluations[action.id] = eval_result;
      
      if (eval_result.passed) {
        viableCandidates.push(action);
      } else {
        // Record rejection
        rejections.push({
          action_id: action.id,
          because: [{
            constraint_id: 'hard_constraint',
            evidence: eval_result.evidence
          }]
        });
      }
    }
    
    if (viableCandidates.length === 0) {
      // All actions violate constraints - unsolvable
      const output: Output = {
        result: 'unsolvable',
        reason: 'No viable actions satisfy constraints'
      };
      
      const outputCanonical = canonicalize(output);
      
      const emergy: Emergy = {
        nofate_version: bundle.nofate_version,
        emergy_version: '1.0.0',
        bundle_hash: bundleHash,
        output_hash: outputHash,
        decision_graph: decisionGraph,
        rejections,
        determinism: {
          canonicalization: 'JCS',
          tie_break: bundle.solver_pins.tie_break
        }
      };}
      };
      
      return { output, emergy };
    }
    
    // Apply tie-breaking if needed
    const chosen = applyTieBreaking(viableCandidates, bundle.solver_pins.tie_break);
    
    // Record decision node
    decisionGraph.push({
      node: `node_${step}`,
      state_hash: stateHash,
      candidates: candidates.map(a => a.id),
      evaluations,
      chosen: chosen.id,
      tie_break: {
        applied: viableCandidates.length > 1,
        reason: viableCandidates.length > 1 ? `Applied ${bundle.solver_pins.tie_break}` : undefined
      }
    });
    
    // Apply action effects
    applyEffects(chosen, currentState);
    
    // Add to plan
    plan.push({
      step,
      action_id: chosen.id,
      start: step - 1,
      end: step,
      resources: chosen.resources
    });
    
    step++;
  }
  
  // Build output
  const output: Output = {
    result: 'solved',
    plan,
    objective: {
      cost: plan.reduce((sum, p) => sum + (bundle.actions.find(a => a.id === p.action_id)?.cost || 0), 0)
    }
  };
  
  const outputCanonical = canonicalize(output);
  const outputHash = `sha256:${outputCanonical.hash}`;
  
  // Build emergy
  const emergy: Emergy = {
    nofate_version: bundle.nofate_version,
    emergy_version: '1.0.0',
    bundle_hash: bundleHash,
    output_hash: outputHash,
    decision_graph: decisionGraph,
    rejections,
    determinism: {
      canonicalization: 'JCS',
      tie_break: bundle.solver_pins.tie_break,
      engine_build: 'nofate-solve-1.0.0'
    }
  };
  
  return { output, emergy };
}

function checkPreconditions(action: Action, state: Record<string, any>): boolean {
  // Simplified: check if precondition variables exist in state
  return action.pre.every(pre => {
    // Very simple: just check if property exists
    const prop = pre.replace(/[^a-zA-Z0-9_]/g, '');
    return prop in state;
  });
}

function evaluateAction(action: Action, constraints: Constraint[], state: Record<string, any>): Evaluation {
  // Simplified: always pass for now (real implementation would evaluate constraint expressions)
  return {
    type: 'hard',
    passed: true,
    evidence: 'Constraint evaluation not implemented (stub)'
  };
}

function applyTieBreaking(actions: Action[], tieBreakStrategy: string): Action {
  // Parse tie-break strategy (e.g., "f,g,depth,action_id,state_hash")
  const criteria = tieBreakStrategy.split(',');
  
  // Simplified: just sort by action_id (lexicographic)
  const sorted = [...actions].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[0];
}

function applyEffects(action: Action, state: Record<string, any>): void {
  // Simplified: set effect variables to true
  action.eff.forEach(eff => {
    const prop = eff.replace(/[^a-zA-Z0-9_]/g, '');
    state[prop] = true;
  });
}

export default solve;
