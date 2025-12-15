export function canonicalizeJson(value) {
    // Canonical JSON: sorted keys, stable arrays, no floats (enforced at engine layer)
    // Harness only sorts keys to ensure stable hashing of receipts it receives.
    return JSON.stringify(sortKeys(value));
}
function sortKeys(value) {
    if (Array.isArray(value))
        return value.map(sortKeys);
    if (value && typeof value === "object") {
        const obj = value;
        const out = {};
        for (const k of Object.keys(obj).sort())
            out[k] = sortKeys(obj[k]);
        return out;
    }
    return value;
}
