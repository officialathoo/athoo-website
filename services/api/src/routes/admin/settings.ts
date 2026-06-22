import { Router } from "express";
import { db, siteSettings } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { AuthRequest } from "../../middlewares/auth.js";

const router = Router();

// GET /api/admin/settings
router.get("/settings", async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(siteSettings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({ settings: map });
  } catch (err) {
    req.log.error({ err }, "get settings error");
    res.status(500).json({ error: "Could not load settings" });
  }
});

// POST /api/admin/settings  (maintenance mode + contact info)
router.post("/settings", async (req: AuthRequest, res) => {
  try {
    const { maintenanceEnabled, maintenanceMessage, supportEmail, supportPhone } = req.body as Record<string, unknown>;

    await upsert("maintenance_mode", {
      enabled: Boolean(maintenanceEnabled),
      message: maintenanceMessage ?? "Athoo website is under maintenance. Please check back soon.",
    });
    if (supportEmail) await upsert("support_email", supportEmail);
    if (supportPhone) await upsert("support_phone", supportPhone);

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "save settings error");
    res.status(500).json({ error: "Could not save settings" });
  }
});

// POST /api/admin/upsert-setting
router.post("/upsert-setting", async (req: AuthRequest, res) => {
  try {
    const { key, value } = req.body as { key?: string; value?: unknown };
    if (!key) { res.status(400).json({ error: "key is required" }); return; }
    await upsert(key, value);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "upsert setting error");
    res.status(500).json({ error: "Could not save setting" });
  }
});

async function upsert(key: string, value: unknown) {
  await db
    .insert(siteSettings)
    .values({ key, value: value as any, updated_at: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: sql`excluded.value`, updated_at: new Date() },
    });
}

export default router;
