import fs from "fs";
import path from "path";
import { runOne } from "./run_one.js";
export async function runSuite(adapter, fixturesDir, outDir) {
    const files = fs.readdirSync(fixturesDir).filter((f) => f.endsWith(".json")).sort();
    const results = [];
    for (const f of files) {
        const gp = JSON.parse(fs.readFileSync(path.join(fixturesDir, f), "utf8"));
        const r = await runOne(adapter, gp);
        results.push(r);
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, `${gp.gridpoint_id}.result.json`), JSON.stringify(r, null, 2));
    }
    fs.writeFileSync(path.join(outDir, `suite_results.json`), JSON.stringify(results, null, 2));
    return results;
}
