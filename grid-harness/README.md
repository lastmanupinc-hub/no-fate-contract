# IF v0 Executable Grid Harness

Minimal, non-authoritative test harness for IF protocol implementations.

## Purpose

This harness provides a **deterministic grid** for verifying that multiple implementations of the IF protocol produce identical results for identical inputs. It does not impose protocol semantics — it only verifies determinism via the adapter interface.

## Structure

- `src/types.ts` — Core types: GridPoint, EngineResult, Outcome
- `src/adapters/` — Engine adapter interface + CLI adapter
- `src/runners/` — Suite execution and cross-implementation comparison
- `src/verify/` — Assertion utilities
- `fixtures/core/` — 10 golden test fixtures covering all outcomes

## Usage

```bash
npm install
npm run build

# Set path to your IF engine CLI
export IF_ENGINE_CLI_PATH=/path/to/if-engine-cli

# Run the test suite
npm run test
```

## Adapter Contract

Your engine must implement a CLI with:

```
./if-engine-cli exec-gridpoint
```

- Reads `GridPoint` JSON from stdin
- Outputs `EngineResult` JSON to stdout
- Exit code 0 = success, non-zero = error

## Fixtures

The 10 core fixtures cover:

- INVALID_INPUT (unknown action, malformed fields, boundary conditions)
- FAIL (insufficient balance, nonce mismatch, double-spend)
- PASS (simple transfer, multi-action ordering)
- INDETERMINATE (missing proof params, missing replay artifacts)

## Cross-Implementation Verification

Use `compare_impls.ts` to verify that different implementations produce byte-for-byte identical results for the same GridPoint.

This is the foundation of the deterministic grid proof.
