import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog-data';

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post || !post.content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-black dark:via-blue-950/10 dark:to-purple-950/10">
      {/* Article Header */}
      <article className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4 py-20 dark:border-zinc-800">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white dark:text-white/70 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            返回博客列表
          </Link>
          <div className="mb-4">
            <span className="inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {post.category}
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {post.title}
          </h1>
          <p className="mb-6 text-xl text-white/90">
            {post.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{post.readTime} 阅读</span>
            </div>
            <button className="flex items-center gap-2 text-white/90 transition-colors hover:text-white">
              <Share2 size={16} />
              分享
            </button>
          </div>
        </div>
      </article>

      {/* Article Content */}
      <article className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900/80 dark:shadow-zinc-950/50">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="border-t border-zinc-200 bg-gradient-to-br from-zinc-50 to-blue-50/30 px-4 py-16 dark:border-zinc-800 dark:from-zinc-900/50 dark:to-blue-950/20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            相关文章
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {getAllBlogPosts()
              .filter((p) => p.slug !== post.slug && p.category === post.category)
              .slice(0, 2)
              .map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-blue-400 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-blue-700"
                >
                  <div className="mb-3 h-2 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    {relatedPost.date}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
