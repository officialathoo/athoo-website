import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const remove = [
  "dist", "build", ".turbo", "coverage", "artifacts/athoo/dist", "artifacts/api-server/dist",
  "apps/website/dist", "services/api/dist"
];
for (const rel of remove) fs.rmSync(path.join(root, rel), { recursive: true, force: true });
console.log("Clean done");
