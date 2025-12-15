import path from "path";
import { readFileSync } from "fs";
import { IFRefEngineCLIAdapter } from "./adapters/if_ref_engine_cli.js";
import { runSuite } from "./runners/run_suite.js";
async function main() {
    const cmd = process.argv[2];
    if (!cmd)
        throw new Error("Missing command");
    // Load implementation manifest (hermetic, no environment dependence)
    const manifestPath = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "impl-manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const repoRoot = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
    const fixturesDir = path.join(repoRoot, "fixtures", "core");
    const outDir = path.join(repoRoot, "outputs", manifest.implementation_id);
    if (cmd === "run") {
        const cliPath = path.join(repoRoot, manifest.executable_path);
        const adapter = new IFRefEngineCLIAdapter(cliPath, manifest.sha256);
        await runSuite(adapter, fixturesDir, outDir);
        console.log("OK: suite complete");
        return;
    }
    throw new Error(`Unknown command: ${cmd}`);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
