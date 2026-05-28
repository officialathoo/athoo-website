import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  api: {
    bodyParser: false,
  },
};

let schemaReady = false;

async function ensureSchemaOnce() {
  if (schemaReady) return;

  try {
    const dbInit = await import(
      "../artifacts/api-server/src/lib/dbInit.js"
    );

    if (dbInit?.ensureSchema) {
      await dbInit.ensureSchema();
    }

    schemaReady = true;
  } catch (error: any) {
    console.warn(
      "Athoo schema init warning:",
      error?.message || error,
    );
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    await ensureSchemaOnce();

    const mod = await import(
      "../artifacts/api-server/src/index.js"
    );

    const app = mod.default;

    if (!app) {
      return res.status(500).json({
        ok: false,
        error: "Express app not found",
      });
    }

    return app(req, res);
  } catch (error: any) {
    console.error("Athoo API fatal error:", error);

    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal server error",
    });
  }
}