/**
 * Test suite for IRS Income Classification Engine
 */

import { classify_income } from "../engines/income";
import { DocumentSet } from "../types";

describe("IRS Income Classification Engine", () => {
  test("should classify wage income", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "wage-statement",
          raw_text: "Form W-2 Wage and Tax Statement\nWages: reported",
        },
      ],
    };

    const result = classify_income(documentSet);

    expect(result.engine).toBe("IRS Income Classification Engine");
    const wageCategory = result.income_categories.find((c) => c.category === "wages");
    expect(wageCategory).toBeDefined();
    expect(wageCategory?.evidence.length).toBeGreaterThan(0);
  });

  test("should classify multiple income types", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "tax-return",
          raw_text: "Form W-2 wages and Form 1099-INT interest income",
        },
      ],
    };

    const result = classify_income(documentSet);

    expect(result.income_categories.length).toBeGreaterThanOrEqual(2);
    expect(result.summary.detected_categories).toContain("wages");
    expect(result.summary.detected_categories).toContain("interest");
  });

  test("should detect self-employment income", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "business-return",
          raw_text: "Schedule C Profit or Loss from Business\nSelf-employment income reported",
        },
      ],
    };

    const result = classify_income(documentSet);

    const selfEmpCategory = result.income_categories.find((c) => c.category === "self_employment");
    expect(selfEmpCategory).toBeDefined();
  });

  test("should handle no income indicators", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "notice",
          raw_text: "This is a general notice with no income information",
        },
      ],
    };

    const result = classify_income(documentSet);

    expect(result.income_categories.length).toBe(0);
    expect(result.summary.total_income_categories_detected).toBe(0);
  });

  test("should sort categories alphabetically", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "doc1",
          document_type: "tax-return",
          raw_text: "Self-employment income, wages, and interest income reported",
        },
      ],
    };

    const result = classify_income(documentSet);

    const categories = result.income_categories.map((c) => c.category);
    const sorted = [...categories].sort();
    expect(categories).toEqual(sorted);
  });
});
