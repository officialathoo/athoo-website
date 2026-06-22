import { motion } from "@/lib/motionLite";
import { Link } from "wouter";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogData";

export default function BlogPreview() {
  const posts = BLOG_POSTS.slice(0, 3);
  const fallbackImage = "/images/blog-default.webp";

  return (
    <section className="bg-gray-50 border-t border-gray-100 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14"
        >
          <div>
            <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600 mb-4">
              From the Blog
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Home Services Insights
            </h2>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0057FF] hover:gap-3 transition-all whitespace-nowrap"
          >
            All Articles <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ delay: i * 0.08 }}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="w-full h-44 overflow-hidden">
                <img
                  src={post.imageUrl || fallbackImage}
                  alt={post.title}
                  width={800}
                  height={450}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => { event.currentTarget.src = fallbackImage; }}
                />
              </div>
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-5">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                    {post.category}
                  </span>
                  {post.featured && (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-gray-900 leading-tight mb-3 group-hover:text-[#0057FF] transition-colors flex-1">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="flex items-center gap-1 text-xs font-bold text-[#0057FF] group-hover:gap-2 transition-all"
                  >
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
