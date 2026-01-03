# 个人网站

基于 Next.js + TypeScript + Tailwind CSS 构建的个人网站。

## ✨ 特性

- 🎨 **首页背景切换** - 支持5种主题（默认、海洋、日落、森林、星空）
- 📝 **博客系统** - 支持Markdown渲染，包含博客列表和详情页
- 🎯 **响应式设计** - 完美适配桌面和移动设备
- 🌙 **深色模式** - 支持浅色/深色主题切换
- 📦 **静态导出** - 支持直接双击 HTML 文件预览，或部署到 GitHub Pages

## 🚀 快速开始

### 开发模式

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5000

### 静态导出

```bash
# 构建静态网站
pnpm build
```

构建产物位于 `out/` 目录。

## 📦 部署

### 方式一：双击 HTML 文件预览

```bash
# 构建后直接双击 out/index.html
pnpm build
```

构建后的文件使用相对路径，可以直接双击 HTML 文件在浏览器中打开。

### 方式二：使用 HTTP 服务器预览

```bash
# 使用预览脚本
./preview-static.sh

# 或手动启动
cd out
python3 -m http.server 8000
```

### 方式三：部署到 GitHub Pages

#### 方法 1：使用 GitHub Actions（推荐）

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages：
   - Settings → Pages
   - Source 选择 GitHub Actions
3. 推送代码到 `main` 分支即可自动部署

#### 方法 2：手动部署

```bash
# 安装 gh-pages
pnpm add -D gh-pages

# 部署到 GitHub Pages
pnpm gh-pages -d out -b gh-pages
```

在仓库设置中：
- Settings → Pages
- Source 选择 Deploy from a branch
- Branch 选择 `gh-pages`

#### 方法 3：使用个人域名

如果使用个人域名，修改 `next.config.ts`：

```typescript
const nextConfig: NextConfig = {
  // ... 其他配置
  assetPrefix: 'https://yourdomain.com',
};
```

### 方式四：部署到其他静态托管平台

项目生成的 `out/` 目录是标准的静态网站结构，可以部署到：

- **Vercel**: `vercel deploy --prebuilt` (在 out/ 目录)
- **Netlify**: 直接拖拽 `out/` 目录到控制台
- **Cloudflare Pages**: 上传 `out/` 目录
- **AWS S3 + CloudFront**: 上传到 S3 存储桶
- **阿里云 OSS / 腾讯云 COS**: 上传到对象存储

## 📁 项目结构

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── about/        # 关于页面
│   │   ├── blog/         # 博客页面
│   │   │   └── [slug]/   # 博客详情页（动态路由）
│   │   ├── contact/      # 联系页面
│   │   ├── tools/        # 工具页面
│   │   └── globals.css   # 全局样式
│   ├── components/       # React 组件
│   │   ├── Navbar.tsx    # 导航栏
│   │   └── Footer.tsx    # 页脚
│   └── lib/              # 工具函数
│       └── blog-data.ts  # 博客数据
├── public/               # 静态资源
├── out/                  # 构建产物（静态导出）
├── next.config.ts        # Next.js 配置
├── package.json          # 依赖配置
└── tsconfig.json         # TypeScript 配置
```

## 🎨 主题和样式

- **框架**: Tailwind CSS 4
- **图标**: Lucide React
- **Markdown**: react-markdown + remark-gfm

## 📝 博客管理

博客数据存储在 `src/lib/blog-data.ts` 文件中，支持：

- 文章列表
- 分类和标签
- Markdown 内容渲染
- 阅读时间估算

详细说明请查看 [BLOG_DATA_EXAMPLE.md](BLOG_DATA_EXAMPLE.md)。

## 🔧 自定义配置

### 修改首页背景主题

编辑 `src/app/page.tsx` 中的 `backgroundThemes` 数组：

```typescript
const backgroundThemes = [
  {
    id: 'custom',
    name: '自定义主题',
    class: 'from-color1 via-color2 to-color3 dark:from-dark1 dark:via-dark2 dark:to-dark3',
  },
];
```

### 添加博客文章

在 `src/lib/blog-data.ts` 的 `blogPosts` 数组中添加新文章：

```typescript
{
  slug: 'your-post-slug',
  title: '文章标题',
  description: '文章描述',
  excerpt: '文章摘要',
  content: '你的 Markdown 内容...',
  date: '2024-01-01',
  readTime: '5 分钟',
  category: '分类',
  tags: ['标签1', '标签2'],
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
