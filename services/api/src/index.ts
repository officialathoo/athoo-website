import { loadEnvFiles } from "./lib/env.js";
import { logger } from "./lib/logger.js";

loadEnvFiles();

const { ensureSchema } = await import("./lib/dbInit.js");
const { default: app } = await import("./app.js");

const rawPort = process.env["PORT"] || "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

try {
  await ensureSchema();
} catch (err) {
  logger.error({ err }, "Database schema initialization failed");
  process.exit(1);
}

app.listen(port, () => {
  logger.info({ port }, "Server listening");
});
