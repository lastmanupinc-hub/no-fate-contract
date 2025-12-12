/**
 * IRS No-Fate Tax Analysis Suite - Main Entry Point
 */

// Type exports
export * from "./types";

// Engine exports
export * from "./engines";

// Output formatter exports
export { toJSON, toMarkdown } from "./output/formatters";

// Validation utilities
export {
  validateTextInput,
  createEvidence,
  generateTimestamp,
  sortAlphabetically,
  extractQuote,
} from "./utils/validation";
