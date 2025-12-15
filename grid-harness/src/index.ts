import path from "path";
import { IFRefEngineCLIAdapter } from "./adapters/if_ref_engine_cli.js";
import { runSuite } from "./runners/run_suite.js";

async function main() {
  const cmd = process.argv[2];
  if (!cmd) throw new Error("Missing command");

  const fixturesDir = path.join(process.cwd(), "fixtures", "core");
  const outDir = path.join(process.cwd(), "outputs", "if_ref_engine_cli");

  if (cmd === "run") {
    const cliPath = process.env.IF_ENGINE_CLI_PATH;
    if (!cliPath) throw new Error("Set IF_ENGINE_CLI_PATH to the IF reference engine CLI executable");

    const adapter = new IFRefEngineCLIAdapter(cliPath);
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
