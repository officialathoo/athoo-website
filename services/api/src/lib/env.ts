import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) return null;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return [key, value];
}

function loadFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) continue;
    const [key, value] = parsed;
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function loadEnvFiles() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const apiRoot = path.resolve(here, "..", "..");
  const projectRoot = path.resolve(apiRoot, "..", "..");

  for (const file of [
    path.join(projectRoot, ".env"),
    path.join(projectRoot, ".env.local"),
    path.join(apiRoot, ".env"),
    path.join(apiRoot, ".env.local"),
  ]) {
    loadFile(file);
  }
}
