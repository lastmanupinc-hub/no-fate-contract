// IO utilities placeholder
// Add file I/O helpers as needed
import fs from "fs";
import path from "path";
export function readJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
export function writeJsonFile(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
