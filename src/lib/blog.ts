import fs from 'fs';
import path from 'path';

// 使用 process.cwd() 以兼容 Next.js
const BLOG_DIR = path.resolve(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  content?: string;
  excerpt?: string;
}

function parseFrontmatter(content: string): { metadata: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content };
  }

  const frontmatter = match[1];
  const body = match[2];
  const metadata: Record<string, any> = {};

  frontmatter.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    let value: string | string[] = line.slice(colonIndex + 1).trim();

    // 处理数组值
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((v) => v.trim().replace(/['"]/g, ''));
    } else {
      // 移除引号
      const strValue = value.replace(/^['"]|['"]$/g, '');
      value = strValue;
    }

    metadata[key] = value;
  });

  return { metadata, content: body };
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const fileNames = fs.readdirSync(BLOG_DIR);
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(BLOG_DIR, fileName);
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      const { metadata, content } = parseFrontmatter(fileContent);

      // 生成摘要（取前200个字符）
      const plainContent = content
        .replace(/^#+\s+/gm, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      const excerpt = plainContent.slice(0, 200) + (plainContent.length > 200 ? '...' : '');

      return {
        slug,
        title: metadata.title || slug,
        description: metadata.description || '',
        date: metadata.date || new Date().toISOString().split('T')[0],
        readTime: metadata.readTime || '5 分钟',
        category: metadata.category || 'Uncategorized',
        tags: Array.isArray(metadata.tags) ? metadata.tags : [],
        content,
        excerpt,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return allPosts;
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(BLOG_DIR, `${slug}.md`);
    console.log(`getBlogPostBySlug - fullPath: ${fullPath}`);
    console.log(`getBlogPostBySlug - exists: ${fs.existsSync(fullPath)}`);

    if (!fs.existsSync(fullPath)) {
      console.log(`getBlogPostBySlug - file not found: ${fullPath}`);
      return null;
    }

    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    console.log(`getBlogPostBySlug - content length: ${fileContent.length}`);

    const { metadata, content } = parseFrontmatter(fileContent);
    console.log(`getBlogPostBySlug - metadata:`, metadata);

    return {
      slug,
      title: metadata.title || slug,
      description: metadata.description || '',
      date: metadata.date || new Date().toISOString().split('T')[0],
      readTime: metadata.readTime || '5 分钟',
      category: metadata.category || 'Uncategorized',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      content,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export function getBlogCategories(): string[] {
  const posts = getAllBlogPosts();
  const categories = new Set(posts.map((post) => post.category));
  return Array.from(categories).sort();
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  const posts = getAllBlogPosts();
  return posts.filter((post) => post.category === category);
}
