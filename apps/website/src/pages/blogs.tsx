import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blogData";
import { apiUrl } from "@/lib/apiBase";

type ApiBlogPost = {
  id: number; title: string; slug: string; excerpt: string; category: string;
  author: string; status: string; featured: boolean; cover_image: string | null;
  read_time: string | null; published_at: string | null; created_at: string;
};

function toDisplayPost(p: ApiBlogPost) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    category: p.category,
    author: p.author,
    publishedAt: p.published_at || p.created_at,
    readTime: p.read_time || "5 min read",
    featured: p.featured,
    imageUrl: (p as any).imageUrl || p.cover_image || undefined,
  };
}

export default function Blogs() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState(BLOG_POSTS);
  const [categories, setCategories] = useState(["All", ...BLOG_CATEGORIES]);

  useEffect(() => {
    fetch(apiUrl("/api/public/blog/posts?limit=100"))
      .then((r) => r.json())
      .then((data) => {
        const postArr = data.ok && Array.isArray(data.posts) ? data.posts
          : Array.isArray(data) ? data : [];
        if (postArr.length > 0) {
          const apiMapped = postArr.map(toDisplayPost);
          const apiSlugs = new Set(apiMapped.map((p: any) => p.slug));
          const staticOnly = BLOG_POSTS.filter((p) => !apiSlugs.has(p.slug));
          const merged = [...apiMapped, ...staticOnly];
          setPosts(merged);
          const cats: string[] = Array.from(new Set(merged.map((p: any) => String(p.category))));
          setCategories(["All", ...cats]);
        }
      })
      .catch(() => {/* fallback to static */});
  }, []);

  const filtered = posts.filter((post) => {
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Athoo Blog — Home Services Insights for Pakistan</title>
        <meta
          name="description"
          content="Read Athoo's blog for tips on hiring home service professionals, platform updates, and insights on the home services market in Rawalpindi and Islamabad."
        />
        <link rel="canonical" href="https://athoo.pk/blogs" />
        <meta property="og:title" content="Athoo Blog — Home Services Insights for Pakistan" />
        <meta property="og:description" content="Tips, guides and platform updates from the Athoo team." />
        <meta property="og:url" content="https://athoo.pk/blogs" />
        <meta property="og:image" content="https://athoo.pk/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Athoo Blog — Home Services Insights for Pakistan" />
        <meta name="twitter:description" content="Tips, guides and platform updates from the Athoo team." />
        <meta name="twitter:image" content="https://athoo.pk/opengraph.jpg" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="athoo-navy py-24 px-6 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-orange-400 mb-6">
              Athoo Blog
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              Home Services Insights
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Tips, guides and updates from the Athoo team — helping customers
              and service professionals navigate Pakistan's home services market.
            </p>
          </motion.div>
        </section>

        {/* Search + Filter */}
        <section className="border-b border-gray-100 bg-gray-50 px-6 py-8 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white pl-11 pr-5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === cat
                      ? "bg-[#0057FF] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-500">
              <p className="text-lg">No articles found for your search.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
              {filtered.map((post, i) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ delay: i * 0.07 }}
                  className="group rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {(post as any).imageUrl && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={(post as any).imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                        Featured
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-black text-gray-900 mb-4 leading-tight group-hover:text-[#0057FF] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.publishedAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <Link
                      href={`/blogs/${post.slug}`}
                      className="flex items-center gap-1.5 text-sm font-bold text-[#0057FF] hover:gap-2.5 transition-all"
                    >
                      Read <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-gray-50 border-t border-gray-100 px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              Stay Updated on Athoo's Launch
            </h2>
            <p className="text-gray-600 mb-8">
              Join the waitlist to get launch updates, blog posts and exclusive
              early access news directly in your inbox.
            </p>
            <Link
              href="/#waitlist"
              className="inline-block rounded-full bg-[#0057FF] px-8 py-4 font-bold text-white shadow-lg hover:bg-blue-700 transition-colors"
            >
              Join Waitlist
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}



