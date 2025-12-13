# @nofate/solve

**Deterministic planning solver with emergy decision traces**

Reference implementation of the No Fate solver that:
- **Produces identical outputs** for identical inputs + solver_pins
- **Records decision traces** (emergy) explaining WHY outcomes were chosen
- **Respects constraints** and applies tie-breaking deterministically

## Installation

```bash
npm install @nofate/solve
```

## CLI Usage

```bash
# Solve a planning problem
nofate-solve bundle.json --out output.json --emergy emergy.json
```

## Input: Bundle

A bundle defines:
- **state**: Initial world state
- **actions**: Available actions with preconditions, effects, costs
- **constraints**: Hard constraints that MUST be satisfied
- **policies**: Soft policies with weights (optional)
- **solver_pins**: Determinism guarantees (contract_semantics, tie_break)

## Output: Plan + Emergy

The solver produces:
- **output.json**: Plan (sequence of actions) or unsolvable/error result
- **emergy.json**: Decision trace showing WHY each action was chosen

## Determinism Guarantees

Given identical:
1. Bundle (canonicalized via JCS)
2. Solver pins (contract_semantics, tie_break, seed)

The solver MUST produce byte-identical:
1. Output (plan)
2. Emergy (decision trace)

This enables:
- **Reproducibility**: Re-run and verify outputs match
- **Auditability**: Inspect decision traces to understand reasoning
- **Attestation**: Cryptographically sign outputs with confidence

## Tie-Breaking

When multiple actions have equal scores, tie-breaking determines which is chosen:
- `f,g,depth,action_id,state_hash`: Compare f-value, g-value, depth, then lexicographic action_id

This ensures determinism even when search finds equally-good solutions.

## License

MIT
