import { Router } from "express";
import { db, activityLogs, leads, adminUsers, blogPosts, mediaItems, emailLogs, services } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import type { AuthRequest } from "../../middlewares/auth.js";

const router = Router();

// GET /api/admin/activity
router.get("/activity", async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const rows  = await db.select().from(activityLogs).orderBy(desc(activityLogs.created_at)).limit(limit);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "activity logs error");
    res.status(500).json({ error: "Could not load activity logs" });
  }
});

// GET /api/admin/db-stats
router.get("/db-stats", async (req: AuthRequest, res) => {
  try {
    const tables = [
      { table: "leads",           query: db.select({ c: sql<number>`count(*)::int` }).from(leads) },
      { table: "admin_users",     query: db.select({ c: sql<number>`count(*)::int` }).from(adminUsers) },
      { table: "blog_posts",      query: db.select({ c: sql<number>`count(*)::int` }).from(blogPosts) },
      { table: "media_items",     query: db.select({ c: sql<number>`count(*)::int` }).from(mediaItems) },
      { table: "email_logs",      query: db.select({ c: sql<number>`count(*)::int` }).from(emailLogs) },
      { table: "services",        query: db.select({ c: sql<number>`count(*)::int` }).from(services) },
      { table: "activity_logs",   query: db.select({ c: sql<number>`count(*)::int` }).from(activityLogs) },
    ];

    const results = await Promise.all(
      tables.map(async ({ table, query }) => {
        const [{ c }] = await query;
        return { table, count: c };
      })
    );

    res.json({ tables: results });
  } catch (err) {
    req.log.error({ err }, "db-stats error");
    res.status(500).json({ error: "Could not load DB stats" });
  }
});

export default router;
