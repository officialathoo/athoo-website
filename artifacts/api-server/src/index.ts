import app from "./app";
import { logger } from "./lib/logger";
import { ensureSchema } from "./lib/dbInit";

const rawPort = process.env["PORT"] || "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  try {
    await ensureSchema();
  } catch (err: any) {
    logger.warn({ err: err.message }, "Schema init warning (non-fatal)");
  }

  app.listen(port, (err?: Error) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

start();
