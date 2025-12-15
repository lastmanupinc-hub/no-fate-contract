// IO utilities placeholder
// Add file I/O helpers as needed
import fs from "fs";
import path from "path";

export function readJsonFile<T = unknown>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function writeJsonFile(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
