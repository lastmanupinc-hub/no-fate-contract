export function assert(cond, msg) {
    if (!cond)
        throw new Error(`ASSERTION FAILED: ${msg}`);
}
