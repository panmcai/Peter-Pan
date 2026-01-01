import Link from 'next/link';
import { Calendar, Clock, Tag } from 'lucide-react';
import { getAllBlogPosts, getBlogCategories } from '@/lib/blog-data';

export default function Blog() {
  const blogPosts = getAllBlogPosts();
  const categories = ['全部', ...getBlogCategories()];
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-black dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 px-4 py-20 dark:border-zinc-800">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              技术博客
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/90">
              分享编程知识、技术见解和最佳实践
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    category === '全部'
                      ? 'bg-blue-600 text-white'
                      : 'border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 p-6">
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {post.title}
                  </h2>
                  <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto space-y-3">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {post.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
