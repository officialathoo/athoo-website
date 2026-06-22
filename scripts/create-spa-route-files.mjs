import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.argv[2] || "artifacts/athoo-website/dist/public");
const indexPath = path.join(outDir, "index.html");
if (!fs.existsSync(indexPath)) {
  throw new Error(`SPA index.html not found: ${indexPath}`);
}

const routes = [
  "admin",
  "about",
  "services",
  "become-provider",
  "contact",
  "support",
  "faq",
  "privacy",
  "terms",
  "cookie-policy",
  "blogs",
  "blog",
  "how-it-works"
];

for (const route of routes) {
  const dir = path.join(outDir, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(indexPath, path.join(dir, "index.html"));
}

console.log(`Created SPA fallback route files in ${outDir}`);
