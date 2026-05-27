import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../artifacts/api-server/src/index.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  return (app as any)(req, res);
}