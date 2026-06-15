import { Router } from "express";
import crypto from "node:crypto";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger.js";

const router = Router();

function sanitize(v: unknown, max = 1000): string {
  return String(v ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
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
  } catch { return null; }
}

function requireAdmin(req: any, res: any): boolean {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!verifyToken(token)) { res.status(401).json({ ok: false, error: "Unauthorized" }); return false; }
  return true;
}

// GET /api/admin/media
router.get("/admin/media", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { rows } = await pool.query(`SELECT * FROM media_library ORDER BY created_at DESC`);
    res.json({ ok: true, items: rows });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Media list error");
    res.status(500).json({ ok: false, error: "Could not load media" });
  }
});

// POST /api/admin/media
router.post("/admin/media", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const body = req.body || {};
    const url = sanitize(body.url, 1000);
    if (!url) return res.status(400).json({ ok: false, error: "URL is required" });
    const alt = sanitize(body.alt, 500);
    const caption = sanitize(body.caption, 500);
    const type = ["image", "video", "document"].includes(body.type) ? body.type : "image";
    const { rows } = await pool.query(
      `INSERT INTO media_library (url, alt, caption, type) VALUES ($1, $2, $3, $4) RETURNING *`,
      [url, alt, caption, type]
    );
    res.status(201).json({ ok: true, item: rows[0] });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Media create error");
    res.status(500).json({ ok: false, error: "Could not save media" });
  }
});

// PATCH /api/admin/media/:id
router.patch("/admin/media/:id", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid ID" });
    const body = req.body || {};
    const alt = sanitize(body.alt, 500);
    const caption = sanitize(body.caption, 500);
    const { rows } = await pool.query(
      `UPDATE media_library SET alt = $1, caption = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [alt, caption, id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, item: rows[0] });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Media update error");
    res.status(500).json({ ok: false, error: "Could not update media" });
  }
});

// DELETE /api/admin/media/:id
router.delete("/admin/media/:id", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid ID" });
    await pool.query(`DELETE FROM media_library WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Media delete error");
    res.status(500).json({ ok: false, error: "Could not delete media" });
  }
});

export default router;
