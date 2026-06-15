import { Router } from "express";
import crypto from "node:crypto";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger.js";

const router = Router();

function sanitize(value: unknown, max = 2000): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function sanitizeSlug(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
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
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
}

// ─── Public endpoints ────────────────────────────────────────────────────────

router.get("/public/blog/posts", async (req: any, res: any) => {
  try {
    const category = sanitize(req.query.category, 100) || null;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    let q = `
      SELECT id, title, slug, excerpt, category, author, status, featured,
             cover_image, read_time, meta_title, published_at, created_at
      FROM blog_posts
      WHERE status = 'published'
    `;
    const params: unknown[] = [];
    if (category) {
      params.push(category);
      q += ` AND category = $${params.length}`;
    }
    q += ` ORDER BY COALESCE(published_at, created_at) DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(q, params);
    return res.json({ ok: true, posts: result.rows });
  } catch (err: any) {
    logger.warn({ err: err?.message }, "Failed to load public blog posts");
    return res.json({ ok: false, posts: [] });
  }
});

router.get("/public/blog/posts/:slug", async (req: any, res: any) => {
  try {
    const slug = sanitizeSlug(req.params.slug);
    if (!slug) return res.status(400).json({ ok: false, error: "Invalid slug" });

    const result = await pool.query(
      `SELECT * FROM blog_posts WHERE slug = $1 AND status = 'published' LIMIT 1`,
      [slug],
    );
    if (!result.rows.length) return res.status(404).json({ ok: false, error: "Post not found" });
    return res.json({ ok: true, post: result.rows[0] });
  } catch (err: any) {
    logger.warn({ err: err?.message }, "Failed to load blog post");
    return res.status(500).json({ ok: false, error: "Could not load post" });
  }
});

// ─── Admin endpoints ──────────────────────────────────────────────────────────

router.get("/admin/blog/posts", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const search = sanitize(req.query.search, 200) || null;
    const status = sanitize(req.query.status, 50) || null;
    const category = sanitize(req.query.category, 100) || null;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    let q = `SELECT id, title, slug, excerpt, category, author, status, featured, cover_image, read_time, meta_title, meta_description, published_at, created_at, updated_at FROM blog_posts WHERE 1=1`;
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      q += ` AND (title ILIKE $${params.length} OR excerpt ILIKE $${params.length} OR category ILIKE $${params.length})`;
    }
    if (status) { params.push(status); q += ` AND status = $${params.length}`; }
    if (category) { params.push(category); q += ` AND category = $${params.length}`; }
    q += ` ORDER BY COALESCE(updated_at, created_at) DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      pool.query(q, params),
      pool.query(`SELECT COUNT(*) AS total FROM blog_posts`),
    ]);
    return res.json({ ok: true, posts: result.rows, total: Number(countResult.rows[0].total) });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Failed to load admin blog posts");
    return res.status(500).json({ ok: false, error: "Could not load posts" });
  }
});

router.post("/admin/blog/posts", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const body = req.body || {};
    const title = sanitize(body.title, 300);
    const slug = sanitizeSlug(body.slug || body.title);
    const excerpt = sanitize(body.excerpt, 1000) || null;
    const content = sanitize(body.content, 200000) || null;
    const category = sanitize(body.category, 100) || "Insights";
    const author = sanitize(body.author, 120) || "Athoo Team";
    const status = ["draft", "published"].includes(body.status) ? body.status : "draft";
    const featured = Boolean(body.featured);
    const coverImage = sanitize(body.coverImage || body.cover_image, 500) || null;
    const readTime = sanitize(body.readTime || body.read_time, 50) || null;
    const metaTitle = sanitize(body.metaTitle || body.meta_title, 300) || null;
    const metaDescription = sanitize(body.metaDescription || body.meta_description, 500) || null;
    const publishedAt = status === "published" ? (body.publishedAt || new Date().toISOString()) : null;
    const tags = Array.isArray(body.tags) ? body.tags.map((t: unknown) => sanitize(t, 60)).filter(Boolean) : [];

    if (!title || !slug) return res.status(400).json({ ok: false, error: "Title and slug are required." });

    const result = await pool.query(
      `INSERT INTO blog_posts
        (title, slug, excerpt, content, category, author, status, featured,
         cover_image, read_time, meta_title, meta_description, published_at, tags, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW())
       RETURNING id, title, slug, status, category, featured, read_time, tags, created_at`,
      [title, slug, excerpt, content, category, author, status, featured,
       coverImage, readTime, metaTitle, metaDescription, publishedAt, tags],
    );
    return res.status(201).json({ ok: true, post: result.rows[0] });
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ ok: false, error: "A post with this slug already exists." });
    logger.error({ err: err?.message }, "Failed to create blog post");
    return res.status(500).json({ ok: false, error: "Could not create post" });
  }
});

router.put("/admin/blog/posts/:id", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid post ID" });

    const body = req.body || {};
    const title = sanitize(body.title, 300);
    const slug = sanitizeSlug(body.slug || body.title);
    const excerpt = sanitize(body.excerpt, 1000) || null;
    const content = sanitize(body.content, 200000) || null;
    const category = sanitize(body.category, 100) || "Insights";
    const author = sanitize(body.author, 120) || "Athoo Team";
    const status = ["draft", "published"].includes(body.status) ? body.status : "draft";
    const featured = Boolean(body.featured);
    const coverImage = sanitize(body.coverImage || body.cover_image, 500) || null;
    const readTime = sanitize(body.readTime || body.read_time, 50) || null;
    const metaTitle = sanitize(body.metaTitle || body.meta_title, 300) || null;
    const metaDescription = sanitize(body.metaDescription || body.meta_description, 500) || null;
    const publishedAt = status === "published" ? (body.publishedAt || new Date().toISOString()) : null;
    const tags = Array.isArray(body.tags) ? body.tags.map((t: unknown) => sanitize(t, 60)).filter(Boolean) : [];

    if (!title || !slug) return res.status(400).json({ ok: false, error: "Title and slug are required." });

    const result = await pool.query(
      `UPDATE blog_posts SET
        title=$1, slug=$2, excerpt=$3, content=$4, category=$5, author=$6,
        status=$7, featured=$8, cover_image=$9, read_time=$10,
        meta_title=$11, meta_description=$12, published_at=$13, tags=$14, updated_at=NOW()
       WHERE id=$15
       RETURNING id, title, slug, status, category, featured, read_time, tags, updated_at`,
      [title, slug, excerpt, content, category, author, status, featured,
       coverImage, readTime, metaTitle, metaDescription, publishedAt, tags, id],
    );
    if (!result.rows.length) return res.status(404).json({ ok: false, error: "Post not found" });
    return res.json({ ok: true, post: result.rows[0] });
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ ok: false, error: "A post with this slug already exists." });
    logger.error({ err: err?.message }, "Failed to update blog post");
    return res.status(500).json({ ok: false, error: "Could not update post" });
  }
});

// POST /api/admin/blog/posts/:id/publish
router.post("/admin/blog/posts/:id/publish", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid ID" });
    const { rows } = await pool.query(
      `UPDATE blog_posts SET status='published', published_at=COALESCE(published_at, NOW()), updated_at=NOW() WHERE id=$1 RETURNING id, title, status, published_at`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: "Post not found" });
    return res.json({ ok: true, post: rows[0] });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Failed to publish post");
    return res.status(500).json({ ok: false, error: "Could not publish post" });
  }
});

// POST /api/admin/blog/posts/:id/unpublish
router.post("/admin/blog/posts/:id/unpublish", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid ID" });
    const { rows } = await pool.query(
      `UPDATE blog_posts SET status='draft', updated_at=NOW() WHERE id=$1 RETURNING id, title, status`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: "Post not found" });
    return res.json({ ok: true, post: rows[0] });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Failed to unpublish post");
    return res.status(500).json({ ok: false, error: "Could not unpublish post" });
  }
});

// GET /api/public/blog/categories
router.get("/public/blog/categories", async (_req: any, res: any) => {
  try {
    const { rows } = await pool.query(`SELECT id, name, slug, description FROM blog_categories ORDER BY name`);
    return res.json({ ok: true, categories: rows });
  } catch (err: any) {
    logger.warn({ err: err?.message }, "Failed to load categories");
    return res.json({ ok: false, categories: [] });
  }
});

// GET /api/public/blog/tags
router.get("/public/blog/tags", async (_req: any, res: any) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT unnest(tags) AS tag FROM blog_posts WHERE array_length(tags,1) > 0 ORDER BY tag`
    );
    return res.json({ ok: true, tags: rows.map((r: any) => r.tag) });
  } catch (err: any) {
    logger.warn({ err: err?.message }, "Failed to load tags");
    return res.json({ ok: false, tags: [] });
  }
});

// GET /api/admin/blog/categories
router.get("/admin/blog/categories", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { rows } = await pool.query(`SELECT id, name, slug, description, created_at FROM blog_categories ORDER BY name`);
    return res.json({ ok: true, categories: rows });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Failed to load admin categories");
    return res.status(500).json({ ok: false, error: "Could not load categories" });
  }
});

// POST /api/admin/blog/categories
router.post("/admin/blog/categories", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const name = sanitize(req.body?.name, 100);
    const description = sanitize(req.body?.description, 500) || null;
    if (!name) return res.status(400).json({ ok: false, error: "Name is required" });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { rows } = await pool.query(
      `INSERT INTO blog_categories (name, slug, description) VALUES ($1,$2,$3) RETURNING *`,
      [name, slug, description]
    );
    return res.status(201).json({ ok: true, category: rows[0] });
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ ok: false, error: "Category already exists" });
    logger.error({ err: err?.message }, "Failed to create category");
    return res.status(500).json({ ok: false, error: "Could not create category" });
  }
});

// DELETE /api/admin/blog/categories/:id
router.delete("/admin/blog/categories/:id", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid ID" });
    await pool.query(`DELETE FROM blog_categories WHERE id = $1`, [id]);
    return res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Failed to delete category");
    return res.status(500).json({ ok: false, error: "Could not delete category" });
  }
});

router.delete("/admin/blog/posts/:id", async (req: any, res: any) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, error: "Invalid post ID" });
    await pool.query(`DELETE FROM blog_posts WHERE id = $1`, [id]);
    return res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Failed to delete blog post");
    return res.status(500).json({ ok: false, error: "Could not delete post" });
  }
});

export default router;
