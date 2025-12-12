/**
 * Test suite for IRS Document Completeness Checker
 */

import { analyze_completeness } from "../engines/completeness";
import { DocumentSet } from "../types";

describe("IRS Document Completeness Checker", () => {
  test("should detect Form 1040", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "tax-return",
          raw_text: "Form 1040 U.S. Individual Income Tax Return for tax year 2023",
        },
      ],
    };

    const result = analyze_completeness(documentSet);

    expect(result.engine).toBe("IRS Document Completeness Checker");
    expect(result.forms_detected.length).toBeGreaterThan(0);
    expect(result.forms_detected[0].form_id).toBe("1040");
    expect(result.forms_detected[0].tax_year).toBe("2023");
  });

  test("should identify missing W-2 dependency", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "tax-return",
          raw_text: "Form 1040 U.S. Individual Income Tax Return",
        },
      ],
    };

    const result = analyze_completeness(documentSet);

    expect(result.summary.completeness_status).toBe("incomplete");
    const w2Missing = result.missing_dependencies.find((d) => d.missing_form === "W-2");
    expect(w2Missing).toBeDefined();
  });

  test("should handle complete document set", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "tax-return",
          raw_text: "Form 1040 U.S. Individual Income Tax Return",
        },
        {
          document_id: "doc2",
          document_type: "wage-statement",
          raw_text: "Form W-2 Wage and Tax Statement",
        },
      ],
    };

    const result = analyze_completeness(documentSet);

    expect(result.summary.total_forms_detected).toBe(2);
    expect(result.summary.total_dependencies_satisfied).toBeGreaterThan(0);
  });

  test("should reject unreadable documents", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "bad-doc",
          raw_text: "",
        },
      ],
    };

    const result = analyze_completeness(documentSet);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].error_code).toBe("error: unreadable_document");
  });

  test("should produce deterministic output", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "tax-return",
          raw_text: "Form 1040 and Schedule C",
        },
      ],
    };

    const result1 = analyze_completeness(documentSet);
    const result2 = analyze_completeness(documentSet);

    // Timestamps will differ, but structure should be identical
    expect(result1.forms_detected).toEqual(result2.forms_detected);
    expect(result1.summary).toEqual(result2.summary);
  });
});
