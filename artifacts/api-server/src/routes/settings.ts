import { Router } from "express";
import crypto from "node:crypto";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger.js";

const router = Router();

function sanitizeKey(v: unknown): string {
  return String(v ?? "").replace(/[^a-z0-9_-]/gi, "").slice(0, 120);
}

function secret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "athoo-admin-secret";
}

function verifyToken(token: string): Record<string, unknown> | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  try {
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Record<string, unknown>;
    if (!payload.exp || Date.now() > (payload.exp as number)) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAdmin(req: any, res: any): boolean {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!verifyToken(token)) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
}

// GET /api/admin/extended-settings — returns ALL app_settings as flat object
router.get("/admin/extended-settings", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { rows } = await pool.query("SELECT key, value FROM app_settings ORDER BY key");
    const settings: Record<string, unknown> = {};
    for (const row of rows) settings[row.key] = row.value;
    res.json({ ok: true, settings });
  } catch (err) {
    logger.error({ err }, "Extended settings error");
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// POST /api/admin/upsert-setting — upsert a single key/value in app_settings
router.post("/admin/upsert-setting", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  const key = sanitizeKey(req.body?.key);
  const { value } = req.body ?? {};
  if (!key) return res.status(400).json({ ok: false, error: "key is required" });
  try {
    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = NOW()`,
      [key, JSON.stringify(value ?? null)]
    );
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Upsert setting error");
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// GET /api/public/site-settings — public subset of settings for the frontend
router.get("/public/site-settings", async (_req: any, res: any) => {
  try {
    const { rows } = await pool.query(
      `SELECT key, value FROM app_settings WHERE key IN (
        'maintenance_mode','site_title','site_description','whatsapp_number',
        'social_instagram','social_facebook','social_tiktok','social_linkedin',
        'launch_date','social_links','seo_settings'
      )`
    );
    const settings: Record<string, unknown> = {};
    for (const row of rows) settings[row.key] = row.value;
    res.json({ ok: true, settings });
  } catch (err) {
    logger.error({ err }, "Public site settings error");
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// GET /api/health (alias)
router.get("/health", (_req: any, res: any) => res.json({ status: "ok" }));

// GET /api/admin/seo
router.get("/admin/seo", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { rows } = await pool.query(`SELECT value FROM app_settings WHERE key = 'seo_settings' LIMIT 1`);
    res.json({ ok: true, seo: rows[0]?.value ?? {} });
  } catch (err) { logger.error({ err }, "SEO get error"); res.status(500).json({ ok: false, error: "Server error" }); }
});

// PATCH /api/admin/seo
router.patch("/admin/seo", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ('seo_settings', $1::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1::jsonb, updated_at = NOW()`,
      [JSON.stringify(req.body ?? {})]
    );
    res.json({ ok: true });
  } catch (err) { logger.error({ err }, "SEO patch error"); res.status(500).json({ ok: false, error: "Server error" }); }
});

// GET /api/admin/social-links
router.get("/admin/social-links", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { rows } = await pool.query(`SELECT value FROM app_settings WHERE key = 'social_links' LIMIT 1`);
    res.json({ ok: true, links: rows[0]?.value ?? {} });
  } catch (err) { logger.error({ err }, "Social get error"); res.status(500).json({ ok: false, error: "Server error" }); }
});

// PATCH /api/admin/social-links
router.patch("/admin/social-links", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ('social_links', $1::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1::jsonb, updated_at = NOW()`,
      [JSON.stringify(req.body ?? {})]
    );
    res.json({ ok: true });
  } catch (err) { logger.error({ err }, "Social patch error"); res.status(500).json({ ok: false, error: "Server error" }); }
});

// GET /api/admin/templates
router.get("/admin/templates", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { rows } = await pool.query(`SELECT id, name, subject, body, category FROM athoo_email_templates ORDER BY id`);
    res.json({ ok: true, templates: rows });
  } catch (err) { logger.error({ err }, "Templates get error"); res.status(500).json({ ok: false, error: "Server error" }); }
});

// POST /api/admin/templates
router.post("/admin/templates", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const name = sanitizeKey(req.body?.name).slice(0, 100) || "Template";
    const subject = String(req.body?.subject ?? "").slice(0, 300);
    const body = String(req.body?.body ?? "").slice(0, 10000);
    const category = String(req.body?.category ?? "general").slice(0, 50);
    const { rows } = await pool.query(
      `INSERT INTO athoo_email_templates (name, subject, body, category) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, subject, body, category]
    );
    res.status(201).json({ ok: true, template: rows[0] });
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ ok: false, error: "Template name already exists" });
    logger.error({ err }, "Template create error"); res.status(500).json({ ok: false, error: "Server error" });
  }
});

// PATCH /api/admin/templates/:id
router.patch("/admin/templates/:id", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid ID" });
    const subject = String(req.body?.subject ?? "").slice(0, 300);
    const body = String(req.body?.body ?? "").slice(0, 10000);
    const name = String(req.body?.name ?? "").slice(0, 100);
    const { rows } = await pool.query(
      `UPDATE athoo_email_templates SET name=$1, subject=$2, body=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
      [name, subject, body, id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, template: rows[0] });
  } catch (err) { logger.error({ err }, "Template update error"); res.status(500).json({ ok: false, error: "Server error" }); }
});

// DELETE /api/admin/templates/:id
router.delete("/admin/templates/:id", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid ID" });
    await pool.query(`DELETE FROM athoo_email_templates WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) { logger.error({ err }, "Template delete error"); res.status(500).json({ ok: false, error: "Server error" }); }
});

// GET /api/admin/db-stats
router.get("/admin/db-stats", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const tables = ["website_leads","blog_posts","blog_categories","blog_tags","media_library","athoo_email_templates","athoo_email_logs","athoo_admin_users","app_settings","cms_pages","roles"];
    const stats = await Promise.all(tables.map(async (t) => {
      try {
        const { rows } = await pool.query(`SELECT COUNT(*) AS count FROM ${t}`);
        return { table: t, count: Number(rows[0].count) };
      } catch { return { table: t, count: -1 }; }
    }));
    res.json({ ok: true, stats });
  } catch (err) { logger.error({ err }, "DB stats error"); res.status(500).json({ ok: false, error: "Server error" }); }
});

export default router;
