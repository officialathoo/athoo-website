import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../artifacts/api-server/src/index.js";
import { ensureSchema } from "../artifacts/api-server/src/lib/dbInit.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

let schemaReady: Promise<void> | null = null;

async function ensureSchemaOnce() {
  if (!schemaReady) {
    schemaReady = ensureSchema().catch((error) => {
      console.warn("Athoo schema init warning:", error?.message || error);
    });
  }
  await schemaReady;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  await ensureSchemaOnce();
  return (app as any)(req, res);
}
