import { Router } from "express";
import { db, blogPosts, blogCategories, leads, emailLogs } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { sendMail } from "../../lib/mailer.js";
import type { AuthRequest } from "../../middlewares/auth.js";

const router = Router();

// ── Blog Posts ────────────────────────────────────────────────────────────

// GET /api/admin/blog/posts
router.get("/blog/posts", async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(blogPosts).orderBy(sql`${blogPosts.created_at} DESC`);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "get blog posts error");
    res.status(500).json({ error: "Could not load posts" });
  }
});

// POST /api/admin/blog/posts
router.post("/blog/posts", async (req: AuthRequest, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const [row] = await db.insert(blogPosts).values({
      title:            String(body.title ?? ""),
      slug:             slugify(String(body.slug || body.title || "")),
      category:         String(body.category ?? "Insights"),
      excerpt:          body.excerpt as string ?? null,
      content:          body.content as string ?? null,
      author:           body.author as string ?? "Athoo Team",
      status:           (body.status as "draft" | "published") ?? "draft",
      published_at:     body.publishedAt as string ?? null,
      cover_image:      body.coverImage as string ?? null,
      read_time:        body.readTime as string ?? null,
      featured:         Boolean(body.featured),
      meta_title:       body.metaTitle as string ?? null,
      meta_description: body.metaDescription as string ?? null,
      tags:             Array.isArray(body.tags) ? body.tags as string[] : [],
    }).returning();
    res.json({ ok: true, id: row.id });
  } catch (err) {
    req.log.error({ err }, "create blog post error");
    res.status(500).json({ error: "Could not create post" });
  }
});

// PATCH/PUT /api/admin/blog/posts/:id
const updateBlogPost = async (req: AuthRequest, res: any) => {
  try {
    const id   = Number(req.params.id);
    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = { updated_at: new Date() };
    const map: Record<string, string> = {
      title: "title", slug: "slug", category: "category", excerpt: "excerpt",
      content: "content", author: "author", status: "status",
      publishedAt: "published_at", coverImage: "cover_image", readTime: "read_time",
      featured: "featured", metaTitle: "meta_title", metaDescription: "meta_description",
      tags: "tags",
    };
    for (const [k, col] of Object.entries(map)) {
      if (k in body) patch[col] = body[k];
    }
    await db.update(blogPosts).set(patch as any).where(eq(blogPosts.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "update blog post error");
    res.status(500).json({ error: "Could not update post" });
  }
};
router.patch("/blog/posts/:id", updateBlogPost);
router.put("/blog/posts/:id", updateBlogPost);

// DELETE /api/admin/blog/posts/:id
router.delete("/blog/posts/:id", async (req: AuthRequest, res) => {
  try {
    await db.delete(blogPosts).where(eq(blogPosts.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "delete blog post error");
    res.status(500).json({ error: "Could not delete post" });
  }
});

// POST /api/admin/blog/newsletter/:id  — send post to all waitlist subscribers
router.post("/blog/newsletter/:id", async (req: AuthRequest, res) => {
  try {
    const postId = Number(req.params.id);
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, postId)).limit(1);
    if (!post) { res.status(404).json({ error: "Post not found" }); return; }

    const subscribers = await db.select({ email: leads.email, name: leads.name })
      .from(leads)
      .where(eq(leads.form_type, "Waitlist Signup"));

    const withEmail = subscribers.filter((s) => s.email);
    let sent = 0;
    let failed = 0;

    for (const sub of withEmail) {
      const result = await sendMail({
        to:      sub.email!,
        subject: `[Athoo] ${post.title}`,
        html:    `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <h2 style="color:#0057FF">${post.title}</h2>
  ${post.excerpt ? `<p style="color:#555">${post.excerpt}</p>` : ""}
  <p><a href="https://athoo.pk/blog/${post.slug}" style="background:#0057FF;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Read Article</a></p>
  <p style="font-size:12px;color:#9ca3af;margin-top:24px">Athoo · Rawalpindi &amp; Islamabad, Pakistan</p>
</div>`,
      });

      try {
        await db.insert(emailLogs).values({
          recipient: sub.email!,
          subject:   `[Athoo] ${post.title}`,
          status:    result.ok ? "sent" : result.status,
          sent_by:   req.adminEmail ?? "system",
        });
      } catch { /* non-fatal */ }

      if (result.ok) sent++;
      else failed++;
    }

    res.json({ ok: true, sent, failed, total: withEmail.length });
  } catch (err) {
    req.log.error({ err }, "newsletter error");
    res.status(500).json({ error: "Newsletter send failed" });
  }
});

// ── Blog Categories ───────────────────────────────────────────────────────

// GET /api/admin/blog/categories
router.get("/blog/categories", async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(blogCategories).orderBy(blogCategories.name);
    res.json({ rows });
  } catch (err) {
    req.log.error({ err }, "get blog cats error");
    res.status(500).json({ error: "Could not load categories" });
  }
});

// POST /api/admin/blog/categories
router.post("/blog/categories", async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body as { name?: string; description?: string };
    if (!name) { res.status(400).json({ error: "name is required" }); return; }
    const [row] = await db.insert(blogCategories).values({
      name,
      slug: slugify(name),
      description: description ?? null,
    }).returning();
    res.json({ ok: true, id: row.id });
  } catch (err) {
    req.log.error({ err }, "create blog cat error");
    res.status(500).json({ error: "Could not create category" });
  }
});

// DELETE /api/admin/blog/categories/:id
router.delete("/blog/categories/:id", async (req: AuthRequest, res) => {
  try {
    await db.delete(blogCategories).where(eq(blogCategories.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "delete blog cat error");
    res.status(500).json({ error: "Could not delete category" });
  }
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || `post-${Date.now()}`;
}

export default router;
