/**
 * Test suite for IRS Notice Response Analyzer
 */

import { analyze_notice } from "../engines/notice";
import { DocumentSet } from "../types";

describe("IRS Notice Response Analyzer", () => {
  test("should identify CP2000 notice", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "notice1",
          document_type: "irs-notice",
          raw_text: "Notice CP2000\nWe believe you owe additional tax for tax year 2022",
        },
      ],
    };

    const result = analyze_notice(documentSet);

    expect(result.engine).toBe("IRS Notice Response Analyzer");
    expect(result.notice_identification).toBeDefined();
    expect(result.notice_identification?.notice_code).toBe("CP2000");
    expect(result.notice_identification?.tax_year).toBe("2022");
  });

  test("should extract deadlines", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "notice1",
          document_type: "irs-notice",
          raw_text:
            "Notice CP14\nYou must respond by January 15, 2024.\nPayment is due by February 1, 2024.",
        },
      ],
    };

    const result = analyze_notice(documentSet);

    expect(result.extracted_deadlines.length).toBeGreaterThan(0);
    const hasResponseDeadline = result.extracted_deadlines.some((d) =>
      d.deadline_purpose.includes("response")
    );
    expect(hasResponseDeadline).toBe(true);
  });

  test("should extract required documents", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "notice1",
          document_type: "irs-notice",
          raw_text: "You must submit copies of your W-2 and 1099 forms to support your claim.",
        },
      ],
    };

    const result = analyze_notice(documentSet);

    expect(result.required_documents.length).toBeGreaterThan(0);
    expect(result.summary.documents_required).toBeGreaterThan(0);
  });

  test("should extract procedural instructions", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "notice1",
          document_type: "irs-notice",
          raw_text:
            "To respond:\n1. Complete the response form\n2. Attach supporting documents\n3. Mail to the address shown",
        },
      ],
    };

    const result = analyze_notice(documentSet);

    expect(result.procedural_instructions.length).toBeGreaterThanOrEqual(3);
    const firstStep = result.procedural_instructions.find((i) => i.step_number === 1);
    expect(firstStep).toBeDefined();
  });

  test("should extract consequences", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "notice1",
          document_type: "irs-notice",
          raw_text:
            "If you do not respond, we will assess the additional tax and you may be subject to penalties.",
        },
      ],
    };

    const result = analyze_notice(documentSet);

    expect(result.consequences_of_non_response).toBeDefined();
    expect(result.summary.consequences_described).toBe(true);
  });

  test("should handle notice with no specific code", () => {
    const documentSet: DocumentSet = {
      documents: [
        {
          document_id: "notice1",
          document_type: "irs-letter",
          raw_text: "This is a general IRS letter with no specific notice code.",
        },
      ],
    };

    const result = analyze_notice(documentSet);

    expect(result.notice_identification).toBeUndefined();
    expect(result.summary.notice_identified).toBe(false);
  });
});
