# Supabase 访客统计 + Vercel 托管配置指南

## 📋 前置要求
- Supabase 账号（免费即可）
- Vercel 账号（免费即可）
- Node.js >= 20
- pnpm >= 9.0.0

---

## 🚀 第一步：配置 Supabase

### 1. 创建 Supabase 项目
1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写项目信息：
   - Project Name：`peter-pan-website`
   - Database Password：设置强密码并保存
   - Region：选择离你最近的区域
4. 点击 "Create new project" 等待项目创建完成（约2-3分钟）

### 2. 创建数据库表
1. 进入项目后，点击左侧菜单 "SQL Editor"
2. 点击 "New Query"
3. 复制以下 SQL 并粘贴到编辑器：

```sql
-- 创建访客记录表
CREATE TABLE IF NOT EXISTS visits (
  id BIGSERIAL PRIMARY KEY,
  path VARCHAR(255) NOT NULL DEFAULT '/',
  user_agent TEXT,
  ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_path ON visits(path);

-- 启用行级安全策略 (RLS)
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 允许公开读取
CREATE POLICY "Allow public read access" ON visits
  FOR SELECT TO anon
  USING (true);

-- 允许公开插入（记录访问）
CREATE POLICY "Allow public insert access" ON visits
  FOR INSERT TO anon
  WITH CHECK (true);
```

4. 点击右下角 "RUN" 执行 SQL

### 3. 部署 Edge Function
1. 在项目左侧菜单点击 "Edge Functions"
2. 如果没有看到 Edge Functions，需要先启用：
   - 点击左侧 "Project Settings"
   - 找到 "API"，确保 Edge Functions 已启用
3. 创建新函数：
   - 点击 "New Function"
   - Function name：`visit`
4. 复制项目中的 `supabase/functions/visit/index.ts` 文件内容
5. 粘贴到在线编辑器中
6. 点击 "Deploy" 部署

### 4. 获取 API 凭证
1. 进入项目左侧菜单 "Project Settings" → "API"
2. 复制以下信息：
   - **Project URL**：类似 `https://xxxxxxxxx.supabase.co`
   - **anon public**（Anon key）：类似 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🔧 第二步：本地配置

### 1. 创建 .env.local 文件
在项目根目录创建 `.env.local` 文件：

```bash
cp .env.local.example .env.local
```

### 2. 填入 Supabase 凭证
编辑 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

替换 `your-project-id` 和 `your-anon-key-here` 为你的实际值。

### 3. 测试本地运行
```bash
pnpm install
pnpm run dev
```

访问 http://localhost:5000，查看首页是否正常显示访客统计。

---

## ☁️ 第三步：部署到 Vercel（动态模式）

### 方法一：通过 GitHub 自动部署（推荐）

1. **推送代码到 GitHub**
```bash
git add .
git commit -m "feat: 添加 Supabase 访客统计和 Vercel 配置"
git push origin main
```

2. **在 Vercel 导入项目**
   - 访问 https://vercel.com/new
   - 点击 "Import Project"
   - 选择你的 GitHub 仓库 `panmcai/Peter-Pan`
   - 点击 "Import"

3. **配置项目**
   - Framework Preset：自动识别为 `Next.js`
   - Root Directory：保持 `./`
   - Build Command：`pnpm run build`
   - **注意**：本项目使用动态模式，无需配置 Output Directory
   - **区域设置**：项目已配置为香港（hkg1）区域部署

4. **配置环境变量（重要）**
   在 "Environment Variables" 部分添加以下环境变量：
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://dhmoxklldcaztujuefsw.supabase.co

   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobW94a2xsZGNhenR1anVlZnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTQ1NzcsImV4cCI6MjA4NDQ3MDU3N30.Cflm39jGTf3pgIPQ6hUY0mehYvKiUv-nO1_PVNYt9HI
   ```

   **注意**：
   - 环境变量必须在 Vercel 控制台中配置，不要在 `vercel.json` 中配置
   - 必须使用 `NEXT_PUBLIC_` 前缀，否则客户端代码无法访问
   - 配置后需要重新部署才能生效

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成（约2-3分钟）

### 方法二：通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 生产部署
vercel --prod
```

---

## 🌍 区域部署配置

本项目已配置为在香港（hkg1）区域部署，以提供更好的访问速度。

### 当前配置
- **部署区域**：香港（hkg1）
- **配置文件**：`vercel.json`

### 更改部署区域

如需更改部署区域，编辑 `vercel.json` 文件：

```json
{
  "framework": "nextjs",
  "regions": ["hkg1"]  // 修改为其他区域代码
}
```

### 可用区域代码

| 区域 | 代码 |
|------|------|
| 香港 | hkg1 |
| 新加坡 | sgp1 |
| 东京 | hnd1 |
| 首尔 | icn1 |
| 法兰克福 | fra1 |
| 伦敦 | lhr1 |
| 华盛顿特区 | iad1 |
| 旧金山 | sfo1 |

### 多区域部署

如需部署到多个区域，使用数组形式：

```json
{
  "framework": "nextjs",
  "regions": ["hkg1", "sgp1", "hnd1"]
}
```

**注意**：多区域部署仅在 Pro 计划及以上可用。

---

## ✅ 第四步：验证部署

1. **访问部署的网站**
   - 在 Vercel 控制台点击生成的域名
   - 应该看到首页正常显示

2. **测试访客统计**
   - 刷新页面几次
   - 访问 Supabase Dashboard → Table Editor → visits 表
   - 应该能看到新的访问记录

3. **检查 Edge Function 日志**
   - Supabase Dashboard → Edge Functions → visit
   - 点击 "Logs" 查看调用日志

---

## 🔍 故障排除

### 问题 1：pnpm install 失败（ERR_INVALID_THIS）

**错误信息**：
```
WARN GET https://registry.npmjs.org/@aws-sdk%2Fclient-s3 error (ERR_INVALID_THIS)
ERR_PNPM_META_FETCH_FAIL GET https://registry.npmjs.org/@tailwindcss%2Fpostcss: Value of "this" must be of type URLSearchParams
```

**原因**：
- 这是 **pnpm 6.x 版本的已知问题**
- Vercel 默认使用 pnpm 6.35.1，存在此 bug
- 在处理某些 npm 包的元数据时会出现

**解决**：
1. 本项目已配置使用 pnpm 9.15.4，修复此问题
2. 确保 package.json 中有 `packageManager: "pnpm@9.15.4"`
3. 确保 .npmrc 配置正确
4. 如果问题仍然存在，检查 Vercel 项目设置：
   - 进入 "Settings" → "General"
   - 确认 "Node.js Version" 为 20.x 或更高
   - 确认 pnpm 已正确安装

### 问题 2：pnpm 版本不兼容（ERR_PNPM_UNSUPPORTED_ENGINE）

**错误信息**：
```
ERR_PNPM_UNSUPPORTED_ENGINE Unsupported environment (bad pnpm and/or Node.js version)
Expected version: >=10.0.0
Got: 6.35.1
```

**原因**：
- 之前使用 `packageManager: "pnpm@10.28.1"`，版本要求过高
- Vercel 环境默认使用 pnpm 6.35.1，不匹配
- 已在 v7 版本修复，调整为 pnpm 9.15.4

**解决**：
1. 本项目已配置使用 pnpm 9.15.4
2. Vercel 会自动识别并安装指定版本
3. 检查 package.json 中的 engines 配置：
   ```json
   "engines": {
     "node": ">=20.0.0",
     "pnpm": ">=9.0.0"
   }
   ```
4. 重新部署

### 问题 2：pnpm 版本不兼容（ERR_PNPM_UNSUPPORTED_ENGINE）

**错误信息**：
```
ERR_PNPM_UNSUPPORTED_ENGINE Unsupported environment (bad pnpm and/or Node.js version)
Expected version: >=9.0.0
Got: 6.35.1
This is happening because the package's manifest has an engines.pnpm field specified.
```

**原因**：
- Vercel 默认使用 pnpm 6.35.1
- package.json 中的 `engines.pnpm` 字段强制要求 >=9.0.0
- 版本不匹配导致构建失败

**解决**：
1. **项目已使用 corepack 配置**（v9 版本）
2. 移除了 `packageManager` 字段（避免冲突）
3. 移除了 `engines.pnpm` 字段（避免版本检查）
4. 在 vercel.json 中使用 corepack 强制使用 pnpm 9.15.4

**vercel.json 配置**：
```json
{
  "buildCommand": "corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm install && pnpm run build"
}
```

**工作原理**：
- corepack 是 Node.js 内置工具
- 自动下载并激活 pnpm 9.15.4
- 不会与 Vercel 默认配置冲突

### 问题 3：Vercel 构建超时
**原因**：Edge Function 未部署或环境变量未配置  
**解决**：
1. 检查 Supabase Edge Function 是否已部署
2. 检查 .env.local 中的 API 凭证是否正确
3. 打开浏览器控制台查看错误信息

### 问题 4：CORS 错误
**原因**：Edge Function CORS 配置问题  
**解决**：
1. 确认 Edge Function 代码中包含正确的 CORS 头
2. 检查 Supabase 项目设置中的域名白名单

### 问题 3：访客统计不更新
**原因**：Edge Function 未部署或环境变量未配置  
**解决**：
1. 检查 Supabase Edge Function 是否已部署
2. 检查 .env.local 中的 API 凭证是否正确
3. 打开浏览器控制台查看错误信息

### 问题 4：CORS 错误
**原因**：Edge Function CORS 配置问题  
**解决**：
1. 确认 Edge Function 代码中包含正确的 CORS 头
2. 检查 Supabase 项目设置中的域名白名单

### 问题 5：Vercel 构建超时
**原因**：依赖下载或构建时间过长  
**解决**：
1. 检查网络连接
2. 在 Vercel 项目设置中增加构建超时时间
3. 优化依赖列表，移除不必要的包

---

## 📝 说明

本项目使用 **动态部署模式**，而非静态导出：
- ✅ 支持 API 路由和服务器组件
- ✅ 支持 Supabase Edge Functions 集成
- ✅ 访客统计功能正常工作
- ✅ 右侧预览与 Vercel 部署效果一致

**v4 版本优化**：
- 修复了 pnpm 在 Vercel 构建环境中的兼容性问题
- 添加了 `.npmrc` 配置优化依赖下载
- 添加了 `.nvmrc` 指定 Node.js 版本
- 简化了 `vercel.json` 配置

**v7-v8 版本优化**：
- 升级 pnpm 到 9.15.4，修复 ERR_INVALID_THIS 错误
- 添加 `packageManager` 字段，确保 Vercel 使用正确版本
- 更新 `engines` 配置，明确最低版本要求

### 关于 pnpm 版本

- **v6 版本问题**：Vercel 默认的 pnpm 6.35.1 存在 ERR_INVALID_THIS 错误
- **v9 版本优势**：修复了已知错误，更快的安装速度，更好的依赖解析
- **版本配置**：项目已配置使用 pnpm 9.15.4，Vercel 会自动安装

详细配置说明请参考 `VERCEL_PNPM_CONFIG.md` 文档。

如果你需要切换到静态导出模式（例如部署到 GitHub Pages），请参考项目中的 `README.md` 或联系开发者。
3. 重新触发部署

---

## 📊 数据库查询示例

### 查询总访问量
```sql
SELECT COUNT(*) as total_visits FROM visits;
```

### 查询最近7天的访问量
```sql
SELECT 
  DATE(created_at) as visit_date,
  COUNT(*) as visit_count
FROM visits
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY visit_date DESC;
```

### 查询最受欢迎的页面
```sql
SELECT 
  path,
  COUNT(*) as visit_count
FROM visits
GROUP BY path
ORDER BY visit_count DESC
LIMIT 10;
```

---

## 🎉 完成！

现在你的个人网站已经：
- ✅ 集成了 Supabase 访客统计系统
- ✅ 部署到 Vercel 托管平台
- ✅ 支持实时访客数据追踪
- ✅ 具备数据降级功能（Supabase 失败时使用 localStorage）

有任何问题，请查看：
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
