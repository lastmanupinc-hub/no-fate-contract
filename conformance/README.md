# Conformance Test Vectors

This directory contains **test vectors** for validating No Fate implementations.

## Purpose

Test vectors enable:
- **Ecosystem interoperability**: Different solvers can be tested against common inputs
- **Conformance verification**: Prove your implementation respects the No Fate contract
- **Regression testing**: Detect when changes break determinism

## Structure

```
conformance/
├── vectors/           # Input bundles
│   ├── test-001-simple-blocks.json
│   ├── test-002-scheduling.json
│   └── test-003-constraints.json
├── expected/          # Expected outputs and emergy
│   ├── test-001-output.json
│   ├── test-001-emergy.json
│   └── ...
└── runner/            # Test runner scripts
```

## Running Tests

```bash
# Run all conformance tests
cd conformance/runner
npm install
npm test

# Run specific test
npm test -- test-001
```

## Test Vectors

### test-001-simple-blocks

**Domain**: Blocks world planning

**Description**: Stack block A on block B

**Expected**: 2-step plan (pickup_a, stack_a_on_b)

**Determinism Check**: With `solver_pins.tie_break = "f,g,depth,action_id,state_hash"`, all conforming solvers MUST produce identical output

### test-002-scheduling

**Domain**: Resource scheduling

**Description**: Schedule 3 tasks with resource constraints

**Expected**: Optimal schedule respecting resource limits

### test-003-constraints

**Domain**: Policy compliance

**Description**: Plan that satisfies hard constraints + soft policies

**Expected**: Solution with documented trade-offs in emergy

## Adding New Test Vectors

1. Create `vectors/test-XXX-name.json` (input bundle)
2. Run reference solver: `nofate-solve vectors/test-XXX-name.json`
3. Save outputs: `expected/test-XXX-output.json` and `expected/test-XXX-emergy.json`
4. Document in this README
5. Add to test runner

## Conformance Criteria

To claim No Fate conformance, your solver MUST:
- Produce **byte-identical outputs** for all test vectors (via hash comparison)
- Produce **valid emergy records** explaining decisions
- Respect **solver_pins** for determinism

## License

Test vectors are CC0 (public domain) to encourage ecosystem adoption.
