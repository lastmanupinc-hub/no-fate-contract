import path from "path";
import { runSuite } from "./runners/run_suite.js";

async function main() {
  const cmd = process.argv[2];
  if (!cmd) throw new Error("Missing command");

  if (cmd === "run") {
    throw new Error(
      "Implementation binding deferred: No implementation manifest exists.\n" +
      "The harness is structurally complete but non-executable until an IF reference engine is bound.\n" +
      "To bind an implementation, create impl-manifest.json with executable_path and sha256 hash."
    );
  }

  throw new Error(`Unknown command: ${cmd}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
