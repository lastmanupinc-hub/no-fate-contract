import { sha256CanonicalJson } from "../hash.js";
import { assert } from "../verify/assert.js";
export async function runOne(adapter, gp) {
    const r = await adapter.exec(gp);
    assert(Array.isArray(r.per_action_outcome), "per_action_outcome must be array");
    assert(typeof r.post_state_root === "string", "post_state_root must be string");
    assert(Array.isArray(r.receipts), "receipts must be array");
    const receipts_sha256 = r.receipts.map((rcpt) => sha256CanonicalJson(rcpt));
    // Golden checks if expected exists
    if (gp.expected?.per_action_outcome) {
        assert(JSON.stringify(r.per_action_outcome) === JSON.stringify(gp.expected.per_action_outcome), `Outcome mismatch: expected=${JSON.stringify(gp.expected.per_action_outcome)} got=${JSON.stringify(r.per_action_outcome)}`);
    }
    if (gp.expected?.post_state_root) {
        assert(r.post_state_root === gp.expected.post_state_root, `post_state_root mismatch`);
    }
    if (gp.expected?.receipts_sha256) {
        assert(JSON.stringify(receipts_sha256) === JSON.stringify(gp.expected.receipts_sha256), `receipts_sha256 mismatch`);
    }
    return {
        gridpoint_id: gp.gridpoint_id,
        impl: adapter.name(),
        per_action_outcome: r.per_action_outcome,
        post_state_root: r.post_state_root,
        receipts_sha256,
    };
}
