# IRS No-Fate Tax Analysis Suite

**Version 1.1** | **SPEC_COMPLETE — DEP_STATUS: CLAIM — RUNTIME_UNVERIFIED**

A deterministic IRS document analysis suite providing five specialized engines for tax document processing. No tax advice. No interpretation. No calculations. Evidence-based only.

---

## Overview

The IRS No-Fate Tax Analysis Suite consists of five independent engines that analyze IRS-related documents using strict No-Fate truth rules:

1. **IRS Document Completeness Checker** - Scans for forms and identifies missing dependencies
2. **IRS Income Classification Engine** - Classifies income types based on explicit textual evidence
3. **IRS Deduction Documentation Verifier** - Verifies presence of required supporting documentation
4. **IRS Business Filing Category Router** - Routes businesses to appropriate IRS filing categories
5. **IRS Notice Response Analyzer** - Extracts procedural requirements from IRS notices

---

## Core Principles

### No-Fate Truth Rules

- **Non-inferential**: No conclusions beyond explicit evidence
- **Strict text grounding**: All outputs anchored to quoted source text
- **Evidence-bound**: Every classification includes evidence anchors
- **Deterministic**: Identical inputs produce identical outputs
- **No advice**: Zero prescriptive or advisory language
- **No interpretation**: No tax law interpretation or compliance judgment

### Numeric Constraints

**Allowed numeric identifiers:**
- Form numbers (e.g., "1040", "Schedule C")
- Schedule numbers
- Notice codes (e.g., "CP2000")
- Tax years as labels (e.g., "2023")

**Forbidden numeric content:**
- Financial amounts, balances, totals, percentages, penalties, interest, computed values

### Scope

**In Scope:** Deterministic text analysis, form detection, dependency identification, income labeling, documentation verification, notice extraction

**Out of Scope:** Tax computation, legal advice, compliance judgment, strategy recommendations, financial calculations

---


---

## Installation

```bash
npm install
npm run build
```

---

## Usage

### Command-Line Interface

```bash
# Analyze document completeness
irs-suite completeness --input ./docs --output report.json

# Classify income types
irs-suite income --input ./docs --format markdown

# Verify deduction documentation
irs-suite deductions --input ./docs --output deductions.json

# Route business filing category
irs-suite filing-route --input ./docs --format markdown

# Analyze IRS notice
irs-suite notice --input ./notices --output notice-analysis.json
```

### Programmatic API

```typescript
import {
  analyze_completeness,
  classify_income,
  verify_deduction_docs,
  route_business_filing,
  analyze_notice,
  DocumentSet
} from "irs-no-fate-tax-analysis-suite";

const documentSet: DocumentSet = {
  documents: [
    {
      document_id: "doc1",
      document_type: "1040",
      raw_text: "Form 1040 U.S. Individual Income Tax Return..."
    }
  ]
};

const result = analyze_completeness(documentSet);
console.log(result);
```

---

## Engine Details

### 1. IRS Document Completeness Checker
Detects forms and identifies missing dependencies.

### 2. IRS Income Classification Engine
Classifies income types (wages, interest, self-employment, etc.) based on explicit evidence.

### 3. IRS Deduction Documentation Verifier
Verifies presence of required documentation for claimed deductions.

### 4. IRS Business Filing Category Router
Routes businesses to appropriate IRS filing categories based on entity type.

### 5. IRS Notice Response Analyzer
Extracts notice codes, deadlines, required documents, and procedural instructions.

---

## Testing

```bash
npm test
npm test -- --coverage
```

---

## Architecture

```
src/
├── types/              # Shared type definitions
├── engines/            # Five analysis engines
├── utils/              # Validation utilities
├── output/             # JSON and Markdown formatters
├── cli.ts              # Command-line interface
└── index.ts            # Public API
```

---

## Acceptance Criteria

All engines must:
- Produce deterministic outputs for identical inputs
- Reject unsupported or unreadable documents
- Anchor all classifications to explicit evidence
- Surface ambiguity rather than inferring missing facts
- Contain zero advisory language
- Extract zero financial numeric values

---

## Limitations

- **TEXT_IMPLEMENTED**: Implementation complete but not runtime-verified
- **DEP_STATUS: CLAIM**: Dependencies claimed but not verified
- **No calculations**: Engines do not perform financial computations
- **No advice**: Engines provide no tax or legal guidance
- **Evidence-dependent**: Output quality depends on input text quality

---

## License

MIT

---

## Disclaimer

This software provides **document analysis only**. It does not provide tax advice, legal advice, or compliance guidance. Consult qualified tax professionals for tax-related decisions.

---

**IRS No-Fate Tax Analysis Suite v1.1**  
*Deterministic. Evidence-bound. No advice. No interpretation.*

