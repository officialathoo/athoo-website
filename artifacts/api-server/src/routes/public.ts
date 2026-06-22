import { Router } from "express";
import { db, siteSettings, blogPosts, blogCategories } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/public/settings
router.get("/public/settings", async (req, res) => {
  try {
    const rows = await db.select().from(siteSettings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const mm  = (map.maintenance_mode as Record<string, unknown> | undefined) ?? {};
    res.json({
      maintenanceMode:    Boolean((mm as any).enabled),
      maintenanceMessage: (mm as any).message ?? "Athoo website is under maintenance.",
      contactEmail:       (map.support_email as string) ?? "official@athoo.pk",
      contactPhone:       (map.support_phone as string) ?? "+92 339 0051068",
    });
  } catch (err) {
    req.log.error({ err }, "public settings error");
    res.status(500).json({ error: "Could not load settings" });
  }
});

// GET /api/public/cms
router.get("/public/cms", async (req, res) => {
  try {
    const rows = await db.select().from(siteSettings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({ cms: map });
  } catch (err) {
    req.log.error({ err }, "public cms error");
    res.status(500).json({ error: "Could not load CMS" });
  }
});

// GET /api/public/blog/posts
router.get("/public/blog/posts", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(blogPosts.created_at);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "public blog posts error");
    res.status(500).json({ error: "Could not load posts" });
  }
});

// GET /api/public/blog/categories
router.get("/public/blog/categories", async (req, res) => {
  try {
    const rows = await db.select().from(blogCategories).orderBy(blogCategories.name);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "public blog cats error");
    res.status(500).json({ error: "Could not load categories" });
  }
});

export default router;
