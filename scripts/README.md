# 访问量统计系统 - 问题排查指南

## 问题：argument of type 'NoneType' is not iterable

### 错误分析

这个错误信息来自 Python，表示尝试对 `None` 值进行迭代操作。但在当前的 Next.js 项目中：
- ✅ 前端使用的是 JavaScript/TypeScript
- ✅ 后端使用的是 Supabase Edge Function (Deno/TypeScript)
- ❌ 不应该出现 Python 错误

**可能的错误来源：**
1. 访问量统计未正确初始化（visit_stats 表为空）
2. Edge Function 未部署或部署失败
3. Supabase 配置问题
4. 其他系统或工具的错误

---

## 解决步骤

### 1. 检查应用状态

```bash
# 检查服务是否运行
curl -I http://localhost:5000

# 查看日志
tail -n 30 /app/work/logs/bypass/dev.log
```

### 2. 初始化 Supabase 数据库

**步骤：**
1. 访问 https://supabase.com/dashboard
2. 进入你的项目（dhmoxklldcaztujuefsw）
3. 点击左侧菜单 "SQL Editor"
4. 点击 "New Query"
5. 复制 `scripts/init-visit-stats.sql` 的内容
6. 粘贴到编辑器
7. 点击 "RUN" 执行

**验证：**
执行后应该看到类似输出：
```
id | total_visits | today_visits | last_updated_at | created_at
----+--------------+--------------+-----------------+------------
  1 |            0 |            0 | 2026-01-28...   | 2026-01-28...
```

### 3. 部署 Edge Function

**步骤：**
1. 在 Supabase Dashboard 点击左侧菜单 "Edge Functions"
2. 找到或创建 `visit` 函数
3. 复制 `supabase/functions/visit/index.ts` 的内容
4. 粘贴到在线编辑器中
5. 点击 "Deploy" 部署

### 4. 测试访问量统计

**测试 Edge Function：**
```bash
# 查询总访问量（GET）
curl -X GET \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://dhmoxklldcaztujuefsw.supabase.co/functions/v1/visit

# 记录一次访问（POST）
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"path":"/"}' \
  https://dhmoxklldcaztujuefsw.supabase.co/functions/v1/visit
```

**测试数据库查询：**
```bash
curl -X GET \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  "https://dhmoxklldcaztujuefsw.supabase.co/rest/v1/visit_stats?select=total_visits&id=eq.1"
```

---

## 常见问题

### Q1: 为什么会出现 Python 错误？

**A:** 这个项目是 Next.js + TypeScript，不应该有 Python 代码。如果看到 Python 错误：
- 检查是否在运行其他 Python 脚本
- 确认错误来源是否真的是当前项目
- 查看完整的错误堆栈信息

### Q2: visit_stats 表返回空数据怎么办？

**A:** 执行 `scripts/init-visit-stats.sql` 脚本初始化数据。

### Q3: Edge Function 返回 404 怎么办？

**A:** 说明 Edge Function 未部署或部署失败。需要在 Supabase Dashboard 中重新部署。

### Q4: 如何重置访问量统计？

**A:**
```sql
-- 重置总访问量
UPDATE visit_stats SET total_visits = 0 WHERE id = 1;

-- 重置今日访问量
UPDATE visit_stats SET today_visits = 0 WHERE id = 1;
```

### Q5: 如何启用每日自动重置今日访问量？

**A:**
```sql
-- 安装 pg_cron 扩展（如果还未安装）
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 创建定时任务（每天凌晨 00:00 执行）
SELECT cron.schedule(
  'reset-today-visits',
  '0 0 * * *',
  'SELECT reset_today_visits();'
);
```

---

## 数据库架构

### visits 表（访问记录）
```sql
- id: BIGSERIAL PRIMARY KEY
- path: VARCHAR(255) -- 访问路径
- user_agent: TEXT -- 用户代理
- ip: VARCHAR(45) -- IP 地址
- created_at: TIMESTAMP WITH TIME ZONE -- 创建时间
```

### visit_stats 表（统计数据）
```sql
- id: SERIAL PRIMARY KEY
- total_visits: INTEGER -- 总访问量
- today_visits: INTEGER -- 今日访问量
- last_updated_at: TIMESTAMP WITH TIME ZONE -- 最后更新时间
- created_at: TIMESTAMP WITH TIME ZONE -- 创建时间
```

### 触发器
```sql
- trigger_update_visit_stats: 在 visits 表插入记录后自动更新 visit_stats 表
```

---

## 联系支持

如果问题仍未解决，请提供以下信息：
1. 完整的错误堆栈信息
2. `dev.log` 的最新日志
3. Supabase Dashboard 中 visits 和 visit_stats 表的数据
4. Edge Function 的部署状态
