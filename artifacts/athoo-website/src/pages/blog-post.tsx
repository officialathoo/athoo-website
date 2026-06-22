import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "wouter";
import { motion } from "@/lib/motionLite";
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { getBlogPost, BLOG_POSTS } from "@/lib/blogData";
import DOMPurify from "dompurify";
import { apiUrl } from "@/lib/apiBase";

type ApiPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  status: string;
  featured: boolean;
  cover_image: string | null;
  imageUrl?: string | null;
  read_time: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  tags?: string[];
};

function toDisplayPost(p: ApiPost) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    content: p.content || "",
    category: p.category,
    author: p.author,
    publishedAt: p.published_at || p.created_at,
    readTime: p.read_time || "5 min read",
    featured: p.featured,
    metaTitle: p.meta_title || p.title,
    metaDescription: p.meta_description || p.excerpt || "",
    tags: p.tags || [],
    imageUrl: p.imageUrl || p.cover_image || undefined,
  };
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<ReturnType<typeof toDisplayPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    setLoading(true);

    fetch(apiUrl(`/api/public/blog/posts/${encodeURIComponent(slug)}`), {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.post) {
          setPost(toDisplayPost(data.post));
        } else {
          const staticPost = getBlogPost(slug);
          setPost(
            staticPost
              ? {
                  ...staticPost,
                  imageUrl: staticPost.imageUrl ?? undefined,
                  featured: staticPost.featured ?? false,
                  metaTitle: staticPost.title,
                  metaDescription: staticPost.excerpt,
                  tags: [],
                }
              : null,
          );
        }
      })
      .catch(() => {
        const staticPost = getBlogPost(slug);
        setPost(
          staticPost
            ? {
                ...staticPost,
                imageUrl: staticPost.imageUrl ?? undefined,
                featured: staticPost.featured ?? false,
                metaTitle: staticPost.title,
                metaDescription: staticPost.excerpt,
                tags: [],
              }
            : null,
        );
      })
      .finally(() => {
        window.clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [slug]);

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const same = BLOG_POSTS.filter((p) => p.slug !== slug && p.category === post.category);
    const other = BLOG_POSTS.filter((p) => p.slug !== slug && p.category !== post.category);
    return [...same, ...other].slice(0, 3);
  }, [slug, post]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-[#0057FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8">This article may have moved or been removed.</p>
        <Link
          href="/blogs"
          className="rounded-full bg-[#0057FF] px-8 py-4 font-bold text-white hover:bg-blue-700 transition-colors"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  const pageUrl = `https://www.athoo.pk/blogs/${post.slug}`;
  const fallbackImage = "/images/blog-default.webp";

  return (
    <>
      <Helmet>
        <title>{post.metaTitle} — Athoo Blog</title>
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={`https://www.athoo.pk/blogs/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.athoo.pk/blogs/${post.slug}`} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content={post.author} />
        <meta property="og:image" content="https://www.athoo.pk/opengraph.jpg" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content="https://www.athoo.pk/opengraph.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            author: { "@type": "Organization", name: post.author },
            datePublished: post.publishedAt,
            publisher: { "@type": "Organization", name: "Athoo", url: "https://www.athoo.pk/" },
            mainEntityOfPage: { "@type": "WebPage", "@id": `https://www.athoo.pk/blogs/${post.slug}` },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <section className="athoo-navy py-20 px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-orange-400">
                {post.category}
              </span>
              {post.tags?.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-400">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span>{post.author}</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </motion.div>
        </section>

        <article className="max-w-3xl mx-auto px-6 py-16">
          <div className="mb-10 overflow-hidden rounded-3xl shadow-xl">
            <img
              src={(post as any).imageUrl || fallbackImage}
              alt={post.title}
              width={800}
              height={450}
              className="h-64 w-full object-cover sm:h-80"
              loading="eager"
              decoding="async"
              onError={(event) => { event.currentTarget.src = fallbackImage; }}
            />
          </div>

          <p className="text-xl text-gray-600 leading-relaxed mb-10 font-medium border-l-4 border-[#0057FF] pl-6">
            {post.excerpt}
          </p>

          <div
            className="prose prose-lg prose-blue max-w-none text-gray-700
              prose-headings:text-gray-900 prose-headings:font-black
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:mb-5
              prose-ul:my-5 prose-li:mb-2
              prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content, { ADD_ATTR: ["target"] }),
            }}
          />

          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-8 pb-4 mt-12">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 mr-1">
              <Share2 className="h-4 w-4" /> Share:
            </span>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              Facebook
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title + " — Athoo Blog")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-colors"
            >
              X / Twitter
            </a>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
            >
              WhatsApp
            </a>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(pageUrl);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>
        </article>

        {(prevPost || nextPost) && (
          <section className="border-t border-gray-100 bg-gray-50 px-6 py-12">
            <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
              {prevPost ? (
                <Link href={`/blogs/${prevPost.slug}`} className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-blue-200 hover:shadow-md transition-all">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </p>
                  <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#0057FF] transition-colors">
                    {prevPost.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link href={`/blogs/${nextPost.slug}`} className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-blue-200 hover:shadow-md transition-all text-right">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5 justify-end">
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </p>
                  <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#0057FF] transition-colors">
                    {nextPost.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </section>
        )}

        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 border-t border-gray-100 px-6 py-14">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-black text-gray-900 mb-7">More Articles</h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/blogs/${rp.slug}`} className="group rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-200 hover:shadow-md transition-all">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 mb-3 inline-block">
                      {rp.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#0057FF] transition-colors">
                      {rp.title}
                    </h3>
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">{rp.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-6 py-16 text-center bg-white border-t border-gray-100">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Ready to try Athoo?</h2>
            <p className="text-gray-600 mb-8">
              Join the waitlist and be first to know when Athoo launches in Rawalpindi and Islamabad.
            </p>
            <Link href="/#waitlist" className="inline-block rounded-full bg-[#0057FF] px-8 py-4 font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Join the Waitlist
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}


