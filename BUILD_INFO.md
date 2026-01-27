# Peter·Pan 个人网站 - 构建信息

## 📦 构建摘要

- **构建时间**: 2026-01-28
- **构建状态**: ✅ 成功
- **构建工具**: Next.js 16.0.10 (Turbopack)
- **构建模式**: 生产构建
- **总构建大小**: 28MB

## 🌐 访问链接

### 本地预览

生产服务器已在 **端口 5000** 启动，可通过以下链接访问：

```
http://localhost:5000
```

### 性能指标

- **HTTP 状态**: 200 OK
- **响应时间**: ~3ms (生产模式)
- **静态页面**: 11 个页面已预渲染

## 📋 路由列表

### 静态页面 (○ Static)
- `/` - 首页
- `/blog` - 博客列表
- `/contact` - 联系页面
- `/tools` - 工具页面
- `/_not-found` - 404 页面

### 动态页面 (● SSG)
- `/blog/[slug]` - 博客文章
  - `/blog/python-memory-management`
  - `/blog/modern-cpp-best-practices`
  - `/blog/python-cpp-integration`
  - `/blog/docker-containerization`

## 🚀 部署说明

### 1. 本地生产运行

```bash
# 安装依赖
pnpm install

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start

# 或指定端口
npx next start -p 5000
```

### 2. 部署到 Vercel

项目已配置为 Vercel 动态部署模式，支持 API 路由和服务器组件。

**部署步骤**：

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 导入项目
3. 配置环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://dhmoxklldcaztujuefsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. 部署即可（Vercel 会自动检测 Next.js 项目）

### 3. 部署到其他平台

项目也支持部署到其他 Node.js 托管平台（如 Railway、Render、Netlify 等），配置方式与 Vercel 类似。

## 🔧 环境变量

在 `.env.local` 文件中配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 功能特性

### 核心功能

- ✅ 响应式设计（移动端友好）
- ✅ 深色模式支持
- ✅ 主题切换（5 种背景主题）
- ✅ 访客统计（带超时优化）
- ✅ 博客系统（Markdown）
- ✅ 工具展示页面
- ✅ 联系表单

### 技术栈

- **框架**: Next.js 16.0.10
- **UI**: React 19.2.1
- **样式**: Tailwind CSS 4
- **组件**: shadcn/ui
- **图标**: Lucide React
- **数据库**: Supabase (PostgreSQL)
- **构建工具**: Turbopack

## 🎨 主题配置

项目支持 5 种背景主题：

1. **默认** - 锌色系（黑白）
2. **海洋** - 蓝色系
3. **日落** - 橙红色系
4. **森林** - 绿色系
5. **星空** - 紫色系

用户可以在首页右下角的主题切换器中更改主题。

## 📝 注意事项

### 数据库初始化

首次部署前，需要在 Supabase Dashboard 中执行以下 SQL 脚本：

1. **创建基础表**：执行 `SUPABASE_VERCEL_SETUP.md` 中的 SQL
2. **创建统计表**：执行 `scripts/init-visit-stats.sql`
3. **部署 Edge Function**：部署 `supabase/functions/visit/index.ts`

详细说明请参考 `scripts/README.md`。

### 访客统计

- 访客统计使用 Supabase Edge Function
- 请求超时设置为 3 秒
- 超时后自动降级到 localStorage
- 不影响页面加载性能

## 🔍 故障排查

### 生产服务器无法启动

```bash
# 检查端口是否被占用
ss -tuln | grep :5000

# 停止占用进程
pkill -f "next start"

# 重新启动
npx next start -p 5000
```

### 访问量统计不工作

1. 检查 Supabase 配置是否正确
2. 检查 Edge Function 是否已部署
3. 查看浏览器控制台的错误信息

详细排查指南请参考 `scripts/README.md`。

## 📚 相关文档

- [SUPABASE_VERCEL_SETUP.md](./SUPABASE_VERCEL_SETUP.md) - Supabase 配置指南
- [scripts/README.md](./scripts/README.md) - 问题排查指南
- [scripts/init-visit-stats.sql](./scripts/init-visit-stats.sql) - 数据库初始化脚本
- [README.md](./README.md) - 项目介绍

## 📄 许可证

本项目为个人项目，版权所有者：Peter·Pan

---

**构建完成时间**: 2026-01-28
**构建状态**: ✅ 成功
**服务器状态**: 🟢 运行中
