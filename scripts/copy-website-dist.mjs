import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "apps", "website", "dist");
const target = path.join(root, "artifacts", "athoo", "dist", "public");

if (!fs.existsSync(source)) {
  throw new Error(`Website dist not found: ${source}`);
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.cpSync(source, target, { recursive: true });
console.log(`Copied website build to ${target}`);
