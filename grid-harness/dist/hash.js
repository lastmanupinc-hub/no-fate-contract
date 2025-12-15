import { createHash } from "crypto";
import { canonicalizeJson } from "./canonical.js";
export function sha256Bytes(buf) {
    const hex = createHash("sha256").update(buf).digest("hex");
    return `sha256:${hex}`;
}
export function sha256CanonicalJson(obj) {
    const s = canonicalizeJson(obj);
    return sha256Bytes(Buffer.from(s, "utf8"));
}
