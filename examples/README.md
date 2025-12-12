# IRS No-Fate Tax Analysis Suite - Examples

This directory contains sample documents and usage examples for all five engines.

## Example Documents

### Completeness Examples
- `example-1040.txt` - Sample Form 1040
- `example-w2.txt` - Sample W-2 form
- `example-schedule-c.txt` - Sample Schedule C

### Income Classification Examples
- `example-mixed-income.txt` - Multiple income types
- `example-self-employment.txt` - Self-employment income

### Deduction Examples
- `example-charitable.txt` - Charitable contribution claim
- `example-receipts.txt` - Supporting receipts

### Filing Route Examples
- `example-sole-prop.txt` - Sole proprietorship
- `example-s-corp.txt` - S Corporation

### Notice Examples
- `example-cp2000.txt` - CP2000 notice
- `example-cp14.txt` - CP14 notice

## Running Examples

```bash
# Completeness check
irs-suite completeness --input examples/completeness --format markdown

# Income classification
irs-suite income --input examples/income --output income-result.json

# Notice analysis
irs-suite notice --input examples/notices --format markdown
```

## Sample Outputs

See `sample-outputs/` for example JSON and Markdown outputs from each engine.
