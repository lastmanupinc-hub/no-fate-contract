// Replay runner placeholder
// Add replay-specific logic as needed
import { IEngineAdapter } from "../adapters/adapter.js";
import { GridPoint } from "../types.js";

export async function runReplay(adapter: IEngineAdapter, replaySpec: GridPoint) {
  // Placeholder: implement replay logic
  // This will be expanded when replay protocol is finalized
  const result = await adapter.exec(replaySpec);
  return result;
}
