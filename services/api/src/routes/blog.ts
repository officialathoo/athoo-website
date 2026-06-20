import { Router, type IRouter } from "express";
import { eq, and, ilike, desc } from "drizzle-orm";
import { db, blogPostsTable } from "@athoo/db";
import { GetBlogPostParams, GetBlogPostsQueryParams } from "@athoo/validation";

const router: IRouter = Router();

router.get(["/blog/posts", "/public/blog/posts"], async (req, res): Promise<void> => {
  const parsed = GetBlogPostsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, limit = 10, offset = 0 } = parsed.data;

  const conditions = [eq(blogPostsTable.isPublished, true)];
  if (category) {
    conditions.push(ilike(blogPostsTable.category, category));
  }

  const posts = await db
    .select()
    .from(blogPostsTable)
    .where(and(...conditions))
    .orderBy(desc(blogPostsTable.publishedAt))
    .limit(limit)
    .offset(offset);

  const mapped = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    tags: p.tags ?? [],
    publishedAt: p.publishedAt?.toISOString() ?? new Date().toISOString(),
    published_at: p.publishedAt?.toISOString() ?? new Date().toISOString(),
    readingTimeMinutes: p.readingTimeMinutes,
    read_time: p.readingTimeMinutes ? `${p.readingTimeMinutes} min read` : "5 min read",
    imageUrl: p.imageUrl,
    cover_image: p.imageUrl ?? null,
    metaTitle: p.metaTitle ?? null,
    meta_title: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null,
    meta_description: p.metaDescription ?? null,
    author: p.author,
    featured: false,
    status: "published",
  }));
  res.json({ ok: true, posts: mapped });
});

router.get(["/blog/posts/:slug", "/public/blog/posts/:slug"], async (req, res): Promise<void> => {
  const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  const [post] = await db
    .select()
    .from(blogPostsTable)
    .where(and(eq(blogPostsTable.slug, rawSlug), eq(blogPostsTable.isPublished, true)))
    .limit(1);

  if (!post) {
    res.status(404).json({ ok: false, error: "Blog post not found" });
    return;
  }

  const mapped = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags ?? [],
    publishedAt: post.publishedAt?.toISOString() ?? new Date().toISOString(),
    published_at: post.publishedAt?.toISOString() ?? new Date().toISOString(),
    readingTimeMinutes: post.readingTimeMinutes,
    read_time: post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : "5 min read",
    imageUrl: post.imageUrl,
    cover_image: post.imageUrl ?? null,
    metaTitle: post.metaTitle ?? null,
    meta_title: post.metaTitle ?? null,
    metaDescription: post.metaDescription ?? null,
    meta_description: post.metaDescription ?? null,
    author: post.author,
    featured: false,
    status: "published",
  };
  res.json({ ok: true, post: mapped });
});

export default router;
