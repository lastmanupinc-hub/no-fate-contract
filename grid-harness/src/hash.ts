import { createHash } from "crypto";
import { canonicalizeJson } from "./canonical.js";

export function sha256Bytes(buf: Buffer): string {
  const hex = createHash("sha256").update(buf).digest("hex");
  return `sha256:${hex}`;
}

export function sha256CanonicalJson(obj: unknown): string {
  const s = canonicalizeJson(obj);
  return sha256Bytes(Buffer.from(s, "utf8"));
}
