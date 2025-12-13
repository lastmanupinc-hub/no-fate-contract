# Operations Scheduling Example

**Use Case**: Deterministic task scheduling for infrastructure operations

## Problem

You have:
- **3 servers** with different capacities (CPU, memory)
- **3 tasks** to schedule (backup, ML training, log sync)
- **Priorities**: High (backup) > Medium (training) > Low (sync)
- **Constraints**: CPU/memory limits, priority ordering
- **Policies**: Minimize cost, balance load

## Determinism Requirements

Infrastructure teams need:
- **Reproducible decisions**: Same inputs → same schedule
- **Auditable reasoning**: Why was task X scheduled on server Y?
- **Regulatory compliance**: Prove fairness, no bias

## No Fate Solution

### Input: ops-scheduling-001.json

Defines:
- Server capacities and availability
- Task requirements and priorities
- Hard constraints (capacity limits, priority order)
- Soft policies (cost, load balancing) with weights

### Solver Pins

```json
{
  "contract_semantics": "nofate-1.0.0",
  "tie_break": "f,g,depth,action_id,state_hash",
  "seed": "42"
}
```

These guarantee that **any No Fate-conforming solver** produces **byte-identical outputs**.

### Output: Schedule + Emergy

**Output**: Deterministic schedule (which tasks on which servers)

**Emergy**: Decision trace showing:
- Why backup was scheduled on srv1 (not srv2 or srv3)
- Why training was scheduled on srv2 (capacity, cost)
- How tie-breaking resolved equal-cost options

### Avery's Attestation

Avery verifies and signs:
- ✅ Constraints satisfied (CPU/mem within limits, priorities respected)
- ✅ Explanations consistent (emergy matches output)
- ✅ Deterministic replay confirmed

## Running This Example

```bash
# Solve
nofate-solve ops-scheduling-001.json --out schedule.json --emergy decisions.json

# Verify
avery-verify ops-scheduling-001.json schedule.json decisions.json

# Attest
avery-attest ops-scheduling-001.json schedule.json decisions.json <private_key> --out attestation.json

# Replay (prove determinism)
avery-replay ops-scheduling-001.json schedule.json decisions.json
```

## Benefits

1. **Reproducibility**: Re-run next week, get same schedule
2. **Auditability**: Inspect decision trace for compliance
3. **Trust**: Cryptographic attestation from Avery
4. **Fairness**: No hidden randomness or bias
5. **Debugging**: Emergy shows WHY choices were made

## Extensions

- Add temporal constraints (deadlines, dependencies)
- Multi-objective optimization (cost vs. latency)
- Dynamic events (server failures, new tasks)
- Integration with CI/CD pipelines

## License

MIT
