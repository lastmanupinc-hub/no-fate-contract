import fs from "fs";
import path from "path";
import { assert } from "../verify/assert.js";

export function compareImplementations(gridpointIds: string[], implOutDirs: Record<string, string>) {
  for (const gpId of gridpointIds) {
    const loaded: Record<string, any> = {};

    for (const [impl, dir] of Object.entries(implOutDirs)) {
      const p = path.join(dir, `${gpId}.result.json`);
      assert(fs.existsSync(p), `missing output for ${impl} ${gpId}: ${p}`);
      loaded[impl] = JSON.parse(fs.readFileSync(p, "utf8"));
    }

    const impls = Object.keys(loaded);
    const first = loaded[impls[0]];

    for (const impl of impls.slice(1)) {
      const cur = loaded[impl];
      assert(
        JSON.stringify(cur.per_action_outcome) === JSON.stringify(first.per_action_outcome),
        `DIVERGENCE outcomes for ${gpId}: ${impl} vs ${impls[0]}`
      );
      assert(cur.post_state_root === first.post_state_root, `DIVERGENCE state_root for ${gpId}`);
      assert(
        JSON.stringify(cur.receipts_sha256) === JSON.stringify(first.receipts_sha256),
        `DIVERGENCE receipts_sha256 for ${gpId}`
      );
    }
  }
}
