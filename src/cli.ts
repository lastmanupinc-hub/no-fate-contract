#!/usr/bin/env node

/**
 * IRS No-Fate Tax Analysis Suite - CLI
 * Command-line interface for all five analysis engines
 */

import * as fs from "fs";
import * as path from "path";
import { DocumentSet } from "./types";
import {
  analyze_completeness,
  classify_income,
  verify_deduction_docs,
  route_business_filing,
  analyze_notice,
} from "./engines";
import { toJSON, toMarkdown } from "./output/formatters";

/**
 * CLI usage information
 */
const USAGE = `
IRS No-Fate Tax Analysis Suite v1.1

Usage: irs-suite <command> [options]

Commands:
  completeness    Analyze document completeness and dependencies
  income          Classify income types from documents
  deductions      Verify deduction documentation
  filing-route    Route business to appropriate filing category
  notice          Analyze IRS notice and extract requirements

Options:
  --input <dir>       Directory containing text-extracted documents (required)
  --output <file>     Output file path (optional, defaults to stdout)
  --format <fmt>      Output format: json (default) or markdown

Example:
  irs-suite completeness --input ./docs --output report.json
  irs-suite notice --input ./notices --format markdown

Notes:
  - All documents must be text files (.txt)
  - No tax advice or interpretation is provided
  - All outputs are deterministic and evidence-based
`;

/**
 * Parse command-line arguments
 */
function parseArgs(): {
  command: string;
  inputDir?: string;
  outputFile?: string;
  format: "json" | "markdown";
} {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(USAGE);
    process.exit(0);
  }

  const command = args[0];
  let inputDir: string | undefined;
  let outputFile: string | undefined;
  let format: "json" | "markdown" = "json";

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--input" && i + 1 < args.length) {
      inputDir = args[i + 1];
      i++;
    } else if (args[i] === "--output" && i + 1 < args.length) {
      outputFile = args[i + 1];
      i++;
    } else if (args[i] === "--format" && i + 1 < args.length) {
      const fmt = args[i + 1].toLowerCase();
      if (fmt === "json" || fmt === "markdown") {
        format = fmt;
      }
      i++;
    }
  }

  return { command, inputDir, outputFile, format };
}

/**
 * Load documents from input directory
 */
function loadDocuments(inputDir: string): DocumentSet {
  if (!fs.existsSync(inputDir)) {
    console.error(`Error: Input directory does not exist: ${inputDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(inputDir);
  const txtFiles = files.filter((f) => f.endsWith(".txt"));

  if (txtFiles.length === 0) {
    console.error(`Error: No .txt files found in ${inputDir}`);
    process.exit(1);
  }

  const documents = txtFiles.map((file) => {
    const filePath = path.join(inputDir, file);
    const rawText = fs.readFileSync(filePath, "utf-8");
    const documentType = path.basename(file, ".txt");

    return {
      document_id: file,
      document_type: documentType,
      raw_text: rawText,
    };
  });

  return { documents };
}

/**
 * Execute the appropriate engine
 */
function executeEngine(command: string, documentSet: DocumentSet): any {
  switch (command) {
    case "completeness":
      return analyze_completeness(documentSet);

    case "income":
      return classify_income(documentSet);

    case "deductions":
      return verify_deduction_docs(documentSet);

    case "filing-route":
      return route_business_filing(documentSet);

    case "notice":
      return analyze_notice(documentSet);

    default:
      console.error(`Error: Unknown command: ${command}`);
      console.log(USAGE);
      process.exit(1);
  }
}

/**
 * Format and output result
 */
function outputResult(result: any, format: "json" | "markdown", outputFile?: string): void {
  const output = format === "json" ? toJSON(result) : toMarkdown(result);

  if (outputFile) {
    fs.writeFileSync(outputFile, output, "utf-8");
    console.log(`Output written to: ${outputFile}`);
  } else {
    console.log(output);
  }
}

/**
 * Main CLI entry point
 */
function main(): void {
  const { command, inputDir, outputFile, format } = parseArgs();

  if (!inputDir) {
    console.error("Error: --input <dir> is required");
    console.log(USAGE);
    process.exit(1);
  }

  console.error(`Loading documents from: ${inputDir}`);
  const documentSet = loadDocuments(inputDir);
  console.error(`Loaded ${documentSet.documents.length} document(s)`);

  console.error(`Running engine: ${command}`);
  const result = executeEngine(command, documentSet);

  console.error("Analysis complete");
  outputResult(result, format, outputFile);
}

// Run CLI
main();
