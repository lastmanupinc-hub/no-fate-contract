export type HarnessVerdict = "PASS" | "FAIL";

export interface VerdictRecord {
  gridpoint_id: string;
  verdict: HarnessVerdict;
  reasons: string[];
}
