# 博客数据读取示例

本文档展示如何在Next.js项目中读取本地Markdown和TypeScript数据。

## 方案一：从TypeScript文件读取（推荐）

这种方式最简单，适合静态博客。

### 1. 创建数据文件 `src/lib/blog-data.ts`

```typescript
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  content: string;  // Markdown格式的字符串
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  author?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'getting-started-with-nextjs',
    title: 'Next.js 入门指南',
    description: '学习如何使用 Next.js 构建现代化的 React 应用',
    excerpt: 'Next.js 是一个功能强大的 React 框架，本文将带你快速入门。',
    content: `
# Next.js 入门指南

Next.js 是一个功能强大的 React 框架，提供了许多开箱即用的功能。

## 什么是 Next.js

Next.js 是一个基于 React 的服务端渲染框架。

## 安装

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

## 特性

- 服务端渲染（SSR）
- 静态站点生成（SSG）
- API Routes
- TypeScript 支持
    `,
    date: '2024-01-15',
    readTime: '5 分钟',
    category: '前端开发',
    tags: ['Next.js', 'React', 'TypeScript'],
  },
  {
    slug: 'advanced-react-patterns',
    title: 'React 高级模式',
    description: '深入了解 React 的高级设计模式和最佳实践',
    excerpt: '掌握高级模式可以让你写出更优雅、更高效的 React 代码。',
    content: `
# React 高级模式

## Hooks 模式

### 自定义 Hooks

\`\`\`typescript
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
\`\`\`

## 组合模式

通过 props.children 实现灵活的组件组合。
    `,
    date: '2024-01-20',
    readTime: '8 分钟',
    category: '前端开发',
    tags: ['React', 'Patterns', 'Hooks'],
  }
];

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getBlogCategories(): string[] {
  const categories = new Set(blogPosts.map(post => post.category));
  return Array.from(categories);
}
```

### 2. 在页面中使用

```typescript
// src/app/blog/page.tsx
import { getAllBlogPosts, getBlogCategories } from '@/lib/blog-data';

export default function Blog() {
  const blogPosts = getAllBlogPosts();
  const categories = ['全部', ...getBlogCategories()];

  return (
    <div>
      <h1>博客列表</h1>
      {blogPosts.map(post => (
        <Link key={post.slug} href={`/blog/${post.slug}`}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </Link>
      ))}
    </div>
  );
}
```

```typescript
// src/app/blog/[slug]/page.tsx
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div>
      <h1>{post.title}</h1>
      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
```

---

## 方案二：从Markdown文件读取

这种方式适合内容较多的情况。

### 1. 创建Markdown文件

`src/content/blog/getting-started-with-nextjs.md`:

```markdown
---
title: "Next.js 入门指南"
description: "学习如何使用 Next.js 构建现代化的 React 应用"
date: "2024-01-15"
readTime: "5 分钟"
category: "前端开发"
tags: ["Next.js", "React", "TypeScript"]
excerpt: "Next.js 是一个功能强大的 React 框架，本文将带你快速入门。"
---

# Next.js 入门指南

Next.js 是一个功能强大的 React 框架，提供了许多开箱即用的功能。
```

### 2. 创建读取工具函数 `src/lib/blog-utils.ts`

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export function getAllBlogPosts(): BlogPost[] {
  // 读取所有Markdown文件
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || '',
        description: data.description || '',
        excerpt: data.excerpt || '',
        content,
        date: data.date || '',
        readTime: data.readTime || '',
        category: data.category || '',
        tags: data.tags || [],
      } as BlogPost;
    });

  return allPostsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      excerpt: data.excerpt || '',
      content,
      date: data.date || '',
      readTime: data.readTime || '',
      category: data.category || '',
      tags: data.tags || [],
    } as BlogPost;
  } catch {
    return undefined;
  }
}
```

### 3. 安装依赖

```bash
pnpm add gray-matter @types/node
```

### 4. 在页面中使用（与方案一相同）

---

## 方案对比

| 特性 | TypeScript文件 | Markdown文件 |
|------|--------------|------------|
| 适合场景 | 少量文章、快速原型 | 大量文章、内容管理 |
| 内容编辑 | 需要修改代码文件 | 使用Markdown编辑器 |
| 类型安全 | ✅ 完全支持 | ⚠️ 需要额外工具 |
| 构建速度 | 快 | 较慢（需要读取文件） |
| 维护性 | 简单 | 更适合内容团队 |

## 推荐方案

对于个人博客项目，**推荐使用方案一（TypeScript文件）**，原因：

1. 实现简单，无需额外依赖
2. 类型安全，IDE支持更好
3. 构建速度快
4. 内容和代码在同一个地方，便于维护

如果将来内容增多，可以迁移到方案二或使用Headless CMS（如Sanity、Contentful等）。
