import { spawn } from "child_process";
import { readFileSync } from "fs";
import { IEngineAdapter } from "./adapter.js";
import { EngineResult, GridPoint } from "../types.js";
import { sha256Bytes } from "../hash.js";
import { assert } from "../verify/assert.js";

export class IFRefEngineCLIAdapter implements IEngineAdapter {
  private hashVerified = false;

  constructor(
    private readonly cliPath: string,
    private readonly expectedHash: string
  ) {}

  name(): string {
    return "if_ref_engine_cli";
  }

  async exec(gridpoint: GridPoint): Promise<EngineResult> {
    // Hash verification preflight (once per adapter instance)
    if (!this.hashVerified) {
      const bin = readFileSync(this.cliPath);
      const hash = sha256Bytes(bin);
      assert(
        hash === this.expectedHash,
        `Implementation hash mismatch: expected ${this.expectedHash}, got ${hash}`
      );
      this.hashVerified = true;
    }

    // Contract: CLI reads GridPoint JSON from stdin and prints EngineResult JSON to stdout.
    // This is the ONLY coupling point between harness and implementation.
    const input = JSON.stringify(gridpoint);

    const res = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve, reject) => {
      const p = spawn(this.cliPath, ["exec-gridpoint"], {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          LANG: "C",
          LC_ALL: "C",
          TZ: "UTC"
        },
        shell: false,
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";

      p.stdout.on("data", (d) => (stdout += d.toString("utf8")));
      p.stderr.on("data", (d) => (stderr += d.toString("utf8")));
      p.on("error", reject);
      p.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));

      p.stdin.write(input);
      p.stdin.end();
    });

    if (res.code !== 0) {
      // Adapter must not reinterpret: treat non-zero as INVALID_INPUT at harness level?
      // No — the harness should FAIL the implementation because it violated interface contract.
      throw new Error(`Engine CLI failed (exit=${res.code}): ${res.stderr}`);
    }

    const parsed = JSON.parse(res.stdout) as EngineResult;
    return parsed;
  }
}
