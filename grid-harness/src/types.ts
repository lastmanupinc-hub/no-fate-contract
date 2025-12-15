export type Outcome = "PASS" | "FAIL" | "INDETERMINATE" | "INVALID_INPUT";

export type Hex32 = string; // "sha256:<hex>"
export type ProtocolVersion = "v0";

export interface BlockContext {
  height: number;
  epoch: number;
  active_protocol_version: ProtocolVersion;
  validator_set_hash: Hex32;
  finalized_checkpoint_hash: Hex32 | null;
}

export interface PreState {
  // Keep this as "opaque container" at harness level.
  // The engine adapter owns validation/parsing of state shape.
  // This avoids the harness inventing semantics.
  [k: string]: unknown;
}

export interface Action {
  type: string;
  [k: string]: unknown;
}

export interface Expected {
  // If omitted, harness treats as property test / boundary test
  per_action_outcome?: Outcome[];
  post_state_root?: Hex32;
  receipts_sha256?: Hex32[];
}

export interface GridPoint {
  gridpoint_id: string;
  genesis_ref: Hex32;
  pre_state: PreState;
  block_context: BlockContext;
  actions: Action[];
  expected?: Expected;
  // Optional hints for harness behavior
  mode?: "golden" | "property";
}

export interface EngineResult {
  per_action_outcome: Outcome[];
  receipts: unknown[]; // canonical JSON objects
  post_state_root: Hex32;
  trace?: unknown; // optional debug, non-normative, never hashed for comparison unless explicitly requested
}
