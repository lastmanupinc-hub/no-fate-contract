# @nofate/avery-replay

**Avery's replay tool - verifies deterministic reproducibility**

Re-runs the solver and confirms:
- **Byte-identical outputs** for identical inputs
- **Byte-identical emergy** (decision traces)
- **Determinism guarantees** hold in practice

## Installation

```bash
npm install @nofate/avery-replay
```

## CLI Usage

```bash
# Replay a computation
avery-replay bundle.json output.json emergy.json
```

Exit codes:
- `0`: Replay confirmed (deterministic)
- `1`: Replay failed (non-deterministic or error)

## What It Does

1. **Re-runs solver** with the original bundle
2. **Compares hashes** of new vs. expected outputs
3. **Reports differences** if outputs don't match byte-for-byte

## Why This Matters

Replay verification ensures:
- **Trust**: Outputs are reproducible, not one-off
- **Auditability**: Anyone can re-run and confirm results
- **Debugging**: Detects non-determinism bugs in solvers
- **Conformance**: Proves solver respects No Fate determinism contract

## Programmatic Usage

```typescript
import { replay } from '@nofate/avery-replay';

const result = replay(bundle, expectedOutput, expectedEmergy);

if (result.deterministic) {
  console.log('✓ Deterministic replay confirmed');
} else {
  console.error('✗ Non-deterministic behavior detected');
  console.error('Differences:', result.differences);
}
```

## Determinism Violations

If replay fails, it means:
- Solver has non-deterministic behavior (randomness, timestamps, etc.)
- `solver_pins` are insufficient to guarantee determinism
- Implementation bug in solver

Fix by:
- Adding more determinism pins (seed, version, etc.)
- Removing sources of non-determinism (e.g., `Math.random()`, `Date.now()`)
- Using canonical ordering for all data structures

## License

MIT
