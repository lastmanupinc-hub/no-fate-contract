import { GridPoint, EngineResult } from "../types.js";

export interface IEngineAdapter {
  name(): string;

  // Must run deterministically for identical inputs.
  // The adapter must ensure it does not inject time, randomness, environment variance.
  exec(gridpoint: GridPoint): Promise<EngineResult>;
}
