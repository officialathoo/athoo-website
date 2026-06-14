import { Helmet } from "react-helmet-async";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { getBlogPost, BLOG_POSTS } from "@/lib/blogData";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8">This article may have moved or been removed.</p>
        <Link href="/blogs" className="rounded-full bg-[#0057FF] px-8 py-4 font-bold text-white hover:bg-blue-700 transition-colors">
          Back to Blog
        </Link>
      </div>
    );
  }

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  return (
    <>
      <Helmet>
        <title>{post.title} — Athoo Blog</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://athoo.pk/blogs/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://athoo.pk/blogs/${post.slug}`} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content={post.author} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "author": { "@type": "Organization", "name": post.author },
          "datePublished": post.publishedAt,
          "publisher": { "@type": "Organization", "name": "Athoo", "url": "https://athoo.pk/" },
          "mainEntityOfPage": { "@type": "WebPage", "@id": `https://athoo.pk/blogs/${post.slug}` }
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="athoo-navy py-20 px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-orange-400">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>{post.author}</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </motion.div>
        </section>

        {/* Content */}
        <article className="max-w-3xl mx-auto px-6 py-16">
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
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Prev / Next */}
        <section className="border-t border-gray-100 bg-gray-50 px-6 py-12">
          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
            {prevPost ? (
              <Link href={`/blogs/${prevPost.slug}`} className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-blue-200 hover:shadow-md transition-all">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5"><ArrowLeft className="h-3.5 w-3.5" /> Previous</p>
                <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#0057FF] transition-colors">{prevPost.title}</p>
              </Link>
            ) : <div />}
            {nextPost ? (
              <Link href={`/blogs/${nextPost.slug}`} className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-blue-200 hover:shadow-md transition-all text-right">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5 justify-end">Next <ArrowRight className="h-3.5 w-3.5" /></p>
                <p className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#0057FF] transition-colors">{nextPost.title}</p>
              </Link>
            ) : <div />}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 text-center bg-white border-t border-gray-100">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Ready to try Athoo?</h2>
            <p className="text-gray-600 mb-8">Join the waitlist and be first to know when Athoo launches in Rawalpindi and Islamabad.</p>
            <Link href="/#waitlist" className="inline-block rounded-full bg-[#0057FF] px-8 py-4 font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Join the Waitlist
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
