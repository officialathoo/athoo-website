import { Router, type IRouter } from "express";
import { db, appSettingsTable } from "@athoo/db";

const router: IRouter = Router();

router.get("/settings/public", async (_req, res): Promise<void> => {
  const rows = await db.select().from(appSettingsTable);

  const map: Record<string, string> = {};
  for (const row of rows) {
    const val = row.value;
    map[row.key] = typeof val === "string" ? val : JSON.stringify(val).replace(/^"|"$/g, "");
  }

  res.json({
    siteName: map["site_title"] ?? "Athoo — Pakistan Smart Home Services",
    supportPhone: map["support_phone"] ?? "+92 339 0051068",
    supportEmail: map["support_email"] ?? "support@athoo.pk",
    whatsappNumber: map["whatsapp_number"] ?? "923390051068",
    socialInstagram: map["social_instagram"] ?? null,
    socialFacebook: map["social_facebook"] ?? null,
    socialTiktok: map["social_tiktok"] ?? null,
  });
});

export default router;
