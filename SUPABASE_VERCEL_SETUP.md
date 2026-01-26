# Supabase 访客统计 + Vercel 托管配置指南

## 📋 前置要求
- Supabase 账号（免费即可）
- Vercel 账号（免费即可）

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

## ☁️ 第三步：部署到 Vercel

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
   - Framework Preset：选择 `Next.js`
   - Root Directory：保持 `./`
   - Build Command：`pnpm run build`
   - Output Directory：`out`

4. **配置环境变量**
   在 "Environment Variables" 部分添加：
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project-id.supabase.co
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: your-anon-key-here
   ```

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

# 重新部署
vercel --prod
```

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

### 问题 1：访客统计不更新
**原因**：Edge Function 未部署或环境变量未配置  
**解决**：
1. 检查 Supabase Edge Function 是否已部署
2. 检查 .env.local 中的 API 凭证是否正确
3. 打开浏览器控制台查看错误信息

### 问题 2：CORS 错误
**原因**：Edge Function CORS 配置问题  
**解决**：
1. 确认 Edge Function 代码中包含正确的 CORS 头
2. 检查 Supabase 项目设置中的域名白名单

### 问题 3：Vercel 部署失败
**原因**：环境变量缺失或配置错误  
**解决**：
1. 在 Vercel 控制台检查环境变量是否已添加
2. 确认 `NEXT_PUBLIC_` 前缀存在
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
