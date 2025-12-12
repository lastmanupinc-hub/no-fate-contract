/**
 * IRS Business Filing Category Router
 * Scope: Deterministic routing of businesses into filing categories based on explicit descriptors
 * Domain: Classification of business entities into IRS filing categories
 */

import {
  DocumentSet,
  FilingRouteResult,
  BusinessTypeDetection,
  FilingCategoryRecommendation,
  EntityType,
  AnalysisError,
} from "../types";
import {
  validateTextInput,
  createEvidence,
  generateTimestamp,
  extractQuote,
} from "../utils/validation";

/**
 * Entity type detection patterns
 */
const ENTITY_PATTERNS: Array<{ type: EntityType; patterns: RegExp[]; priority: number }> = [
  {
    type: "sole_proprietorship",
    patterns: [
      /\bsole proprietor(?:ship)?\b/i,
      /\bself-employed\b/i,
      /\bindividual.*business owner\b/i,
      /\bSchedule C\b/i,
    ],
    priority: 1,
  },
  {
    type: "single_member_llc",
    patterns: [
      /\bsingle[- ]member LLC\b/i,
      /\bSMLC\b/,
      /\bLLC.*disregarded entity\b/i,
      /\bone[- ]member LLC\b/i,
    ],
    priority: 1,
  },
  {
    type: "partnership",
    patterns: [
      /\bgeneral partnership\b/i,
      /\blimited partnership\b/i,
      /\bForm 1065\b/i,
      /\bpartner(?:ship)?\b/i,
    ],
    priority: 1,
  },
  {
    type: "multi_member_llc",
    patterns: [
      /\bmulti[- ]member LLC\b/i,
      /\bLLC.*partnership\b/i,
      /\bLLC.*members\b/i,
      /\btwo[- ]member LLC\b/i,
    ],
    priority: 1,
  },
  {
    type: "c_corporation",
    patterns: [
      /\bC[- ]Corp(?:oration)?\b/i,
      /\bForm 1120\b(?!-?S)/i,
      /\bregular corporation\b/i,
    ],
    priority: 1,
  },
  {
    type: "s_corporation",
    patterns: [/\bS[- ]Corp(?:oration)?\b/i, /\bForm 1120-?S\b/i, /\bsubchapter S\b/i],
    priority: 1,
  },
  {
    type: "trust",
    patterns: [/\btrust\b/i, /\bForm 1041\b/i, /\btrustee\b/i, /\bbeneficiary\b/i],
    priority: 1,
  },
  {
    type: "estate",
    patterns: [/\bestate\b/i, /\bdecedent\b/i, /\bexecutor\b/i, /\bForm 1041\b/i],
    priority: 1,
  },
  {
    type: "non_profit",
    patterns: [/\bnon[- ]?profit\b/i, /\b501\(c\)\b/i, /\bForm 990\b/i, /\btax[- ]exempt\b/i],
    priority: 1,
  },
  {
    type: "other",
    patterns: [/\bbusiness entity\b/i, /\borganization\b/i],
    priority: 3,
  },
].sort((a, b) => a.type.localeCompare(b.type));

/**
 * Filing category routing rules
 */
const FILING_ROUTES: Record<
  EntityType,
  { primaryForm: string; requiredSchedules: string[]; reason: string }
> = {
  sole_proprietorship: {
    primaryForm: "1040",
    requiredSchedules: ["Schedule C", "Schedule SE"],
    reason: "Sole proprietorships report on individual return with Schedule C",
  },
  single_member_llc: {
    primaryForm: "1040",
    requiredSchedules: ["Schedule C", "Schedule SE"],
    reason: "Single-member LLCs treated as disregarded entities file Schedule C",
  },
  partnership: {
    primaryForm: "1065",
    requiredSchedules: ["Schedule K-1"],
    reason: "Partnerships file Form 1065 and issue K-1s to partners",
  },
  multi_member_llc: {
    primaryForm: "1065",
    requiredSchedules: ["Schedule K-1"],
    reason: "Multi-member LLCs taxed as partnerships file Form 1065",
  },
  c_corporation: {
    primaryForm: "1120",
    requiredSchedules: [],
    reason: "C corporations file Form 1120",
  },
  s_corporation: {
    primaryForm: "1120-S",
    requiredSchedules: ["Schedule K-1"],
    reason: "S corporations file Form 1120-S and issue K-1s to shareholders",
  },
  trust: {
    primaryForm: "1041",
    requiredSchedules: ["Schedule K-1"],
    reason: "Trusts and estates file Form 1041",
  },
  estate: {
    primaryForm: "1041",
    requiredSchedules: ["Schedule K-1"],
    reason: "Trusts and estates file Form 1041",
  },
  non_profit: {
    primaryForm: "990",
    requiredSchedules: [],
    reason: "Tax-exempt organizations file Form 990",
  },
  other: {
    primaryForm: "indeterminate",
    requiredSchedules: [],
    reason: "Insufficient evidence for specific filing category",
  },
};

/**
 * Main analysis function
 */
export function route_business_filing(documentSet: DocumentSet): FilingRouteResult {
  const errors: AnalysisError[] = [];
  const detectedTypes: Array<{ type: EntityType; evidence: any[]; priority: number }> = [];

  // Validate and scan all documents
  for (const doc of documentSet.documents) {
    const validationError = validateTextInput(doc.raw_text, doc.document_id);
    if (validationError) {
      errors.push(validationError);
      continue;
    }

    // Scan for entity type indicators
    scanForEntityType(doc, detectedTypes);
  }

  // Determine routing
  let businessTypeDetection: BusinessTypeDetection | undefined;
  let recommendedCategory: FilingCategoryRecommendation | undefined;
  let ambiguousRouting: any | undefined;

  if (detectedTypes.length === 0) {
    // No evidence
    ambiguousRouting = {
      possible_categories: [],
      ambiguity: {
        reason: "No explicit business entity descriptors detected",
      },
    };
  } else if (detectedTypes.length === 1) {
    // Single clear detection
    const detected = detectedTypes[0];
    businessTypeDetection = {
      entity_type: detected.type,
      evidence: detected.evidence,
    };

    const route = FILING_ROUTES[detected.type];
    if (route.primaryForm !== "indeterminate") {
      recommendedCategory = {
        primary_form: route.primaryForm,
        required_schedules: route.requiredSchedules.sort(),
        reason: route.reason,
        evidence: detected.evidence,
      };
    }
  } else {
    // Multiple detections - check for conflicts
    const highPriority = detectedTypes.filter((d) => d.priority === 1);
    if (highPriority.length > 1) {
      // Conflicting high-priority detections
      ambiguousRouting = {
        possible_categories: highPriority.map((d) => FILING_ROUTES[d.type].primaryForm).sort(),
        ambiguity: {
          reason: "Multiple conflicting entity type indicators detected",
          conflicting_evidence: highPriority.slice(0, 3).flatMap((d) => d.evidence.slice(0, 1)),
        },
      };
    } else {
      // Use highest priority detection
      const best = detectedTypes.reduce((prev, curr) =>
        curr.priority < prev.priority ? curr : prev
      );
      businessTypeDetection = {
        entity_type: best.type,
        evidence: best.evidence,
      };

      const route = FILING_ROUTES[best.type];
      recommendedCategory = {
        primary_form: route.primaryForm,
        required_schedules: route.requiredSchedules.sort(),
        reason: route.reason,
        evidence: best.evidence,
      };
    }
  }

  // Generate summary
  const routingStatus: "routed" | "ambiguous" | "insufficient_evidence" = recommendedCategory
    ? "routed"
    : ambiguousRouting
    ? "ambiguous"
    : "insufficient_evidence";

  const summary = {
    routing_status: routingStatus,
    entity_type_detected: businessTypeDetection !== undefined,
  };

  return {
    engine: "IRS Business Filing Category Router",
    timestamp: generateTimestamp(),
    errors,
    detected_business_type: businessTypeDetection,
    recommended_filing_category: recommendedCategory,
    ambiguous_routing: ambiguousRouting,
    summary,
  };
}

/**
 * Scans for entity type indicators
 */
function scanForEntityType(
  doc: any,
  detectedTypes: Array<{ type: EntityType; evidence: any[]; priority: number }>
): void {
  const text = doc.raw_text;

  for (const { type, patterns, priority } of ENTITY_PATTERNS) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const matchIndex = text.indexOf(match[0]);
        const quote = extractQuote(text, matchIndex, 120);

        const evidence = createEvidence(
          quote,
          doc.document_id,
          `Entity type indicator: ${match[0]}`
        );

        const existing = detectedTypes.find((d) => d.type === type);
        if (existing) {
          existing.evidence.push(evidence);
        } else {
          detectedTypes.push({ type, evidence: [evidence], priority });
        }
        break; // One match per pattern per document
      }
    }
  }
}
