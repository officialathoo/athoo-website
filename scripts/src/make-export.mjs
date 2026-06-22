/**
 * make-export.mjs
 * Creates ATHOO_FINAL_READY_REPLACE.zip with structure:
 *   apps/website/         (← artifacts/athoo-website, renamed to @workspace/website)
 *   services/api/         (← artifacts/api-server)
 *   packages/db/          (← lib/db)
 *   packages/api-zod/     (← lib/api-zod)
 *   packages/api-spec/    (← lib/api-spec)
 *   scripts/
 *   vercel.json
 *   tsconfig.json
 *   tsconfig.base.json
 *   package.json          (generated — clean root)
 *   pnpm-workspace.yaml   (generated — remapped paths)
 */

import fs   from "fs";
import path from "path";
import zlib from "zlib";

const ROOT = path.resolve(import.meta.dirname, "../..");
const TMP  = path.join(ROOT, ".export-tmp");
const DEST = path.join(ROOT, "ATHOO_FINAL_READY_REPLACE.zip");

// ── Helpers ────────────────────────────────────────────────────────────────
const SKIP = new Set(["node_modules","dist",".tsbuildinfo",".replit-artifact",".export-tmp","ATHOO_FINAL_READY_REPLACE.zip"]);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeJson(p, o) { fs.writeFileSync(p, JSON.stringify(o, null, 2) + "\n"); }

// ── CRC-32 ────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ── Pure-Node ZIP writer ──────────────────────────────────────────────────
function buildZip(srcDir, destPath) {
  const entries = [];
  function walk(d, base) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === ".DS_Store") continue;
      const rel  = base ? `${base}/${e.name}` : e.name;
      const full = path.join(d, e.name);
      e.isDirectory() ? walk(full, rel) : entries.push({ rel, full });
    }
  }
  walk(srcDir, "");

  const parts   = [];
  const central = [];
  let   offset  = 0;
  const d = new Date();
  const dosDate = ((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
  const dosTime = (d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);

  for (const { rel, full } of entries) {
    const raw  = fs.readFileSync(full);
    const comp = zlib.deflateRawSync(raw, { level: 6 });
    const name = Buffer.from(rel, "utf8");
    const crc  = crc32(raw);

    const lh = Buffer.alloc(30 + name.length);
    lh.writeUInt32LE(0x04034b50,  0);
    lh.writeUInt16LE(20,           4);
    lh.writeUInt16LE(0,            6);
    lh.writeUInt16LE(8,            8);   // DEFLATE
    lh.writeUInt16LE(dosTime,     10);
    lh.writeUInt16LE(dosDate,     12);
    lh.writeUInt32LE(crc,         14);
    lh.writeUInt32LE(comp.length, 18);
    lh.writeUInt32LE(raw.length,  22);
    lh.writeUInt16LE(name.length, 26);
    lh.writeUInt16LE(0,           28);
    name.copy(lh, 30);

    central.push({ name, crc, compLen: comp.length, rawLen: raw.length, offset });
    parts.push(lh, comp);
    offset += lh.length + comp.length;
  }

  const cdStart = offset;
  for (const { name, crc, compLen, rawLen, offset: fOff } of central) {
    const cdh = Buffer.alloc(46 + name.length);
    cdh.writeUInt32LE(0x02014b50,  0);
    cdh.writeUInt16LE(20,           4);
    cdh.writeUInt16LE(20,           6);
    cdh.writeUInt16LE(0,            8);
    cdh.writeUInt16LE(8,           10);
    cdh.writeUInt16LE(dosTime,     12);
    cdh.writeUInt16LE(dosDate,     14);
    cdh.writeUInt32LE(crc,         16);
    cdh.writeUInt32LE(compLen,     20);
    cdh.writeUInt32LE(rawLen,      24);
    cdh.writeUInt16LE(name.length, 28);
    cdh.writeUInt16LE(0,           30);
    cdh.writeUInt16LE(0,           32);
    cdh.writeUInt16LE(0,           34);
    cdh.writeUInt16LE(0,           36);
    cdh.writeUInt32LE(0,           38);
    cdh.writeUInt32LE(fOff,        42);
    name.copy(cdh, 46);
    parts.push(cdh);
  }

  const cdSize = parts.reduce((s, b) => s + b.length, 0) - cdStart;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50,      0);
  eocd.writeUInt16LE(0,               4);
  eocd.writeUInt16LE(0,               6);
  eocd.writeUInt16LE(central.length,  8);
  eocd.writeUInt16LE(central.length, 10);
  eocd.writeUInt32LE(cdSize,         12);
  eocd.writeUInt32LE(cdStart,        16);
  eocd.writeUInt16LE(0,              20);
  parts.push(eocd);

  fs.writeFileSync(destPath, Buffer.concat(parts));
}

// ── Clean up old tmp ───────────────────────────────────────────────────────
if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

// ── Copy source trees ──────────────────────────────────────────────────────
console.log("📦 Copying apps/website …");
copyDir(path.join(ROOT, "artifacts/athoo-website"), path.join(TMP, "apps/website"));

console.log("📦 Copying services/api …");
copyDir(path.join(ROOT, "artifacts/api-server"),  path.join(TMP, "services/api"));

const libDir = path.join(ROOT, "lib");
for (const e of fs.readdirSync(libDir, { withFileTypes: true })) {
  if (!e.isDirectory() || e.name === "integrations") continue;
  console.log(`📦 Copying packages/${e.name} …`);
  copyDir(path.join(libDir, e.name), path.join(TMP, `packages/${e.name}`));
}

console.log("📦 Copying scripts …");
copyDir(path.join(ROOT, "scripts"), path.join(TMP, "scripts"));

console.log("📄 Copying root config …");
for (const f of ["tsconfig.json", "tsconfig.base.json"]) {
  const s = path.join(ROOT, f);
  if (fs.existsSync(s)) fs.copyFileSync(s, path.join(TMP, f));
}
fs.copyFileSync(path.join(ROOT, "vercel.json"), path.join(TMP, "vercel.json"));

// ── Patch apps/website/package.json ───────────────────────────────────────
const websitePkg = path.join(TMP, "apps/website/package.json");
if (fs.existsSync(websitePkg)) {
  const pkg = readJson(websitePkg);
  pkg.name  = "@workspace/website";
  for (const dep of ["@replit/vite-plugin-cartographer","@replit/vite-plugin-dev-banner","@replit/vite-plugin-runtime-error-modal"]) {
    delete pkg.devDependencies?.[dep];
  }
  writeJson(websitePkg, pkg);
  console.log("✏️  Renamed package → @workspace/website");
}

// ── Patch vite.config.ts (remove Replit-only plugins) ─────────────────────
const viteCfg = path.join(TMP, "apps/website/vite.config.ts");
if (fs.existsSync(viteCfg)) {
  let v = fs.readFileSync(viteCfg, "utf8");
  v = v
    .replace(/^import\s+\w+\s+from\s+["']@replit\/vite-plugin-runtime-error-modal["'].*\n?/mg, "")
    .replace(/^\s*runtimeErrorOverlay\(\),?\s*\n?/mg, "")
    .replace(/^\s*(await\s+import\(["']@replit\/vite-plugin-cartographer["']\)[^)]*\),[^\n]*\n?)/mg, "")
    .replace(/^\s*(await\s+import\(["']@replit\/vite-plugin-dev-banner["']\)[^)]*\),[^\n]*\n?)/mg, "");
  fs.writeFileSync(viteCfg, v);
  console.log("✏️  Removed Replit plugins from vite.config.ts");
}

// ── Root tsconfig.json — remap lib/* → packages/* ─────────────────────────
const rootTs = path.join(TMP, "tsconfig.json");
if (fs.existsSync(rootTs)) {
  const ts = readJson(rootTs);
  if (Array.isArray(ts.references)) {
    ts.references = ts.references.map((r) => ({ ...r, path: r.path?.replace(/^\.\/lib\//, "./packages/") }));
  }
  writeJson(rootTs, ts);
}

// ── Patch tsconfig.json references inside packages/* and services/* ────────
function patchTsconfigs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const tsPath = path.join(dir, e.name, "tsconfig.json");
    if (!fs.existsSync(tsPath)) continue;
    const ts = readJson(tsPath);
    let changed = false;
    if (Array.isArray(ts.references)) {
      ts.references = ts.references.map((r) => {
        const fixed = r.path?.replace(/\.\.\/\.\.\/lib\//, "../../packages/");
        if (fixed !== r.path) { changed = true; return { ...r, path: fixed }; }
        return r;
      });
    }
    if (ts.compilerOptions?.paths) {
      const np = {};
      for (const [k, v] of Object.entries(ts.compilerOptions.paths)) {
        np[k] = v.map((p) => p.replace(/\.\.\/\.\.\/lib\//, "../../packages/"));
      }
      ts.compilerOptions.paths = np;
      changed = true;
    }
    if (changed) writeJson(tsPath, ts);
  }
}
patchTsconfigs(path.join(TMP, "services"));
patchTsconfigs(path.join(TMP, "apps"));

// ── Generate root package.json ─────────────────────────────────────────────
writeJson(path.join(TMP, "package.json"), {
  name:    "athoo",
  version: "0.0.0",
  private: true,
  scripts: {
    // dev helpers — run both servers together, or individually
    dev:             "pnpm run dev:api & pnpm run dev:web",
    "dev:web":       "pnpm --filter @workspace/website run dev",
    "dev:api":       "pnpm --filter @workspace/api-server run dev",
    // typecheck + build
    "typecheck:libs":"tsc --build",
    typecheck:       "pnpm run typecheck:libs && pnpm -r --filter './apps/**' --filter './services/**' --filter './scripts' --if-present run typecheck",
    build:           "pnpm run typecheck && pnpm -r --if-present run build",
  },
  devDependencies: { prettier: "^3.8.3", typescript: "~5.9.3" },
});
console.log("✏️  Generated root package.json");

// ── Generate pnpm-workspace.yaml ──────────────────────────────────────────
const srcYaml = fs.readFileSync(path.join(ROOT, "pnpm-workspace.yaml"), "utf8");
// Extract just the catalog: block (stop before next top-level key)
const catMatch = srcYaml.match(/^(catalog:(?:\n(?:  |\t)[^\n]*)*)$/m);
const catBlock = catMatch ? catMatch[0] : "catalog: {}";

fs.writeFileSync(path.join(TMP, "pnpm-workspace.yaml"),
`packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
  - "scripts"

${catBlock}

autoInstallPeers: false

onlyBuiltDependencies:
  - '@swc/core'
  - esbuild
  - msw
  - unrs-resolver
`);
console.log("✏️  Generated pnpm-workspace.yaml");

// ── Build ZIP ──────────────────────────────────────────────────────────────
if (fs.existsSync(DEST)) fs.unlinkSync(DEST);
console.log(`\n🗜  Zipping …`);
buildZip(TMP, DEST);

fs.rmSync(TMP, { recursive: true, force: true });
const sizeMB = (fs.statSync(DEST).size / 1024 / 1024).toFixed(2);
console.log(`\n✅  Done → ${DEST}`);
console.log(`    Size: ${sizeMB} MB`);
