# No-Fate Solver Conformance System (NF-SCS) v1.0.0

**SPEC_COMPLETE**: Yes  
**TEXT_IMPLEMENTED**: Not Asserted  
**RUNTIME_VERIFIED**: Forbidden  

**Date**: 2025-12-12  
**Status**: Canonical Conformance Specification

---

## System Identity & Purpose

### Name
No-Fate Solver Conformance System (NF-SCS)

### Scope
Specification of the rules, checks, and artifacts required to determine whether a solver implementation conforms to No-Fate execution law. This system defines **how solvers are evaluated**, NOT how they solve problems.

### Domain
- Deterministic solver verification
- Replay validation
- Emergy compliance
- Conformance auditing

### Canonical Intent

This system specifies how a solver is **proven compliant** with No-Fate requirements so that:
- Multiple independent solvers can be trusted
- Equivalent results are guaranteed for same canonical input
- All results are auditable and replayable
- Solver implementations are replaceable without trust loss

---

## Truth Rules

NF-SCS applies standard No-Fate truth rules:

1. **Non-inferential**: No assumptions about solver intent or heuristics
2. **Evidence-bound**: All conformance claims tied to test artifacts
3. **Explicit failure modes**: Named errors, no silent failures
4. **Deterministic ordering**: All lists canonically ordered
5. **No invented facts**: Only state what test execution reveals
6. **No narrative completion**: No filling gaps with "reasonable" assumptions

---

## Current Reality Assessment

### Reality Artifacts

**Status**: `DEP_STATUS: TEXT_ONLY`

References:
- No-Fate bundle schema (input specification)
- No-Fate output schema (result specification)
- No-Fate emergy schema (decision trace)
- No-Fate attestation schema (cryptographic proof)

### Foundational Assumptions

#### Assumption S1: Solvers Are Replaceable Implementations

**Claim**: All solvers implementing the same contract version MUST produce equivalent outputs for equivalent canonical inputs.

**Detection**: Solver embeds hidden heuristics, undocumented behavior, or proprietary tie-breaking.

**Hard Failure**: `error: solver_behavior_undocumented`

**Rationale**: If solver behavior cannot be replicated by reading its documented contract, it cannot be replaced. Replaceability requires complete specification.

**Test**: 
- Read solver documentation
- Implement second solver from documentation alone
- Compare outputs for same bundle
- If divergence: documentation incomplete or behavior hidden

#### Assumption S2: Canonicalization Precedes Solving

**Claim**: Solvers MUST accept ONLY canonical inputs. Solvers MUST NOT perform their own normalization.

**Detection**: 
- Solver accepts non-canonical JSON
- Solver reorders fields or normalizes data
- Solver behavior changes based on input formatting

**Hard Failure**: `error: solver_input_not_canonical`

**Rationale**: If solvers normalize inputs differently, "same input" becomes ambiguous. Canonicalization MUST be external and uniform.

**Test**:
- Present semantically equivalent but differently formatted bundles
- If outputs differ: solver violated canonicalization requirement

#### Assumption S3: Emergy Is Mandatory and Authoritative

**Claim**: Every solver output MUST be accompanied by a complete, valid Emergy artifact explaining all decisions.

**Detection**:
- Solver emits output without emergy
- Emergy missing decision paths
- Emergy cannot explain output

**Hard Failure**: `error: emergy_missing`

**Rationale**: Output without explanation cannot be audited. Emergy is not debug output—it is first-class artifact. See EMERGY_WHY_INTERFACE_POLICY.md.

**Test**:
- Check for emergy artifact in solver output
- Validate emergy schema compliance
- Attempt replay from emergy
- If replay fails: emergy incomplete or incorrect

#### Assumption S4: Determinism Is a Conformance Requirement

**Claim**: Determinism is NOT an optimization. It is a conformance requirement. Non-deterministic solvers are NON-COMPLIANT.

**Detection**: Identical canonical inputs yield divergent outputs or emergy across multiple runs.

**Hard Failure**: `error: nondeterministic_solver`

**Rationale**: Non-determinism destroys replayability, auditability, and trust. Random solvers cannot be attested.

**Test**:
- Run solver N times (N ≥ 10) with identical bundle
- Compare outputs byte-for-byte
- If ANY divergence: non-deterministic

---

## Scope (Explicit In / Out)

### In Scope

✅ Conformance requirements:
- Determinism verification
- Emergy completeness and correctness
- Replay validation
- Cross-solver equivalence
- Attestation eligibility rules

✅ Test infrastructure:
- Conformance test harness
- Determinism checker
- Replay engine
- Cross-solver comparator

✅ Audit artifacts:
- Conformance reports
- Test evidence (hashes)
- Historical conformance records

### Out of Scope

❌ Solver internal algorithms or performance optimizations  
❌ Business logic, planning semantics, or domain objectives  
❌ Runtime deployment or scaling characteristics  
❌ Trust policy beyond explicit attestation rules  
❌ Solver implementation guidance (how to build a solver)  

---

## Dependencies & Consumers

### Dependencies (Untrusted)

All dependencies are `DEP_STATUS: CLAIM` (not verified, not trusted):

1. **Canonicalization engine** (`@nofate/canon`)
   - JCS (RFC 8785) implementation
   - SHA-256 hashing

2. **Avery verification engine**
   - Bundle validation
   - Output validation
   - Attestation verification

3. **Emergy schema and validator**
   - JSON Schema validator
   - Emergy-specific checks (decision graph completeness)

4. **Cryptographic primitives**
   - SHA-256 for artifact hashing
   - Ed25519 for attestation signatures

### Consumers

Who uses NF-SCS:

1. **Solver developers**: Test compliance before publication
2. **Governance systems**: Enforce conformance requirements (NFGS)
3. **Blueprint generators**: Select conformant solvers
4. **Compliance reviewers**: Audit solver behavior
5. **Attestation issuers**: Determine eligibility for attestation

---

## Core Components & Responsibilities

### 1. Conformance Test Harness

**Purpose**: Execute solvers against canonical bundles in controlled environment.

**Responsibilities**:
- Load canonical bundle (pre-canonicalized)
- Invoke solver with bundle
- Collect output, emergy, logs
- Ensure identical input across all runs
- Isolate solver execution (sandbox)

**Interfaces**:
```
load_bundle(bundle_ref) -> Bundle | FAIL
execute_solver(solver, bundle) -> SolverRun | FAIL
collect_artifacts(run_id) -> (Output, Emergy) | FAIL
```

**Failure Modes**:
- `error: bundle_not_canonical` (input validation failed)
- `error: solver_execution_failed` (crash, timeout)
- `error: artifacts_missing` (output or emergy not emitted)

### 2. Determinism Checker

**Purpose**: Verify solver produces identical outputs for identical inputs.

**Responsibilities**:
- Execute solver N times (N ≥ 10) with same bundle
- Compute canonical hashes of each output
- Compute canonical hashes of each emergy
- Compare byte-for-byte
- Report ANY divergence as FAIL

**Interfaces**:
```
check_determinism(solver, bundle, runs: int) -> PASS | FAIL
get_divergence_evidence(run_id) -> DivergenceReport | null
```

**Algorithm**:
```
1. FOR i = 1 TO N:
     output[i] = solver(bundle)
     emergy[i] = solver.emergy(bundle)
     hash_output[i] = SHA256(canonicalize(output[i]))
     hash_emergy[i] = SHA256(canonicalize(emergy[i]))

2. IF all(hash_output) are equal AND all(hash_emergy) are equal:
     RETURN PASS
   ELSE:
     RETURN FAIL with divergence evidence
```

**Failure Modes**:
- `error: nondeterministic_solver` (hash divergence detected)
- `error: nondeterminism_in_output` (output hashes differ)
- `error: nondeterminism_in_emergy` (emergy hashes differ)

### 3. Emergy Validator

**Purpose**: Validate emergy structure, completeness, and correctness.

**Responsibilities**:
- Validate emergy against JSON Schema
- Check emergy_version matches schema version
- Ensure every decision path is explained
- Confirm rejected alternatives are documented
- Verify determinism metadata (canonicalization, tie_break)

**Interfaces**:
```
validate_emergy_schema(emergy) -> PASS | FAIL
validate_emergy_completeness(emergy, output) -> PASS | FAIL
validate_rejections(emergy) -> PASS | FAIL
```

**Completeness Checks**:
1. **Decision Graph**: Every state transition must have decision node
2. **Rejections**: All explored-but-rejected paths must be documented
3. **Output Linkage**: Emergy must explain how output was derived
4. **Determinism**: Must document canonicalization method, tie-break rules

**Failure Modes**:
- `error: emergy_schema_invalid` (JSON Schema violation)
- `error: emergy_version_mismatch` (wrong version)
- `error: emergy_incomplete` (missing decision paths)
- `error: rejections_undocumented` (alternatives not explained)
- `error: determinism_metadata_missing` (no canonicalization/tie_break)

### 4. Replay Engine

**Purpose**: Reconstruct solver outcome solely from emergy artifact.

**Responsibilities**:
- Parse emergy decision graph
- Follow decision path from initial state
- Apply decisions in order
- Reconstruct output
- Compare reconstructed output with original

**Interfaces**:
```
replay(bundle, emergy) -> Output | FAIL
verify_replay(original_output, replayed_output) -> PASS | FAIL
```

**Algorithm**:
```
1. state = bundle.state
2. FOR EACH decision IN emergy.decision_graph:
     action = decision.action_taken
     state = apply(state, action)
3. reconstructed_output = state_to_output(state)
4. IF hash(reconstructed_output) == hash(original_output):
     RETURN PASS
   ELSE:
     RETURN FAIL
```

**Failure Modes**:
- `error: replay_mismatch` (reconstructed ≠ original)
- `error: emergy_replay_failed` (cannot follow decision graph)
- `error: decision_graph_invalid` (malformed graph)
- `error: replay_non_deterministic` (replays diverge)

### 5. Cross-Solver Comparator

**Purpose**: Compare outputs and emergy from multiple solvers for same bundle.

**Responsibilities**:
- Execute multiple solvers with identical bundle
- Compare outputs (MUST be equivalent)
- Compare emergy (MAY differ in structure, MUST explain same decisions)
- Report divergence as conformance violation

**Interfaces**:
```
compare_solvers(solver_a, solver_b, bundle) -> ComparisonResult
get_divergence_details(comparison_id) -> DivergenceReport
```

**Equivalence Rules**:
- **Outputs**: MUST be byte-identical after canonicalization
- **Emergy**: Structure MAY differ, but:
  - Same final state reached
  - Same actions selected
  - Same alternatives rejected (with reason)

**Failure Modes**:
- `error: solver_divergence` (outputs differ)
- `error: solver_decision_divergence` (different actions taken)
- `error: solver_rejection_mismatch` (different alternatives rejected)

### 6. Attestation Gate

**Purpose**: Determine eligibility for solver attestation.

**Responsibilities**:
- Check conformance history (all tests PASS)
- Verify zero unresolved failures
- Block non-conforming solvers from attestation
- Emit eligibility decision with evidence

**Interfaces**:
```
eligible_for_attestation(solver_identity) -> YES | NO
get_eligibility_evidence(solver_identity) -> EligibilityReport
block_attestation(solver_identity, reason) -> PASS
```

**Eligibility Requirements**:
1. ✅ Determinism check: PASS (10+ runs)
2. ✅ Emergy validation: PASS (schema + completeness)
3. ✅ Replay validation: PASS (output reproducible)
4. ✅ Cross-solver comparison: PASS (if applicable)
5. ✅ No unresolved conformance failures

**Failure Modes**:
- `error: attestation_blocked_determinism` (failed determinism check)
- `error: attestation_blocked_emergy` (emergy incomplete)
- `error: attestation_blocked_replay` (replay failed)
- `error: attestation_blocked_history` (past failures unresolved)

---

## Domain Models / Data Contracts

### SolverIdentity

```json
{
  "solver_id": "string (unique identifier)",
  "solver_version": "semver (e.g., 2.1.0)",
  "implementation_ref": "git commit | package version | URL",
  "supported_contract_version": "1.0.0",
  "author": "string | null",
  "published_at": "ISO8601 timestamp"
}
```

### ConformanceRun

```json
{
  "run_id": "UUID",
  "solver_identity": {
    "solver_id": "...",
    "solver_version": "..."
  },
  "bundle_ref": "sha256:<hash>",
  "output_ref": "sha256:<hash>",
  "emergy_ref": "sha256:<hash>",
  "timestamp": "ISO8601",
  "duration_ms": "number",
  "exit_code": "number"
}
```

**Ordering**: Single object, no collections.

### ConformanceResult

```json
{
  "solver_identity": {
    "solver_id": "...",
    "solver_version": "..."
  },
  "bundle_ref": "sha256:<hash>",
  "result": "PASS | FAIL",
  "failure_codes": [
    "error: nondeterministic_solver",
    "error: emergy_incomplete"
  ],
  "evidence_refs": [
    "sha256:abc123...",
    "sha256:def456..."
  ],
  "tests_executed": [
    "determinism_check",
    "emergy_validation",
    "replay_validation"
  ],
  "timestamp": "ISO8601"
}
```

**Ordering**: 
- `failure_codes[]` sorted lexicographically
- `evidence_refs[]` sorted lexicographically
- `tests_executed[]` sorted lexicographically

### ConformanceFinding

```json
{
  "finding_id": "UUID",
  "rule_id": "S1 | S2 | S3 | S4",
  "status": "PASS | FAIL",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "evidence_ref": "sha256:<hash>",
  "required_fix": "string (description)",
  "detected_at": "ISO8601"
}
```

### DivergenceReport

```json
{
  "report_id": "UUID",
  "solver_a": "SolverIdentity",
  "solver_b": "SolverIdentity",
  "bundle_ref": "sha256:<hash>",
  "divergence_type": "output | emergy | decision",
  "hash_a": "sha256:<hash>",
  "hash_b": "sha256:<hash>",
  "diff_available": "boolean",
  "timestamp": "ISO8601"
}
```

### EligibilityReport

```json
{
  "solver_identity": "SolverIdentity",
  "eligible": "YES | NO",
  "requirements": [
    {
      "requirement": "determinism_check",
      "status": "PASS | FAIL",
      "evidence_ref": "sha256:<hash>"
    },
    {
      "requirement": "emergy_validation",
      "status": "PASS | FAIL",
      "evidence_ref": "sha256:<hash>"
    },
    {
      "requirement": "replay_validation",
      "status": "PASS | FAIL",
      "evidence_ref": "sha256:<hash>"
    }
  ],
  "blocking_issues": [
    "error: nondeterministic_solver"
  ],
  "assessed_at": "ISO8601"
}
```

**Ordering**:
- `requirements[]` sorted by `requirement` field lexicographically
- `blocking_issues[]` sorted lexicographically

---

## Engine Responsibilities & Public Interfaces

### Primary Interfaces

All interfaces return explicit `PASS | FAIL` or structured results (no exceptions).

```typescript
// Conformance Testing
run_conformance(solver: SolverIdentity, bundle: Bundle): Result<ConformanceResult>

// Determinism Verification
check_determinism(solver: SolverIdentity, bundle: Bundle, runs?: number): Result<PASS | FAIL>

// Emergy Validation
validate_emergy(emergy: Emergy): Result<PASS | FAIL>
validate_emergy_completeness(emergy: Emergy, output: Output): Result<PASS | FAIL>

// Replay Verification
replay(bundle: Bundle, emergy: Emergy): Result<Output>
verify_replay(original: Output, replayed: Output): Result<PASS | FAIL>

// Cross-Solver Comparison
compare_solvers(
  solver_a: SolverIdentity, 
  solver_b: SolverIdentity, 
  bundle: Bundle
): Result<ComparisonResult>

// Attestation Eligibility
eligible_for_attestation(solver: SolverIdentity): Result<YES | NO>
get_eligibility_evidence(solver: SolverIdentity): Result<EligibilityReport>
block_attestation(solver: SolverIdentity, reason: string): Result<PASS>
```

### Critical Rule: No Partial Success

**FORBIDDEN**:
- "Mostly deterministic" (90% of runs matched)
- "Emergy mostly complete" (some paths explained)
- "Replay approximately correct" (close enough)

**REQUIRED**:
- Binary outcomes: PASS or FAIL
- No scoring, no thresholds, no "good enough"
- One failure = complete failure

---

## State & Persistence Model

### Immutability Guarantees

1. **Conformance results are immutable** once recorded
   - No editing past results
   - No retroactive upgrades from FAIL → PASS
   - New test creates new result (does not overwrite)

2. **Historical failures MUST NEVER be deleted**
   - Failures remain visible indefinitely
   - Solver history includes all failures
   - Cannot "clean up" failed tests

3. **Eligibility derived from history, not stored flags**
   - Eligibility computed on-demand from conformance records
   - No mutable "certified" flag
   - Re-evaluation uses current rules against historical evidence

### Failure Modes

- `error: conformance_history_violation` - Mutation detected
- `error: result_overwritten` - Attempt to replace immutable result
- `error: failure_deleted` - Historical failure removed

---

## Integration Surfaces / Events / APIs

### Inbound

**Solver Execution**:
- Solver binaries (executable)
- Solver adapters (CLI wrapper, API client)
- Canonical bundles (pre-canonicalized JSON)
- Emergy artifacts (JSON)

**Formats**:
- Solvers MUST accept bundle via:
  - `stdin` (JSON)
  - File path argument
  - API endpoint (POST /solve)
- Solvers MUST emit:
  - Output to `stdout` (JSON)
  - Emergy to `stderr` or separate file (JSON)

### Outbound

**Conformance Reports**:
```json
{
  "report_type": "conformance_result",
  "solver_identity": {...},
  "result": "PASS | FAIL",
  "evidence_refs": [...]
}
```

**Eligibility Decisions**:
```json
{
  "decision_type": "attestation_eligibility",
  "solver_identity": {...},
  "eligible": "YES | NO",
  "blocking_issues": [...]
}
```

**Audit Events**:
```
event: ConformanceTestExecuted
  - run_id
  - solver_identity
  - bundle_ref
  - result

event: DeterminismCheckFailed
  - solver_identity
  - bundle_ref
  - divergence_count

event: AttestationBlocked
  - solver_identity
  - reason
  - evidence_refs
```

---

## Validation Rules & Failure Modes

### Determinism Rules

**Rule D1: Identical Input → Identical Output**

**Requirement**: Same canonical bundle + same solver version → byte-identical output across all runs.

**Test**: Run solver N times (N ≥ 10), hash outputs, compare.

**Failure**: `error: nondeterministic_solver`

**Severity**: CRITICAL (blocks attestation)

---

**Rule D2: Identical Input → Identical Emergy**

**Requirement**: Same canonical bundle + same solver version → byte-identical emergy across all runs.

**Test**: Run solver N times, hash emergy artifacts, compare.

**Failure**: `error: nondeterminism_in_emergy`

**Severity**: CRITICAL (blocks attestation)

---

### Emergy Rules

**Rule E1: Emergy Artifact Required**

**Requirement**: Every solver output MUST include emergy artifact.

**Test**: Check for emergy in solver output.

**Failure**: `error: emergy_missing`

**Severity**: CRITICAL (blocks attestation)

---

**Rule E2: Emergy Schema Compliance**

**Requirement**: Emergy MUST validate against emergy.schema.json.

**Test**: JSON Schema validation.

**Failure**: `error: emergy_schema_invalid`

**Severity**: CRITICAL (blocks attestation)

---

**Rule E3: Emergy Version Match**

**Requirement**: `emergy_version` field MUST match schema version (currently "1.0.0").

**Test**: Check `emergy.emergy_version === "1.0.0"`.

**Failure**: `error: emergy_version_mismatch`

**Severity**: HIGH (blocks attestation)

---

**Rule E4: Decision Graph Completeness**

**Requirement**: Every state transition in output MUST have corresponding decision node in emergy.

**Test**: Trace output construction, verify all decisions explained.

**Failure**: `error: emergy_incomplete`

**Severity**: CRITICAL (blocks attestation)

---

**Rule E5: Rejections Documented**

**Requirement**: All explored-but-rejected alternatives MUST be documented with reasons.

**Test**: Check emergy.rejections array is non-empty if alternatives existed.

**Failure**: `error: rejections_undocumented`

**Severity**: MEDIUM (advisory, may block attestation)

---

### Replay Rules

**Rule R1: Replay Must Succeed**

**Requirement**: Given bundle + emergy, replay MUST reconstruct output.

**Test**: `replay(bundle, emergy) -> output'`, verify `hash(output') == hash(output)`.

**Failure**: `error: replay_mismatch`

**Severity**: CRITICAL (blocks attestation)

---

**Rule R2: Replay Must Be Deterministic**

**Requirement**: Replay of same bundle + emergy must produce identical output every time.

**Test**: Replay N times, compare outputs.

**Failure**: `error: replay_non_deterministic`

**Severity**: CRITICAL (blocks attestation)

---

### Cross-Solver Rules

**Rule C1: Solver Output Equivalence**

**Requirement**: Multiple conformant solvers MUST produce equivalent outputs for same canonical bundle.

**Test**: Execute solver_a and solver_b with same bundle, compare outputs.

**Failure**: `error: solver_divergence`

**Severity**: HIGH (blocks equivalence claims, may block attestation)

---

**Rule C2: Solver Decision Consistency**

**Requirement**: Solvers MUST make same decisions (same actions selected, same alternatives rejected).

**Test**: Compare emergy decision graphs for same final state and actions.

**Failure**: `error: solver_decision_divergence`

**Severity**: MEDIUM (advisory)

---

### Input Rules

**Rule I1: Input Must Be Canonical**

**Requirement**: Solver MUST accept ONLY canonical bundles. Solver MUST NOT perform own normalization.

**Test**: Present semantically equivalent but formatted differently bundles. If outputs differ, solver violated rule.

**Failure**: `error: solver_input_not_canonical`

**Severity**: CRITICAL (blocks attestation)

---

### Named Failure Modes Summary

| Error Code | Severity | Blocks Attestation |
|------------|----------|-------------------|
| `error: solver_input_not_canonical` | CRITICAL | YES |
| `error: solver_behavior_undocumented` | CRITICAL | YES |
| `error: nondeterministic_solver` | CRITICAL | YES |
| `error: nondeterminism_in_output` | CRITICAL | YES |
| `error: nondeterminism_in_emergy` | CRITICAL | YES |
| `error: emergy_missing` | CRITICAL | YES |
| `error: emergy_schema_invalid` | CRITICAL | YES |
| `error: emergy_version_mismatch` | HIGH | YES |
| `error: emergy_incomplete` | CRITICAL | YES |
| `error: rejections_undocumented` | MEDIUM | NO* |
| `error: replay_mismatch` | CRITICAL | YES |
| `error: replay_non_deterministic` | CRITICAL | YES |
| `error: solver_divergence` | HIGH | YES** |
| `error: solver_decision_divergence` | MEDIUM | NO* |
| `error: conformance_history_violation` | CRITICAL | YES |

\* Advisory warnings, may influence future attestation policy  
\** Blocks equivalence claims between solvers

---

## Audit & Verification Design (Non-Fake)

### Audit Event Requirements

Every conformance run MUST emit auditable record with:

1. **Run Metadata**: run_id, timestamp, duration
2. **Solver Identity**: solver_id, solver_version, implementation_ref
3. **Input Evidence**: bundle_ref (sha256 hash)
4. **Output Evidence**: output_ref (sha256 hash), emergy_ref (sha256 hash)
5. **Result**: PASS | FAIL with error codes
6. **Test Artifacts**: determinism runs, replay results, comparison data

### Attestation Eligibility Audit

Eligibility decision MUST be auditable:

```json
{
  "decision_id": "UUID",
  "solver_identity": {...},
  "eligible": "YES | NO",
  "evidence": {
    "determinism_tests": 10,
    "determinism_result": "PASS",
    "emergy_validation": "PASS",
    "replay_validation": "PASS",
    "historical_failures": 0
  },
  "blocking_issues": [],
  "decided_at": "ISO8601",
  "decided_by": "NFSCS v1.0.0"
}
```

### Replay Verification Mandate

**Requirement**: Replay verification is MANDATORY for PASS result.

**Process**:
1. Solver executes, emits output + emergy
2. Conformance system validates emergy schema
3. Conformance system replays emergy → reconstructs output
4. Compare reconstructed vs. original
5. If mismatch: FAIL (emergy insufficient or incorrect)

**Rationale**: Passing conformance without replay verification allows incomplete emergy to be attested.

---

## Operational / CLI / Control Surfaces

### Command-Line Interface

```bash
# Run Conformance Suite
nfscs test <solver> <bundle>
nfscs test ./my-solver bundles/ops-scheduling.json
# Output: ConformanceResult (PASS | FAIL)

# Determinism Check (10 runs)
nfscs determinism-check <solver> <bundle>
nfscs determinism-check ./my-solver bundles/ops-scheduling.json --runs 20
# Output: PASS | FAIL with divergence evidence

# Emergy Validation
nfscs validate-emergy <emergy-file>
nfscs validate-emergy outputs/emergy-001.json
# Output: PASS | FAIL with schema violations

# Replay Check
nfscs replay-check <bundle> <emergy>
nfscs replay-check bundles/ops-scheduling.json outputs/emergy-001.json
# Output: Reconstructed output + PASS | FAIL

# Cross-Solver Comparison
nfscs compare <solver-a> <solver-b> <bundle>
nfscs compare ./solver-v1 ./solver-v2 bundles/ops-scheduling.json
# Output: ComparisonResult (PASS | FAIL with divergence report)

# Conformance Report (Historical)
nfscs conformance-report <solver-id>
nfscs conformance-report my-solver-v2.1.0
# Output: Historical conformance results, eligibility status

# Attestation Eligibility
nfscs eligible <solver-id>
nfscs eligible my-solver-v2.1.0
# Output: YES | NO with blocking issues

# Full Test Suite (All Checks)
nfscs full-suite <solver> <test-bundle-directory>
nfscs full-suite ./my-solver ./conformance/vectors/
# Output: Comprehensive report (determinism + emergy + replay + cross-solver)
```

### Expected Outputs

All commands return:
- **Exit Code**: 0 (PASS) | 1 (FAIL)
- **JSON Output**: Structured result with evidence
- **NO Narratives**: No plain text explanations

Example:
```json
{
  "command": "determinism-check",
  "result": "FAIL",
  "error_codes": ["error: nondeterministic_solver"],
  "evidence": {
    "total_runs": 10,
    "unique_output_hashes": 3,
    "divergence_at_run": 4,
    "bundle_ref": "sha256:abc123...",
    "output_refs": [
      "sha256:111...",
      "sha256:222...",
      "sha256:333..."
    ]
  }
}
```

---

## Observability, State & Telemetry

### Permitted Telemetry

**Numeric counts ONLY** (no content):

```
nfscs.conformance_runs.total: 342
nfscs.conformance_runs.pass: 298
nfscs.conformance_runs.fail: 44
nfscs.determinism_checks.executed: 512
nfscs.determinism_checks.failed: 12
nfscs.emergy_validations.total: 342
nfscs.emergy_validations.schema_invalid: 5
nfscs.emergy_validations.incomplete: 8
nfscs.replay_validations.total: 342
nfscs.replay_validations.failed: 7
nfscs.solver_comparisons.total: 89
nfscs.solver_comparisons.diverged: 3
nfscs.attestation_eligibility_checks.total: 156
nfscs.attestation_eligibility_checks.blocked: 15
```

### Forbidden Telemetry

- ❌ Solver output content
- ❌ Emergy decision details
- ❌ Bundle state or constraints
- ❌ Solver identity (names, versions)
- ❌ Error messages (text)
- ❌ Divergence details

**Rationale**: Content-level logging enables reconstruction of solver behavior and privacy violations. Counts are sufficient for operational monitoring.

---

## Security / Isolation / Multi-Actor Considerations

### Untrusted Solver Execution

**Threat Model**: Solvers are untrusted code that may:
- Attempt file system access
- Network communication
- Resource exhaustion (CPU, memory)
- Non-deterministic system calls (random, time)

**Mitigations**:
1. **Sandbox Execution**: Run solvers in isolated container/VM
2. **Resource Limits**: CPU time, memory, file descriptors
3. **No Network Access**: Block all outbound connections
4. **Deterministic Environment**: Fixed RNG seed, mocked system time
5. **Read-Only File System**: Except output directory

### Attestation Authority Separation

**Rule**: No solver may attest itself.

**Enforcement**:
- Attestation keys are external to solver control
- Attestation issued by independent Avery instance
- Solver cannot access attestation signing keys

**Architecture**:
```
Solver → NFSCS (conformance test) → PASS/FAIL → Avery (attestation issuer)
```

Solver has NO direct path to attestation issuance.

### Multi-Solver Isolation

**Requirement**: Conformance runs of different solvers MUST NOT interfere.

**Enforcement**:
- Separate sandboxes per solver
- No shared mutable state
- Independent bundle copies (immutable)
- Parallel execution permitted

---

## Acceptance Criteria

### Positive Tests

**Test P1: Conformant Solver Passes All Checks**

Given:
- Solver implements deterministic algorithm
- Solver emits complete emergy
- Replay succeeds

Expected:
- `check_determinism()` → PASS (10/10 runs identical)
- `validate_emergy()` → PASS (schema + completeness)
- `replay()` → PASS (output reconstructed)
- `eligible_for_attestation()` → YES

---

**Test P2: Attestation Eligibility Granted**

Given:
- Solver has PASS on all conformance tests
- No unresolved historical failures

Expected:
- `eligible_for_attestation(solver)` → YES
- Attestation gate allows attestation issuance

---

**Test P3: Cross-Solver Equivalence Confirmed**

Given:
- Two independent solvers (solver_a, solver_b)
- Both conformant
- Same canonical bundle

Expected:
- `compare_solvers(a, b, bundle)` → PASS
- Outputs are byte-identical
- Decisions are consistent

---

### Negative Tests

**Test N1: Non-Deterministic Solver Fails**

Given:
- Solver uses random number generator without fixed seed
- Multiple runs produce different outputs

Expected:
- `check_determinism()` → FAIL
- Error: `error: nondeterministic_solver`
- `eligible_for_attestation()` → NO

---

**Test N2: Missing Emergy Blocks Attestation**

Given:
- Solver emits output but NO emergy artifact

Expected:
- `validate_emergy()` → FAIL
- Error: `error: emergy_missing`
- `eligible_for_attestation()` → NO

---

**Test N3: Incomplete Emergy Fails Replay**

Given:
- Solver emits emergy with missing decision paths
- Replay cannot reconstruct output

Expected:
- `replay(bundle, emergy)` → FAIL
- Error: `error: replay_mismatch`
- `eligible_for_attestation()` → NO

---

**Test N4: Solver Divergence Detected**

Given:
- Two solvers produce different outputs for same bundle
- Both claim conformance

Expected:
- `compare_solvers(a, b, bundle)` → FAIL
- Error: `error: solver_divergence`
- Equivalence claim blocked

---

**Test N5: Non-Canonical Input Rejection**

Given:
- Solver accepts non-canonical JSON (e.g., unordered fields)
- Solver performs own normalization

Expected:
- Conformance test detects behavior change based on formatting
- Error: `error: solver_input_not_canonical`
- `eligible_for_attestation()` → NO

---

### Stress Tests

**Test S1: Large Bundle Determinism**

Given:
- Bundle with 10,000 state variables
- Bundle with 1,000 actions
- Bundle with 500 constraints

Expected:
- Solver still deterministic (10/10 runs match)
- Emergy complete (all 1,000+ decisions explained)
- Replay succeeds

---

**Test S2: Concurrent Solver Testing**

Given:
- 10 different solvers tested in parallel
- Same bundle used for all

Expected:
- No interference between solvers
- All conformance results valid
- No resource contention issues

---

**Test S3: Historical Conformance Replay**

Given:
- Conformance tests run 6 months ago
- Test artifacts (bundle, output, emergy) preserved

Expected:
- Re-run conformance today → same results
- Historical PASS remains PASS
- Historical FAIL remains FAIL (no retroactive changes)

---

## Guardrails for Code or Agent Generators

### DO NOT

❌ Infer solver intent or heuristics (test behavior only)  
❌ Allow partial conformance ("mostly deterministic")  
❌ Weaken emergy requirements ("this is debug info")  
❌ Bypass replay validation ("we trust this solver")  
❌ Score conformance (0-100 scale) instead of PASS/FAIL  
❌ Implement "conformance levels" (basic, standard, premium)  
❌ Grant attestation based on reputation  
❌ Accept "close enough" replay matches  

### DO

✅ Test only observable behavior (black box)  
✅ Enforce binary outcomes (PASS | FAIL)  
✅ Require complete emergy for ALL solvers  
✅ Replay MUST succeed for PASS  
✅ One failure = complete failure  
✅ Maintain immutable conformance history  
✅ Block attestation for ANY unresolved failure  
✅ Compare byte-for-byte (no "semantic equivalence")  

### Critical Rule

**If equivalence cannot be proven deterministically, fail explicitly.**

Examples of unprovable equivalence:
- "These outputs are semantically the same" (subjective)
- "The differences don't matter" (opinion)
- "Both are correct answers" (multiple solutions violates determinism)
- "Close enough for production" (arbitrary threshold)

These claims are NOT falsifiable. They are FORBIDDEN in NF-SCS.

---

## Integration with No-Fate Governance System (NFGS)

NF-SCS operates under NFGS authority:

1. **Schema Authority**: Governs conformance artifact schemas
2. **Rule Authority**: Governs conformance rules (D1-D2, E1-E5, R1-R2, C1-C2, I1)
3. **Solver Authority**: Issues solver certifications based on NF-SCS results
4. **Attestation Authority**: Uses NF-SCS eligibility for attestation issuance

**Conformance Policy**:
- NF-SCS rules are governance artifacts (versioned, immutable)
- Changes to conformance rules require NFGS change control
- Historical conformance results evaluated under rules active at test time
- New rules apply prospectively, not retroactively

---

## Version History

### v1.0.0 (2025-12-12) - Genesis

**Status**: Canonical specification published

**Scope**:
- Core conformance components defined
- Determinism and replay validation specified
- Emergy compliance requirements established
- Cross-solver equivalence testing defined
- Attestation eligibility rules created
- Failure modes and audit design specified

**Conformance Vectors**:
- Baseline determinism test (existing)
- 15 additional vectors planned (see CONFORMANCE_EXPANSION_PLAN.md)

**Next**:
- Implementation (TEXT → RUNTIME)
- Integration with Avery attestation system
- Solver developer SDK

---

## References

**No-Fate Ecosystem**:
- NFGS Specification (governance/NFGS_SPECIFICATION.md)
- Schema Freeze Notice (schemas/SCHEMA_FREEZE_NOTICE.md)
- Baseline Determinism Vector (conformance/baseline/BASELINE_DETERMINISM_VECTOR.md)
- Avery Gate Policy (AVERY_GATE_POLICY.md)
- Emergy WHY Interface Policy (EMERGY_WHY_INTERFACE_POLICY.md)
- Conformance Expansion Plan (CONFORMANCE_EXPANSION_PLAN.md)

**Schemas**:
- bundle.schema.json (v1.0.0)
- output.schema.json (v1.0.0)
- emergy.schema.json (v1.0.0)
- attestation.schema.json (v1.0.0)

**Standards**:
- JCS (RFC 8785) - JSON Canonicalization Scheme
- Ed25519 - Cryptographic signatures
- JSON Schema (Draft 07)
- ISO8601 - Timestamp format

---

**END OF SPECIFICATION**

**Status**: SPEC_COMPLETE  
**Authority**: Rule Authority (under NFGS)  
**Supersedes**: None (Genesis)  
**Next Version**: TBD (requires NFGS change proposal)
