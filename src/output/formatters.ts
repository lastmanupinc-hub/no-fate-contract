/**
 * IRS No-Fate Tax Analysis Suite - Output Formatters
 * Generates JSON and Markdown outputs for analysis results
 */

import { BaseResult } from "../types";

/**
 * Converts any result to formatted JSON string
 */
export function toJSON(result: BaseResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Converts any result to Markdown format
 */
export function toMarkdown(result: BaseResult): string {
  const lines: string[] = [];

  lines.push(`# ${result.engine}`);
  lines.push("");
  lines.push(`**Timestamp:** ${result.timestamp}`);
  lines.push("");

  // Errors section
  if (result.errors && result.errors.length > 0) {
    lines.push("## Errors");
    lines.push("");
    for (const error of result.errors) {
      lines.push(`- **${error.error_code}**: ${error.error_message}`);
      if (error.document_id) {
        lines.push(`  - Document: \`${error.document_id}\``);
      }
    }
    lines.push("");
  }

  // Engine-specific sections
  lines.push(formatEngineSpecificContent(result));

  return lines.join("\n");
}

/**
 * Formats engine-specific content
 */
function formatEngineSpecificContent(result: any): string {
  const lines: string[] = [];

  switch (result.engine) {
    case "IRS Document Completeness Checker":
      lines.push(formatCompletenessResult(result));
      break;
    case "IRS Income Classification Engine":
      lines.push(formatIncomeResult(result));
      break;
    case "IRS Deduction Documentation Verifier":
      lines.push(formatDeductionResult(result));
      break;
    case "IRS Business Filing Category Router":
      lines.push(formatFilingResult(result));
      break;
    case "IRS Notice Response Analyzer":
      lines.push(formatNoticeResult(result));
      break;
  }

  return lines.join("\n");
}

/**
 * Formats completeness result
 */
function formatCompletenessResult(result: any): string {
  const lines: string[] = [];

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Completeness Status:** ${result.summary.completeness_status}`);
  lines.push(`- **Forms Detected:** ${result.summary.total_forms_detected}`);
  lines.push(`- **Dependencies Required:** ${result.summary.total_dependencies_required}`);
  lines.push(`- **Dependencies Satisfied:** ${result.summary.total_dependencies_satisfied}`);
  lines.push(`- **Dependencies Missing:** ${result.summary.total_dependencies_missing}`);
  lines.push("");

  if (result.forms_detected && result.forms_detected.length > 0) {
    lines.push("## Forms Detected");
    lines.push("");
    for (const form of result.forms_detected) {
      lines.push(`### ${form.form_id}: ${form.form_name}`);
      if (form.tax_year) {
        lines.push(`**Tax Year:** ${form.tax_year}`);
      }
      lines.push(`**Evidence:** "${form.evidence.quoted_text}"`);
      lines.push(`**Source:** \`${form.evidence.document_id}\``);
      lines.push("");
    }
  }

  if (result.missing_dependencies && result.missing_dependencies.length > 0) {
    lines.push("## Missing Dependencies");
    lines.push("");
    for (const missing of result.missing_dependencies) {
      lines.push(`- **${missing.parent_form}** requires **${missing.missing_form}**`);
      lines.push(`  - Reason: ${missing.reason}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Formats income classification result
 */
function formatIncomeResult(result: any): string {
  const lines: string[] = [];

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total Income Categories:** ${result.summary.total_income_categories_detected}`);
  lines.push(`- **Ambiguous Classifications:** ${result.summary.total_ambiguous_classifications}`);
  lines.push(`- **Detected Categories:** ${result.summary.detected_categories.join(", ")}`);
  lines.push("");

  if (result.income_categories && result.income_categories.length > 0) {
    lines.push("## Income Categories");
    lines.push("");
    for (const category of result.income_categories) {
      lines.push(`### ${category.category.replace(/_/g, " ").toUpperCase()}`);
      lines.push(`**Sources:** ${category.source_documents.join(", ")}`);
      lines.push("**Evidence:**");
      for (const evidence of category.evidence) {
        lines.push(`- "${evidence.quoted_text}" (\`${evidence.document_id}\`)`);
      }
      lines.push("");
    }
  }

  if (result.ambiguous_classifications && result.ambiguous_classifications.length > 0) {
    lines.push("## Ambiguous Classifications");
    lines.push("");
    for (const ambiguous of result.ambiguous_classifications) {
      lines.push(`- **Document:** \`${ambiguous.document_id}\``);
      lines.push(`  - Possible Categories: ${ambiguous.possible_categories.join(", ")}`);
      lines.push(`  - Reason: ${ambiguous.ambiguity.reason}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Formats deduction verification result
 */
function formatDeductionResult(result: any): string {
  const lines: string[] = [];

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Deductions Claimed:** ${result.summary.total_deductions_claimed}`);
  lines.push(`- **Fully Documented:** ${result.summary.total_fully_documented}`);
  lines.push(`- **Partially Documented:** ${result.summary.total_partially_documented}`);
  lines.push(`- **Undocumented:** ${result.summary.total_undocumented}`);
  lines.push("");

  if (result.documentation_status && result.documentation_status.length > 0) {
    lines.push("## Documentation Status");
    lines.push("");
    for (const status of result.documentation_status) {
      lines.push(`### ${status.deduction_type.replace(/_/g, " ").toUpperCase()}`);
      lines.push(`**Status:** ${status.status}`);
      lines.push(`**Required Documentation:** ${status.required_documentation.join(", ")}`);
      if (status.documentation_missing.length > 0) {
        lines.push(`**Missing:** ${status.documentation_missing.join(", ")}`);
      }
      if (status.documentation_present.length > 0) {
        lines.push("**Present:**");
        for (const doc of status.documentation_present) {
          lines.push(`- ${doc.document_type} (\`${doc.document_id}\`)`);
        }
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Formats filing route result
 */
function formatFilingResult(result: any): string {
  const lines: string[] = [];

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Routing Status:** ${result.summary.routing_status}`);
  lines.push(`- **Entity Type Detected:** ${result.summary.entity_type_detected}`);
  lines.push("");

  if (result.detected_business_type) {
    lines.push("## Detected Business Type");
    lines.push("");
    lines.push(`**Entity Type:** ${result.detected_business_type.entity_type.replace(/_/g, " ")}`);
    lines.push("**Evidence:**");
    for (const evidence of result.detected_business_type.evidence) {
      lines.push(`- "${evidence.quoted_text}" (\`${evidence.document_id}\`)`);
    }
    lines.push("");
  }

  if (result.recommended_filing_category) {
    lines.push("## Recommended Filing Category");
    lines.push("");
    lines.push(`**Primary Form:** ${result.recommended_filing_category.primary_form}`);
    lines.push(`**Required Schedules:** ${result.recommended_filing_category.required_schedules.join(", ") || "None"}`);
    lines.push(`**Reason:** ${result.recommended_filing_category.reason}`);
    lines.push("");
  }

  if (result.ambiguous_routing) {
    lines.push("## Ambiguous Routing");
    lines.push("");
    lines.push(`**Reason:** ${result.ambiguous_routing.ambiguity.reason}`);
    if (result.ambiguous_routing.possible_categories && result.ambiguous_routing.possible_categories.length > 0) {
      lines.push(`**Possible Categories:** ${result.ambiguous_routing.possible_categories.join(", ")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Formats notice analysis result
 */
function formatNoticeResult(result: any): string {
  const lines: string[] = [];

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Notice Identified:** ${result.summary.notice_identified}`);
  lines.push(`- **Deadlines Extracted:** ${result.summary.deadlines_extracted}`);
  lines.push(`- **Documents Required:** ${result.summary.documents_required}`);
  lines.push(`- **Procedural Steps:** ${result.summary.procedural_steps_extracted}`);
  lines.push(`- **Consequences Described:** ${result.summary.consequences_described}`);
  lines.push("");

  if (result.notice_identification) {
    lines.push("## Notice Identification");
    lines.push("");
    lines.push(`**Notice Code:** ${result.notice_identification.notice_code}`);
    if (result.notice_identification.notice_date) {
      lines.push(`**Notice Date:** ${result.notice_identification.notice_date}`);
    }
    if (result.notice_identification.tax_year) {
      lines.push(`**Tax Year:** ${result.notice_identification.tax_year}`);
    }
    lines.push("");
  }

  if (result.extracted_deadlines && result.extracted_deadlines.length > 0) {
    lines.push("## Deadlines");
    lines.push("");
    for (const deadline of result.extracted_deadlines) {
      lines.push(`- **${deadline.deadline_purpose}:** ${deadline.deadline}`);
    }
    lines.push("");
  }

  if (result.required_documents && result.required_documents.length > 0) {
    lines.push("## Required Documents");
    lines.push("");
    for (const doc of result.required_documents) {
      lines.push(`- ${doc.document_description}`);
      lines.push(`  - Reason: ${doc.reason}`);
    }
    lines.push("");
  }

  if (result.procedural_instructions && result.procedural_instructions.length > 0) {
    lines.push("## Procedural Instructions");
    lines.push("");
    for (const instruction of result.procedural_instructions) {
      if (instruction.step_number) {
        lines.push(`${instruction.step_number}. ${instruction.instruction}`);
      } else {
        lines.push(`- ${instruction.instruction}`);
      }
    }
    lines.push("");
  }

  if (result.consequences_of_non_response) {
    lines.push("## Consequences of Non-Response");
    lines.push("");
    lines.push(result.consequences_of_non_response.consequence_description);
    lines.push("");
  }

  return lines.join("\n");
}
