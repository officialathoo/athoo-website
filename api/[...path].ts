import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../artifacts/api-server/src/app";
import { ensureSchema } from "../artifacts/api-server/src/lib/dbInit";

let schemaReady: Promise<void> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!schemaReady) {
    schemaReady = ensureSchema().catch((error) => {
      console.error("Database schema initialization failed", error);
      throw error;
    });
  }
  await schemaReady;
  return app(req as any, res as any);
}
