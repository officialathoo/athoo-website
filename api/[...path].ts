import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../artifacts/api-server/src/index.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err?: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
}