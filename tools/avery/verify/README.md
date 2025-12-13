# @nofate/avery-verify

**Avery's verification tool for No Fate computations**

Validates that outputs and emergy records are:
- **Hash-consistent**: Claimed hashes match actual artifacts
- **Schema-valid**: Conform to No Fate specifications
- **Constraint-satisfying**: Outputs respect bundle constraints
- **Explanation-consistent**: Emergy traces explain output decisions

## Installation

```bash
npm install @nofate/avery-verify
```

## CLI Usage

```bash
# Verify a computation
avery-verify bundle.json output.json emergy.json
```

Exit codes:
- `0`: Verification passed
- `1`: Verification failed

## Verification Checks

1. **Hash Consistency**
   - `bundle_hash` in emergy matches actual bundle hash
   - `output_hash` in emergy matches actual output hash

2. **Schema Validity**
   - Bundle conforms to bundle.schema.json
   - Output conforms to output.schema.json
   - Emergy conforms to emergy.schema.json

3. **Constraint Satisfaction**
   - All hard constraints from bundle are satisfied by output plan
   - Preconditions → effects logic is sound

4. **Explanation Consistency**
   - Decision graph in emergy explains output choices
   - Every plan step has a corresponding decision node
   - Rejections are properly documented with evidence

## Programmatic Usage

```typescript
import { verify } from '@nofate/avery-verify';

const result = verify(bundle, output, emergy);

if (result.valid) {
  console.log('Verification passed');
  console.log('Checks:', result.checks);
} else {
  console.error('Verification failed');
  console.error('Errors:', result.errors);
}
```

## License

MIT
