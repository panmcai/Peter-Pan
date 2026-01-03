# 静态导出使用指南

## ✨ 重要更新

**现在支持直接双击 HTML 文件预览了！**

构建脚本会自动将所有绝对路径转换为相对路径，使得双击 HTML 文件也能正常预览。

## ⚠️ 重要提示

## 🚀 预览方式

### 方式一：直接双击 HTML 文件（推荐）✨

```bash
# 构建静态网站
pnpm build

# 直接双击打开
out/index.html
out/about.html
out/blog.html
# ... 其他页面
```

现在可以像打开普通网页文件一样，直接双击 HTML 文件在浏览器中打开，所有样式和脚本都能正常加载！

### 方式二：使用预览脚本

```bash
# 运行预览脚本
./preview-static.sh
```

然后在浏览器中打开：`http://localhost:8000`

### 方式三：使用 VS Code Live Server 扩展

1. 安装 VS Code 扩展：Live Server
2. 右键点击 `out/index.html`
3. 选择 "Open with Live Server"

## 📦 构建步骤

```bash
# 1. 安装依赖（首次运行）
pnpm install

# 2. 构建静态网站
pnpm build

# 3. 预览
./preview-static.sh
```

## 📁 构建产物

构建完成后，`out/` 目录结构如下：

```
out/
├── index.html              # 首页
├── about.html              # 关于页
├── blog.html               # 博客列表页
├── tools.html              # 工具页
├── contact.html            # 联系页
├── 404.html                # 404页面
├── _next/                  # Next.js 静态资源
│   └── static/
│       ├── chunks/         # JavaScript/CSS chunks
│       └── media/          # 静态资源（字体、图片等）
└── blog/                   # 博客详情页
    ├── python-memory-management.html
    ├── modern-cpp-best-practices.html
    ├── python-cpp-integration.html
    └── docker-containerization.html
```

## 🌍 部署到静态托管平台

### GitHub Pages

```bash
# 安装 gh-pages
pnpm add -D gh-pages

# 部署到 GitHub Pages
pnpm gh-pages -d out
```

### Vercel

1. 安装 Vercel CLI
2. 运行 `vercel deploy --prebuilt` 在 `out/` 目录

### Netlify

直接拖拽 `out/` 目录到 Netlify 控制台

### 其他平台

`out/` 目录是标准的静态网站结构，可以部署到任何支持静态网站托管的服务：
- Cloudflare Pages
- AWS S3 + CloudFront
- Firebase Hosting
- 阿里云 OSS
- 腾讯云 COS

## ⚠️ 注意事项

1. **相对路径支持**
   - ✅ 支持直接双击 HTML 文件预览
   - ✅ 使用相对路径 `./_next/static/...`
   - ✅ 自动路径转换脚本

2. **图片优化已禁用**
   - 静态导出模式下，Next.js 的图片优化功能被禁用
   - 所有图片使用原始大小和格式

3. **无服务端功能**
   - API 路由不可用（已移除）
   - 依赖服务端的功能需要改为纯客户端实现

## 🔧 开发 vs 生产

### 开发模式
```bash
pnpm dev
```
- 支持 HMR（热模块替换）
- 完整的 Next.js 功能
- 适用于开发调试

### 静态导出
```bash
pnpm build
```
- 生成纯静态 HTML 文件
- 适用于部署到静态托管平台
- **必须使用 HTTP 服务器预览**
