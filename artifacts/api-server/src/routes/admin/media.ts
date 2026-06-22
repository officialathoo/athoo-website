import { Router } from "express";
import { db, mediaItems } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { AuthRequest } from "../../middlewares/auth.js";

const router = Router();

// GET /api/admin/media
router.get("/media", async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(mediaItems).orderBy(sql`${mediaItems.created_at} DESC`);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "get media error");
    res.status(500).json({ error: "Could not load media" });
  }
});

// POST /api/admin/media
router.post("/media", async (req: AuthRequest, res) => {
  try {
    const { url, alt, caption, type } = req.body as Record<string, string>;
    if (!url) { res.status(400).json({ error: "url is required" }); return; }
    const [item] = await db.insert(mediaItems).values({
      url,
      alt:     alt     ?? null,
      caption: caption ?? null,
      type:    type    ?? "image",
    }).returning();
    res.json({ ok: true, item });
  } catch (err) {
    req.log.error({ err }, "create media error");
    res.status(500).json({ error: "Could not save media" });
  }
});

// DELETE /api/admin/media/:id
router.delete("/media/:id", async (req: AuthRequest, res) => {
  try {
    await db.delete(mediaItems).where(eq(mediaItems.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "delete media error");
    res.status(500).json({ error: "Could not delete media" });
  }
});

export default router;
